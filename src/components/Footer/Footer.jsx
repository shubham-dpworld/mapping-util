import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © {new Date().getFullYear()} Integration Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;