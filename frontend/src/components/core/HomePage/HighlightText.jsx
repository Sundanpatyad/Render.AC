import React from 'react';

const HighlightText = ({ text }) => {
  return (
    <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300'>
      {text}
    </span>
  );
}

export default HighlightText;
