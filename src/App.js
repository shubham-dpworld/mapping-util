import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FileMapper from './components/FileMapper/FileMapper';
import ComponentGenerator from './components/ComponentGenerator/ComponentGenerator';
import './App.css';
import ComponentGeneratorWithExcel from './components/ComponentGeneratorWithExcel/ComponentGeneratorWithExcel';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FileMapper />} />
            <Route path="/component-generator" element={<ComponentGenerator />} />
            <Route path="/component-generator-excel" element={<ComponentGeneratorWithExcel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;