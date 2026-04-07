const placesData = [
  // --- 맛집 (10개) ---
  { id: 1, type: 'food', icon: 'soup_kitchen', name: '용흥궁식당', desc: '고려 왕실 진상 메뉴 젓국갈비. 맑고 칼칼한 국물.', tags: ['#향토음식', '#해장'] },
  { id: 2, type: 'food', icon: 'set_meal', name: '강화풍물시장 밴댕이', desc: '강화도 필수 코스! 밴댕이회, 무침, 구이 세트.', tags: ['#소주한잔', '#가성비'] },
  { id: 3, type: 'food', icon: 'rice_bowl', name: '맛을담은강된장', desc: '건강하고 깔끔한 우렁강된장과 가마솥밥 정식.', tags: ['#든든한아침', '#웨이팅'] },
  { id: 4, type: 'food', icon: 'ramen_dining', name: '금문도', desc: '전국唯一 강화 순무 탕수육 & 백짬뽕 퓨전 중식.', tags: ['#예약필수', '#이색맛집'] },
  { id: 5, type: 'food', icon: 'crab', name: '충남서산집', desc: '속이 꽉 찬 꽃게탕 찐 맛집. 밥도둑 양념게장.', tags: ['#해산물', '#얼큰함'] },
  { id: 6, type: 'food', icon: 'kebab_dining', name: '왕자정식당', desc: '묵밥과 젓국갈비가 유명한 현지인 웨이팅 맛집.', tags: ['#묵밥', '#현지인추천'] },
  { id: 7, type: 'food', icon: 'local_pizza', name: '강화집', desc: '아침부터 줄 서서 먹는 깊고 진한 닭곰탕 노포.', tags: ['#닭곰탕', '#든든한한끼'] },
  { id: 8, type: 'food', icon: 'restaurant', name: '마니산산채', desc: '직접 담근 된장과 산채 비빔밥, 감자전의 조합.', tags: ['#산채비빔밥', '#건강식'] },
  { id: 9, type: 'food', icon: 'set_meal', name: '갯배생선구이', desc: '바다를 보며 숯불에 직접 구워 먹는 모둠 생선구이.', tags: ['#생선구이', '#오션뷰식당'] },
  { id: 10, type: 'food', icon: 'bolt', name: '나룻터꽃게집', desc: '꽃게탕, 간장게장, 양념게장 3대장 세트 메뉴.', tags: ['#게장세트', '#포식'] },

  // --- 숙소 (8개) ---
  { id: 11, type: 'stay', icon: 'camping', name: '아로니움 글램핑', desc: '럭셔리한 텐트와 바비큐 세트로 완벽한 캠핑 낭만.', tags: ['#글램핑', '#포토존'] },
  { id: 12, type: 'stay', icon: 'pool', name: '플로망스 풀빌라', desc: '프라이빗 온수풀에서 끝내주는 오션뷰 감상.', tags: ['#오션뷰', '#우정여행'] },
  { id: 13, type: 'stay', icon: 'home', name: '펜션루나', desc: '화이트톤 화사한 감성 인테리어와 깨끗한 시설.', tags: ['#감성숙소', '#깔끔함'] },
  { id: 14, type: 'stay', icon: 'waves', name: '노을내리는아름다운집', desc: '서해 낙조가 방 안으로 들어오는 동화 같은 펜션.', tags: ['#일몰명소', '#노을뷰'] },
  { id: 15, type: 'stay', icon: 'apartment', name: '라르고빌 리조트', desc: '강화도 최고급 시설! 넓은 잔디밭과 인피니티 풀.', tags: ['#호캉스', '#인피니티풀'] },
  { id: 16, type: 'stay', icon: 'bungalow', name: '바다로 글램핑', desc: '전 객실 오션뷰 텐트. 바로 앞 갯벌 체험 가능.', tags: ['#갯벌체험', '#바다뷰'] },
  { id: 17, type: 'stay', icon: 'hot_tub', name: '바닷가산책 스파펜션', desc: '바다를 보며 제트스파로 피로를 푸는 힐링 숙소.', tags: ['#제트스파', '#힐링'] },
  { id: 18, type: 'stay', icon: 'holiday_village', name: '강화 에코 스파펜션', desc: '빔프로젝터로 영화 감상! 감성 넘치는 글램핑장.', tags: ['#영화감상', '#감성캠핑'] },

  // --- 카페/놀거리 (6개) ---
  { id: 19, type: 'cafe', icon: 'local_cafe', name: '조양방직', desc: '강화도 무조건 필수! 초대형 레트로 감성 인생샷 카페.', tags: ['#레트로', '#인생사진'] },
  { id: 20, type: 'cafe', icon: 'beach_access', name: '토크라피', desc: '지중해풍 하얀 건물과 바다가 맞닿은 오션뷰 카페.', tags: ['#오션뷰', '#휴양지느낌'] },
  { id: 21, type: 'cafe', icon: 'snowmobile', name: '루지 (씨사이드리조트)', desc: '곤돌라 타고 올라가 스릴 넘치게 카트 타고 내려오기!', tags: ['#액티비티', '#스릴만점'] },
  { id: 22, type: 'cafe', icon: 'coffee', name: '카페 109하우스', desc: '산토리니 감성의 루프탑에서 즐기는 환상적인 일몰.', tags: ['#산토리니', '#루프탑'] },
  { id: 23, type: 'cafe', icon: 'spa', name: '카페 트라몬토', desc: '탁 트인 통창 바다 뷰를 보며 따뜻하게 즐기는 족욕 스파.', tags: ['#족욕카페', '#피로회복'] },
  { id: 24, type: 'cafe', icon: 'stadium', name: '동막해변', desc: '세계 5대 갯벌! 해안가 산책과 조개잡이 체험.', tags: ['#갯벌체험', '#산책코스'] }
];

let selectedPlaces = [];

const placesListEl = document.getElementById('placesList');
const itineraryListEl = document.getElementById('itineraryList');
const countEl = document.getElementById('itineraryCount');
const btnShare = document.getElementById('btnShare');

// 상세 데이터 가짜 생성기 (장소 타입에 따라 가격/메뉴 다르게)
function getDetailInfo(place) {
  if (place.type === 'food') {
    return {
      hours: '매일 11:00 ~ 21:00 (화요일 휴무)',
      menus: [
        { name: '대표 2인 추천 세트', price: '38,000원' },
        { name: '시그니처 단품 메뉴', price: '15,000원' },
        { name: '공기밥/추가사리', price: '2,000원' }
      ],
      notice: '주말 점심시간에는 웨이팅이 발생할 수 있습니다.'
    };
  } else if (place.type === 'stay') {
    return {
      hours: '체크인 15:00 / 체크아웃 11:00',
      menus: [
        { name: '비수기 평일 독채', price: '120,000원 ~' },
        { name: '주말/성수기 룸', price: '250,000원 ~' },
        { name: '바비큐 숯/그릴 세팅', price: '30,000원' }
      ],
      notice: '연박 할인 및 바비큐 패키지 사전 예약 가능합니다.'
    };
  } else {
    return {
      hours: '평일 10:00 ~ 20:00 / 주말 ~21:00',
      menus: [
        { name: '시그니처 아메리카노', price: '7,000원' },
        { name: '오션뷰 에이드/라떼', price: '8,500원' },
        { name: '수제 디저트 베이커리', price: '6,500원 ~' }
      ],
      notice: '애견 동반은 야외 테라스석에서만 가능합니다.'
    };
  }
}

// 장소 렌더링
function renderPlaces(filter = 'all') {
  placesListEl.innerHTML = '';
  const filtered = filter === 'all' ? placesData : placesData.filter(p => p.type === filter);
  
  filtered.forEach(place => {
    const isAdded = selectedPlaces.find(p => p.id === place.id);
    const card = document.createElement('div');
    card.className = 'place-card';
    card.onclick = () => openDetailModal(place); // 카드 전체 클릭 시 모달 열기
    
    card.innerHTML = `
      <h3><span class="material-symbols-rounded" style="color:var(--primary-color)">${place.icon}</span> ${place.name}</h3>
      <p class="desc">${place.desc}</p>
      <div class="badges">
        ${place.tags.map(tag => `<span class="badge-tag">${tag}</span>`).join('')}
      </div>
      <button class="btn-add" onclick="event.stopPropagation(); togglePlace(${place.id})">
        ${isAdded ? '추가됨 (클릭 시 취소)' : '일정에 담기 +'}
      </button>
    `;
    if(isAdded) {
      const btn = card.querySelector('.btn-add');
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.style.color = 'var(--text-tertiary)';
    }
    placesListEl.appendChild(card);
  });
}

// 모달 로직
const detailModal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModalBtn');

function openDetailModal(place) {
  const isAdded = selectedPlaces.find(p => p.id === place.id);
  const details = getDetailInfo(place);
  
  modalContent.innerHTML = `
    <h2 class="modal-title"><span class="material-symbols-rounded">${place.icon}</span> ${place.name}</h2>
    
    <div class="modal-info-group">
      <h4>장소 설명</h4>
      <p>${place.desc}</p>
    </div>
    
    <div class="modal-info-group">
      <h4>운영 시간</h4>
      <p>${details.hours}</p>
    </div>
    
    <div class="modal-info-group">
      <h4>주요 메뉴 / 요금 정보</h4>
      <div class="modal-menu-list">
        ${details.menus.map(m => `
          <div class="modal-menu-item">
            <span>${m.name}</span>
            <strong>${m.price}</strong>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="modal-info-group" style="margin-top: 16px;">
      <h4>이용 팁</h4>
      <p style="font-size:13px; color:var(--primary-color);">${details.notice}</p>
    </div>
    
    <button class="btn-primary btn-add" onclick="togglePlace(${place.id}); closeDetailModal();" style="margin-top: 24px;">
      ${isAdded ? '일정에서 빼기' : '이 장소 일정에 추가하기'}
    </button>
  `;
  detailModal.classList.remove('hidden');
}

function closeDetailModal() { detailModal.classList.add('hidden'); }
closeModalBtn.addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', (e) => {
  if(e.target === detailModal) closeDetailModal();
});


// 스케줄 토글
function togglePlace(id) {
  const index = selectedPlaces.findIndex(p => p.id === id);
  if (index > -1) {
    selectedPlaces.splice(index, 1);
  } else {
    const place = placesData.find(p => p.id === id);
    selectedPlaces.push(place);
  }
  updateItinerary();
  renderPlaces(document.querySelector('.cat-btn.active').dataset.cat);
}

// 스케줄 바스켓 업데이트
function updateItinerary() {
  countEl.innerText = `${selectedPlaces.length}개 선택됨`;
  const btnPrint = document.getElementById('btnPrint');
  
  if (selectedPlaces.length === 0) {
    itineraryListEl.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded">flight_takeoff</span>
        <p>아직 추가된 일정이 없습니다.</p>
        <span>왼쪽에서 장소를 추가해주세요!</span>
      </div>`;
    btnPrint.classList.add('disabled');
    return;
  }

  btnPrint.classList.remove('disabled');
  itineraryListEl.innerHTML = '';
  
  selectedPlaces.forEach((place, index) => {
    // 기본 방문시간 배정 (임시)
    if (!place.visitTime) place.visitTime = `${String(10 + index * 2).padStart(2, '0')}:00`;

    const el = document.createElement('div');
    el.className = 'selected-item';
    el.innerHTML = `
      <div class="sel-info" style="flex:1;">
        <h4><span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-secondary); margin-right:8px">${index+1}</span> ${place.name}</h4>
        <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
          <input type="time" value="${place.visitTime}" onchange="changeTime(${place.id}, this.value)" 
            style="background:rgba(0,0,0,0.5); color:#fff; border:1px solid #444; border-radius:4px; padding:4px; font-size:13px; font-family:inherit;">
          <p style="margin:0;">${place.type === 'food' ? '맛집' : (place.type === 'cafe' ? '카페/비치' : '숙소')}</p>
        </div>
      </div>
      <button class="btn-remove" onclick="togglePlace(${place.id})" style="margin-left:8px;">
        <span class="material-symbols-rounded">delete</span>
      </button>
    `;
    itineraryListEl.appendChild(el);
  });
}

// 방문시간 업데이트
function changeTime(id, newTime) {
  const p = selectedPlaces.find(x => x.id === id);
  if(p) p.visitTime = newTime;
}

// 탭 필터
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderPlaces(e.target.dataset.cat);
  });
});

// 초기 구동
renderPlaces();

// 일정표 요약 및 인쇄 호출
document.getElementById('btnPrint').addEventListener('click', () => {
  if(selectedPlaces.length === 0) return;
  
  // 시간순 정렬
  const sorted = [...selectedPlaces].sort((a,b) => a.visitTime.localeCompare(b.visitTime));

  const printWaitNodes = document.getElementById('printWaitNodes');
  const printScheduleGrid = document.getElementById('printScheduleGrid');
  
  // 1. 타임라인 (선) 그리기
  printWaitNodes.innerHTML = sorted.slice(0, 6).map((p, i) => `
    <div class="node-step">
      <div class="n-dot"></div>
      <div class="n-name">${p.name}</div>
      <div class="n-time">${p.visitTime}</div>
    </div>
  `).join('') + (sorted.length > 6 ? `<div class="node-step"><div class="n-dot"></div><div class="n-name">외 ${sorted.length-6}곳</div></div>` : '');

  // 2. 스케줄 그리드 그리기
  printScheduleGrid.innerHTML = sorted.map((p, i) => {
    const timeVal = p.visitTime.split(':'); // ["10", "00"]
    return `
      <div class="s-card">
        <div class="s-time-block">
          <div class="s-time">${timeVal[0]}</div>
          <div class="s-day">${timeVal[1]}</div>
        </div>
        <div class="s-content">
          <div class="s-title"><span class="material-symbols-rounded type-icon">${p.icon}</span> ${p.name}</div>
          <div class="s-desc">${p.desc}</div>
          <div class="s-tags">
            ${p.tags.slice(0, 2).map((t, idx) => `<span class="s-tag ${idx === 1 ? 'alt' : ''}">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 3. 브라우저 인쇄 실행
  setTimeout(() => window.print(), 300);
});
