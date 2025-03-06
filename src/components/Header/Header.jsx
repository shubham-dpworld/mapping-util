import React from 'react';
import './Header.css';
// Update this path to match your actual logo location

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
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
      </div>
    </header>
  );
};

export default Header;