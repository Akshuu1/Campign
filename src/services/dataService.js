import { db } from "../firebase";
import {
  collection, getDocs, doc, setDoc,
  updateDoc, increment, addDoc, serverTimestamp,
  deleteDoc, onSnapshot
} from "firebase/firestore";

// ─── STORAGE KEYS ──────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  SUGGESTIONS: "campus_admin_suggestions",
  USERS: "campus_foodies_registry",
  GOOGLE_USERS: "campus_google_users_registry",
  VOTES: "campus_user_votes",
  ANNOUNCEMENT: "campus_campaign_announcement",
  ADMIN_SESSION: "akshat_admin_session"
};

// ─── PERF CONSTANTS ────────────────────────────────────────────────────────────
const NETWORK_TIMEOUT_MS = 10_000;
// Rapid dish adds within this window collapse into ONE Firestore write per user
const WRITE_DEBOUNCE_MS = 1_200;
// Leaderboard + suggestions cache TTL
const LEADERBOARD_CACHE_TTL = 30_000;
const SUGGESTIONS_CACHE_TTL = 30_000;

// ─── HELPER: Promise with timeout ─────────────────────────────────────────────
function withTimeout(promise, ms = NETWORK_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network timeout")), ms)
    )
  ]);
}

// ─── HELPER: Safe localStorage write (never crashes on quota) ─────────────────
// localStorage is only a read-cache for the current user's own data.
// Firestore is the real database – no data is trimmed here.
function safeLSWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // QuotaExceededError on extremely old/restricted devices – Firestore remains source of truth
    console.warn("localStorage write failed (quota?), Firestore will sync on next load:", key);
  }
}

// ─── DEBOUNCE MAP: uid → timer ─────────────────────────────────────────────────
// Each user gets their own debounce slot – 2000 concurrent users never interfere
const _writeDebounceMap = new Map();

function scheduleMealWrite(uid, payload) {
  const existing = _writeDebounceMap.get(uid);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    _writeDebounceMap.delete(uid);
    try {
      await withTimeout(
        setDoc(doc(db, "users", uid), payload, { merge: true }),
        NETWORK_TIMEOUT_MS
      );
    } catch (e) {
      console.warn("Debounced meal write failed:", e.message);
    }
  }, WRITE_DEBOUNCE_MS);

  _writeDebounceMap.set(uid, timer);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY CLEANUP
// ═══════════════════════════════════════════════════════════════════════════════

export function cleanLegacyMockData() {
  try {
    const rawSug = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    if (rawSug) {
      const parsed = JSON.parse(rawSug);
      if (Array.isArray(parsed)) {
        safeLSWrite(
          STORAGE_KEYS.SUGGESTIONS,
          parsed.filter(s => s && !["sug_1","sug_2","sug_3","sug_4"].includes(s.id) && !s.id?.startsWith("mock"))
        );
      }
    }
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        safeLSWrite(
          STORAGE_KEYS.USERS,
          parsed.filter(u => u && !u.uid?.startsWith("student_10") && !u.uid?.startsWith("mock"))
        );
      }
    }
    localStorage.removeItem("akshat_pledged_votes");
  } catch (e) {}
}
cleanLegacyMockData();

export function clearDataServiceCache() {
  _leaderboardCache.data = null;
  _leaderboardCache.timestamp = 0;
  _suggestionsCache.data = null;
  _suggestionsCache.timestamp = 0;
}

export const DEFAULT_CAMPUS_FOODIES = [];
export const DEFAULT_SUGGESTIONS = [];

// ─── IN-MEMORY CACHES ─────────────────────────────────────────────────────────
const _leaderboardCache = { data: null, timestamp: 0 };
const _suggestionsCache = { data: null, timestamp: 0 };

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL SYNC  (debounced – rapid adds collapse into ONE Firestore write)
// ═══════════════════════════════════════════════════════════════════════════════

export function syncUserMeals(user, meals) {
  if (!user || !user.uid || user.isGuest) return;

  const breakfast  = meals.breakfast || [];
  const lunch      = meals.lunch     || [];
  const dinner     = meals.dinner    || [];
  const snacks     = meals.snacks    || [];
  const totalMeals = breakfast.length + lunch.length + dinner.length + snacks.length;

  // 1. Instant local write
  safeLSWrite(`funky_menu_meals_${user.uid}`, meals);

  // 2. Optimistic in-memory leaderboard update (UI reflects instantly)
  if (_leaderboardCache.data) {
    const cloned = [..._leaderboardCache.data];
    const idx    = cloned.findIndex(u => u.uid === user.uid);
    const votes  = idx >= 0 ? (cloned[idx].votes || 0) : 0;
    const record = {
      uid: user.uid,
      displayName: user.displayName || "Student Foodie",
      photoURL: user.photoURL || "",
      meals: totalMeals,
      votes,
      score: totalMeals * 2 + votes,
      menus: { Breakfast: breakfast, Lunch: lunch, Snacks: snacks, Dinner: dinner }
    };
    if (idx >= 0) cloned[idx] = { ...cloned[idx], ...record };
    else cloned.push(record);
    cloned.sort((a, b) => b.score - a.score);
    _leaderboardCache.data = cloned;
    _leaderboardListeners.forEach(cb => cb(cloned));
  }

  // 3. Debounced Firestore write (collapses rapid dish adds)
  scheduleMealWrite(user.uid, {
    displayName: user.displayName || "Student Foodie",
    email: user.email || "",
    photoURL: user.photoURL || "",
    emailVerified: !!user.emailVerified,
    provider: user.providerData?.[0]?.providerId || "google.com",
    breakfast,
    lunch,
    dinner,
    snacks,
    updatedAt: serverTimestamp()
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD  (shared onSnapshot – ALL components share ONE Firestore listener)
// ═══════════════════════════════════════════════════════════════════════════════

let _leaderboardUnsubscribe = null;
const _leaderboardListeners = new Set();

/**
 * Subscribe to live leaderboard.
 * No matter how many components call this, only ONE Firestore listener is created.
 */
export function subscribeToLeaderboard(callback) {
  _leaderboardListeners.add(callback);

  if (_leaderboardCache.data) callback(_leaderboardCache.data);

  if (!_leaderboardUnsubscribe) {
    try {
      _leaderboardUnsubscribe = onSnapshot(
        collection(db, "users"),
        (snap) => {
          const list = snap.docs
            .filter(d => !d.id.startsWith("student_10") && !d.id.startsWith("mock"))
            .map(d => {
              const data = d.data();
              const b  = data.breakfast || [];
              const l  = data.lunch     || [];
              const s  = data.snacks    || [];
              const dn = data.dinner    || [];
              const meals = b.length + l.length + s.length + dn.length;
              const votes = data.votes || 0;
              return {
                uid: d.id,
                displayName: data.displayName || "Student Foodie",
                photoURL: data.photoURL || "",
                meals, votes,
                score: meals * 2 + votes,
                menus: { Breakfast: b, Lunch: l, Snacks: s, Dinner: dn }
              };
            });
          list.sort((a, b) => b.score - a.score);
          _leaderboardCache.data = list;
          _leaderboardCache.timestamp = Date.now();
          _leaderboardListeners.forEach(cb => cb(list));
        },
        (err) => console.warn("Leaderboard snapshot:", err.message)
      );
    } catch (e) {
      console.warn("Could not attach leaderboard listener:", e.message);
    }
  }

  return () => {
    _leaderboardListeners.delete(callback);
    if (_leaderboardListeners.size === 0 && _leaderboardUnsubscribe) {
      _leaderboardUnsubscribe();
      _leaderboardUnsubscribe = null;
    }
  };
}

export async function fetchLeaderboardEntries(currentUser, force = false) {
  const now = Date.now();

  if (!force && _leaderboardCache.data && now - _leaderboardCache.timestamp < LEADERBOARD_CACHE_TTL) {
    return _applyLocalMealOverride(_leaderboardCache.data, currentUser);
  }

  let list = getStoredUsers();

  try {
    const snap = await withTimeout(getDocs(collection(db, "users")), NETWORK_TIMEOUT_MS);
    if (!snap.empty) {
      const remoteUsers = snap.docs
        .filter(d => !d.id.startsWith("student_10") && !d.id.startsWith("mock"))
        .map(d => {
          const data = d.data();
          const b  = data.breakfast || [];
          const l  = data.lunch     || [];
          const s  = data.snacks    || [];
          const dn = data.dinner    || [];
          const meals = b.length + l.length + s.length + dn.length;
          const votes = data.votes || 0;
          return {
            uid: d.id,
            displayName: data.displayName || "Student Foodie",
            photoURL: data.photoURL || "",
            meals, votes,
            score: meals * 2 + votes,
            menus: { Breakfast: b, Lunch: l, Snacks: s, Dinner: dn }
          };
        });
      const map = new Map();
      remoteUsers.forEach(u => map.set(u.uid, u));
      list.forEach(u => { if (!map.has(u.uid)) map.set(u.uid, u); });
      list = Array.from(map.values()).filter(u => u && u.uid);
    }
  } catch (err) {}

  list.sort((a, b) => b.score - a.score);
  _leaderboardCache.data = list;
  _leaderboardCache.timestamp = now;
  return _applyLocalMealOverride(list, currentUser);
}

function _applyLocalMealOverride(list, currentUser) {
  if (!currentUser) return list;
  try {
    const raw = localStorage.getItem(`funky_menu_meals_${currentUser.uid}`);
    if (!raw) return list;
    const mealsObj = JSON.parse(raw);
    const count =
      (mealsObj.breakfast?.length || 0) +
      (mealsObj.lunch?.length     || 0) +
      (mealsObj.dinner?.length    || 0) +
      (mealsObj.snacks?.length    || 0);
    const cloned = [...list];
    const idx    = cloned.findIndex(u => u.uid === currentUser.uid);
    if (idx >= 0) {
      cloned[idx] = {
        ...cloned[idx],
        meals: count,
        score: count * 2 + (cloned[idx].votes || 0),
        menus: {
          Breakfast: mealsObj.breakfast || [],
          Lunch:     mealsObj.lunch     || [],
          Snacks:    mealsObj.snacks    || [],
          Dinner:    mealsObj.dinner    || []
        }
      };
    } else if (count > 0) {
      cloned.push({
        uid: currentUser.uid,
        displayName: currentUser.displayName || "You",
        photoURL: currentUser.photoURL || "",
        meals: count, votes: 0, score: count * 2,
        menus: {
          Breakfast: mealsObj.breakfast || [],
          Lunch:     mealsObj.lunch     || [],
          Snacks:    mealsObj.snacks    || [],
          Dinner:    mealsObj.dinner    || []
        }
      });
    }
    cloned.sort((a, b) => b.score - a.score);
    return cloned;
  } catch (e) { return list; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS / SESSION
// ═══════════════════════════════════════════════════════════════════════════════

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(u => u && !u.uid?.startsWith("student_10") && !u.uid?.startsWith("mock"));
      }
    }
  } catch (e) {}
  return [];
}

/** Fire-and-forget – never blocks login flow */
export async function recordUserSession(user) {
  if (!user || !user.uid) return;
  const profile = {
    uid: user.uid,
    displayName: user.displayName || "Google Student",
    email: user.email || "",
    photoURL: user.photoURL || "",
    emailVerified: !!user.emailVerified,
    provider: user.providerData?.[0]?.providerId || "google.com",
    lastLoginAt: Date.now(),
    lastSignInTime: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    creationTime: user.metadata?.creationTime || new Date().toISOString()
  };

  try {
    const raw   = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    const users = raw ? JSON.parse(raw) : [];
    const idx   = users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) users[idx] = { ...users[idx], ...profile };
    else users.unshift(profile);
    safeLSWrite(STORAGE_KEYS.GOOGLE_USERS, users);
  } catch (e) {}

  withTimeout(
    setDoc(doc(db, "users", user.uid), {
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      emailVerified: profile.emailVerified,
      provider: profile.provider,
      lastLoginAt: serverTimestamp(),
      lastSignInTime: profile.lastSignInTime,
      creationTime: profile.creationTime
    }, { merge: true }),
    NETWORK_TIMEOUT_MS
  ).catch(e => {
    if (e.code !== "permission-denied") console.warn("User session sync:", e.message);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOTING
// ═══════════════════════════════════════════════════════════════════════════════

export async function castVoteForStudent(targetUid, currentUid) {
  if (_leaderboardCache.data) {
    const cloned = [..._leaderboardCache.data];
    const idx    = cloned.findIndex(u => u.uid === targetUid);
    if (idx >= 0) {
      const nextVotes = (cloned[idx].votes || 0) + 1;
      cloned[idx] = {
        ...cloned[idx],
        votes: nextVotes,
        score: cloned[idx].meals * 2 + nextVotes
      };
      cloned.sort((a, b) => b.score - a.score);
      _leaderboardCache.data = cloned;
      _leaderboardListeners.forEach(cb => cb(cloned));
    }
  }

  if (currentUid) {
    try {
      const raw      = localStorage.getItem(`voted_list_${currentUid}`);
      const votedList = raw ? JSON.parse(raw) : [];
      if (!votedList.includes(targetUid)) votedList.push(targetUid);
      localStorage.setItem(`voted_list_${currentUid}`, JSON.stringify(votedList));
      localStorage.setItem(`voted_${currentUid}`, targetUid);
    } catch (e) {}
  }

  // Atomic increment – safe under high concurrent vote load
  withTimeout(
    setDoc(doc(db, "users", targetUid), { votes: increment(1) }, { merge: true }),
    NETWORK_TIMEOUT_MS
  ).catch(e => console.warn("Vote sync:", e.message));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN: GOOGLE USERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchGoogleUsers() {
  const map = new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(gu => {
          if (gu && gu.uid && !gu.uid.startsWith("student_10") && !gu.uid.startsWith("mock")) {
            map.set(gu.uid, { ...gu, isGoogle: true });
          }
        });
      }
    }
  } catch (e) {}

  try {
    const snap = await withTimeout(getDocs(collection(db, "users")), NETWORK_TIMEOUT_MS);
    snap.docs.forEach(docSnap => {
      if (docSnap.id.startsWith("student_10") || docSnap.id.startsWith("mock")) return;
      const d        = docSnap.data();
      const existing = map.get(docSnap.id) || {};
      const b  = d.breakfast || existing.menus?.Breakfast || [];
      const l  = d.lunch     || existing.menus?.Lunch     || [];
      const s  = d.snacks    || existing.menus?.Snacks    || [];
      const dn = d.dinner    || existing.menus?.Dinner    || [];
      map.set(docSnap.id, {
        ...existing,
        uid: docSnap.id,
        displayName: d.displayName || existing.displayName || "Google Student",
        email: d.email || existing.email || "",
        photoURL: d.photoURL || existing.photoURL || "",
        emailVerified: d.emailVerified !== undefined ? d.emailVerified : true,
        provider: d.provider || "google.com",
        creationTime: d.creationTime || existing.creationTime || "",
        lastSignInTime: d.lastSignInTime || existing.lastSignInTime || "",
        lastLoginAt: d.lastLoginAt?.toMillis
          ? d.lastLoginAt.toMillis()
          : (d.lastLoginAt || existing.lastLoginAt || Date.now()),
        meals: b.length + l.length + s.length + dn.length,
        votes: d.votes || existing.votes || 0,
        menus: { Breakfast: b, Lunch: l, Snacks: s, Dinner: dn },
        isGoogle: true
      });
    });
  } catch (e) {}

  const list = Array.from(map.values()).filter(u => u && u.uid);
  list.sort((a, b) => {
    const tA = typeof a.lastLoginAt === "number" ? a.lastLoginAt : 0;
    const tB = typeof b.lastLoginAt === "number" ? b.lastLoginAt : 0;
    return tB - tA;
  });
  return list;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getStoredSuggestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => s && !["sug_1","sug_2","sug_3","sug_4"].includes(s.id));
      }
    }
  } catch (e) {}
  return [];
}

export async function submitSuggestion(data) {
  const newSug = {
    id: "sug_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    suggestion: data.suggestion.trim(),
    category: data.category || "General Feedback",
    studentName: data.studentName || "Campus Student",
    studentEmail: data.studentEmail || "",
    studentRoom: data.studentRoom || "",
    status: "new",
    starred: false,
    createdAt: Date.now(),
    timestamp:
      new Date().toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit", timeZone: 'Asia/Kolkata' }) +
      ", " +
      new Date().toLocaleDateString('en-US', { month: "short", day: "numeric", timeZone: 'Asia/Kolkata' })
  };

  try {
    const existing = getStoredSuggestions();
    const updated  = [newSug, ...existing.filter(s => s.id !== newSug.id)];
    safeLSWrite(STORAGE_KEYS.SUGGESTIONS, updated);
    _suggestionsCache.data = updated;
    _suggestionsCache.timestamp = Date.now();
  } catch (e) {}

  withTimeout(
    addDoc(collection(db, "suggestions"), { ...newSug, firestoreCreatedAt: serverTimestamp() }),
    NETWORK_TIMEOUT_MS
  ).catch(e => console.info("Suggestions background write:", e.message));

  return newSug;
}

export async function fetchAllSuggestions() {
  const now = Date.now();
  if (_suggestionsCache.data && now - _suggestionsCache.timestamp < SUGGESTIONS_CACHE_TTL) {
    return _suggestionsCache.data;
  }

  let localList = getStoredSuggestions();
  try {
    const snap = await withTimeout(getDocs(collection(db, "suggestions")), NETWORK_TIMEOUT_MS);
    if (!snap.empty) {
      const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const map = new Map();
      remoteList.forEach(item => map.set(item.id || item.suggestion, item));
      localList.forEach(item => {
        if (!map.has(item.id) && !map.has(item.suggestion)) map.set(item.id, item);
      });
      const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      safeLSWrite(STORAGE_KEYS.SUGGESTIONS, merged);
      _suggestionsCache.data = merged;
      _suggestionsCache.timestamp = now;
      return merged;
    }
  } catch (e) {}

  _suggestionsCache.data = localList;
  _suggestionsCache.timestamp = now;
  return localList;
}

export async function updateSuggestionItem(id, updates) {
  const current = getStoredSuggestions();
  const next    = current.map(item => (item.id === id ? { ...item, ...updates } : item));
  safeLSWrite(STORAGE_KEYS.SUGGESTIONS, next);
  _suggestionsCache.data = next;
  _suggestionsCache.timestamp = Date.now();
  withTimeout(updateDoc(doc(db, "suggestions", id), updates), NETWORK_TIMEOUT_MS).catch(() => {});
  return next;
}

export async function removeSuggestionItem(id) {
  const current = getStoredSuggestions();
  const next    = current.filter(item => item.id !== id);
  safeLSWrite(STORAGE_KEYS.SUGGESTIONS, next);
  _suggestionsCache.data = next;
  _suggestionsCache.timestamp = Date.now();
  withTimeout(deleteDoc(doc(db, "suggestions", id)), NETWORK_TIMEOUT_MS).catch(() => {});
  return next;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function getCampaignAnnouncement() {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
    if (custom && !custom.includes("⚡")) return custom;
  } catch (e) {}
  return "Voting opens on 5th October · Cast your vote for Akshat";
}

export function saveCampaignAnnouncement(text) {
  try { localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, text); } catch (e) {}
  return text;
}
