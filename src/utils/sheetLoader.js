const SS_ID = '1A41Zr4anXAv4369D6IfmbIXuIXCkZ1gVynMEuUgOjNQ';

const SHEET_GID = {
  INCI_Dict:      '347208701',
  CosIng:         '1415351726',
  Japan:          '373145437',
  사용제한성분:   '206448184',
  원료정보:       '807032163',
  공급사정보:     '1703849239',
  AnnexII:        '2116139856',
  AnnexIII:       '362214914',
  AnnexIV:        '36412469',
  AnnexV:         '874575026',
  AnnexVI:        '1658065229',
  '別表第1':      '1080036316',
  '別表第2':      '787039064',
  '別表第3-1':    '315307966',
  '別表第3-2':    '1183387497',
  '別表第4-1':    '277132581',
  '別表第4-2':    '637955731',
};

function csvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SS_ID}/export?format=csv&gid=${gid}`;
}

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [], field = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i+1] === '"') { field += '"'; i++; }
        else inQuote = false;
      } else { field += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') {
        row.push(field); field = '';
        if (row.some(c => c.trim())) rows.push(row);
        row = [];
      } else { field += ch; }
    }
  }
  row.push(field);
  if (row.some(c => c.trim())) rows.push(row);
  return rows;
}

async function fetchSheet(sheetName) {
  const gid = SHEET_GID[sheetName];
  if (!gid) throw new Error(`Unknown sheet: ${sheetName}`);
  const res = await fetch(csvUrl(gid));
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${sheetName}`);
  const text = await res.text();
  return parseCSV(text);
}

// ── Japan 별표 ───────────────────────────────────────────────
const JAPAN_ANNEX_CONFIG = {
  '1':   { sheet: '別表第1',   type: 'ban',    nameCol: 1 },
  '2':   { sheet: '別表第2',   type: 'simple', nameCol: 0 },
  '3-1': { sheet: '別表第3-1', type: 'simple', nameCol: 0 },
  '3-2': { sheet: '別表第3-2', type: 'triple', nameCol: 0 },
  '4-1': { sheet: '別表第4-1', type: 'simple', nameCol: 0 },
  '4-2': { sheet: '別表第4-2', type: 'triple', nameCol: 0 },
};

function normalize(s) {
  return s.replace(/[－―‐]/g,'-').replace(/\s/g,'').replace(/，/g,',').replace(/[「」]/g,'');
}

function getJapanAnnexRows(regClass, annexData) {
  if (!regClass) return [];
  const results = [];
  const clean = regClass.replace(/\n\s*\[번역\][^\n;]*/g,'').replace(/\[번역\][^\n;]*/g,'');
  clean.split(';').forEach(part => {
    part = part.trim();
    const annexMatch = part.match(/別表第(\d+(?:-\d+)?)/);
    if (!annexMatch) return;
    const annexNum = annexMatch[1];
    const nameMatch = part.match(/「([^」]+)」/);
    if (!nameMatch) return;
    const searchName = nameMatch[1].trim();
    const keys = annexNum==='3' ? ['3-1','3-2'] : annexNum==='4' ? ['4-1','4-2'] : [annexNum];
    keys.forEach(key => {
      const cfg = JAPAN_ANNEX_CONFIG[key];
      if (!cfg) return;
      const data = annexData[cfg.sheet];
      if (!data) return;
      for (let i = 1; i < data.length; i++) {
        const r = data[i];
        const name = (r[cfg.nameCol]||'').trim();
        if (normalize(name) === normalize(searchName)) {
          const row = { annexKey: key, searchName, type: cfg.type };
          if (cfg.type === 'ban') {
            row.ban = true;
          } else if (cfg.type === 'simple') {
            const rows = [];
            for (let j = i; j < data.length; j++) {
              const rj = data[j];
              const nj = (rj[cfg.nameCol]||'').trim();
              if (j > i && nj !== '' && normalize(nj) !== normalize(searchName)) break;
              if (normalize(nj)===normalize(searchName) || (j>i && nj===''))
                rows.push({ cosmeType: rj[1]||'', maxConc: rj[2]||'' });
            }
            row.rows = rows;
          } else if (cfg.type === 'triple') {
            row.wash=r[1]||''; row.nonwash=r[2]||''; row.mucosa=r[3]||'';
          }
          results.push(row);
          break;
        }
      }
    });
  });
  return results;
}

// ── EU Annex ─────────────────────────────────────────────────
const EU_ANNEX_CONFIG = {
  'II':  { nameCol:1, concCol:-1, wordingCol:-1 },
  'III': { nameCol:1, concCol:6,  wordingCol:8  },
  'IV':  { nameCol:1, concCol:7,  wordingCol:9  },
  'V':   { nameCol:1, concCol:6,  wordingCol:8  },
  'VI':  { nameCol:1, concCol:6,  wordingCol:8  },
};

function lookupAnnex(annexNum, refNo, annexData) {
  const cfg = EU_ANNEX_CONFIG[annexNum];
  if (!cfg) return null;
  const data = annexData[`Annex${annexNum}`];
  if (!data) return null;
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if ((r[0]||'').trim() === refNo.trim()) {
      return {
        name:    r[cfg.nameCol]||'',
        conc:    cfg.concCol>=0    ? r[cfg.concCol]||''    : '',
        wording: cfg.wordingCol>=0 ? r[cfg.wordingCol]||'' : '',
      };
    }
  }
  return null;
}

// ── 빌드 헬퍼 ────────────────────────────────────────────────
function buildIndex(inciRaw) {
  const index = [];
  for (let i = 1; i < inciRaw.length; i++) {
    const r = inciRaw[i];
    const kor = (r[0]||'').trim();
    if (!kor) continue;
    index.push({
      kor, eng:r[1]||'', old:r[2]||'', eu:r[3]||'', cn:r[4]||'',
      jp:r[5]||'', cas:r[6]||'', ec:r[7]||'', unii:r[8]||'',
      origin:r[9]||'', formula:r[10]||'', func:r[11]||'',
      regType:r[12]||'', regName:r[13]||'', regNote:r[14]||'',
      history:r[15]||'', ewg:r[16]||'', ewgData:r[17]||'',
    });
  }
  return index;
}

function buildReglMap(reglRaw) {
  const reglMap = {};
  for (let j = 1; j < reglRaw.length; j++) {
    const r = reglRaw[j];
    const kor = (r[0]||'').trim();
    if (!kor) continue;
    if (!reglMap[kor]) reglMap[kor] = [];
    reglMap[kor].push({
      regType:r[4]||'', country:r[5]||'',
      noticeName:r[6]||'', provis:r[7]||'', limitCond:r[8]||'',
    });
  }
  return reglMap;
}

function buildSupplierMap(supplierRaw) {
  const supplierMap = {};
  for (let s = 1; s < supplierRaw.length; s++) {
    const r = supplierRaw[s];
    const name = (r[0]||'').trim();
    if (!name) continue;
    supplierMap[name] = { manager:r[1]||'', tel:r[2]||'', email:r[3]||'' };
  }
  return supplierMap;
}

function buildMatMap(matRaw, supplierMap) {
  const matMap = {};
  for (let k = 1; k < matRaw.length; k++) {
    const r = matRaw[k];
    const comp = (r[1]||'').trim();
    if (!comp) continue;
    const supplierName = (r[3]||'').trim();
    const sup = supplierMap[supplierName] || {};
    const matObj = {
      productName:r[0]||'', composition:comp,
      maker:r[2]||'', supplier:supplierName,
      manager:sup.manager||'', tel:sup.tel||'', email:sup.email||'',
    };
    comp.split(/;\s*/).forEach(ing => {
      ing = ing.trim();
      if (!ing) return;
      if (!matMap[ing]) matMap[ing] = [];
      matMap[ing].push(matObj);
    });
  }
  return matMap;
}

function buildCosingMap(cosingRaw, euAnnexData) {
  const cosingMap = {};
  for (let i = 1; i < cosingRaw.length; i++) {
    const r = cosingRaw[i];
    const key1 = (r[1]||'').trim().toUpperCase();
    const key2 = (r[3]||'').trim().toUpperCase();
    if (!key1 && !key2) continue;
    const restriction = (r[11]||'').trim();
    const annexRows = [];
    if (restriction) {
      restriction.split(';').forEach(restr => {
        restr = restr.trim();
        const m = restr.match(/^([IVX]+)\/(\d+)$/);
        if (m) { const row = lookupAnnex(m[1], m[2], euAnnexData); if (row) annexRows.push({ annex:restr, data:row }); }
      });
    }
    const obj = {
      inciName:r[3]||'', innName:r[4]||'', phEurName:r[5]||'',
      casNo:r[6]||'', ecNo:r[7]||'', description:r[8]||'',
      chemName:r[9]||'', function_:r[10]||'', restriction,
      otherRestr:r[12]||'', status:r[14]||'', annexRows,
    };
    if (key1) cosingMap[key1] = obj;
    if (key2 && key2 !== key1) cosingMap[key2] = obj;
  }
  return cosingMap;
}

function buildJapanMap(japanRaw, jpAnnexData) {
  const japanMap = {};
  for (let i = 1; i < japanRaw.length; i++) {
    const r = japanRaw[i];
    const jpKey = (r[3]||'').trim();
    if (!jpKey) continue;
    const regClass = r[8]||'';
    japanMap[jpKey] = {
      jpName:jpKey, inciName:r[4]||'', definition:r[5]||'',
      purpose:r[7]||'', regClass, casRn:r[9]||'',
      organic:r[10]||'', inorganic:r[11]||'', note:r[12]||'',
      annexRows: getJapanAnnexRows(regClass, jpAnnexData),
    };
  }
  return japanMap;
}

// ── 메인 로드 함수 ───────────────────────────────────────────
// onProgress  : 상태 메시지 콜백
// onDetailReady : Phase 2 완료 시 전체 data 객체 전달 콜백
export async function loadAllData(onProgress, onDetailReady) {
  const prog = msg => onProgress && onProgress(msg);

  // ── Phase 1: 검색에 필요한 핵심 4개 시트 (검색 즉시 활성화) ──
  prog('성분 데이터 로딩 중...');
  const [inciRaw, reglRaw, matRaw, supplierRaw] = await Promise.all([
    fetchSheet('INCI_Dict'),
    fetchSheet('사용제한성분'),
    fetchSheet('원료정보'),
    fetchSheet('공급사정보'),
  ]);

  const supplierMap = buildSupplierMap(supplierRaw);
  const phase1 = {
    index:       buildIndex(inciRaw),
    reglMap:     buildReglMap(reglRaw),
    matMap:      buildMatMap(matRaw, supplierMap),
    cosingMap:   {},     // Phase 2 완료 전 빈 상태 (유럽팝업: "로딩 중")
    japanMap:    {},     // Phase 2 완료 전 빈 상태 (일본팝업: "로딩 중")
    detailReady: false,
  };

  // ── Phase 2: 상세 팝업용 13개 시트 (백그라운드, await 없음) ──
  Promise.all([
    fetchSheet('CosIng'),
    fetchSheet('Japan'),
    fetchSheet('AnnexII'),
    fetchSheet('AnnexIII'),
    fetchSheet('AnnexIV'),
    fetchSheet('AnnexV'),
    fetchSheet('AnnexVI'),
    fetchSheet('別表第1'),
    fetchSheet('別表第2'),
    fetchSheet('別表第3-1'),
    fetchSheet('別表第3-2'),
    fetchSheet('別表第4-1'),
    fetchSheet('別表第4-2'),
  ]).then(([
    cosingRaw, japanRaw,
    annexII, annexIII, annexIV, annexV, annexVI,
    b1, b2, b31, b32, b41, b42
  ]) => {
    const euAnnexData = { AnnexII:annexII, AnnexIII:annexIII, AnnexIV:annexIV, AnnexV:annexV, AnnexVI:annexVI };
    const jpAnnexData = {
      '別表第1':b1, '別表第2':b2,
      '別表第3-1':b31, '別表第3-2':b32,
      '別表第4-1':b41, '別表第4-2':b42,
    };
    const fullData = {
      ...phase1,
      cosingMap:   buildCosingMap(cosingRaw, euAnnexData),
      japanMap:    buildJapanMap(japanRaw, jpAnnexData),
      detailReady: true,
    };
    onDetailReady && onDetailReady(fullData);
  }).catch(err => {
    console.warn('Phase 2 로딩 실패:', err);
  });

  return phase1;
}
