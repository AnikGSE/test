// src/components/Dashboard.jsx
import React, { useMemo, useState } from "react";


/* Chart.js */
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

const formatCurrency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const timeframes = [
  { key: "day", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function Dashboard() {
  const [range, setRange] = useState("month");

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
    <div className="main-content">
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

/* ---------- Small KPI Card ---------- */
function KPI({ title, value, unit }) {
  return (
    <div className="card">
      <div className="card-unit">{unit}</div>
      <div className="card-value">{value}</div>
      <div className="card-title">{title}</div>
    </div>
  );
}
