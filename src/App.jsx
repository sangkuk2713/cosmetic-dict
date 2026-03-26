import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadAllData } from './utils/sheetLoader';
import SearchBar from './components/SearchBar';
import ResultList from './components/ResultList';
import DetailModal from './components/DetailModal';
import CosIngModal from './components/CosIngModal';
import JapanModal from './components/JapanModal';
import './App.css';

export default function App() {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [progress, setProgress] = useState('데이터 로딩 중...');
  const [data, setData] = useState(null); // { index, cosingMap, japanMap }
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cosIngTarget, setCosIngTarget] = useState(null);
  const [japanTarget, setJapanTarget] = useState(null);

  // 데이터 로드
  useEffect(() => {
    loadAllData(setProgress)
      .then(d => { setData(d); setStatus('ready'); })
      .catch(e => { console.error(e); setStatus('error'); setProgress(e.message); });
  }, []);

  // 검색
  useEffect(() => {
    if (!data || !query.trim()) { setResults([]); return; }
    const kw = query.trim().toLowerCase();
    const res = [];
    for (const item of data.index) {
      if (
        item.kor.toLowerCase().includes(kw) ||
        item.eng.toLowerCase().includes(kw) ||
        item.old.toLowerCase().includes(kw)
      ) {
        res.push(item);
        if (res.length >= 200) break;
      }
    }
    setResults(res);
  }, [query, data]);

  const openCosIng = useCallback((inciName) => {
    if (!inciName || inciName === '-' || !data) return;
    const d = data.cosingMap[inciName.trim().toUpperCase()];
    setCosIngTarget(d || null);
  }, [data]);

  const openJapan = useCallback((jpName) => {
    if (!jpName || jpName === '-' || !data) return;
    const d = data.japanMap[jpName.trim()];
    setJapanTarget(d || null);
  }, [data]);

  return (
    <div className="app">
      <div className="container">
        <div className="sticky-top">
          <h1>🧪 화장품 성분사전</h1>
          <SearchBar value={query} onChange={setQuery} disabled={status !== 'ready'} />
          <div className="status-bar">
            {status === 'loading' && <span className="status-loading">⏳ {progress}</span>}
            {status === 'ready' && !query && (
              <span className="status-ready">✅ {data.index.length.toLocaleString()}개 성분 로드 완료</span>
            )}
            {status === 'ready' && query && results.length > 0 && (
              <span className="status-count">총 {results.length}건</span>
            )}
            {status === 'ready' && query && results.length === 0 && (
              <span className="status-empty">검색 결과가 없습니다.</span>
            )}
            {status === 'error' && <span className="status-error">❌ 로드 실패: {progress}</span>}
          </div>
        </div>

        {results.length > 0 && (
          <ResultList
            results={results}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onOpenCosIng={openCosIng}
          onOpenJapan={openJapan}
        />
      )}

      {cosIngTarget !== null && (
        <CosIngModal
          data={cosIngTarget}
          onClose={() => setCosIngTarget(null)}
        />
      )}

      {japanTarget !== null && (
        <JapanModal
          data={japanTarget}
          onClose={() => setJapanTarget(null)}
        />
      )}
    </div>
  );
}
