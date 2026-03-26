// ============================================================
// 구글시트 CSV 로더 & 파서
// ============================================================

const SS_ID = '1A41Zr4anXAv4369D6IfmbIXuIXCkZ1gVynMEuUgOjNQ';

// 탭별 gid
const SHEET_GID = {
  INCI_Dict:      '347208701',
  CosIng:         '1415351726',
  Japan:          '373145437',
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

// CSV 한 줄 파싱 (따옴표 처리 포함)
function parseCSVLine(line) {
  const result = [];
  let field = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; }
        else inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { result.push(field); field = ''; }
      else { field += ch; }
    }
  }
  result.push(field);
  return result;
}

// CSV 텍스트 → 2D 배열
function parseCSV(text) {
  // BOM 제거
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return lines.filter(l => l.trim()).map(parseCSVLine);
}

// 특정 시트 fetch
async function fetchSheet(sheetName) {
  const gid = SHEET_GID[sheetName];
  if (!gid) throw new Error(`Unknown sheet: ${sheetName}`);
  const res = await fetch(csvUrl(gid));
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${sheetName}`);
  const text = await res.text();
  return parseCSV(text);
}

// ============================================================
// 별표 조회 설정
// ============================================================
const JAPAN_ANNEX_CONFIG = {
  '1':   { sheet: '別表第1', type: 'ban',    nameCol: 1 },
  '2':   { sheet: '別表第2', type: 'simple', nameCol: 0 },
  '3-1': { sheet: '別表第3-1', type: 'simple', nameCol: 0 },
  '3-2': { sheet: '別表第3-2', type: 'triple', nameCol: 0 },
  '4-1': { sheet: '別表第4-1', type: 'simple', nameCol: 0 },
  '4-2': { sheet: '別表第4-2', type: 'triple', nameCol: 0 },
};

function normalize(s) {
  return s.replace(/[－―‐]/g, '-').replace(/\s/g, '').replace(/，/g, ',').replace(/[「」]/g, '');
}

function getJapanAnnexRows(regClass, annexData) {
  if (!regClass) return [];
  const results = [];
  // [번역] 이후 제거
  const clean = regClass.replace(/\n\s*\[번역\][^\n;]*/g, '').replace(/\[번역\][^\n;]*/g, '');
  clean.split(';').forEach(part => {
    part = part.trim();
    const annexMatch = part.match(/別表第(\d+(?:-\d+)?)/);
    if (!annexMatch) return;
    const annexNum = annexMatch[1];
    const nameMatch = part.match(/「([^」]+)」/);
    if (!nameMatch) return;
    const searchName = nameMatch[1].trim();
    const keys = annexNum === '3' ? ['3-1', '3-2'] : annexNum === '4' ? ['4-1', '4-2'] : [annexNum];
    keys.forEach(key => {
      const cfg = JAPAN_ANNEX_CONFIG[key];
      if (!cfg) return;
      const data = annexData[cfg.sheet];
      if (!data) return;
      for (let i = 1; i < data.length; i++) {
        const r = data[i];
        const name = (r[cfg.nameCol] || '').trim();
        if (normalize(name) === normalize(searchName)) {
          const row = { annexKey: key, searchName, type: cfg.type };
          if (cfg.type === 'ban') {
            row.ban = true;
          } else if (cfg.type === 'simple') {
            const rows = [];
            for (let j = i; j < data.length; j++) {
              const rj = data[j];
              const nj = (rj[cfg.nameCol] || '').trim();
              if (j > i && nj !== '' && normalize(nj) !== normalize(searchName)) break;
              if (normalize(nj) === normalize(searchName) || (j > i && nj === '')) {
                rows.push({ cosmeType: rj[1] || '', maxConc: rj[2] || '' });
              }
            }
            row.rows = rows;
          } else if (cfg.type === 'triple') {
            row.wash    = r[1] || '';
            row.nonwash = r[2] || '';
            row.mucosa  = r[3] || '';
          }
          results.push(row);
          break;
        }
      }
    });
  });
  return results;
}

// ============================================================
// Annex 조회 설정 (EU)
// ============================================================
const EU_ANNEX_CONFIG = {
  'II':  { nameCol: 1, casCol: 2, ecCol: 3, concCol: -1, wordingCol: -1, iupacCol: 7 },
  'III': { nameCol: 1, casCol: 3, ecCol: 4, concCol: 6,  wordingCol: 8,  iupacCol: 12 },
  'IV':  { nameCol: 1, casCol: 3, ecCol: 4, concCol: 7,  wordingCol: 9,  iupacCol: 13 },
  'V':   { nameCol: 1, casCol: 3, ecCol: 4, concCol: 6,  wordingCol: 8,  iupacCol: 12 },
  'VI':  { nameCol: 1, casCol: 3, ecCol: 4, concCol: 6,  wordingCol: 8,  iupacCol: 12 },
};

function lookupAnnex(annexNum, refNo, annexData) {
  const cfg = EU_ANNEX_CONFIG[annexNum];
  if (!cfg) return null;
  const data = annexData[`Annex${annexNum}`];
  if (!data) return null;
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if ((r[0] || '').trim() === refNo.trim()) {
      return {
        name:    r[cfg.nameCol] || '',
        cas:     cfg.casCol >= 0 ? r[cfg.casCol] || '' : '',
        conc:    cfg.concCol >= 0 ? r[cfg.concCol] || '' : '',
        wording: cfg.wordingCol >= 0 ? r[cfg.wordingCol] || '' : '',
      };
    }
  }
  return null;
}

// ============================================================
// 전체 데이터 로드 & 빌드
// ============================================================
export async function loadAllData(onProgress) {
  const progress = (msg) => onProgress && onProgress(msg);

  // 1. INCI_Dict
  progress('기본 성분 데이터 로딩 중...');
  const inciRaw = await fetchSheet('INCI_Dict');

  // 2. CosIng
  progress('유럽 성분 데이터 로딩 중...');
  const cosingRaw = await fetchSheet('CosIng');

  // 3. Japan
  progress('일본 성분 데이터 로딩 중...');
  const japanRaw = await fetchSheet('Japan');

  // 4. EU Annex
  progress('유럽 규제 데이터 로딩 중...');
  const [annexII, annexIII, annexIV, annexV, annexVI] = await Promise.all([
    fetchSheet('AnnexII'),
    fetchSheet('AnnexIII'),
    fetchSheet('AnnexIV'),
    fetchSheet('AnnexV'),
    fetchSheet('AnnexVI'),
  ]);
  const euAnnexData = { AnnexII: annexII, AnnexIII: annexIII, AnnexIV: annexIV, AnnexV: annexV, AnnexVI: annexVI };

  // 5. Japan 別表
  progress('일본 규제 데이터 로딩 중...');
  const [b1, b2, b31, b32, b41, b42] = await Promise.all([
    fetchSheet('別表第1'),
    fetchSheet('別表第2'),
    fetchSheet('別表第3-1'),
    fetchSheet('別表第3-2'),
    fetchSheet('別表第4-1'),
    fetchSheet('別表第4-2'),
  ]);
  const jpAnnexData = {
    '別表第1': b1, '別表第2': b2,
    '別表第3-1': b31, '別表第3-2': b32,
    '別表第4-1': b41, '別表第4-2': b42,
  };

  progress('데이터 처리 중...');

  // ── CosIng Map 빌드 ──
  const cosingMap = {};
  for (let i = 1; i < cosingRaw.length; i++) {
    const r = cosingRaw[i];
    const key1 = (r[1] || '').trim().toUpperCase();
    const key2 = (r[3] || '').trim().toUpperCase();
    if (!key1 && !key2) continue;
    const restriction = (r[11] || '').trim();
    const annexRows = [];
    if (restriction) {
      restriction.split(';').forEach(restr => {
        restr = restr.trim();
        const m = restr.match(/^([IVX]+)\/(\d+)$/);
        if (m) {
          const row = lookupAnnex(m[1], m[2], euAnnexData);
          if (row) annexRows.push({ annex: restr, data: row });
        }
      });
    }
    const obj = {
      inciName:    r[3]  || '',
      innName:     r[4]  || '',
      phEurName:   r[5]  || '',
      casNo:       r[6]  || '',
      ecNo:        r[7]  || '',
      description: r[8]  || '',
      chemName:    r[9]  || '',
      function_:   r[10] || '',
      restriction,
      otherRestr:  r[12] || '',
      status:      r[14] || '',
      annexRows,
    };
    if (key1) cosingMap[key1] = obj;
    if (key2 && key2 !== key1) cosingMap[key2] = obj;
  }

  // ── Japan Map 빌드 ──
  const japanMap = {};
  for (let i = 1; i < japanRaw.length; i++) {
    const r = japanRaw[i];
    const jpKey = (r[3] || '').trim();
    if (!jpKey) continue;
    const regClass = r[8] || '';
    japanMap[jpKey] = {
      jpName:    jpKey,
      inciName:  r[4]  || '',
      definition:r[5]  || '',
      purpose:   r[7]  || '',
      regClass,
      casRn:     r[9]  || '',
      organic:   r[10] || '',
      inorganic: r[11] || '',
      note:      r[12] || '',
      annexRows: getJapanAnnexRows(regClass, jpAnnexData),
    };
  }

  // ── 검색 인덱스 빌드 ──
  const index = [];
  for (let i = 1; i < inciRaw.length; i++) {
    const r = inciRaw[i];
    const kor = (r[0] || '').trim();
    if (!kor) continue;
    index.push({
      kor,                     // 0 국문명
      eng:    r[1]  || '',    // 1 영문명
      old:    r[2]  || '',    // 2 구명칭
      eu:     r[3]  || '',    // 3 유럽성분명
      cn:     r[4]  || '',    // 4 중문명
      jp:     r[5]  || '',    // 5 일본어명
      cas:    r[6]  || '',    // 6 CAS No
      ec:     r[7]  || '',    // 7 EC No
      unii:   r[8]  || '',    // 8 UNII
      origin: r[9]  || '',    // 9 기원및정의
      formula:r[10] || '',    // 10 시성식
      func:   r[11] || '',    // 11 배합목적
      regType:r[12] || '',    // 12 국내규제_구분
      regName:r[13] || '',    // 13 국내규제_고시명
      regNote:r[14] || '',    // 14 국내규제_단서조항
      history:r[15] || '',    // 15 명칭변경이력
      ewg:    r[16] || '',    // 16 EWG등급
      ewgData:r[17] || '',    // 17 EWG데이터등급
    });
  }

  progress('완료!');
  return { index, cosingMap, japanMap };
}
