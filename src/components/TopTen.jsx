import React, { useEffect, useState } from 'react';
import { getPopularRanking, getIngredientByName } from '../utils/supabaseLoader';

export default function TopTen({ onSelect }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    // 실시간 구독 대신 5분마다 갱신하거나 컴포넌트 마운트 시 한 번 가져옵니다.
    // (Supabase Realtime으로 구현도 가능하지만 일단 단순하게 한 번 가져오는 방식으로 최적화)
    const fetchRanking = async () => {
      const topTen = await getPopularRanking();
      setList(topTen);
    };
    fetchRanking();
  }, []);

  const handleClick = async (name) => {
    if (!name) return;
    const item = await getIngredientByName(name);
    if (item) {
      // UI 매칭을 위한 변환
      onSelect({
        kor: item.kor_name,
        eng: item.eng_name,
        old: item.old_name,
        function: item.function,
        cas: item.cas_no,
        ec: item.ec_no,
        unii: item.unii,
        origin: item.origin,
        formula: item.formula,
        regType: item.reg_type,
        regName: item.reg_name,
        regNote: item.reg_note,
        history: item.history,
        ewg: item.ewg,
        ewgData: item.ewg_data,
        type: 'ingredient'
      });
    }
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
          <div key={item.name} className="top-item-card" onClick={() => handleClick(item.name)}>
            <span className="rank-badge">{idx + 1}</span>
            <div className="top-item-info">
              <span className="top-item-name">{item.name}</span>
              <span className="top-item-count">{item.count?.toLocaleString()}회 조회</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
