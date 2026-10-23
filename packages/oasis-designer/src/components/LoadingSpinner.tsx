import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <div className="spinner">
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(91, 46, 166, 0.1);
            border-left-color: #5b2ea6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;
