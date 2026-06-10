import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/404-styles.css';

const NotFound = () => (
  <div className="not-found-wrapper">
    <div className="bg-glow"></div>
    <header className="minimal-header">
      <Link to="/" className="logo">
        <div className="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <span>TaskMaster</span>
      </Link>
    </header>
    <main className="not-found-container">
      <div className="not-found-content">
        <p className="error-code">404</p>
        <h1 className="error-title">Page not found</h1>
        <p className="error-desc">
          Oops! The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
        </p>
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  </div>
);

export default NotFound;
