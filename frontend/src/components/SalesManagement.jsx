import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../App.css';

function SalesManagement({ products = [] }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ---------- Checkout Flow ----------
  const [status, setStatus] = useState('idle'); // idle | checking_out | awaiting_payment | invoicing | notifying | done
  const [orderId, setOrderId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [err, setErr] = useState('');

  const handleAddToCart = (p) => {
    // normalize minimal fields
    const norm = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price ?? 0),
      stock: Number(p.stock ?? p.stock_quantity ?? 0),
      category: p.category,
      sku: p.sku,
    };
    addToCart(norm);
    navigate('/cart');
  };

  const handleCheckout = async () => {
    try {
      setErr('');
      setStatus('checking_out');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source: 'sales-page' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOrderId(data.orderId);
      setStatus('awaiting_payment');
      if (data.paymentUrl) window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setErr(e.message || 'Checkout failed');
      setStatus('idle');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!orderId) return;
    try {
      setErr('');
      setStatus('invoicing');
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInvoice(data);
      setStatus('notifying');
    } catch (e) {
      setErr(e.message || 'Invoice failed');
      setStatus('idle');
    }
  };

  const handleNotifyInventory = async () => {
    if (!orderId) return;
    try {
      setErr('');
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('done');
    } catch (e) {
      setErr(e.message || 'Inventory update failed');
      setStatus('idle');
    }
  };

  // ---------- Reports (API) ----------
  // /api/reports/daily-sales -> [{ date, totalSales, orders, avgOrderValue, taxes, refunds }]
  // /api/reports/product-performance -> [{ id, name, soldQty, revenue, returns, stockLeft }]
  const [salesByDay, setSalesByDay] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportErr, setReportErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setReportErr('');
        setReportLoading(true);
        const [r1, r2] = await Promise.all([
          fetch('/api/reports/daily-sales', { credentials: 'include' }),
          fetch('/api/reports/product-performance', { credentials: 'include' }),
        ]);
        if (!r1.ok) throw new Error(await r1.text());
        if (!r2.ok) throw new Error(await r2.text());

        const d1 = await r1.json();
        const d2 = await r2.json();

        if (mounted) {
          setSalesByDay(Array.isArray(d1) ? d1 : (d1?.rows ?? []));
          setProductStats(Array.isArray(d2) ? d2 : (d2?.rows ?? []));
        }
      } catch (e) {
        if (mounted) setReportErr(e.message || 'Failed to load reports');
      } finally {
        if (mounted) setReportLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ---------- KPIs ----------
  const totalRevenue = useMemo(
    () => salesByDay.reduce((s, r) => s + Number(r.totalSales ?? 0), 0),
    [salesByDay]
  );

  const ordersToday = useMemo(() => {
    if (!salesByDay.length) return 0;
    const latest = [...salesByDay].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return Number(latest?.orders ?? 0);
  }, [salesByDay]);

  const bestSelling = useMemo(() => {
    if (!productStats.length) return null;
    return [...productStats].sort((a, b) => Number(b.soldQty ?? 0) - Number(a.soldQty ?? 0))[0] || null;
  }, [productStats]);

  // ---------- Top‑10 (revenue) — simple table only ----------
  const top10ByRevenue = useMemo(() =>
    [...productStats]
      .map(r => ({
        name: r.name,
        revenue: Number(r.revenue ?? 0),
        soldQty: Number(r.soldQty ?? 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    [productStats]
  );

  // ---------- Table rows ----------
  const dailyRows = useMemo(() => (salesByDay || []).map(r => ({
    Date: r.date,
    'Total Sales': Number(r.totalSales ?? 0).toFixed(2),
    'Number of Orders': Number(r.orders ?? 0),
    'Average Order Value': Number(r.avgOrderValue ?? 0).toFixed(2),
    Taxes: Number(r.taxes ?? 0).toFixed(2),
    Refunds: Number(r.refunds ?? 0).toFixed(2),
  })), [salesByDay]);

  const productRows = useMemo(() => (productStats || []).map(r => ({
    'Product ID': r.id,
    Name: r.name,
    'Sold Qty': Number(r.soldQty ?? 0),
    Revenue: Number(r.revenue ?? 0).toFixed(2),
    Returns: Number(r.returns ?? 0),
    'Stock Left': Number(r.stockLeft ?? (r.stock ?? 0)),
  })), [productStats]);

  return (
    <div className="sales-container">
      {/* Header */}
      <div className="list-head">
        <h3 style={{ margin: 0, color: 'black' }}>🛒 Sales Management</h3>
      </div>

      {err && <div className="alert error">{err}</div>}
      <div style={{ marginBottom: 10, color: 'white' }}>
        <small>Status: <b>{status.replace('_', ' ')}</b> | Order: <b>{orderId ?? '—'}</b></small>
      </div>


      {/* Dashboard / Reports */}
      <div className="dash-wrap" style={{ marginTop: 30 }}>
        {/* KPIs */}
        <div className="kpis">
          <div className="kpi">
            <div className="kpi-label">Total revenue</div>
            <div className="kpi-value">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Orders today</div>
            <div className="kpi-value">{ordersToday}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Best‑selling item</div>
            <div className="kpi-value">{bestSelling?.name ?? '—'}</div>
            <div className="kpi-foot">Sold: {bestSelling?.soldQty ?? 0}</div>
          </div>
        </div>

        {/* Top‑10 by Revenue (simple table) */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ margin: 0 }}>Top 10 Products (by Revenue)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cart-table" style={{ minWidth: 600, background: '#fff', color: '#333' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Revenue</th>
                  <th>Sold Qty</th>
                </tr>
              </thead>
              <tbody>
                {(top10ByRevenue.length ? top10ByRevenue : [{ name: '—', revenue: 0, soldQty: 0 }]).map((r, i) => (
                  <tr key={r.name + i}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.revenue.toFixed(2)}</td>
                    <td>{r.soldQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reportLoading && <div style={{ marginTop: 8 }}>Loading…</div>}
          {reportErr && <div className="alert error" style={{ marginTop: 8 }}>{reportErr}</div>}
        </div>

        {/* Daily Sales Table */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ margin: 0 }}>Daily Sales Summary</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cart-table" style={{ minWidth: 700, background: '#fff', color: '#333' }}>
              <thead>
                <tr>
                  {Object.keys(dailyRows[0] || { Date: '', 'Total Sales': '', 'Number of Orders': '', 'Average Order Value': '', Taxes: '', Refunds: '' })
                    .map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {(dailyRows.length ? dailyRows : [{ Date: '—', 'Total Sales': '0.00', 'Number of Orders': 0, 'Average Order Value': '0.00', Taxes: '0.00', Refunds: '0.00' }])
                  .map((row, i) => (
                    <tr key={i}>
                      {Object.keys(row).map((k) => <td key={k}>{row[k]}</td>)}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ margin: 0 }}>Product Sales Performance</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cart-table" style={{ minWidth: 800, background: '#fff', color: '#333' }}>
              <thead>
                <tr>
                  {Object.keys(productRows[0] || { 'Product ID': '', Name: '', 'Sold Qty': '', Revenue: '', Returns: '', 'Stock Left': '' })
                    .map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {(productRows.length ? productRows : [{ 'Product ID': '—', Name: '—', 'Sold Qty': 0, Revenue: '0.00', Returns: 0, 'Stock Left': 0 }])
                  .map((row, i) => (
                    <tr key={i}>
                      {Object.keys(row).map((k) => <td key={k}>{row[k]}</td>)}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SalesManagement;
