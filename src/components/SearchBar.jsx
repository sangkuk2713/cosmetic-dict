import React, { useRef, useEffect } from 'react';

export default function SearchBar({ value, onChange, disabled }) {
  const ref = useRef();
  useEffect(() => { if (!disabled) ref.current?.focus(); }, [disabled]);

  return (
    <div className="search-box">
      <input
        ref={ref}
        type="text"
        placeholder="성분명 입력 (국문, 영문, 구명칭)"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
