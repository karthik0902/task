import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-page">

      {}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="home-logo">Task<span>Master</span></Link>
          <div className="nav-actions">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </header>

      <main>
        {}
        <section className="hero">
          <div className="hero-content">
            <h1>
              Manage your tasks efficiently,{' '}
              <br />
              without the clutter.
            </h1>
            <p>
              The ultimate tool to organize your workflow, boost productivity,
              and get things done. Built for modern teams and focused individuals.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started for Free
              </Link>
              <a href="#features" className="btn btn-outline btn-large">
                View Features
              </a>
            </div>
          </div>
        </section>

        {}
        <section id="features" className="features">
          <div className="features-container">
            <div className="section-title">
              <h2>Everything you need to stay on track</h2>
            </div>
            <div className="features-grid">

              <div className="feature-card">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <h3>Seamless Organization</h3>
                <p>
                  Easily create, edit, and organize your tasks. Toggle between pending and
                  completed statuses with a single click to track your progress.
                </p>
              </div>

              <div className="feature-card">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3>Secure Authentication</h3>
                <p>
                  Your data is safe with us. We use industry-standard JSON Web Tokens (JWT)
                  to ensure your account and tasks remain entirely private.
                </p>
              </div>

              <div className="feature-card">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3>Lightning Fast</h3>
                <p>
                  Built on the modern MERN stack. Enjoy a snappy, single-page application
                  experience where your dashboard updates instantly without reloading.
                </p>
              </div>

            </div>
          </div>
        </section>

        {}
        <section className="how-it-works">
          <div className="works-container">
            <div className="section-title">
              <h2>How TaskMaster works</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Get started in seconds and take control of your day.
              </p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Create an Account</h3>
                <p>Sign up securely using your email. Your account is protected with JWT authentication.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Add Your Tasks</h3>
                <p>Quickly add pending tasks, set descriptions, and organize what needs to be done.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Track Progress</h3>
                <p>Mark tasks as completed as you finish them and enjoy a clutter-free dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="bottom-cta">
          <div className="cta-content">
            <h2>Ready to boost your productivity?</h2>
            <p>
              Join our community today and start managing your tasks the right way.
              It's completely free.
            </p>
            <Link to="/register" className="btn btn-cta-invert btn-large">
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-container">
          <p>© 2024 TaskMaster. All rights reserved.</p>
          <div className="footer-links">
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
