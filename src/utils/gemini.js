import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Groq API (Primary) + Gemini API (Backup)
const GROQ_API_KEY = (process.env.REACT_APP_GROQ_API_KEY || '').trim();
const GEMINI_API_KEY = (process.env.REACT_APP_GEMINI_API_KEY || '').trim();
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

if (!GROQ_API_KEY && !GEMINI_API_KEY) {
  console.error('[AI] AI API 키가 설정되지 않았습니다!');
}

/**
 * 성분 요약용 시스템 프롬프트
 */
const SYSTEM_INSTRUCTION = `당신은 대한민국 화장품 R&D 전문가입니다.
주어진 화장품 성분에 대해 다음 항목을 간결하게 설명해 주세요:

1. **성분 개요**: 이 성분이 무엇인지, 화학적 특성
2. **주요 효능**: 피부에 어떤 효과가 있는지 (보습, 진정, 항산화 등)
3. **사용 용도**: 화장품에서 어떤 목적으로 배합되는지
4. **사용 시 참고사항**: 권장 농도, 주의사항 등 (알고 있는 경우)

[답변 규칙]
- 성분 자체의 효능과 특성에 집중하세요.
- 식약처 기능성 고시 여부는 사용자가 묻지 않는 한 언급하지 마세요.
- 모든 답변은 한국어 원어민이 읽기에 자연스럽고 매끄러운 문장으로 작성하세요.
- [절대 금지 규칙] 한자(漢字), 일본어 문자, 키릴 문자 등 한글 이외의 어떤 외국 문자도 절대로 섞지 마세요. 
- 영어 단어를 써야 할 경우에도 반드시 한글 음독으로 표기하세요 (예: Balance -> 밸런스).
- 오직 한글 자음과 모음으로만 구성된 답변만 허용됩니다.`;

/**
 * Q&A용 시스템 프롬프트
 */
const QA_INSTRUCTION = `당신은 대한민국 화장품 R&D 디렉터급 전문가입니다.
사용자의 질문에 정확하고 도움이 되는 답변을 해주세요.

[핵심 규칙]
- 질문에 직접적으로 대답하세요. 묻지 않은 내용을 덧붙이지 마세요.
- 식약처 기능성 고시 여부는 사용자가 "기능성 고시", "미백 고시", "주름개선 고시" 등을 직접 물어봤을 때만 언급하세요.
- 이전 대화 내용을 기억하여 자연스럽게 대화하세요.
- 확실하지 않은 정보는 추측하지 말고 솔직하게 말하세요.
- 모든 답변은 한국어 원어민이 읽기에 자연스럽고 매끄러운 문장으로 작성하세요.
- [절대 금지 규칙] 한자(漢字), 일본어 문자, 키릴 문자 등 한글 이외의 어떤 외국 문자도 절대로 섞지 마세요. 
- 영어 단어를 써야 할 경우에도 반드시 한글 음독으로 표기하세요 (예: Balance -> 밸런스).
- 오직 한글 자음과 모음으로만 구성된 답변만 허용됩니다.

[오류 방지 - 반드시 지켜야 할 사항]
- 나이아신아마이드: 식약처 고시상 "미백" 기능성 성분입니다. 주름개선 고시 성분이 아닙니다. 혼동하지 마세요.
- 아데노신: 식약처 고시상 "주름개선" 기능성 성분입니다. 미백 고시 성분이 아닙니다. 혼동하지 마세요.`;

/**
 * Groq API 스트리밍 호출 (OpenAI 호환 형식)
 */
async function* callGroqStream(systemPrompt, userPrompt, history = []) {
  const apiKey = GROQ_API_KEY;
  if (!apiKey) {
    yield { fallback: true, error: "⚠️ Groq API 키가 설정되지 않았습니다." };
    return;
  }

  // OpenAI 호환 메시지 형식 구성
  const messages = [{ role: 'system', content: systemPrompt }];
  
  // 대화 히스토리 추가
  for (const msg of history) {
    messages.push({
      role: msg.type === 'q' ? 'user' : 'assistant',
      content: msg.text
    });
  }
  
  messages.push({ role: 'user', content: userPrompt });

  const body = JSON.stringify({
    model: GROQ_MODEL,
    messages: messages,
    temperature: 0,
    max_tokens: 4096,
    stream: true
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // 429 에러 시 대기 후 재시도 (최대 3회)
  for (let retry = 0; retry < 3; retry++) {
    try {
      const response = await fetch(GROQ_ENDPOINT, { method: 'POST', headers, body });

      if (response.ok) {
        console.log(`[AI] ✅ Groq(${GROQ_MODEL}) 연결 성공`);
        yield* processGroqStream(response);
        return;
      }

      const status = response.status;

      // 429: 쿼터 초과 → 대기 후 재시도
      if (status === 429) {
        const waitSec = Math.pow(2, retry + 1); // 2초, 4초, 8초
        console.warn(`[AI] Groq 쿼터 초과(429) → ${waitSec}초 대기 후 재시도 (${retry + 1}/3)`);
        yield { waiting: `⏳ 서버가 바쁩니다. ${waitSec}초 후 자동 재시도합니다...` };
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }

      // 그 외 에러
      const errBody = await response.text().catch(() => '');
      console.error(`[AI] Groq 에러(${status}):`, errBody);
      yield { error: `⏳ AI 응답 오류가 발생했습니다. (${status}) 다시 시도해 주세요.` };
      return;

    } catch (e) {
      console.error('[AI] Groq 네트워크 오류:', e.message);
      if (retry < 2) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      yield { error: "⏳ AI 서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요." };
      return;
    }
  }

  yield { error: "⏳ AI 서버 요청 한도를 초과했습니다. 30초 정도 기다린 후 다시 시도해 주세요." };
}

/**
 * Groq SSE 스트림 파싱 (OpenAI 호환 형식)
 */
async function* processGroqStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) yield { text: content };
        } catch (e) {}
      }
    }
  }
  // 잔여 버퍼 처리
  if (buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6).trim());
      const content = data.choices?.[0]?.delta?.content;
      if (content) yield { text: content };
    } catch (e) {}
  }
}

/**
 * 하이브리드 스트리밍 호출 (Groq 시도 후 실패 시 Gemini로 폴백)
 */
async function* callHybridStream(systemPrompt, userPrompt, history = []) {
  // 1. Groq 시도
  try {
    const groqGen = callGroqStream(systemPrompt, userPrompt, history);
    for await (const chunk of groqGen) {
      if (chunk.fallback) {
        console.warn("[AI] Groq 폴백 트리거:", chunk.error);
        break; // 루프 탈출 후 Gemini로 이동
      }
      if (chunk.error && !chunk.waiting) {
        console.warn("[AI] Groq 오류로 인한 폴백:", chunk.error);
        break;
      }
      yield chunk;
      // 만약 Groq에서 텍스트 응답이 오기 시작했다면 끝까지 완료
      if (chunk.text) {
        for await (const nextChunk of groqGen) {
          yield nextChunk;
        }
        return;
      }
    }
  } catch (e) {
    console.error("[AI] Groq 실행 중 중명령 오류, Gemini로 전환합니다.", e);
  }

  // 2. Gemini 폴백
  console.log("[AI] 🔄 Gemini 모델로 전환하여 시도합니다...");
  yield* callGeminiStream(systemPrompt, userPrompt, history);
}

/**
 * Gemini API 직접 스트리밍 호출
 */
async function* callGeminiStream(systemPrompt, userPrompt, history = []) {
  if (!genAI) {
    yield { error: "⚠️ Gemini API 키가 설정되지 않았습니다." };
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.type === 'q' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessageStream(userPrompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield { text };
    }
  } catch (e) {
    console.error("[AI] Gemini API 에러:", e);
    yield { error: "⏳ AI 서비스를 현재 이용할 수 없습니다. 나중에 다시 시도해 주세요." };
  }
}

function makeQACacheKey(korName, question) {
  const cleanQ = question.trim().replace(/[/\\\\.\\s]+/g, '_').substring(0, 60);
  return `${korName}__${cleanQ}`;
}

export async function* getIngredientSummaryStream(item) {
  if (!GROQ_API_KEY && !GEMINI_API_KEY) { yield "⚠️ API 키가 설정되지 않았습니다."; return; }

  // 1. Firestore 캐시 확인
  try {
    const cacheRef = doc(db, "ai_summaries_v19", item.kor);
    const cacheSnap = await getDoc(cacheRef);
    if (cacheSnap.exists()) {
      console.log(`[AI Cache] '${item.kor}' 캐시에서 로드`);
      yield cacheSnap.data().content;
      return;
    }
  } catch (e) { console.warn("Cache access issue, proceeding to AI..."); }

  // 2. 하이브리드 AI 호출 (Groq -> Gemini)
  const userPrompt = `요청(성분명):\n${item.kor}`;
  
  try {
    let fullText = "";
    for await (const chunk of callHybridStream(SYSTEM_INSTRUCTION, userPrompt)) {
      if (chunk.error) {
        yield chunk.error;
        return;
      }
      if (chunk.waiting) {
        yield chunk.waiting;
        continue;
      }
      if (chunk.text) {
        fullText += chunk.text;
        yield chunk.text;
      }
    }
    // 3. 전체 수신 완료 후 캐시 저장
    if (fullText.trim()) {
      try {
        await setDoc(doc(db, "ai_summaries_v19", item.kor), {
          content: fullText, createdAt: new Date()
        });
        console.log(`[AI Cache] '${item.kor}' 캐시 저장 완료`);
      } catch (e) { console.warn("캐시 저장 실패:", e.message); }
    }
  } catch(e) {
    yield "답변을 생성하는 도중 오류가 발생했습니다.";
  }
}

export async function* askAiAboutIngredientStream(item, q, history = []) {
  if (!GROQ_API_KEY && !GEMINI_API_KEY) { yield "⚠️ API 키가 설정되지 않았습니다."; return; }

  // 1. Q&A 캐시 확인 (히스토리가 있는 경우 캐시 우회)
  if (history.length === 0) {
    const cacheKey = makeQACacheKey(item.kor, q);
    try {
      const cacheRef = doc(db, "ai_qa_cache_v19", cacheKey);
      const cacheSnap = await getDoc(cacheRef);
      if (cacheSnap.exists()) {
        console.log(`[AI Q&A Cache] 캐시에서 로드`);
        yield cacheSnap.data().content;
        return;
      }
    } catch (e) {}
  }

  // 2. 하이브리드 AI 호출 (Q&A 스트리밍, 대화 내역 포함)
  const userPrompt = `성분: ${item.kor}\n질문: ${q}`;
  
  try {
    let fullText = "";
    for await (const chunk of callHybridStream(QA_INSTRUCTION, userPrompt, history)) {
      if (chunk.error) {
        yield chunk.error;
        return;
      }
      if (chunk.waiting) {
        yield chunk.waiting;
        continue;
      }
      if (chunk.text) {
        fullText += chunk.text;
        yield chunk.text;
      }
    }
    // 3. Q&A 캐시 저장 (첫 질문인 경우만 저장)
    if (history.length === 0 && fullText.trim()) {
      const cacheKey = makeQACacheKey(item.kor, q);
      try {
        await setDoc(doc(db, "ai_qa_cache_v19", cacheKey), {
          content: fullText,
          ingredient: item.kor,
          question: q,
          createdAt: new Date()
        });
      } catch (e) {}
    }
  } catch(e) {
    yield "⏳ AI 응답 시간이 초과되었습니다. 잠시 후 다시 질문해 주세요.";
  }
}

export async function getIngredientSummary(item) {
  let full = ""; for await (const s of getIngredientSummaryStream(item)) { full += s; }
  return full;
}
export async function askAiAboutIngredient(item, q) {
  let full = ""; for await (const s of askAiAboutIngredientStream(item, q)) { full += s; }
  return full;
}