import React from 'react';
import InfoTable, { InfoRowIf, InfoRowNL } from './InfoTable';

function NlbrRow({ label, value }) {
  if (!value) return null;
  // [번역] 포함된 경우 줄바꿈 처리
  const lines = value.split('\n').map(v => v.trim()).filter(v => v);
  if (!lines.length) return null;
  return (
    <div className="dr">
      <span className="dl">{label}</span>
      <span className="dv">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </span>
    </div>
  );
}

function JapanAnnexSection({ annexRows }) {
  if (!annexRows || !annexRows.length) return null;
  return (
    <div className="detail-section">
      <div className="section-title">🗾 일본 규제 정보 (化粧品基準 別表)</div>
      {annexRows.map((ar, i) => {
        const label = `別表第${ar.annexKey}`;
        if (ar.type === 'ban') {
          return (
            <div key={i} className="natl-regl-box" style={{ borderColor: '#ffb3b3', background: '#fff0f0', marginBottom: 8 }}>
              <div className="natl-regl-row">
                <span className="natl-regl-label">{label}</span>
                <span className="natl-regl-val"><span className="badge-ban">배합금지</span></span>
              </div>
            </div>
          );
        }
        if (ar.type === 'simple') {
          return (
            <div key={i} className="natl-regl-box" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ padding: '8px 12px', background: '#f0f4f8', fontWeight: 'bold', fontSize: 12, color: '#2c5f8a' }}>
                {label} ({ar.searchName})
              </div>
              <div className="regl-scroll">
                <table className="regl-table">
                  <thead><tr><th>화장품 종류/사용목적</th><th>최대배합량(100g당)</th></tr></thead>
                  <tbody>
                    {ar.rows.map((rw, j) => (
                      <tr key={j}>
                        <td>{rw.cosmeType}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#c00' }}>{rw.maxConc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        if (ar.type === 'triple') {
          return (
            <div key={i} className="natl-regl-box" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ padding: '8px 12px', background: '#f0f4f8', fontWeight: 'bold', fontSize: 12, color: '#2c5f8a' }}>
                {label} ({ar.searchName})
              </div>
              <div className="regl-scroll">
                <table className="regl-table">
                  <thead>
                    <tr>
                      <th>세척용<br/>(점막X)</th>
                      <th>비세척용<br/>(점막X)</th>
                      <th>점막 사용 가능</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#c00' }}>{ar.wash || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#c00' }}>{ar.nonwash || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#c00' }}>{ar.mucosa || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function JapanModal({ data, onClose }) {
  return (
    <div className="sub-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sub-modal">
        <div className="sub-header">
          <span className="sub-title">🇯🇵 일본 성분 정보{data ? ` - ${data.jpName}` : ''}</span>
          <button className="btn-close-detail" onClick={onClose}>✕</button>
        </div>
        <div className="sub-body">
          {!data ? (
            <p className="loading">데이터가 없습니다.</p>
          ) : (
            <>
              <div className="detail-section">
                <InfoTable>
                  <InfoRowIf label="일본어명"  value={data.jpName} />
                  <InfoRowIf label="INCI명"    value={data.inciName} />
                  <NlbrRow   label="정의"      value={data.definition} />
                  <NlbrRow   label="배합목적"  value={data.purpose} />
                  <NlbrRow   label="규제분류"  value={data.regClass} />
                  <InfoRowIf label="CAS RN"    value={data.casRn} />
                  <InfoRowIf label="유기성값"  value={data.organic} />
                  <InfoRowIf label="무기성값"  value={data.inorganic} />
                  <NlbrRow   label="비고"      value={data.note} />
                </InfoTable>
              </div>
              <JapanAnnexSection annexRows={data.annexRows} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
