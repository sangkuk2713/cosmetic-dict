import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, increment, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// Firebase 설정값 (사용자 프로젝트 정보로 대체 필요)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 성분 조회수 증가 함수
 * @param {string} korName - 성분 국문명
 */
export const trackIngredientView = async (korName) => {
  if (!korName) return;
  const ingredientRef = doc(db, "ingredient_views", korName);
  try {
    await setDoc(ingredientRef, {
      name: korName,
      count: increment(1),
      lastUpdated: new Date()
    }, { merge: true });
  } catch (error) {
    console.error("Firebase tracking error:", error);
  }
};

/**
 * 실시간 인기 성분 상위 10개 감시 (Real-time listener)
 * @param {function} callback - 순위 업데이트 콜백함수
 */
export const subscribeTopTen = (callback) => {
  const q = query(
    collection(db, "ingredient_views"),
    orderBy("count", "desc"),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(list);
  });
};
