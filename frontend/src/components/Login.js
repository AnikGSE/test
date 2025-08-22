import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }

    const userData = { email, password };

    try {
      const response = await fetch('/backend/login_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Login successful!');

        const role = (data.user.role || '').toLowerCase().trim();
        console.log('Logged in user role:', role); // Debugging

        // Save user to context
        const loggedInUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: role,
        };
        login(loggedInUser);

        // Redirect based on normalized role
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'staff') {
          navigate('/staff-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setMessage(data.message || 'Login failed. Invalid credentials or server error.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Network error or server unavailable.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-card">
        <h2 className="login-title">User Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email:</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password:</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">Login</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
