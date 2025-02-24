import React from 'react';

const Widget = ({ title, children }) => {
  return (
    <div className="widget">
      <h2>{title}</h2>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default Widget;