import React, { useEffect, useMemo, useState } from "react";

// CHANGE: Allow overriding via Vite env; fallback to your current value
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || "http://localhost/cloudtrack/api";

// Small helper for fetch with JSON & errors
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}` , {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CHANGE: include cookies for PHP session auth
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  // if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

export default function Customer() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // filters / ui
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all"); // all | customer | staff | admin
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal state
  const empty = { id: null, name: "", email: "", password: "", role: "customer" };
  const [form, setForm] = useState(empty);
  const [openEditor, setOpenEditor] = useState(false);
  const isEditing = !!form.id;

  // details (with invoices)
  const [openDetails, setOpenDetails] = useState(false);
  const [active, setActive] = useState(null);
  const [invoices, setInvoices] = useState([]); // [{id, invoice_no, date, subtotal, tax, discount, total, status, items:[{product_id,name,price,qty,line_total}]}]
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // --- Load customers ---
  async function load() {
    try {
      setLoading(true); setError("");
      // NOTE: Backend should return the `users` table as customers
      const data = await api("/customers.php");
      const list = Array.isArray(data) ? data : [];
      // CHANGE: normalize roles to lower-case, ensure required fields present
      setRows(list.map(r => ({
        id: r.id,
        name: r.name ?? "",
        email: r.email ?? "",
        role: (r.role || "customer").toLowerCase(),
      })));
    } catch (e) { setError(e.message || "Failed to load customers"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  // reset to page 1 on filter/search change
  useEffect(() => { setPage(1); }, [search, role, pageSize]);

  // --- CRUD ---
  async function save(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    const { name, email, password, role } = form;
    if (!name.trim()) return setError("Name is required.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError("Valid email is required.");
    if (!isEditing && !password.trim()) return setError("Password is required for new customers.");

    try {
      if (isEditing) {
        await api(`/customers.php?id=${form.id}` , { method: "PUT", body: JSON.stringify({ name, email, role, ...(password ? { password } : {}) })});
        setSuccess("Customer updated.");
      } else {
        await api("/customers.php", { method: "POST", body: JSON.stringify({ name, email, password, role })});
        setSuccess("Customer created.");
      }
      setOpenEditor(false); setForm(empty);
      await load();
    } catch (e) { setError(e.message || "Action failed."); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this customer? This cannot be undone.")) return;
    try { await api(`/customers.php?id=${id}`, { method: "DELETE" }); await load(); }
    catch (e) { setError(e.message || "Delete failed."); }
  }

  // --- Details & Invoices ---
  async function loadInvoices(customerId) {
    setInvoices([]);
    try {
      setInvoicesLoading(true);
      const data = await api(`/customer_invoices.php?customer_id=${customerId}`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch { setInvoices([]); }
    finally { setInvoicesLoading(false); }
  }

  function openDetailsFor(row) {
    setActive(row); setOpenDetails(true); loadInvoices(row.id);
  }

  function toggleSort(key){
    if (sortKey === key) setSortDir(d=> d === "asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  // --- Derived rows: filter -> sort -> paginate ---
  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    let data = rows;
    if (role !== "all") data = data.filter(r => (r.role || "customer") === role);
    if (q) data = data.filter(r => (r.name||"").toLowerCase().includes(q) || (r.email||"").toLowerCase().includes(q));
    return data;
  }, [rows, role, q]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a,b)=>{
      const A = (a?.[sortKey] ?? "").toString().toLowerCase();
      const B = (b?.[sortKey] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = sorted.slice((current-1)*pageSize, (current-1)*pageSize + pageSize);

  // Print single invoice
  function printInvoice(inv){
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsRows = inv.items?.map(it => `<tr><td>${it.name}</td><td>${it.qty}</td><td>${Number(it.price).toFixed(2)}</td><td>${Number(it.line_total).toFixed(2)}</td></tr>`).join('') || '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${inv.invoice_no}</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px}
        h1{margin:0 0 8px}
        .muted{color:#555}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ccc;padding:8px;text-align:left}
        tfoot td{font-weight:700}
      </style>
    </head><body>
      <h1>Invoice #${inv.invoice_no}</h1>
      <div class="muted">Date: ${inv.date}</div>
      <div class="muted">Customer: ${active?.name} (${active?.email})</div>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
        <tbody>${itemsRows}</tbody>
        <tfoot>
          <tr><td colSpan="3">Subtotal</td><td>${Number(inv.subtotal).toFixed(2)}</td></tr>
          <tr><td colSpan="3">Tax</td><td>${Number(inv.tax||0).toFixed(2)}</td></tr>
          <tr><td colSpan="3">Discount</td><td>${Number(inv.discount||0).toFixed(2)}</td></tr>
          <tr><td colSpan="3">Grand Total</td><td>${Number(inv.total).toFixed(2)}</td></tr>
        </tfoot>
      </table>
      <script>window.print();</script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title">Customers</div>
          <div className="actions">
            <div className="pill-group" role="tablist" aria-label="Filter by role">
              {["all","customer","staff","admin"].map(r=> (
                <button key={r} role="tab" aria-selected={role===r} className={`pill ${role===r?"pill-active":""}`} onClick={()=>{ setRole(r); setPage(1); }}>{r[0].toUpperCase()+r.slice(1)}</button>
              ))}
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} className="search-input" placeholder="Search name or email…" />
            <button className="btn btn-primary" onClick={()=>{ setForm(empty); setOpenEditor(true); }}>+ Add Customer</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-secondary btn-xs" onClick={load}>Retry</button>
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card-panel">
          {loading ? (
            <div className="empty">Loading customers…</div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th className="th-sort" onClick={()=>toggleSort("name")}>
                      Name {sortKey==="name" ? (sortDir==="asc"?"▲":"▼") : ""}
                    </th>
                    <th className="th-sort" onClick={()=>toggleSort("email")}>
                      Email {sortKey==="email" ? (sortDir==="asc"?"▲":"▼") : ""}
                    </th>
                    <th className="th-sort small" onClick={()=>toggleSort("role")}>
                      Role {sortKey==="role" ? (sortDir==="asc"?"▲":"▼") : ""}
                    </th>
                    <th className="small">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={4} className="empty">No customers found.</td></tr>
                  ) : (
                    pageRows.map(u => (
                      <tr key={u.id} className="row-hover">
                        <td onClick={()=>openDetailsFor(u)} style={{cursor:'pointer'}}>{u.name}</td>
                        <td onClick={()=>openDetailsFor(u)} style={{cursor:'pointer'}}>
                          {u.email} {" "}
                          <button className="link-btn" title="Copy email" onClick={(e)=>{ e.stopPropagation();
                            try{
                              if (navigator.clipboard?.writeText) navigator.clipboard.writeText(u.email);
                            }catch{}
                          }}>Copy</button>
                        </td>
                        <td><span className={`role-badge role-${(u.role||"customer").toLowerCase()}`}>{u.role || "customer"}</span></td>
                        <td>
                          <button className="btn btn-secondary" onClick={()=>{ setForm({ id:u.id, name:u.name, email:u.email, password:"", role:u.role||"customer" }); setOpenEditor(true); }}>Edit</button>{" "}
                          <button className="btn btn-danger" onClick={()=>remove(u.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="pagination">
                <div className="muted">Total: {filtered.length}</div>
                <div className="pagination-controls">
                  <button className="btn" disabled={current<=1} onClick={()=>setPage(1)}>«</button>
                  <button className="btn" disabled={current<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
                  <span className="muted">Page {current} / {pageCount}</span>
                  <button className="btn" disabled={current>=pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Next</button>
                  <button className="btn" disabled={current>=pageCount} onClick={()=>setPage(pageCount)}>»</button>
                  <select className="page-size" value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
                    <option>5</option><option>10</option><option>20</option><option>50</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {openEditor && (
        <div className="modal-backdrop" onClick={()=>setOpenEditor(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span>{isEditing ? "Edit Customer" : "Add Customer"}</span>
              <button className="btn btn-secondary" onClick={()=>setOpenEditor(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={save}>
              <div className="form-grid">
                <label className="label">Name
                  <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                </label>
                <label className="label">Email
                  <input type="email" className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                </label>
                <label className="label">{isEditing?"New Password (optional)":"Password"}
                  <input type="password" className="input" value={form.password} placeholder={isEditing?"Leave blank to keep current":""} onChange={e=>setForm({...form, password:e.target.value})} />
                </label>
                <label className="label">Role
                  <select className="select" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={()=>setOpenEditor(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing?"Save Changes":"Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {openDetails && active && (
        <div className="modal-backdrop" onClick={()=>setOpenDetails(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span>Customer Details</span>
              <button className="btn btn-secondary" onClick={()=>setOpenDetails(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="details">
                <div><span className="muted">Name:</span> {active.name}</div>
                <div><span className="muted">Email:</span> {active.email}</div>
                <div><span className="muted">Role:</span> <span className={`badge role-${(active.role||"customer").toLowerCase()}`}>{active.role || "customer"}</span></div>
              </div>

              <div style={{marginTop:16, fontWeight:700}}>Invoices</div>
              {invoicesLoading ? (
                <div className="empty">Loading invoices…</div>
              ) : invoices.length === 0 ? (
                <div className="empty">No invoices found.</div>
              ) : (
                <div className="invoice-list">
                  {invoices.map(inv => (
                    <details key={inv.id} className="invoice-card" open>
                      <summary>
                        <div className="inv-head">
                          <div>
                            <div className="inv-title">Invoice #{inv.invoice_no}</div>
                            <div className="muted">{inv.date} • Status: <span className={`badge status-${(inv.status||'paid').toLowerCase()}`}>{inv.status||'paid'}</span></div>
                          </div>
                          <div className="inv-amount">{Number(inv.total).toFixed(2)}</div>
                        </div>
                      </summary>

                      <div className="inv-body">
                        <table className="inv-table">
                          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
                          <tbody>
                            {(inv.items||[]).map((it,idx)=> (
                              <tr key={idx}><td>{it.name}</td><td>{it.qty}</td><td>{Number(it.price).toFixed(2)}</td><td>{Number(it.line_total).toFixed(2)}</td></tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr><td colSpan={3}>Subtotal</td><td>{Number(inv.subtotal).toFixed(2)}</td></tr>
                            <tr><td colSpan={3}>Tax</td><td>{Number(inv.tax||0).toFixed(2)}</td></tr>
                            <tr><td colSpan={3}>Discount</td><td>{Number(inv.discount||0).toFixed(2)}</td></tr>
                            <tr><td colSpan={3}>Grand Total</td><td>{Number(inv.total).toFixed(2)}</td></tr>
                          </tfoot>
                        </table>
                        <div className="inv-actions">
                          <button className="btn" onClick={()=>printInvoice(inv)}>Print</button>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}