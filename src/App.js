import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FileMapper from './components/FileMapper/FileMapper';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <FileMapper />
      </main>
      <Footer />
    </div>
  );
}

export default App;