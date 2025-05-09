import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-main">
              <span className="logo-gradient">Integration</span>
              <span className="logo-platform">Platform</span>
            </div>
            <div className="logo-divider"></div>
            <div className="logo-byline">
              <span className="by-text">by</span>
              <img 
                src="logo.png" 
                alt="DP World" 
                className="dp-world-logo"
              />
            </div>
          </div>
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  File Mapper
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/component-generator" className="nav-link">
                  XML Component Generator
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;