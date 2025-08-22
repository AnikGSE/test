import React, { useEffect, useState } from 'react';

const API_URL = {
  suppliers: '/backend/get_suppliers.php',
  products: '/backend/get_products.php',
  restocks: '/backend/get_restocks.php',
  addSupplier: '/backend/add_supplier.php',
  updateSupplier: '/backend/update_supplier.php',
  placeOrder: '/backend/place_order.php'
};

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [restocks, setRestocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contact_info: '',
    payment_terms: '',
    lead_time: ''
  });

  const [orderFormData, setOrderFormData] = useState({
    product_id: '',
    supplier_id: '',
    quantity: '',
    expected_delivery_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr('');

      const [suppliersRes, productsRes, restocksRes] = await Promise.all([
        fetch(API_URL.suppliers),
        fetch(API_URL.products),
        fetch(API_URL.restocks)
      ]);

      if (!suppliersRes.ok || !productsRes.ok || !restocksRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();
      const restocksData = await restocksRes.json();

      setSuppliers(Array.isArray(suppliersData) ? suppliersData : 
                  (suppliersData.suppliers || suppliersData.data || []));
      setProducts(Array.isArray(productsData) ? productsData : 
                 (productsData.products || productsData.data || []));
      setRestocks(Array.isArray(restocksData) ? restocksData : 
                 (restocksData.restocks || restocksData.data || []));
    } catch (e) {
      setErr(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSupplier ? 
        `${API_URL.updateSupplier}?id=${editingSupplier.id}` : 
        API_URL.addSupplier;
      
      const response = await fetch(url, {
        method: editingSupplier ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save supplier');

      setShowAddForm(false);
      setEditingSupplier(null);
      setFormData({ name: '', contact_info: '', payment_terms: '', lead_time: '' });
      fetchData(); // Refresh data
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL.placeOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderFormData)
      });

      if (!response.ok) throw new Error('Failed to place order');

      setShowOrderForm(false);
      setOrderFormData({ product_id: '', supplier_id: '', quantity: '', expected_delivery_date: '' });
      fetchData(); // Refresh data
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_info: supplier.contact_info,
      payment_terms: supplier.payment_terms || '',
      lead_time: supplier.lead_time || ''
    });
    setShowAddForm(true);
  };

  const handlePlaceOrder = (product) => {
    setSelectedProduct(product);
    setOrderFormData({
      product_id: product.id,
      supplier_id: '',
      quantity: '',
      expected_delivery_date: ''
    });
    setShowOrderForm(true);
  };

  const getSupplierProducts = (supplierId) => {
    return products.filter(product => 
      product.supplier_id === supplierId || 
      (product.suppliers && product.suppliers.includes(supplierId))
    );
  };


  // Inline styles
  const styles = {
    container: {
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #e0e0e0'
    },
    title: {
      margin: '0',
      color: '#333'
    },
    button: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      backgroundColor: '#4361ee',
      color: 'white',
      boxShadow: '0 2px 4px rgba(67, 97, 238, 0.3)'
    },
    buttonSecondary: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    buttonSmall: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    errorMessage: {
      padding: '12px 16px',
      borderRadius: '4px',
      backgroundColor: '#fee',
      color: '#c33',
      marginBottom: '20px',
      borderLeft: '4px solid #c33'
    },
    section: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    alertsList: {
      marginTop: '15px'
    },
    alertItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    tableContainer: {
      overflowX: 'auto',
      marginTop: '15px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      fontWeight: '600',
      color: '#495057',
      borderBottom: '2px solid #e9ecef',
      padding: '12px',
      textAlign: 'left'
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #e9ecef'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    modalHeader: {
      padding: '20px',
      borderBottom: '1px solid #e9ecef'
    },
    form: {
      padding: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '500',
      color: '#495057'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid #e9ecef'
    },
    status: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    statusProcessing: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    statusShipped: {
      backgroundColor: '#cce5ff',
      color: '#004085'
    },
    statusDelivered: {
      backgroundColor: '#d4edda',
      color: '#155724'
    }
  };

  // Add CSS animation to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .modal {
        animation: modalFadeIn 0.3s ease;
      }
      
      .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      input:focus, select:focus {
        outline: none;
        border-color: #4361ee;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
      }
      
      @media (max-width: 768px) {
        .supplier-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }
        
        .alert-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .form-actions {
          flex-direction: column;
        }
        
        .form-actions button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) return <div style={styles.container}><p>Loading…</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Supplier Management</h2>
        <button 
          style={{...styles.button, ...styles.buttonPrimary}}
          onClick={() => setShowAddForm(true)}
          className="btn"
        >
          Add New Supplier
        </button>
      </div>

      {err && <div style={styles.errorMessage}>Error: {err}</div>}


      {/* Supplier List */}
      <div style={styles.section}>
        <h3>Suppliers</h3>
        {suppliers.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Contact Info</th>
                  <th style={styles.tableHeader}>Payment Terms</th>
                  <th style={styles.tableHeader}>Lead Time (Days)</th>
                  <th style={styles.tableHeader}>Associated Products</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td style={styles.tableCell}>{supplier.id}</td>
                    <td style={styles.tableCell}>{supplier.name}</td>
                    <td style={styles.tableCell}>{supplier.contact_info || '—'}</td>
                    <td style={styles.tableCell}>{supplier.payment_terms || '—'}</td>
                    <td style={styles.tableCell}>{supplier.lead_time || '—'}</td>
                    <td style={styles.tableCell}>
                      {getSupplierProducts(supplier.id).map(p => p.name).join(', ') || 'None'}
                    </td>
                    <td style={styles.tableCell}>
                      <button 
                        style={{...styles.button, ...styles.buttonSecondary, ...styles.buttonSmall}}
                        onClick={() => handleEdit(supplier)}
                        className="btn"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No suppliers found.</p>
        )}
      </div>

      {/* Add/Edit Supplier Form */}
      {showAddForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="modal">
            <div style={styles.modalHeader}>
              <h3 style={{margin: 0}}>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Info:</label>
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Terms:</label>
                <input
                  type="text"
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Lead Time (days):</label>
                <input
                  type="number"
                  name="lead_time"
                  value={formData.lead_time}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="submit" 
                  style={{...styles.button, ...styles.buttonPrimary}}
                  className="btn"
                >
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
                <button 
                  type="button" 
                  style={{...styles.button, ...styles.buttonSecondary}}
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSupplier(null);
                  }}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Place Order Form */}
      {showOrderForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="modal">
            <div style={styles.modalHeader}>
              <h3 style={{margin: 0}}>Place Restock Order for {selectedProduct?.name}</h3>
            </div>
            <form onSubmit={handleOrderSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Supplier:</label>
                <select
                  name="supplier_id"
                  value={orderFormData.supplier_id}
                  onChange={handleOrderInputChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={orderFormData.quantity}
                  onChange={handleOrderInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expected Delivery Date:</label>
                <input
                  type="date"
                  name="expected_delivery_date"
                  value={orderFormData.expected_delivery_date}
                  onChange={handleOrderInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="submit" 
                  style={{...styles.button, ...styles.buttonPrimary}}
                  className="btn"
                >
                  Place Order
                </button>
                <button 
                  type="button" 
                  style={{...styles.button, ...styles.buttonSecondary}}
                  onClick={() => setShowOrderForm(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock History */}
      <div style={styles.section}>
        <h3>Restock History</h3>
        {restocks.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Product</th>
                  <th style={styles.tableHeader}>Supplier</th>
                  <th style={styles.tableHeader}>Quantity</th>
                  <th style={styles.tableHeader}>Order Date</th>
                  <th style={styles.tableHeader}>Expected Delivery</th>
                  <th style={styles.tableHeader}>Actual Delivery</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {restocks.map(restock => (
                  <tr key={restock.id}>
                    <td style={styles.tableCell}>{restock.product_name || `Product ${restock.product_id}`}</td>
                    <td style={styles.tableCell}>{restock.supplier_name || `Supplier ${restock.supplier_id}`}</td>
                    <td style={styles.tableCell}>{restock.quantity}</td>
                    <td style={styles.tableCell}>{restock.order_date || '—'}</td>
                    <td style={styles.tableCell}>{restock.expected_delivery_date || '—'}</td>
                    <td style={styles.tableCell}>{restock.actual_delivery_date || '—'}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.status,
                        ...(restock.status.toLowerCase() === 'processing' ? styles.statusProcessing :
                            restock.status.toLowerCase() === 'shipped' ? styles.statusShipped :
                            styles.statusDelivered)
                      }}>
                        {restock.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No restock history available.</p>
        )}
      </div>
    </div>
  );
}