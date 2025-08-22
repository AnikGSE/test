import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext is available
import { useNavigate } from 'react-router-dom'; // For potential future navigation
import '../App.css'; // Reuse App.css for styling

function StaffDashboard() {
  const { user } = useAuth(); // Get current user info from AuthContext

  // Placeholder states for Sales Overview data
  const [totalSalesToday, setTotalSalesToday] = useState('N/A');
  const [transactionsToday, setTransactionsToday] = useState('N/A');
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);

  // State for Product Inventory Management (frontend-only for now)
  const [products, setProducts] = useState([]);

  const [showProductInventory, setShowProductInventory] = useState(false); // New state to toggle inventory visibility

  // Placeholder for low stock count (derived from dummy products)
  const [lowStockItemsCount, setLowStockItemsCount] = useState('N/A');

  // Simulate fetching dashboard and product data
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      // Simulate API call for sales overview data
      setTimeout(() => {
        setTotalSalesToday('$1,234.56');
        setTransactionsToday('15');
      }, 500); // Short delay

      // Simulate API call for product list and inventory overview
      setTimeout(() => {
        const dummyProducts = [
          { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 1200.50, stock_quantity: 10, category: 'Electronics' },
          { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 25.00, stock_quantity: 5, category: 'Accessories' },
          { id: 3, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 85.99, stock_quantity: 2, category: 'Electronics' }, // Low stock
          { id: 4, name: 'USB-C Hub', description: 'Multi-port USB-C adapter', price: 30.00, stock_quantity: 25, category: 'Accessories' },
          { id: 5, name: 'Webcam 1080p', description: 'Full HD webcam for conferencing', price: 45.00, stock_quantity: 0, category: 'Electronics' }, // Low stock (out of stock)
        ];
        setProducts(dummyProducts);
        // Calculate low stock items (e.g., quantity < 5)
        setLowStockItemsCount(dummyProducts.filter(p => p.stock_quantity < 5).length);
      }, 1000); // Longer delay for products

      // Final loading state after all dummy data is set
      setTimeout(() => {
        setLoadingDashboardData(false);
      }, 1200);
    };

    fetchAllDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // Handlers for Quick Actions (currently just alerts)
  const handleRecordSale = () => {
    alert('🛒 Record Sale functionality will be implemented here!');
    // navigate('/record-sale'); // Future: navigate to a dedicated sales page
  };

  const handleCheckStock = () => {
    // Toggles the visibility of the product inventory table
    setShowProductInventory(prev => !prev);
  };

  const handleGenerateReport = () => {
    alert('📄 Generate Report functionality will be implemented here!');
    // navigate('/reports'); // Future: navigate to a report generation page
  };


  // Optional: Display a loading message if user context isn't ready
  if (!user) {
    return (
      <div className="staff-dashboard-container">
        <p className="loading-message">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-container">
      {/* <div className="dashboard-header">
        <h2 className="dashboard-title">Staff Dashboard</h2>
        <p className="welcome-text">Welcome, {user.name} ({user.role})!</p>
      </div> */}

      {loadingDashboardData ? (
        <p className="loading-message">Loading dashboard overview...</p>
      ) : (
        <div className="dashboard-grid">
          {/* Sales Overview Card */}
          <div className="dashboard-card sales-overview-card">
            <h3 className="card-title">📈 Sales Overview</h3>
            <div className="card-content">
              <p>Total Sales Today: <strong>{totalSalesToday}</strong></p>
              <p>Transactions Today: <strong>{transactionsToday}</strong></p>
            </div>
            <button className="card-button" onClick={handleRecordSale}>Record New Sale</button>
          </div>

          {/* Inventory Management Card */}
          <div className="dashboard-card inventory-card">
            <h3 className="card-title">📦 Inventory Overview</h3>
            <div className="card-content">
              <p>Items in Low Stock: <strong>{lowStockItemsCount}</strong></p>
              <p>Total Products: <strong>{products.length}</strong></p>
            </div>
            <button className="card-button" onClick={handleCheckStock}>
              {'View/Manage Inventory'}
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card quick-actions-card">
            <h3 className="card-title">⚡ Quick Actions</h3>
            <div className="card-content quick-actions-buttons">
              <button className="action-button" onClick={handleRecordSale}>
                <span role="img" aria-label="cart">🛒</span> Record Sale
              </button>
              <button className="action-button" onClick={handleCheckStock}>
                <span role="img" aria-label="search">🔍</span> Check Stock
              </button>
              <button className="action-button" onClick={handleGenerateReport}>
                <span role="img" aria-label="report">📄</span> Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StaffDashboard;
