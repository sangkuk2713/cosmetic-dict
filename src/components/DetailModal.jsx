import React from 'react';
import InfoTable, { InfoRowIf, InfoRowMulti, InfoRowLinks, InfoRowInline } from './InfoTable';

export default function DetailModal({ item, reglRows, matRows, onClose, onOpenCosIng, onOpenJapan, onOpenMat }) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const modalStyle = isMobile
    ? { width:'100%', maxWidth:'100%', height:'100%', maxHeight:'100%', borderRadius:0 }
    : { width:'92%', maxWidth:'720px', maxHeight:'88vh', borderRadius:'12px' };

  const hasNatlRegl = item.regType || item.regName || item.regNote;

  return (
    <div className="detail-overlay show" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="detail-modal" style={modalStyle}>
        <div className="detail-modal-header">
          <span className="detail-modal-title">
            <span className="google-symbols filled">info</span>
            {item.kor}
          </span>
          <button className="btn-close-detail" onClick={onClose}>
            <span className="google-symbols">close</span>
          </button>
        </div>
        <div className="detail-modal-body">

          {/* 기본 정보 */}
          <div className="detail-section">
            <div className="section-title">
              <span className="google-symbols">list_alt</span> 
              기본 정보
            </div>
            <InfoTable>
              <InfoRowIf    label="국문명"    value={item.kor} />
              <InfoRowMulti label="영문명"    value={item.eng} />
              <InfoRowIf    label="구명칭"    value={item.old} />
              <InfoRowLinks label="유럽성분명" value={item.eu}  onClick={onOpenCosIng} />
              <InfoRowInline label="중문명"   value={item.cn} />
              <InfoRowLinks label="일본어명"  value={item.jp}  onClick={onOpenJapan} />
              <InfoRowMulti label="CAS No"   value={item.cas} />
              <InfoRowMulti label="EC No"    value={item.ec} />
              <InfoRowIf    label="UNII Code" value={item.unii} />
              <InfoRowIf    label="기원및정의" value={item.origin} />
              <InfoRowIf    label="시성식"    value={item.formula} />
              <InfoRowMulti label="배합목적"  value={item.func} />
              <InfoRowIf    label="EWG 등급"  value={item.ewg} />
              <InfoRowIf    label="데이터등급" value={item.ewgData} />
            </InfoTable>
          </div>

          {/* 국내 규제 */}
          {hasNatlRegl && (
            <div className="detail-section">
              <div className="section-title">
                <span className="google-symbols">gavel</span> 
                국내 규제 정보
              </div>
              <div className="natl-regl-box">
                {item.regType && <div className="natl-regl-row"><span className="natl-regl-label">구분</span><span className="natl-regl-val">{item.regType}</span></div>}
                {item.regName && <div className="natl-regl-row"><span className="natl-regl-label">고시명</span><span className="natl-regl-val">{item.regName}</span></div>}
                {item.regNote && <div className="natl-regl-row"><span className="natl-regl-label">단서조항</span><span className="natl-regl-val">{item.regNote}</span></div>}
              </div>
            </div>
          )}

          {/* 규제 정보 (사용제한성분) */}
          {reglRows && reglRows.length > 0 && (
            <div className="detail-section">
              <div className="section-title">
                <span className="google-symbols">public</span> 
                규제 정보
              </div>
              <div className="regl-scroll">
                {reglRows.map((r, i) => (
                  <div key={i} className="regl-card">
                    <div className="regl-badge-row">
                      <span className={r.regType === '금지' ? 'badge-ban' : 'badge-limit'}>
                        {r.regType === '금지' ? <span className="google-symbols" style={{fontSize: '14px'}}>do_not_disturb_on</span> : <span className="google-symbols" style={{fontSize: '14px'}}>warning</span>}
                        {r.regType}
                      </span>
                    </div>
                    <div className="regl-dd"><strong>고시원료명:</strong> {r.noticeName}</div>
                    {r.provis && <div className="regl-dt">단서조항: {r.provis}</div>}
                    {r.limitCond && <div className="regl-dt">제한사항: {r.limitCond}</div>}
                    <div className="regl-dt" style={{marginTop: '8px', color: 'var(--text-tertiary)'}}>국가: {r.country}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 관련 원료 - 환경변수로 표시 여부 제어 */}
          {process.env.REACT_APP_SHOW_MAT !== 'false' && matRows && matRows.length > 0 && (
            <div className="detail-section">
              <div className="section-title">
                <span className="google-symbols">inventory_2</span> 
                관련 원료
              </div>
              <div className="mat-list">
                {matRows.map((m, i) => {
                  const isMixedMat = m.composition && (m.composition.includes(';') || m.composition.includes(','));
                  return (
                    <div key={i} className="mat-card" onClick={() => onOpenMat(m)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="mat-card-title">{m.productName}</div>
                        <span className={isMixedMat ? 'badge badge-mixed' : 'badge badge-single'} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {isMixedMat ? '혼합원료' : '단일원료'}
                        </span>
                      </div>
                      <div className="mat-card-sub">{m.supplier}{m.maker ? ` | ${m.maker}` : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
