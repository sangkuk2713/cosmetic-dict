import React, { useEffect, useState } from 'react';
import { subscribeTopTen } from '../utils/firebase.js';

export default function TopTen({ onSelect, data }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    // 실시간 구독 시작
    const unsubscribe = subscribeTopTen((topTen) => {
      setList(topTen);
    });
    return () => unsubscribe(); // 언마운트 시 구독 취소
  }, []);

  const handleClick = (name) => {
    if (!name || !data) return;
    const item = data.index.find(x => x.kor === name);
    if (item) onSelect(item);
  };

  if (list.length === 0) return null;

  return (
    <div className="top-ten-section">
      <div className="section-title">
        <span className="google-symbols filled" style={{ color: '#ffc107' }}>trending_up</span>
        실시간 인기 성분 TOP 10
      </div>
      <div className="top-ten-grid">
        {list.map((item, idx) => (
          <div key={item.id} className="top-item-card" onClick={() => handleClick(item.name)}>
            <span className="rank-badge">{idx + 1}</span>
            <div className="top-item-info">
              <span className="top-item-name">{item.name}</span>
              <span className="top-item-count">{item.count.toLocaleString()}회 조회</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
