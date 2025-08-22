import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';


function AdminDashboard() {
  // State for User Management
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  
  // State for Product Management
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingStock, setEditingStock] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [expandedProductId, setExpandedProductId] = useState(null); // New state for expanded details
  const [searchTerm, setSearchTerm] = useState('');

  // State for Add New Product Form
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [addProductMessage, setAddProductMessage] = useState('');

  const { user: currentUser } = useAuth();

  // --- User Management Functions ---

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const response = await fetch('/backend/get_users.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setUsersError(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setLoadingUsers(true);
    setUsersError('');

    try {
      const response = await fetch('/backend/delete_user.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'User deleted successfully!');
        fetchUsers();
      } else {
        setUsersError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setUsersError(`Network error or server unavailable: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  // --- Product Management Functions ---

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const response = await fetch('/backend/get_products.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setProductsError(data.message || 'Failed to fetch products.');
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProductsError(`Failed to fetch products: ${err.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setLoadingProducts(true);
    setProductsError('');

    try {
      const response = await fetch('/backend/delete_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Product deleted successfully!');
        fetchProducts();
      } else {
        setProductsError(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setProductsError(`Network error or server unavailable: ${err.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditingStock(product.stock_quantity);
    setEditingPrice(product.price);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingStock('');
    setEditingPrice('');
  };

  const handleSaveProduct = async (productId) => {
    if (isNaN(editingStock) || editingStock < 0 || isNaN(editingPrice) || editingPrice < 0) {
      alert('Please enter valid positive numbers for stock and price.');
      return;
    }

    setLoadingProducts(true);
    setProductsError('');

    try {
      const response = await fetch('/backend/update_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          stock_quantity: parseInt(editingStock),
          price: parseFloat(editingPrice),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Product updated successfully!');
        setEditingProductId(null);
        fetchProducts();
      } else {
        setProductsError(data.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setProductsError(`Network error or server unavailable: ${err.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProductName || !newProductPrice || !newProductStock || !newProductCategory) {
      setAddProductMessage('Please fill in all required fields (Name, Price, Stock, Category).');
      return;
    }
    if (isNaN(newProductPrice) || parseFloat(newProductPrice) < 0) {
      setAddProductMessage('Price must be a valid positive number.');
      return;
    }
    if (isNaN(newProductStock) || parseInt(newProductStock) < 0) {
      setAddProductMessage('Stock must be a valid non-negative integer.');
      return;
    }

    setAddingProduct(true);
    setAddProductMessage('');

    const productData = {
      name: newProductName,
      description: newProductDescription,
      price: parseFloat(newProductPrice),
      stock_quantity: parseInt(newProductStock),
      category: newProductCategory,
    };

    try {
      const response = await fetch('/backend/add_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Product added successfully!');
        setNewProductName('');
        setNewProductDescription('');
        setNewProductPrice('');
        setNewProductStock('');
        setNewProductCategory('');
        setShowAddProductForm(false);
        fetchProducts();
      } else {
        setAddProductMessage(data.message || 'Failed to add product.');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setAddProductMessage(`Network error or server unavailable: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  // --- View Details Function ---
  const toggleProductDetails = (productId) => {
    setExpandedProductId(prevId => (prevId === productId ? null : productId));
  };


  // --- useEffect Hooks ---
  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const getStockStatus = (stock) => {
    if (stock < 50) return { text: 'Low Stock', className: 'low-stock' };
    if (stock > 200) return { text: 'Overstock', className: 'overstock' };
    return { text: 'In Stock', className: 'in-stock' };
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-card">
        <p className="admin-dashboard-text">
        </p>

        <hr className="section-divider" />

        {/* Product Management Section */}
        
        <div className="product-management-section section-card">
          <h3>📦 Inventory Management 📦</h3>
          <button
            onClick={() => setShowAddProductForm(!showAddProductForm)}
            className="add-product-toggle-button"
          >
            {showAddProductForm ? 'Hide Add Product Form' : 'Add New Product'}
          </button>

          {showAddProductForm && (
            <div className="add-product-form-container">
              <h4>Add New Product</h4>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label htmlFor="newProductName">Product Name:</label>
                  <input
                    type="text"
                    id="newProductName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                    
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductDescription">Description (Optional):</label>
                  <textarea
                    id="newProductDescription"
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="newProductPrice">Price:</label>
                  <input
                    type="number"
                    id="newProductPrice"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductStock">Stock Quantity:</label>
                  <input
                    type="number"
                    id="newProductStock"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductCategory">Category:</label>
                  <input
                    type="text"
                    id="newProductCategory"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={addingProduct} className="submit-button add-product-button">
                  {addingProduct ? 'Adding...' : 'Add Product'}
                </button>
                {addProductMessage && <p className={`form-message ${addProductMessage.includes('successful') ? 'success' : 'error'}`}>{addProductMessage}</p>}
              </form>
            </div>
          )}
          <div className="search-container" style={{ margin: '1rem 0' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', width: '250px', marginRight: '10px' }}
            />
            <button
              onClick={() => {}}
              className="search-button"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#3498db', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Search
            </button>
          </div>

          {loadingProducts && <p>Loading products...</p>}
          {productsError && <p className="error-message">{productsError}</p>}
          {!loadingProducts && !productsError && (
            <div className="table-container">
              {products.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                    .filter(product =>
                      product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(product => {
                      const status = getStockStatus(product.stock_quantity);
                      return (
                        <React.Fragment key={product.id}>
                          <tr>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            {editingProductId === product.id ? (
                              <>
                                <td>
                                  <input
                                    type="number"
                                    value={editingPrice}
                                    onChange={(e) => setEditingPrice(e.target.value)}
                                    className="edit-input"
                                    step="0.01"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={editingStock}
                                    onChange={(e) => setEditingStock(e.target.value)}
                                    className="edit-input"
                                    min="0"
                                  />
                                </td>
                                <td>-</td>
                              </>
                            ) : (
                              <>
                                <td>${parseFloat(product.price).toFixed(2)}</td>
                                <td>{product.stock_quantity}</td>
                                <td className={status.className}>{status.text}</td>
                              </>
                            )}
                            <td className="product-actions-cell">
                              {editingProductId === product.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveProduct(product.id)}
                                    className="save-button"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="cancel-button"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="edit-button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    className="delete-button"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => toggleProductDetails(product.id)}
                                    className="view-details-button"
                                  >
                                    {expandedProductId === product.id ? 'Hide Details' : 'View Details'}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                          {expandedProductId === product.id && (
                            <tr className="expanded-details-row">
                              <td colSpan="6">
                                <div className="expanded-details-content">
                                  <p><strong>Description:</strong> {product.description || 'No description available.'}</p>
                                  <p><strong>Category:</strong> {product.category}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No products found.</p>
              )}
            </div>
          )}
        </div>


        

      </div>
    </div>
  );
}

export default AdminDashboard;