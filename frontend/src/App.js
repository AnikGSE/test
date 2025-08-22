import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Login from './components/Login';
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import SalesManagement from './components/SalesManagement'; // NEW
import { CartProvider } from './context/CartContext';
import CartPage from './components/CartPage';
import Supplier from './components/Supplier';
import AdminUser from './components/AdminUser';
import Inventory from './components/Inventory';
import Customer from "./components/Customer";
import Dashboard from "./components/Dashboard";
import Product from "./components/Product";
import './App.css';

function App() {
  const [products, setProducts] = useState([]);

  // Fetch products once here and pass to SalesManagement
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/backend/get_products.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Adjust depending on your backend response structure
        setProducts(data.products || data);
      } catch (err) {
        console.error('Failed to fetch products for SalesManagement:', err);
      }
    };
    fetchProducts();
  }, []); // Empty dependency array ensures it only runs once after the component mounts.

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-main-container">
            <Navbar />
            <div className="app-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/products" element={<PublicRoute><Product /></PublicRoute>} />
                
              
                <Route
                  path="/admin-dashboard"
                  element={
                    <PrivateRoute requiredRole="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin-dashboard-users"
                  element={
                    <PrivateRoute requiredRole="admin">
                      <AdminUser />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin-dashboard-inventory"
                  element={
                    <PrivateRoute requiredRole="admin">
                      <Inventory />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin-dashboard-sales"
                  element={
                    <PrivateRoute requiredRole="admin">
                      <SalesManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/staff-dashboard"
                  element={
                    <PrivateRoute requiredRole="staff">
                      <StaffDashboard />
                    </PrivateRoute>
                  }
                />

                {/* NEW: Sales route for logged-in users */}
                <Route
                  path="/sales"
                  element={
                    <PrivateRoute>
                      <SalesManagement products={products} />
                    </PrivateRoute>
                  }
                />
                <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                
                {/* Add the /supplier route here */}
                <Route path="/supplier" element={<Supplier />} /> {/* Supplier route */}
                <Route path="/admin-dashboard-supplier" element={<Supplier />} />
                <Route path="/admin-dashboard-customer" element={<Customer />} />
              </Routes>
            </div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
