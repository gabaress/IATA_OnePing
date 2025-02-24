import React from 'react';
import Widget from "./components/widget.jsx";
import './App.css';
import Navbar from './components/folder/navbar.jsx';

const App = () => {
  return (
    <div>
    <Navbar />
    <div className="dashboard">
      <Widget title="Widget 1">
        <p>This is the content of widget 1.</p>
      </Widget>
      <Widget title="Widget 2">
        <p>This is the content of widget 2.</p>
      </Widget>
      <Widget title="Widget 3">
        <p>This is the content of widget 3.</p>
      </Widget>
      <Widget title="Widget 4">
        <p>This is the content of widget 4.</p>
      </Widget>
    </div>
    </div>
  );
};

export default App;