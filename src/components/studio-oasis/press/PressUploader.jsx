// PressUploader.jsx
import React, { useRef } from 'react';
import OasisButton from './OasisButton';

export const PressUploader = ({ isLoading = false, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.ppt,image/*"
        multiple
        onChange={onFileUpload}
        className="hidden"
        disabled={isLoading}
      />
      <OasisButton
        size="md"
        isLoading={isLoading}
        onClick={handleClick}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        }
      >
        {isLoading ? 'PROCESANDO...' : 'CARGAR ARCHIVO'}
      </OasisButton>
    </div>
  );
};

export default PressUploader;
