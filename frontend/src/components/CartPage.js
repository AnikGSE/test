import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const navigate = useNavigate();
  const taxRate = 0.05;

  const getPrice = (price) => parseFloat(price) || 0;
  const subTotal = cart.reduce((sum, item) => sum + getPrice(item.price) * item.qty, 0);
  const discountAmount = (subTotal * discount) / 100;
  const tax = (subTotal - discountAmount) * taxRate;
  const total = subTotal - discountAmount + tax;

  const handleCheckout = () => {
    if (!paymentMethod) {
      alert('Please select a payment method before proceeding.');
      return;
    }
    alert(`Transaction complete!\nPayment via: ${paymentMethod}\nTotal: $${total.toFixed(2)}`);
    clearCart();
    setDiscount(0);
    navigate('/'); // Redirect to homepage after checkout
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h2 className="cart-title">Your Shopping Cart</h2>
        <button className="back-to-shop-btn" onClick={() => navigate('/sales')}>
          ← Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart-icon">🛒</div>
          <p className="empty-cart-message">Your cart is empty</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/sales')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h3>Items ({cart.length})</h3>
            </div>
            
            <div className="cart-items-list">
              {cart.map(item => (
                <div className="cart-item-card" key={item.id}>
                  <div className="item-image-container">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">${getPrice(item.price).toFixed(2)}</p>
                    
                    <div className="item-controls">
                      <div className="quantity-control">
                        <label>Quantity:</label>
                        <div className="quantity-input-group">
                          <button 
                            className="qty-btn minus"
                            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                            className="qty-input"
                          />
                          <button 
                            className="qty-btn plus"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-subtotal">
                    <span className="subtotal-label">Subtotal:</span>
                    <span className="subtotal-amount">${(getPrice(item.price) * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-details">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-line discount-line">
                  <div className="discount-input-container">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="discount-input"
                    />
                  </div>
                  <span className="discount-amount">- ${discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="summary-line">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-options">
                  <div 
                    className={`payment-option ${paymentMethod === 'Bkash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Bkash')}
                  >
                    <div className="payment-icon">bKash</div>
                    <span>bKash</span>
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'Visa' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Visa')}
                  >
                    <div className="payment-icon">Visa</div>
                    <span>Visa</span>
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'MasterCard' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('MasterCard')}
                  >
                    <div className="payment-icon">MC</div>
                    <span>MasterCard</span>
                  </div>
                </div>
              </div>

              <button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={!paymentMethod}
              >
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;