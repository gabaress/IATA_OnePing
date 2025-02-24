import React from "react";
import Widget from "../widget.jsx";

const HomePage = () => {
  return (
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
      <Widget title="Agent">
        <p>Krishna & Favour API</p>
      </Widget>
    </div>
  );
};

export default HomePage;