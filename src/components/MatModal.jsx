import React, { useState } from 'react';

export default function MatModal({ data, onClose, onOpenIngredient }) {
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
        <button className="btn-close" onClick={onClose}>✕</button>
        <div className="modal-title">{data.productName}</div>
        <div className="modal-grid">
          <span className="ml">제품명</span><span className="mv">{data.productName}</span>
          {data.feature && <><span className="ml">특징</span><span className="mv">{data.feature}</span></>}
          {data.funcType && <><span className="ml">기능</span><span className="mv">{data.funcType}</span></>}
          <span className="ml">제조사</span><span className="mv">{data.maker}</span>
          <span className="ml">공급사</span><span className="mv">{data.supplier}</span>
          <span className="ml">담당자</span><span className="mv">{data.manager}</span>
          <span className="ml">연락처</span><span className="mv">{data.tel}</span>
        </div>
        <div className="ml" style={{marginBottom:6,fontSize:13}}>조성</div>
        <div className="modal-comp">
          {data.composition.split(/;\s*/).map((ing, i, arr) => {
            const name = ing.trim();
            if (!name) return null;
            return (
              <span key={i}>
                <span
                  onClick={() => onOpenIngredient && onOpenIngredient(name)}
                  style={{
                    cursor: onOpenIngredient ? 'pointer' : 'default',
                    color: '#2c5f8a',
                    textDecoration: onOpenIngredient ? 'underline' : 'none',
                  }}
                >
                  {name}
                </span>
                {i < arr.length - 1 && <span style={{color:'#999'}}> ; </span>}
              </span>
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
          <select {...f('reqType')} style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:8}}>
            <option>샘플 요청</option>
            <option>TDS 요청</option>
            <option>SDS 요청</option>
            <option>COA 요청</option>
            <option>기타 문의</option>
          </select>
          <textarea placeholder="요청 내용을 입력하세요" {...f('msg')}
            style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,height:80,resize:'vertical',fontFamily:'inherit',marginBottom:8}} />
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
