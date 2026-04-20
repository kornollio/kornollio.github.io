// Firebase Realtime Database client for reactions.
// Загружается как обычный модуль через ESM-импорт из CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRUiIQpXf2xt1lvDWLlGqFbtNNZqpixkQ",
  authDomain: "privetandrey-reactions.firebaseapp.com",
  databaseURL: "https://privetandrey-reactions-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "privetandrey-reactions",
  storageBucket: "privetandrey-reactions.firebasestorage.app",
  messagingSenderId: "641130300738",
  appId: "1:641130300738:web:e555453f04af73b111f4db",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Public API
window.reactionsAPI = {
  // Подписка на счётчики одного сообщения. Возвращает функцию-отписку.
  subscribe(msgId, cb) {
    const r = ref(db, "reactions/" + msgId);
    return onValue(r, (snap) => {
      cb(snap.val() || {});
    });
  },

  // Атомарно увеличить/уменьшить счётчик.
  async bump(msgId, emoji, delta) {
    const safeEmoji = encodeURIComponent(emoji);
    const r = ref(db, "reactions/" + msgId + "/" + safeEmoji);
    await runTransaction(r, (current) => {
      const next = (current || 0) + delta;
      return next <= 0 ? null : next;
    });
  },

  decodeEmoji(key) {
    try { return decodeURIComponent(key); } catch (e) { return key; }
  },
};

window.dispatchEvent(new Event("reactions-api-ready"));
