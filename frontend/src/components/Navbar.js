import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="container header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          Total <span>Office</span> Center
        </Link>

        {/* Main Nav Links */}
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        {/* Auth Buttons / User Info */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              {user && (
                <span style={{ color: '#fff', marginRight: '1rem' }}>
                  Welcome, {user.name} ({user.role})
                </span>
              )}

              {/* Dashboard Buttons */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className="btn btn-signup"
                  style={{ marginRight: '0.5rem' }}
                >
                  Admin Dashboard
                </Link>
              )}
              {user?.role === 'staff' && (
                <Link
                  to="/staff-dashboard"
                  className="btn btn-signup"
                  style={{ marginRight: '0.5rem' }}
                >
                  Staff Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-login"
                style={{ cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-login" id="login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-signup" id="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
