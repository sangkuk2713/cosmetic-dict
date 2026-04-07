import React, { useRef, useEffect } from 'react';

export default function SearchBar({ value, onChange, disabled }) {
  const ref = useRef();
  // We keep focus on desktop, but maybe avoid auto-focus on mobile so keyboard doesn't pop up immediately.
  useEffect(() => { 
    if (!disabled && window.innerWidth > 600) ref.current?.focus(); 
  }, [disabled]);

  return (
    <div className="search-box">
      <span className="google-symbols search-icon">search</span>
      <input
        ref={ref}
        type="text"
        placeholder="성분명 입력 (국문, 영문, 구명칭, CAS)"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
      {value && (
        <button className="search-clear" onClick={() => { onChange(''); ref.current?.focus(); }}>
          <span className="google-symbols">close</span>
        </button>
      )}
    </div>
  );
}
