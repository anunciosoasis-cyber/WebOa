import React from 'react';

const BoardHeader = ({ title, subtitle, rightElement }) => {
  return (
    <div className="flex justify-between items-center mb-10 border-b-2 border-slate-100 pb-6">
      <div className="flex flex-col">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          {title}
        </h1>
        {subtitle && (
          <span className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-widest">
            {subtitle}
          </span>
        )}
      </div>
      {rightElement && (
        <div>{rightElement}</div>
      )}
    </div>
  );
};

export default BoardHeader;
