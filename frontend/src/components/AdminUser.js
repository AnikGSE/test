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

        {/* User Management Section */}
        <div className="user-management-section section-card">
          <h3>👥 User Management 👥</h3>
          {loadingUsers && <p>Loading users...</p>}
          {usersError && <p className="error-message">{usersError}</p>}
          {!loadingUsers && !usersError && (
            <div className="table-container">
              {users.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          {user.role === 'staff' && currentUser && user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

export default AdminDashboard;