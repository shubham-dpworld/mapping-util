import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Custom styling
import { useState, useEffect } from "react";

const messages = [
    "Designed for Integrators",
    "Seamless Mapping Starts Here",
    "Built with Security and Speed",
];

const LandingPage = () => {

    const [messageIndex, setMessageIndex] = useState(0);
   

    useEffect(() => {
    const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1000);
    return () => clearInterval(interval);
    }, []);

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="logo">🧩 MappingUtil - A Product of Integration Platform </div>
        <nav className="nav-links">
          <Link to="/file-mapper">Generate XML</Link>
          <Link to="/support">Support</Link>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-text">
          <h1>Accelerate Your Integration Workflows</h1>
          <p>
            Convert Excel mapping files to Boomi-compatible XMLs with ease. Fast. Secure. Developer-Friendly.
          </p>
          <Link to="/file-mapper" className="cta-button">
            🚀 Get Started
          </Link>
        </div>
        <div className="hero-image">
        <img
            src="workflow-integration.jpg"
            alt="Visual representation of integration workflow"
        />
        </div>
      </main>

      <section className="features-section">
        <h2>Why Use MappingUtil?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🧠 Smart Mapping</h3>
            <p>Automatically process Excel mappings and generate ready-to-import Boomi XML components.</p>
          </div>
          <div className="feature-card">
            <h3>📄 Format Friendly</h3>
            <p>Support for XLSX/XLS, intuitive field validation, and clean XML output.</p>
          </div>
          <div className="feature-card">
            <h3>💡 Transparent Status</h3>
            <p>Use your unique tracking key to view detailed status reports in real-time.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
      <p>
        &copy; MappingUtil by DP World |{" "}
        <span className="footer-slider-text" key={messageIndex}>
          {messages[messageIndex]}
        </span>
      </p>
      </footer>
    </div>
  );
};

export default LandingPage;
