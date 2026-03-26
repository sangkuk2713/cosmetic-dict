import React from 'react';
import InfoTable, { InfoRowIf } from './InfoTable';

export default function CosIngModal({ data, onClose }) {
  return (
    <div className="sub-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sub-modal">
        <div className="sub-header">
          <span className="sub-title">🇪🇺 유럽 성분 정보{data ? ` - ${data.inciName}` : ''}</span>
          <button className="btn-close-detail" onClick={onClose}>✕</button>
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
                    <table className="regl-table">
                      <thead>
                        <tr>
                          <th>Annex</th>
                          <th>성분명</th>
                          <th>최대농도</th>
                          <th>사용조건</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.annexRows.map((ar, i) => (
                          <tr key={i}>
                            <td><b>Annex {ar.annex}</b></td>
                            <td>{ar.data.name}</td>
                            <td>{ar.data.conc}</td>
                            <td>{ar.data.wording}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
