import React, { useState } from 'react';
import AdminAnnouncements from './components/AdminAnnouncements';
import TemplatesGallery from './components/TemplatesGallery';
import { ThemeProvider } from './context/ThemeContext';
import { FormData } from './data/templates';

const App = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<FormData> | null>(null);

  return (
    <ThemeProvider>
      {selectedTemplate ? (
        <div style={{ height: '100vh' }}>
          <AdminAnnouncements 
            initialData={selectedTemplate} 
            onBack={() => setSelectedTemplate(null)} 
          />
        </div>
      ) : (
        <TemplatesGallery onSelect={setSelectedTemplate} />
      )}
    </ThemeProvider>
  );
};

export default App;
