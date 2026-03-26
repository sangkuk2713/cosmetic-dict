import React from 'react';
import InfoTable, { InfoRowIf, InfoRowMulti, InfoRowLinks, InfoRowInline } from './InfoTable';

export default function DetailModal({ item, onClose, onOpenCosIng, onOpenJapan }) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const modalStyle = isMobile
    ? { width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%', borderRadius: 0 }
    : { width: '92%', maxWidth: '720px', maxHeight: '88vh', borderRadius: '12px' };

  const hasNatlRegl = item.regType || item.regName || item.regNote;

  return (
    <div className="detail-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal" style={modalStyle}>
        <div className="detail-modal-header">
          <span className="detail-modal-title">{item.kor}</span>
          <button className="btn-close-detail" onClick={onClose}>✕</button>
        </div>
        <div className="detail-modal-body">

          {/* 기본 정보 */}
          <div className="detail-section">
            <div className="section-title">기본 정보</div>
            <InfoTable>
              <InfoRowIf label="국문명" value={item.kor} />
              <InfoRowMulti label="영문명" value={item.eng} />
              <InfoRowIf label="구명칭" value={item.old} />
              <InfoRowLinks label="유럽성분명" value={item.eu} onClick={onOpenCosIng} />
              <InfoRowInline label="중문명" value={item.cn} />
              <InfoRowLinks label="일본어명" value={item.jp} onClick={onOpenJapan} />
              <InfoRowMulti label="CAS No" value={item.cas} />
              <InfoRowMulti label="EC No" value={item.ec} />
              <InfoRowIf label="UNII Code" value={item.unii} />
              <InfoRowIf label="기원및정의" value={item.origin} />
              <InfoRowIf label="시성식" value={item.formula} />
              <InfoRowMulti label="배합목적" value={item.func} />
              <InfoRowIf label="EWG 등급" value={item.ewg} />
              <InfoRowIf label="데이터등급" value={item.ewgData} />
            </InfoTable>
          </div>

          {/* 국내 규제 */}
          {hasNatlRegl && (
            <div className="detail-section">
              <div className="section-title">국내 규제 정보</div>
              <div className="natl-regl-box">
                {item.regType && (
                  <div className="natl-regl-row">
                    <span className="natl-regl-label">구분</span>
                    <span className="natl-regl-val">{item.regType}</span>
                  </div>
                )}
                {item.regName && (
                  <div className="natl-regl-row">
                    <span className="natl-regl-label">고시명</span>
                    <span className="natl-regl-val">{item.regName}</span>
                  </div>
                )}
                {item.regNote && (
                  <div className="natl-regl-row">
                    <span className="natl-regl-label">단서조항</span>
                    <span className="natl-regl-val">{item.regNote}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
