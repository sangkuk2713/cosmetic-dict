import React, { useState } from 'react';

export default function MatModal({ data, onClose, onIngredientClick }) {
  const [form, setForm] = useState({ name:'', title:'', company:'', tel:'', email:'', addr:'', reqType:'샘플 요청', msg:'' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.name.trim()) { alert('이름을 입력해주세요.'); return; }
    if (!form.company.trim()) { alert('회사명을 입력해주세요.'); return; }
    if (!form.tel.trim()) { alert('연락처를 입력해주세요.'); return; }
    if (!form.addr.trim()) { alert('샘플 받을 주소를 입력해주세요.'); return; }
    if (!form.msg.trim()) { alert('요청 내용을 입력해주세요.'); return; }
    if (!data.email) { alert('담당자 이메일 정보가 없습니다.'); return; }

    setSending(true);
    // GAS sendRequestEmail 호출 (기존 GAS 웹앱 URL 사용)
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwxckcbx5yDO1GLpTVe8fs5tjTqHbqu_f3PjivJtwYN0rko5AD3oJdW5tCNgRg4BXUHeQ/exec';
    try {
      const params = new URLSearchParams({
        action: 'sendMail',
        email: data.email,
        productName: data.productName,
        maker: data.maker,
        supplier: data.supplier,
        manager: data.manager,
        senderName: form.name,
        senderTitle: form.title,
        senderCompany: form.company,
        senderTel: form.tel,
        senderEmail: form.email,
        senderAddr: form.addr,
        requestType: form.reqType,
        message: form.msg,
      });
      await fetch(`${GAS_URL}?${params}`);
      alert('메일이 전송됐습니다.');
      onClose();
    } catch(e) {
      alert('전송 실패: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({...p, [key]: e.target.value})) });

  return (
    <div className="modal-overlay show" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <button className="btn-close" onClick={onClose}>
          <span className="google-symbols">close</span>
        </button>
        <div className="modal-title">
          <span className="google-symbols" style={{marginRight: '8px', verticalAlign: '-4px', color: 'var(--primary-color)'}}>inventory_2</span>
          {data.productName}
        </div>
        <div className="modal-grid">
          <span className="ml">제품명</span><span className="mv">{data.productName}</span>
          {data.feature && <><span className="ml">특징</span><span className="mv">{data.feature}</span></>}
          {data.funcType && <><span className="ml">기능</span><span className="mv">{data.funcType}</span></>}
          <span className="ml">제조사</span><span className="mv">{data.maker}</span>
          <span className="ml">공급사</span><span className="mv">{data.supplier}</span>
          <span className="ml">담당자</span><span className="mv">{data.manager}</span>
          <span className="ml">연락처</span><span className="mv">{data.tel}</span>
        </div>
        <div className="ml" style={{marginBottom:6,fontSize:13}}>조성 <span style={{fontSize:'12px', fontWeight:'normal'}}>(클릭하여 성분 검색)</span></div>
        <div className="modal-comp">
          {data.composition.split(/[,;]/).map((comp, idx, arr) => {
            const name = comp.trim();
            if (!name) return null;
            return (
              <React.Fragment key={idx}>
                <span 
                  className="dv-link" 
                  style={{cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '500', textDecoration: 'underline'}} 
                  onClick={() => onIngredientClick(name)}
                >
                  {name}
                </span>
                {idx < arr.length - 1 ? ' ; ' : ''}
              </React.Fragment>
            );
          })}
        </div>
        <div className="req-area">
          <div className="req-title">샘플/자료 요청</div>
          <div className="f-grid">
            <input type="text"  placeholder="이름 *"             {...f('name')} />
            <input type="text"  placeholder="직급 (예: 소장, 연구원)" {...f('title')} />
            <input type="text"  placeholder="회사명 *"           {...f('company')} />
            <input type="tel"   placeholder="연락처 *"           {...f('tel')} />
            <input type="email" placeholder="이메일 (자료 수신용)" {...f('email')} />
            <input type="text"  placeholder="샘플 받을 주소 *"   {...f('addr')} />
          </div>
          <select {...f('reqType')} className="req-select" style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border-color)',borderRadius:'8px',fontSize:'14px',marginBottom:'12px', background:'var(--bg-surface)', color:'var(--text-primary)'}}>
            <option>샘플 요청</option>
            <option>TDS 요청</option>
            <option>SDS 요청</option>
            <option>COA 요청</option>
            <option>기타 문의</option>
          </select>
          <textarea placeholder="요청 내용을 입력하세요" {...f('msg')}
            style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border-color)',borderRadius:'8px',fontSize:'14px',height:'60px',resize:'vertical',fontFamily:'inherit', background:'var(--bg-surface)', color:'var(--text-primary)'}} />
          <div className="btn-row">
            <button className="btn-cancel" onClick={onClose}>취소</button>
            <button className="btn-send" onClick={handleSend} disabled={sending}>
              {sending ? '전송 중...' : '메일 전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
