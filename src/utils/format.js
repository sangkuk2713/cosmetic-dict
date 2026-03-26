// 세미콜론 구분 → 줄바꿈
export function fmtVal(val) {
  if (!val) return null;
  const parts = val.split(';').map(v => v.trim()).filter(v => v && v !== '-');
  return parts.length ? parts : null;
}

// 세미콜론 구분 → 슬래시 한줄 (중문명)
export function fmtInline(val) {
  if (!val) return null;
  const parts = val.split(';').map(v => v.trim());
  const hasContent = parts.some(v => v && v !== '-');
  if (!hasContent) return null;
  return parts.map(v => v || '-').join(' / ');
}

// 링크 분리 (세미콜론 구분, -는 회색)
export function fmtLinks(val) {
  if (!val) return null;
  const parts = val.split(';').map(v => v.trim());
  const hasContent = parts.some(v => v && v !== '-');
  if (!hasContent) return null;
  return parts; // [{ text, isDash }] 형태로 반환
}

// \n → <br> 역할 (React에서는 split으로 처리)
export function nlbr(val) {
  if (!val) return null;
  return val.split('\n').map(v => v.trim()).filter(v => v);
}

// 값이 있는지 확인
export function hasValue(val) {
  return val && val.trim() && val.trim() !== '-';
}
