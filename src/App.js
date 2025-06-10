import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FileMapper from './components/FileMapper/FileMapper';
import ComponentGenerator from './components/ComponentGenerator/ComponentGenerator';
import SupportPage from './components/SupportPage/SupportPage';
import LandingPage from './components/LandingPage/LandingPage';
import './App.css';
import ComponentGeneratorWithExcel from './components/ComponentGeneratorWithExcel/ComponentGeneratorWithExcel';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/file-mapper" element={<FileMapper />} />
            <Route path="/component-generator" element={<ComponentGenerator />} />
            <Route path="/component-generator-excel" element={<ComponentGeneratorWithExcel />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;