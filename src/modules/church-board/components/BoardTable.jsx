import React from 'react';

const BoardTable = ({ columns, data, renderRow }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80">
      {/* Cabecera Naranja Gradiente */}
      <div 
        className="grid bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black px-6 py-3 rounded-2xl mx-2 mt-2 text-xs tracking-widest uppercase shadow-md shadow-amber-500/20"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col, index) => (
          <div 
            key={index} 
            className={`${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Cuerpo de la tabla */}
      <div className="p-2">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div 
              key={item.id || index} 
              className={`grid px-6 py-4 items-center text-sm ${index !== data.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors rounded-xl`}
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {renderRow(item)}
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-8 italic">
            No hay datos disponibles.
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardTable;
