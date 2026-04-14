import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import ResultList from './components/ResultList';
import DetailModal from './components/DetailModal';
import CosIngModal from './components/CosIngModal';
import JapanModal from './components/JapanModal';
import MatModal from './components/MatModal';
import TopTen from './components/TopTen';
import { 
  searchIngredients, 
  getRegulatoryInfo, 
  updateIngredientView,
  getCosIngInfo,
  getJapanInfo,
  getMaterialInfo
} from './utils/supabaseLoader';
import './App.css';

export default function App() {
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState('데이터 로딩 중...');
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchMode, setSearchMode] = useState('ing'); // 'ing' or 'mat'
  
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
    // Supabase 환경에서는 더 이상 초기 로딩을 기다릴 필요가 없습니다.
    // 바로 'ready' 상태로 진입합니다.
    setStatus('ready');
  }, []);

  // 디바운싱 된 검색 로직 (Supabase 쿼리)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const dbResults = await searchIngredients(query.trim());
      // 기존 UI와 매칭되는 프로퍼티로 변환
      const formatted = dbResults.map(item => ({
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
      }));
      setResults(formatted);
    }, 150); // 150ms 대기 후 검색 (서버 부하 방지)

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (item) => {
    if (!item) { setSelected(null); return; }
    
    if (item.type === 'material') {
      setMatTarget(item);
    } else {
      // 상세 정보 보기 시점에 모든 추가 데이터를 병렬로 즉시 가져옵니다. (고속 로딩)
      const [regl, cosing, japan, materials] = await Promise.all([
        getRegulatoryInfo(item.kor),
        getCosIngInfo(item.eng),
        getJapanInfo(item.kor),
        getMaterialInfo(item.kor)
      ]);

      // 원료 정렬 로직 적용 (단일원료 우선 > 성분개수 적은순 > 제품명 가나다순)
      const sortedMaterials = [...materials].sort((a, b) => {
        const checkMixed = (comp) => comp && (comp.includes(';') || comp.includes(','));
        const getCount = (comp) => comp ? comp.split(/[;,]/).filter(s => s.trim()).length : 0;

        // DB 필드명(coos_structure) 또는 UI 필드명(composition) 대응
        const compA = a.coos_structure || a.composition || '';
        const compB = b.coos_structure || b.composition || '';
        
        const isMixedA = checkMixed(compA);
        const isMixedB = checkMixed(compB);

        if (isMixedA !== isMixedB) return isMixedA ? 1 : -1;
        const countA = getCount(compA);
        const countB = getCount(compB);
        if (countA !== countB) return countA - countB;
        
        const nameA = a.productName || a.ingredient_name || '';
        const nameB = b.productName || b.ingredient_name || '';
        return nameA.localeCompare(nameB);
      });

      setSelected({ 
        ...item, 
        regulatoryRows: regl,
        cosingData: cosing,
        japanData: japan,
        materialRows: sortedMaterials
      });
      
      updateIngredientView(item.kor);
    }
  };

  const openCosIng = () => {
    if (selected && selected.cosingData) {
      setCosIngTarget({ ...selected, cosingInfo: selected.cosingData });
    } else {
      // 데이터가 없는 경우를 대비한 대체 처리도 가능
      setCosIngTarget({ ...selected, cosingInfo: null });
    }
  };

  const openJapan = () => {
    if (selected && selected.japanData) {
      setJapanTarget({ ...selected, japanInfo: selected.japanData });
    } else {
      setJapanTarget({ ...selected, japanInfo: null });
    }
  };

  const getReglRows = useCallback((kor) => {
    if (!data || !kor) return [];
    return data.reglMap[kor] || [];
  }, [data]);

  const getMatRows = useCallback((kor) => {
    if (!data || !kor) return [];
    const rows = [...(data.matMap[kor] || [])];
    
    // UI 배지 로직과 동일하게 혼합/단일 여부 계산
    const checkMixed = (comp) => comp && (comp.includes(';') || comp.includes(','));
    const getCount = (comp) => {
      if (!comp) return 0;
      return comp.split(/[;,]/).filter(s => s.trim()).length;
    };

    rows.sort((a, b) => {
      const isMixedA = checkMixed(a.composition);
      const isMixedB = checkMixed(b.composition);

      // 1순위: 단일원료가 무조건 위로 (isMixed가 false인 쪽이 위로)
      if (isMixedA !== isMixedB) {
        return isMixedA ? 1 : -1;
      }

      // 2순위: 성분 개수가 적은 순
      const countA = getCount(a.composition);
      const countB = getCount(b.composition);
      if (countA !== countB) return countA - countB;

      // 3순위: 제품명 가나다순
      return (a.productName || '').localeCompare(b.productName || '');
    });
    
    return rows;
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
          
          <div className="search-mode-toggle">
            <button 
              className={`mode-btn ${searchMode === 'ing' ? 'active' : ''}`}
              onClick={() => { setSearchMode('ing'); setResults([]); }}
            >
              <span className="google-symbols">science</span>
              성분 검색
            </button>
            <button 
              className={`mode-btn ${searchMode === 'mat' ? 'active' : ''}`}
              onClick={() => { setSearchMode('mat'); setResults([]); }}
            >
              <span className="google-symbols">inventory_2</span>
              원료 검색
            </button>
          </div>

          <div className="status-bar">
            {status === 'loading' && <><span className="google-symbols status-loading">sync</span> <span>{progress}</span></>}
            {status === 'ready' && !query && (
              <>
                <span className="google-symbols status-ready">check_circle</span> 
                <span>실시간 데이터베이스 연결됨</span>
              </>
            )}
            {status === 'ready' && query && results.length > 0 && <><span className="google-symbols status-count">list</span> <span>총 {results.length}건</span></>}
            {status === 'ready' && query && results.length === 0 && <><span className="google-symbols status-empty">info</span> <span>검색 결과가 없습니다.</span></>}
            {status === 'error' && <><span className="google-symbols status-error">error</span> <span>로드 실패: {progress}</span></>}
          </div>
        </div>

        {results.length > 0 && (
          <ResultList results={results} selected={selected} onSelect={handleSelect} />
        )}

        {process.env.REACT_APP_SHOW_MAT !== 'false' && (
          <TopTen data={data} onSelect={handleSelect} />
        )}
      </div>

      {selected && (
        <DetailModal
          item={selected}
          reglRows={selected.regulatoryRows || []}
          matRows={selected.materialRows || []}
          cosingData={selected.cosingData}
          japanData={selected.japanData}
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
