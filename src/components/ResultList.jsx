import React from 'react';

export default function ResultList({ results, selected, onSelect }) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  return (
    <div className="result-list">
      <div className={`result-header ${isMobile ? 'mobile' : 'desktop'}`}>
        <span>No</span>
        <span>국문명</span>
        <span>영문명</span>
        {!isMobile && <><span>CAS No</span><span>구명칭</span></>}
      </div>
      {results.map((item, idx) => (
        <div
          key={idx}
          className={`result-row ${isMobile ? 'mobile' : 'desktop'} ${selected === item ? 'selected' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span>{idx + 1}</span>
          <span>{item.kor}</span>
          <span>{item.eng}</span>
          {!isMobile && <><span>{item.cas}</span><span>{item.old}</span></>}
        </div>
      ))}
    </div>
  );
}
