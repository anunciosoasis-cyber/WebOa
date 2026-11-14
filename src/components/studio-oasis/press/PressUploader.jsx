// PressUploader.jsx — botón de icono para cargar PDF / PPTX / imágenes
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

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
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.ppt,image/*"
        multiple
        onChange={onFileUpload}
        className="hidden"
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        title={isLoading ? 'Procesando archivo…' : 'Cargar archivo (PDF, PPTX o imágenes)'}
        aria-label="Cargar archivo"
        aria-busy={isLoading}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 bg-white text-slate-700 shadow-sm border border-gray-100 hover:shadow-md hover:text-oasis-orange disabled:opacity-60"
      >
        {isLoading
          ? <span className="w-4 h-4 border-2 border-oasis-yellow border-t-transparent rounded-full animate-spin" />
          : <Upload size={16} strokeWidth={2.5} />}
      </button>
    </>
  );
};

export default PressUploader;
