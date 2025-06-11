import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Custom styling
import { useState, useEffect } from "react";
import FeatureCard from "../Common/FeatureCard";

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
    }, 2000);
    return () => clearInterval(interval);
    }, []);

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="logo">🧩 Integration Platform Explore Page</div>
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
        <h2>We Proudly Supports!</h2>
        <div className="features-grid">
        <FeatureCard
            to="/file-mapper"
            icon="🧠"
            title="Smart Mapping"
            text="Automatically process Excel mappings and generate ready-to-import Boomi XML components."
        />
        <FeatureCard
            to="/component-generator-excel"
            icon="📄"
            title="Automatic Boomi Profile Generation"
            text="Generate Boomi XML Profiles for request, response and map shape."
        />
        <FeatureCard
            to="/support"
            icon="💡"
            title="Transparent Status"
            text="Use your unique tracking key to view detailed status reports in real-time."
        />
        </div>
      </section>

      <footer className="landing-footer">
      <p>
        &copy; Integration Platform by DP World |{" "}
        <span className="footer-slider-text" key={messageIndex}>
          {messages[messageIndex]}
        </span>
      </p>
      </footer>
    </div>
  );
};

export default LandingPage;
