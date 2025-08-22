// src/pages/AdminDashboard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* Chart.js + react-chartjs-2 (must be installed)
   npm i chart.js react-chartjs-2
*/
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ---------- Small KPI Card (local) ---------- */
function KPI({ title, value, unit }) {
  return (
    <div className="card kpi-card">
      <div className="card-unit">{unit}</div>
      <div className="card-value">{value}</div>
      <div className="card-title">{title}</div>
    </div>
  );
}

/* ---------- Embedded Dashboard (local) ---------- */
function EmbeddedDashboard() {
  const [range, setRange] = useState("month");

  const formatCurrency = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const timeframes = [
    { key: "day", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  /** ---------- DUMMY DATA (replace with real API/DB) ---------- **/
  const mock = useMemo(() => {
    const base = {
      day: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        revenue: Array.from({ length: 24 }, () => 400 + Math.random() * 900),
        profit: Array.from({ length: 24 }, () => 120 + Math.random() * 300),
      },
      week: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        revenue: [6200, 7400, 6800, 7200, 9600, 10100, 8400],
        profit: [1800, 2200, 2100, 2000, 2900, 3100, 2500],
      },
      month: {
        labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
        revenue: Array.from({ length: 30 }, () => 6000 + Math.random() * 6000),
        profit: Array.from({ length: 30 }, () => 1800 + Math.random() * 2200),
      },
    };

    const products = [
      { name: "CutiePie Rompers", units: 160, sales: 12400, margin: 28 },
      { name: "Hanswooly Cotton", units: 120, sales: 9800, margin: 24 },
      { name: "Kool Kiddo Pants", units: 20, sales: 2600, margin: 19 },
      { name: "Toddler Treat Box", units: 20, sales: 2300, margin: 25 },
      { name: "Sunny Tee", units: 14, sales: 1350, margin: 22 },
    ];

    const inventory = {
      inHand: 421,
      toReceive: 216,
      activePct: 81,
      lowStock: 2,
      groups: 5,
      items: 16,
    };

    const channels = [
      { channel: "Shopify", draft: 0, confirmed: 12, packed: 0, shipped: 0, invoiced: 2 },
      { channel: "Etsy", draft: 0, confirmed: 3, packed: 0, shipped: 6, invoiced: 6 },
      { channel: "Others", draft: 0, confirmed: 42, packed: 5, shipped: 27, invoiced: 75 },
    ];

    const purchaseOrder = { qty: 519, totalCost: 12760.16 };

    return { base, products, inventory, channels, purchaseOrder };
  }, []);
  /** ----------------------------------------------------------- **/

  /** ---------- KPI Cards (computed) ---------- **/
  const kpis = useMemo(() => {
    const rev = mock.base[range].revenue.reduce((a, b) => a + b, 0);
    const prof = mock.base[range].profit.reduce((a, b) => a + b, 0);
    const growth = range === "month" ? 12.4 : range === "week" ? 4.8 : 1.6; // demo numbers
    return {
      toPack: 25,
      toShip: 1,
      toDeliver: 3,
      toInvoice: 4,
      revenue: rev,
      profit: prof,
      growth,
    };
  }, [mock, range]);

  /** ---------- Charts ---------- **/
  const salesOverview = useMemo(
    () => ({
      data: {
        labels: mock.base[range].labels,
        datasets: [
          {
            label: "Revenue",
            data: mock.base[range].revenue,
            borderWidth: 2,
            tension: 0.35,
            fill: false,
          },
          {
            label: "Profit",
            data: mock.base[range].profit,
            borderWidth: 2,
            borderDash: [6, 6],
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`),
            },
          },
        },
      },
    }),
    [mock, range]
  );

  const topSellingBar = useMemo(
    () => ({
      data: {
        labels: mock.products.map((p) => p.name),
        datasets: [
          {
            label: "Units Sold",
            data: mock.products.map((p) => p.units),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { drawBorder: false } },
        },
      },
    }),
    [mock.products]
  );

  const inventoryDonut = useMemo(() => {
    const active = mock.inventory.activePct;
    const inactive = 100 - active;
    return {
      data: {
        labels: ["Active", "Inactive"],
        datasets: [
          {
            data: [active, inactive],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false } },
      },
    };
  }, [mock.inventory.activePct]);

  /** ---------- CSV Report Download ---------- **/
  const downloadCSV = () => {
    const headers = ["Label", "Revenue", "Profit"];
    const rows = mock.base[range].labels.map((label, i) => [
      label,
      mock.base[range].revenue[i],
      mock.base[range].profit[i],
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `sales_report_${range}_${stamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-root">
      <div className="header-row">
        <div className="welcome-text">Welcome Admin</div>

        <div className="range-toggle">
          {timeframes.map((t) => (
            <button
              key={t.key}
              className={`toggle-btn ${range === t.key ? "active" : ""}`}
              onClick={() => setRange(t.key)}
            >
              {t.label}
            </button>
          ))}
          <button className="toggle-btn outline" onClick={downloadCSV}>
            Download Report (CSV)
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="cards-container">
        <KPI title="To be Packed" value={kpis.toPack} unit="Qty" />
        <KPI title="To be Shipped" value={kpis.toShip} unit="Pkgs" />
        <KPI title="To be Delivered" value={kpis.toDeliver} unit="Pkgs" />
        <KPI title="To be Invoiced" value={kpis.toInvoice} unit="Qty" />
      </div>
          
      {/* TOP + INVENTORY SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-title">Inventory Summary</div>
          <div className="inventory-box">
            <div className="inventory-line">
              <span>Quantity in Hand</span>
              <strong>{mock.inventory.inHand}</strong>
            </div>
            <div className="inventory-line">
              <span>Quantity to be Received</span>
              <strong>{mock.inventory.toReceive}</strong>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">Financials</div>
          <div className="financials">
            <div>
              <div className="dim-label">
                Revenue ({timeframes.find((t) => t.key === range).label})
              </div>
              <div className="big">{formatCurrency(kpis.revenue)}</div>
            </div>
            <div>
              <div className="dim-label">Profit</div>
              <div className="big">{formatCurrency(kpis.profit)}</div>
            </div>
            <div>
              <div className="dim-label">Growth</div>
              <div className="big">{kpis.growth}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS: PRODUCT & INVENTORY */}
      <div className="details-grid">
        <div className="detail-card">
          <div className="detail-title">Product Details</div>
          <div className="product-details">
            <div className="left-col">
              <div className="kv">
                <span className="danger">Low Stock Items</span>
                <strong>{mock.inventory.lowStock}</strong>
              </div>
              <div className="kv">
                <span>All Item Group</span>
                <strong>{mock.inventory.groups}</strong>
              </div>
              <div className="kv">
                <span>All Items</span>
                <strong>{mock.inventory.items}</strong>
              </div>
            </div>
            <div className="donut-wrap">
              <div className="donut">
                <Doughnut data={inventoryDonut.data} options={inventoryDonut.options} />
              </div>
              <div className="donut-caption">Active Items {mock.inventory.activePct}%</div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-title">Top Selling Items</div>
          <div className="top-selling">
            <div className="bar-chart">
              <Bar data={topSellingBar.data} options={topSellingBar.options} />
            </div>
            <ul className="top-list">
              {mock.products.map((p, idx) => (
                <li key={idx}>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-meta">
                    <span>{p.units} pcs</span>
                    <span>{formatCurrency(p.sales)}</span>
                    <span>{p.margin}% margin</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SALES OVERVIEW */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Sales Overview</div>
          <div className="muted">Total revenue, profit & growth trends</div>
        </div>
        <div className="chart-xl">
          <Line data={salesOverview.data} options={salesOverview.options} />
        </div>
      </div>

      {/* PURCHASE ORDER + SALES ORDER TABLE */}
      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Purchase Order</div>
            <div className="muted">This {timeframes.find((t) => t.key === range).label}</div>
          </div>
          <div className="po-metrics">
            <div className="po-item">
              <div className="dim-label">Quantity Ordered</div>
              <div className="po-big">{mock.purchaseOrder.qty}</div>
            </div>
            <div className="po-item">
              <div className="dim-label">Total Cost</div>
              <div className="po-big">{formatCurrency(mock.purchaseOrder.totalCost)}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Sales Order</div>
            <div className="muted">This {timeframes.find((t) => t.key === range).label}</div>
          </div>
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Draft</th>
                  <th>Confirmed</th>
                  <th>Packed</th>
                  <th>Shipped</th>
                  <th>Invoiced</th>
                </tr>
              </thead>
              <tbody>
                {mock.channels.map((c, i) => (
                  <tr key={i}>
                    <td>{c.channel}</td>
                    <td>{c.draft}</td>
                    <td>{c.confirmed}</td>
                    <td>{c.packed}</td>
                    <td>{c.shipped}</td>
                    <td>{c.invoiced}</td>
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

/* ---------- PAGE (ONE FILE) ---------- */
export default function AdminDashboard() {
  return (
    <>
      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: Arial, sans-serif;
        }

        .sidebar {
          width: 200px;
          background-color: #2f3542;
          color: white;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          box-sizing: border-box;
          margin-bottom: 20px;
        }

        .sidebar button {
          background-color: #57606f;
          border: none;
          color: white;
          padding: 12px 15px;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          border-radius: 4px;
          margin: 0 10px;
          transition: background-color 0.3s ease;
        }

        .sidebar button:hover {
          background-color: #747d8c;
        }

        .sidebar-link-button {
          display: block;
          background-color: #57606f;
          color: white;
          padding: 12px 15px;
          text-align: left;
          font-size: 14px;
          border-radius: 4px;
          margin: 0 10px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }

        .sidebar-link-button:hover {
          background-color: #747d8c;
        }

        .main-content {
          flex: 1;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #f1f2f6;
        }

        .welcome-text {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 30px;
          color: #2f3542;
        }

        .cards-container {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: stretch;
          width: 100%;
          max-width: 1200px;
        }

        .cards-container-2 {
          margin-top: 20px;
          width: 100%;
        }

        .card {
          background-color: white;
          box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
          border-radius: 8px;
          width: 250px;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #57606f;
          font-size: 18px;
          font-weight: 500;
        }

        /* Card 1 becomes a full-width dashboard host */
        .card-dashboard {
          width: 100%;
          max-width: 1200px;
          min-height: 700px;
          height: auto;
          align-items: stretch;
          padding: 16px;
        }

        .card-sale {
          background-color: white;
          width: 100%;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #57606f;
          font-size: 18px;
          font-weight: 500;
        }

        /* ---------- Minimal styles for Embedded Dashboard ---------- */
        .dashboard-root { width: 100%; }

        .header-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px;
        }

        .range-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
        .toggle-btn {
          border: 1px solid #ccc; padding: 6px 10px; border-radius: 6px; background: #fff; cursor: pointer;
        }
        .toggle-btn.active { border-color: #2f3542; }

        .kpi-card .card-unit { font-size: 12px; color: #888; }
        .kpi-card .card-value { font-size: 28px; font-weight: 700; color: #2f3542; }
        .kpi-card .card-title { font-size: 14px; color: #57606f; }

        .summary-grid, .details-grid, .bottom-grid {
          display: grid; gap: 16px; margin-top: 16px;
        }
        .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .bottom-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .summary-card, .detail-card, .panel {
          background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 2px 6px rgb(0 0 0 / 0.06);
        }
        .summary-title, .detail-title, .panel-title { font-weight: 600; margin-bottom: 8px; }

        .inventory-box .inventory-line { display:flex; justify-content:space-between; padding:4px 0; }

        .financials { display:flex; gap: 24px; }
        .dim-label { font-size:12px; color:#888; }
        .big { font-size:20px; font-weight:700; color:#2f3542; }

        .top-selling { display:grid; grid-template-columns: 1.2fr 1fr; gap: 12px; }
        .top-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
        .prod-name { font-weight:600; }
        .prod-meta { display:flex; gap:8px; font-size:12px; color:#666; }

        /* chart boxes */
        .chart-xl { height: 360px; }
        .bar-chart { height: 240px; }
        .donut-wrap { display:flex; align-items:center; gap:12px; }
        .donut { width: 160px; height: 160px; }
        .donut-caption { font-size: 12px; color:#666; }

        .table-wrap { overflow:auto; }
        .clean-table { width:100%; border-collapse: collapse; }
        .clean-table th, .clean-table td { border-bottom:1px solid #eee; padding:8px; text-align:left; }
      `}</style>

      <div className="admin-container">
        <div className="sidebar">
          <button>Dashboard</button>
          <Link to="/admin-dashboard-users" className="sidebar-link-button">
            Users
          </Link>
          <Link to="/admin-dashboard-inventory" className="sidebar-link-button">
            Inventory
          </Link>
          <Link to="/admin-dashboard-sales" className="sidebar-link-button">
            Sales
          </Link>
          <Link to="/admin-dashboard-supplier" className="sidebar-link-button">
            Supplier
          </Link>
          <Link to="/admin-dashboard-customer" className="sidebar-link-button">
            Customer
          </Link>
        </div>

        <div className="main-content">

          <div className="cards-container">
            {/* Card 1: full analytics dashboard */}
            <div className="card card-dashboard">
              <EmbeddedDashboard />
            </div>
          </div>

          <div className="cards-container-2">
          </div>
        </div>
      </div>
    </>
  );
}
