import React from 'react';
import InfoTable from './InfoTable';

// \n 포함 값 → 줄 단위로 렌더링 (일본어 + [번역] 한국어 표시)
function NlRow({ label, value }) {
  if (!value || !value.trim()) return null;
  const lines = value.split('\n').map(v => v.trim()).filter(v => v);
  if (!lines.length) return null;
  return (
    <div className="dr">
      <span className="dl">{label}</span>
      <span className="dv">
        {lines.map((l, i) => (
          <div key={i} style={l.startsWith('[번역]') ? {color:'#2c5f8a', marginTop:2} : {}}>
            {l}
          </div>
        ))}
      </span>
    </div>
  );
}

function SimpleRow({ label, value }) {
  if (!value || !value.trim() || value.trim() === '-') return null;
  return (
    <div className="dr">
      <span className="dl">{label}</span>
      <span className="dv">{value}</span>
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
            <div key={i} className="natl-regl-box" style={{borderColor:'#ffb3b3',background:'#fff0f0',marginBottom:8}}>
              <div className="natl-regl-row">
                <span className="natl-regl-label">{label}</span>
                <span className="natl-regl-val"><span className="badge-ban">배합금지</span></span>
              </div>
            </div>
          );
        }
        if (ar.type === 'simple') {
          return (
            <div key={i} className="natl-regl-box" style={{padding:0,overflow:'hidden',marginBottom:8}}>
              <div style={{padding:'8px 12px',background:'#f0f4f8',fontWeight:'bold',fontSize:12,color:'#2c5f8a'}}>
                {label} ({ar.searchName})
              </div>
              <div className="regl-scroll">
                {ar.rows.map((rw,j) => (
                  <div key={j} className="regl-card">
                    <div className="regl-dt"><strong>화장품 종류/사용목적:</strong> {rw.cosmeType}</div>
                    <div className="regl-dd" style={{color:'var(--badge-ban-text)', fontWeight:'500'}}><strong>최대배합량(100g당):</strong> {rw.maxConc}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (ar.type === 'triple') {
          return (
            <div key={i} className="natl-regl-box" style={{padding:0,overflow:'hidden',marginBottom:8}}>
              <div style={{padding:'8px 12px',background:'#f0f4f8',fontWeight:'bold',fontSize:12,color:'#2c5f8a'}}>
                {label} ({ar.searchName})
              </div>
              <div className="regl-scroll">
                <div className="regl-card" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <div className="regl-dt"><strong>세척용 (점막X):</strong> <span style={{color:'var(--badge-ban-text)', fontWeight:'500'}}>{ar.wash||'-'}</span></div>
                  <div className="regl-dt"><strong>비세척용 (점막X):</strong> <span style={{color:'var(--badge-ban-text)', fontWeight:'500'}}>{ar.nonwash||'-'}</span></div>
                  <div className="regl-dt"><strong>점막 사용 가능:</strong> <span style={{color:'var(--badge-ban-text)', fontWeight:'500'}}>{ar.mucosa||'-'}</span></div>
                </div>
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
    <div className="sub-overlay show">
      <div className="sub-modal">
        <div className="sub-header">
          <span className="sub-title">
            <span className="google-symbols result-icon" style={{marginRight: '8px', color: 'var(--primary-color)'}}>map</span>
            🇯🇵 일본 성분 정보{data ? ` - ${data.jpName}` : ''}
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
                  <SimpleRow label="일본어명"  value={data.jpName} />
                  <SimpleRow label="INCI명"    value={data.inciName} />
                  <NlRow     label="정의"      value={data.definition} />
                  <NlRow     label="배합목적"  value={data.purpose} />
                  <NlRow     label="규제분류"  value={data.regClass} />
                  <SimpleRow label="CAS RN"    value={data.casRn} />
                  <SimpleRow label="유기성값"  value={data.organic} />
                  <SimpleRow label="무기성값"  value={data.inorganic} />
                  <NlRow     label="비고"      value={data.note} />
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
