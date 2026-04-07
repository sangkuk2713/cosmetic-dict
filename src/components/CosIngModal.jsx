import React from 'react';
import InfoTable, { InfoRowIf } from './InfoTable';

export default function CosIngModal({ data, onClose }) {
  return (
    <div className="sub-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sub-modal">
        <div className="sub-header">
          <span className="sub-title">
            <span className="google-symbols result-icon" style={{marginRight: '8px', color: 'var(--primary-color)'}}>public</span>
            🇪🇺 유럽 성분 정보{data ? ` - ${data.inciName}` : ''}
          </span>
          <button className="btn-close-detail" onClick={onClose}>
            <span className="google-symbols">close</span>
          </button>
        </div>
        <div className="sub-body">
          {!data ? (
            <p className="loading">데이터가 없습니다.</p>
          ) : (
            <>
              <div className="detail-section">
                <InfoTable>
                  <InfoRowIf label="INCI Name"    value={data.inciName} />
                  <InfoRowIf label="INN Name"     value={data.innName} />
                  <InfoRowIf label="Ph. Eur."     value={data.phEurName} />
                  <InfoRowIf label="CAS No"       value={data.casNo} />
                  <InfoRowIf label="EC No"        value={data.ecNo} />
                  <InfoRowIf label="Description"  value={data.description} />
                  <InfoRowIf label="Chem Name"    value={data.chemName} />
                  {data.function_ && (
                    <InfoRowIf label="Function"
                      value={data.function_.replace(/;/g, '\n')}
                      render={v => v.split('\n').map((l,i) => <div key={i}>{l}</div>)}
                    />
                  )}
                  <InfoRowIf label="Restriction"  value={data.restriction} />
                  <InfoRowIf label="Other Restr." value={data.otherRestr} />
                  <InfoRowIf label="Status"       value={data.status} />
                </InfoTable>
              </div>

              {data.annexRows && data.annexRows.length > 0 && (
                <div className="detail-section">
                  <div className="section-title">유럽 규제 정보 (Annex)</div>
                  <div className="regl-scroll">
                    {data.annexRows.map((ar, i) => (
                      <div key={i} className="regl-card">
                        <div className="regl-badge-row">
                          <span className="badge-limit">
                            <span className="google-symbols" style={{fontSize: '14px'}}>warning</span>
                            Annex {ar.annex}
                          </span>
                        </div>
                        <div className="regl-dd"><strong>성분명:</strong> {ar.data.name}</div>
                        {ar.data.conc && <div className="regl-dt"><strong>최대농도:</strong> {ar.data.conc}</div>}
                        {ar.data.wording && <div className="regl-dt"><strong>사용조건:</strong> {ar.data.wording}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
