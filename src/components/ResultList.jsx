import React from 'react';

export default function ResultList({ results, selected, onSelect }) {
  return (
    <div className="result-list">
      {results.map((item, idx) => {
        const isMat = item.type === 'material';
        
        if (isMat) {
          return (
            <div
              key={idx}
              className={`result-card ${selected === item ? 'selected' : ''}`}
              onClick={() => onSelect(item)}
            >
              <div className="res-title-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <span className="res-kor" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.productName}</span>
                <span className="res-eng" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.maker}{item.supplier ? ` | ${item.supplier}` : ''}</span>
              </div>
              
              <div className="res-badges" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.funcType && (
                  <span className="badge" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>{item.funcType}</span>
                )}
                {item.feature && (
                  <span className="badge" style={{ fontSize: '11px' }}>{item.feature}</span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={`result-card ${selected === item ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
          >
            <div className="res-title-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span className="res-kor" style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.kor}</span>
              <span className="res-eng" style={{ fontSize: '14px', color: 'var(--primary-color)' }}>{item.eng}</span>
            </div>
            
            <div className="res-badges" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {item.cas && item.cas !== '-' && (
                <span className="badge badge-cas">CAS: {item.cas}</span>
              )}
              {item.old && item.old !== '-' && (
                <span className="badge badge-old">구명칭: {item.old}</span>
              )}
              {item.regType && (
                <span className={item.regType.includes('금지') ? 'badge badge-ban' : 'badge badge-limit'}>
                  {item.regType}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
