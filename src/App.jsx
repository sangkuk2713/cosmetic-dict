import React, { useState, useEffect, useCallback } from 'react';
import { loadAllData } from './utils/sheetLoader';
import SearchBar from './components/SearchBar';
import ResultList from './components/ResultList';
import DetailModal from './components/DetailModal';
import CosIngModal from './components/CosIngModal';
import JapanModal from './components/JapanModal';
import MatModal from './components/MatModal';
import './App.css';

export default function App() {
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState('데이터 로딩 중...');
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  
  // Modals state
  const [cosIngTarget, setCosIngTarget] = useState(null);
  const [japanTarget, setJapanTarget] = useState(null);
  const [matTarget, setMatTarget] = useState(null);

  // Theme support
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check user preference or set default light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    loadAllData(setProgress)
      .then(d => { setData(d); setStatus('ready'); })
      .catch(e => { setStatus('error'); setProgress(e.message); });
  }, []);

  useEffect(() => {
    if (!data || !query.trim()) { setResults([]); return; }
    const kw = query.trim().toLowerCase();
    const res = [];
    for (const item of data.index) {
      if (item.kor.toLowerCase().includes(kw) ||
          item.eng.toLowerCase().includes(kw) ||
          item.old.toLowerCase().includes(kw)) {
        res.push(item);
        if (res.length >= 200) break;
      }
    }
    setResults(res);
  }, [query, data]);

  const openCosIng = useCallback((inciName) => {
    if (!inciName || inciName === '-' || !data) return;
    const d = data.cosingMap[inciName.trim().toUpperCase()];
    setCosIngTarget(d || false);
  }, [data]);

  const openJapan = useCallback((jpName) => {
    if (!jpName || jpName === '-' || !data) return;
    const d = data.japanMap[jpName.trim()];
    setJapanTarget(d || false);
  }, [data]);

  const getReglRows = useCallback((kor) => {
    if (!data || !kor) return [];
    return data.reglMap[kor] || [];
  }, [data]);

  const getMatRows = useCallback((kor) => {
    if (!data || !kor) return [];
    return data.matMap[kor] || [];
  }, [data]);

  const handleIngredientClick = useCallback((ingName) => {
    if (!data || !ingName) return;
    const cleanName = ingName.trim();
    // find it in index
    const item = data.index.find(x => x.kor === cleanName || x.eng === cleanName || x.old === cleanName);
    
    setMatTarget(null); // 모달 닫기
    setQuery(cleanName); // 검색어 변경
    
    if (item) {
      setSelected(item); // 바로 상세 페이지(모달) 열기
    } else {
      setSelected(null);
    }
  }, [data]);

  // If no query and no results, show the big centered hero banner
  const isHeroMode = !query.trim() && results.length === 0;

  return (
    <div className="app">
      <div className="container">
        
        <div className={`sticky-top ${isHeroMode ? 'hero-mode' : ''}`}>
          <div className="header-row" style={{ display: isHeroMode ? 'none' : 'flex' }}>
            <h1>
              <span className="google-symbols filled">science</span> 
              성분사전
            </h1>
            <button className="theme-toggle" onClick={toggleTheme} title="테마 변경">
              <span className="google-symbols">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
          </div>

          {isHeroMode && (
            <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <span className="google-symbols filled" style={{ fontSize: '48px' }}>science</span>
              화장품 성분사전
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <button className="theme-toggle" onClick={toggleTheme} title="테마 변경">
                  <span className="google-symbols">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
              </div>
            </h1>
          )}

          <SearchBar value={query} onChange={setQuery} disabled={status !== 'ready'} />
          
          <div className="status-bar">
            {status === 'loading' && <><span className="google-symbols status-loading">sync</span> <span>{progress}</span></>}
            {status === 'ready' && !query && <><span className="google-symbols status-ready">check_circle</span> <span>{data.index.length.toLocaleString()}개 성분 로드 완료</span></>}
            {status === 'ready' && query && results.length > 0 && <><span className="google-symbols status-count">list</span> <span>총 {results.length}건</span></>}
            {status === 'ready' && query && results.length === 0 && <><span className="google-symbols status-empty">info</span> <span>검색 결과가 없습니다.</span></>}
            {status === 'error' && <><span className="google-symbols status-error">error</span> <span>로드 실패: {progress}</span></>}
          </div>
        </div>

        {results.length > 0 && (
          <ResultList results={results} selected={selected} onSelect={setSelected} />
        )}

      </div>

      {selected && (
        <DetailModal
          item={selected}
          reglRows={getReglRows(selected.kor)}
          matRows={getMatRows(selected.kor)}
          onClose={() => setSelected(null)}
          onOpenCosIng={openCosIng}
          onOpenJapan={openJapan}
          onOpenMat={setMatTarget}
        />
      )}
      {cosIngTarget !== null && (
        <CosIngModal data={cosIngTarget || null} onClose={() => setCosIngTarget(null)} />
      )}
      {japanTarget !== null && (
        <JapanModal data={japanTarget || null} onClose={() => setJapanTarget(null)} />
      )}
      {matTarget && (
        <MatModal 
          data={matTarget} 
          onClose={() => setMatTarget(null)} 
          onIngredientClick={handleIngredientClick}
        />
      )}
    </div>
  );
}
