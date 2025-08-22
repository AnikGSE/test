import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/backend/get_products.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Your Partner in Local Business Growth</h1>
          <p>
            Dedicated to delivering quality products and services that bring value, 
            convenience, and impact to everyday life
          </p>
        </div>
      </section>
      

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Total Office Center?</h2>
            <p>We provide comprehensive office solutions with unmatched convenience and quality</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Wide Product Range</h3>
              <p>Thousands of products from stationery to office furniture, all in one place for your convenience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Competitive Pricing</h3>
              <p>Get the best value for your money with our competitive prices and regular discounts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery services to ensure you get what you need when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Total Office Center</h2>
              <p>
                Founded with the vision to revolutionize office supplies shopping, 
                Total Office Center has grown to become the premier destination for all office and stationery needs.
              </p>
              <p>
                Our mission is to provide businesses and individuals with a seamless shopping experience, 
                offering high-quality products at affordable prices with exceptional customer service.
              </p>
              <ul className="about-list">
                <li>Over 10,000 products in stock</li>
                <li>Serving customers since 2010</li>
                <li>Corporate and retail solutions</li>
                <li>Bulk order discounts available</li>
              </ul>
              <button className="btn-hero">Learn More</button>
            </div>
            <div className="about-image">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                alt="Our Office Supply Store"
              />
            </div>
          </div>
        </div>
      </section>
        {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="section-title">
            <h2>Contact Us</h2>
            <p>You can reach us using the information below.</p>
          </div>
          <div className="contact-content" style={{ textAlign: 'center', lineHeight: '1.8' }}>
            <h3>Our Office</h3>
            <p>
              123 Business Avenue<br />
              City Center, 10001
            </p>
            <p><strong>Phone:</strong> +880171185292</p>
            <p><strong>Email:</strong> info@totaloffice.com</p>
          </div>
        </div>
      </section>
       
    </div>
  );
}

export default Home;
