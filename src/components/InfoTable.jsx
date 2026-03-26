import React from 'react';
import { hasValue } from '../utils/format';

// 한 행: 값 없으면 렌더링 안 함
export function InfoRow({ label, children }) {
  return (
    <div className="dr">
      <span className="dl">{label}</span>
      <span className="dv">{children}</span>
    </div>
  );
}

// 값이 있을 때만 렌더링
export function InfoRowIf({ label, value, render }) {
  if (!hasValue(value)) return null;
  return (
    <InfoRow label={label}>
      {render ? render(value) : value}
    </InfoRow>
  );
}

// 세미콜론 구분 → 줄바꿈
export function InfoRowMulti({ label, value }) {
  if (!value) return null;
  const parts = value.split(';').map(v => v.trim()).filter(v => v && v !== '-');
  if (!parts.length) return null;
  return (
    <InfoRow label={label}>
      {parts.map((p, i) => <div key={i}>{p}</div>)}
    </InfoRow>
  );
}

// \n 포함 값 → 줄바꿈 렌더링
export function InfoRowNL({ label, value }) {
  if (!hasValue(value)) return null;
  const lines = value.split('\n').map(v => v.trim()).filter(v => v);
  if (!lines.length) return null;
  return (
    <InfoRow label={label}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </InfoRow>
  );
}

// 링크형 (클릭 가능, 세미콜론 구분)
export function InfoRowLinks({ label, value, onClick }) {
  if (!value) return null;
  const parts = value.split(';').map(v => v.trim());
  const hasContent = parts.some(v => v && v !== '-');
  if (!hasContent) return null;
  return (
    <InfoRow label={label}>
      {parts.map((p, i) => (
        <div key={i}>
          {p && p !== '-'
            ? <span className="dv-link" onClick={() => onClick(p)}>{p}</span>
            : <span style={{ color: '#aaa' }}>-</span>
          }
        </div>
      ))}
    </InfoRow>
  );
}

// 인라인 슬래시 구분 (중문명)
export function InfoRowInline({ label, value }) {
  if (!value) return null;
  const parts = value.split(';').map(v => v.trim());
  const hasContent = parts.some(v => v && v !== '-');
  if (!hasContent) return null;
  return (
    <InfoRow label={label}>
      {parts.map(v => v || '-').join(' / ')}
    </InfoRow>
  );
}

// 테이블 래퍼
export default function InfoTable({ children }) {
  return <div className="detail-grid">{children}</div>;
}
