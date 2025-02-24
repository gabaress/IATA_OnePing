import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Widget from "./components/widget.jsx";
import Navbar from './components/folder/navbar.jsx';
import './App.css';

// Page Components
import HomePage from './components/pages/HomePage.jsx';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;