// components/Product.js
import React, { useState, useMemo, useCallback, useEffect } from "react";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [showInvoice, setShowInvoice] = useState(false);

  // Load products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use your API endpoint here
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          // Fallback to static data if API is not available
          console.log('Failed to load data from API, using static data');
          setProducts([
            {
              id: 1,
              name: 'Bluetooth Speaker',
              description: 'Portable waterproof Bluetooth speaker.',
              price: 35.50,
              stock_quantity: 200,
              category: 'Audio'
            },
            {
              id: 2,
              name: 'USB-C Hub',
              description: '7-in-1 USB-C Hub with HDMI and USB 3.0 ports.',
              price: 25.00,
              stock_quantity: 10,
              category: 'Accessories'
            },
            {
              id: 3,
              name: 'Pen',
              description: 'Erasable pen',
              price: 25.00,
              stock_quantity: 100,
              category: 'Stationary'
            },
            {
              id: 4,
              name: 'Pencil',
              description: '2B pencil',
              price: 54.00,
              stock_quantity: 100,
              category: 'Stationary'
            },
            {
              id: 8,
              name: 'Notebook',
              description: 'Hearts Notebook',
              price: 150.00,
              stock_quantity: 50,
              category: 'Stationary'
            },
            {
              id: 9,
              name: 'Drawing Book',
              description: 'Hearts Drawing Book 100 pages',
              price: 200.00,
              stock_quantity: 150,
              category: 'Stationary'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Format currency
  const currency = useCallback((num) => {
    const n = Number(num ?? 0);
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }, []);

  // Add to cart function
  const handleAddToCart = useCallback((product) => {
    if (product.stock_quantity <= 0) {
      setNotification("Product is out of stock!");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // If already in cart, increase quantity if stock allows
        if (existingItem.quantity < product.stock_quantity) {
          return prevCart.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          setNotification("Cannot add more than available stock!");
          setTimeout(() => setNotification(""), 3000);
          return prevCart;
        }
      } else {
        // Add new item to cart
        return [...prevCart, { 
          ...product, 
          quantity: 1,
          price: Number(product.price)
        }];
      }
    });

    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  // Remove from cart function
  const handleRemoveFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  // Update quantity in cart
  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) } 
          : item
      )
    );
  }, [handleRemoveFromCart]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [cart]);

  // Generate invoice
  const generateInvoice = useCallback(() => {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString();
    
    return {
      invoiceNumber,
      invoiceDate,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      totals: cartTotals,
      paymentMethod
    };
  }, [cart, cartTotals, paymentMethod]);

  // Handle checkout process
  const handleCheckoutProcess = useCallback(async () => {
    if (cart.length === 0) {
      setNotification("Cart is empty!");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      // Generate invoice
      const newInvoice = generateInvoice();
      setInvoice(newInvoice);
      setShowInvoice(true);
      
      // Here you would typically send the order to your backend
      console.log("Checkout data:", { cart, totals: cartTotals, paymentMethod });
      
      // Clear cart after successful checkout
      setCart([]);
      setIsCartOpen(false);
      setNotification("Order placed successfully!");
      setTimeout(() => setNotification(""), 3000);
      
    } catch (error) {
      setNotification("Checkout failed: " + error.message);
      setTimeout(() => setNotification(""), 3000);
    }
  }, [cart, cartTotals, paymentMethod, generateInvoice]);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-container">
      {/* Notification */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      {/* Header with cart icon */}
      <div className="products-header">
        <h2>Products</h2>
        <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
          🛒 {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="products-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <div className="image-placeholder">📦</div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-sku">SKU: {product.id}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">{currency(product.price)}</div>
                <div className="product-stock">
                  Stock: {product.stock_quantity > 0 ? product.stock_quantity : "Out of stock"}
                </div>
                
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock_quantity <= 0}
                >
                  {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">No products available</div>
        )}
      </div>
      
      {/* Shopping Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
        </div>
        
        {cart.length > 0 ? (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{currency(item.price)} each</div>
                  </div>
                  
                  <div className="item-controls">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >−</button>
                    
                    <span className="item-quantity">{item.quantity}</span>
                    
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="quantity-btn"
                    >+</button>
                    
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="remove-btn"
                    >×</button>
                  </div>
                  
                  <div className="item-total">
                    {currency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>{currency(cartTotals.subtotal)}</span>
              </div>
              
              <div className="total-line">
                <span>Tax (10%):</span>
                <span>{currency(cartTotals.tax)}</span>
              </div>
              
              <div className="total-line grand-total">
                <span>Total:</span>
                <span>{currency(cartTotals.total)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="payment-section">
              <h4>Payment Method</h4>
              <div className="payment-options">
                <label className="payment-option">
                  <input 
                    type="radio" 
                    value="credit_card" 
                    checked={paymentMethod === "credit_card"} 
                    onChange={() => setPaymentMethod("credit_card")} 
                  />
                  Credit Card
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    value="Bkash" 
                    checked={paymentMethod === "Bkash"} 
                    onChange={() => setPaymentMethod("Bkash")} 
                  />
                  Bkash
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    value="Nagad" 
                    checked={paymentMethod === "Nagad"} 
                    onChange={() => setPaymentMethod("Nagad")} 
                  />
                  Nagad
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    value="cash" 
                    checked={paymentMethod === "cash"} 
                    onChange={() => setPaymentMethod("cash")} 
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={handleCheckoutProcess}
            >
              Checkout
            </button>
          </>
        ) : (
          <div className="empty-cart">Your cart is empty</div>
        )}
      </div>
      
      {/* Invoice Modal */}
      {showInvoice && invoice && (
        <div className="invoice-modal">
          <div className="invoice-content">
            <div className="invoice-header">
              <h2>Invoice</h2>
              <button className="close-invoice" onClick={() => setShowInvoice(false)}>×</button>
            </div>
            
            <div className="invoice-details">
              <div className="invoice-meta">
                <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {invoice.invoiceDate}</p>
                <p><strong>Payment Method:</strong> {invoice.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <div className="invoice-items">
                <h3>Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{currency(item.price)}</td>
                        <td>{currency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="invoice-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>{currency(invoice.totals.subtotal)}</span>
                </div>
                <div className="total-line">
                  <span>Tax (10%):</span>
                  <span>{currency(invoice.totals.tax)}</span>
                </div>
                <div className="total-line grand-total">
                  <span>Total Amount:</span>
                  <span>{currency(invoice.totals.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="invoice-actions">
              <button className="btn-print" onClick={() => window.print()}>Print Invoice</button>
              <button className="btn-close" onClick={() => setShowInvoice(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay when cart is open */}
      {isCartOpen && (
        <div className="overlay" onClick={() => setIsCartOpen(false)}></div>
      )}

      <style jsx>{`
        /* Main container */
        .products-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
        }
        
        /* Loading */
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }
        
        /* Notification */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 20px;
          border-radius: 4px;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        /* Header */
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .products-header h2 {
          margin: 0;
          color: #333;
        }
        
        .cart-icon {
          position: relative;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
        }
        
        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        
        /* Products grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        /* Product card */
        .product-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .product-image {
          height: 180px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-placeholder {
          font-size: 60px;
          opacity: 0.3;
        }
        
        .product-info {
          padding: 20px;
        }
        
        .product-name {
          margin: 0 0 10px;
          font-size: 18px;
          color: #333;
        }
        
        .product-sku {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .product-description {
          color: #666;
          margin-bottom: 15px;
          line-height: 1.4;
          font-size: 14px;
        }
        
        .product-price {
          font-size: 20px;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 10px;
        }
        
        .product-stock {
          font-size: 14px;
          margin-bottom: 15px;
          color: #666;
        }
        
        .add-to-cart-btn {
          width: 100%;
          padding: 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }
        
        .add-to-cart-btn:hover:not(:disabled) {
          background: #388E3C;
        }
        
        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        /* Cart sidebar */
        .cart-sidebar {
          position: fixed;
          top: 0;
          right: -400px;
          width: 380px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0,0,0,0.1);
          transition: right 0.3s ease;
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }
        
        .cart-sidebar.open {
          right: 0;
        }
        
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .cart-header h3 {
          margin: 0;
        }
        
        .close-cart {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        
        .cart-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .item-price {
          color: #666;
          font-size: 14px;
        }
        
        .item-controls {
          display: flex;
          align-items: center;
          margin: 0 15px;
        }
        
        .quantity-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .item-quantity {
          margin: 0 10px;
          min-width: 20px;
          text-align: center;
        }
        
        .remove-btn {
          margin-left: 10px;
          background: #ff4757;
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .item-total {
          font-weight: bold;
          min-width: 80px;
          text-align: right;
        }
        
        .cart-totals {
          padding: 20px;
          border-top: 1px solid #eee;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .total-line.grand-total {
          font-weight: bold;
          font-size: 18px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        /* Payment Section */
        .payment-section {
          padding: 0 20px;
          margin-bottom: 20px;
        }
        
        .payment-section h4 {
          margin-bottom: 10px;
        }
        
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .payment-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkout-btn {
          width: calc(100% - 40px);
          margin: 0 20px 20px;
          padding: 15px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .checkout-btn:hover {
          background: #388E3C;
        }
        
        .empty-cart {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        /* Invoice Modal */
        .invoice-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        .invoice-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .invoice-header h2 {
          margin: 0;
        }
        
        .close-invoice {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .invoice-meta {
          margin-bottom: 20px;
        }
        
        .invoice-meta p {
          margin: 5px 0;
        }
        
        .invoice-items {
          margin-bottom: 20px;
        }
        
        .invoice-items h3 {
          margin-bottom: 10px;
        }
        
        .invoice-items table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .invoice-items th, .invoice-items td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .invoice-items th {
          font-weight: bold;
          background: #f9f9f9;
        }
        
        .invoice-totals {
          border-top: 2px solid #eee;
          padding-top: 15px;
        }
        
        .invoice-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-print, .btn-close {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .btn-print {
          background: #2c5aa0;
          color: white;
        }
        
        .btn-close {
          background: #666;
          color: white;
        }
        
        /* Overlay */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
          
          .cart-sidebar {
            width: 100%;
            right: -100%;
          }
          
          .invoice-content {
            width: 95%;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;