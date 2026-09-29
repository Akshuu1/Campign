import { db } from "../firebase";
import {
  collection, getDocs, doc, setDoc,
  updateDoc, increment, addDoc, serverTimestamp, deleteDoc
} from "firebase/firestore";

const STORAGE_KEYS = {
  SUGGESTIONS: "campus_admin_suggestions",
  USERS: "campus_foodies_registry",
  GOOGLE_USERS: "campus_google_users_registry",
  VOTES: "campus_user_votes",
  ANNOUNCEMENT: "campus_campaign_announcement",
  ADMIN_SESSION: "akshat_admin_session"
};

// ─── HIGH CONCURRENCY CACHE & TIMEOUT CONFIG ──────────────────────────────────
// Ensures 3000+ simultaneous students experience 0ms UI lag and instant cross-user syncing
const CACHE_TTL_MS = 3 * 1000; // 3s fast sync TTL
const NETWORK_TIMEOUT_MS = 12000; // 12s failsafe timeout for mobile devices

let memoryUsersCache = { data: null, timestamp: 0 };
let memorySuggestionsCache = { data: null, timestamp: 0 };
let syncDebounceTimer = null;

// Helper to prevent long network hangs
function withTimeout(promise, ms = NETWORK_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout")), ms))
  ]);
}

// Clean legacy mock data from browser localStorage
export function cleanLegacyMockData() {
  try {
    const rawSug = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    if (rawSug) {
      const parsed = JSON.parse(rawSug);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(s => s && !["sug_1", "sug_2", "sug_3", "sug_4"].includes(s.id) && !s.id?.startsWith("mock"));
        localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(cleaned));
      }
    }
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(u => u && !u.uid?.startsWith("student_10") && !u.uid?.startsWith("mock"));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
      }
    }
    const rawGoogle = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    if (rawGoogle) {
      const parsed = JSON.parse(rawGoogle);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(u => u && !u.uid?.startsWith("student_10") && !u.uid?.startsWith("mock"));
        localStorage.setItem(STORAGE_KEYS.GOOGLE_USERS, JSON.stringify(cleaned));
      }
    }
    localStorage.removeItem("akshat_pledged_votes");
  } catch (e) {}
}

// Auto-run cleanup on initial load
cleanLegacyMockData();

export function clearDataServiceCache() {
  memoryUsersCache = { data: null, timestamp: 0 };
  memorySuggestionsCache = { data: null, timestamp: 0 };
}

// Real collections only (Zero mock foodies or mock suggestions)
export const DEFAULT_CAMPUS_FOODIES = [];
export const DEFAULT_SUGGESTIONS = [];

// ─── Suggestions Service (Non-blocking & Instant) ─────────────────────────────

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
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
  };

  // 1. Instant local persistence for zero-delay UI
  try {
    const existing = getStoredSuggestions();
    const updated = [newSug, ...existing.filter(s => s.id !== newSug.id)];
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    memorySuggestionsCache.data = updated;
    memorySuggestionsCache.timestamp = Date.now();
  } catch (err) {
    console.warn("Local storage suggestion save failed:", err);
  }

  // 2. Non-blocking asynchronous Firestore write (never hangs or freezes UI)
  withTimeout(
    addDoc(collection(db, "suggestions"), {
      ...newSug,
      firestoreCreatedAt: serverTimestamp()
    }),
    NETWORK_TIMEOUT_MS
  ).catch(err => {
    // Graceful offline/restricted fallback - already safely stored locally
    console.info("Firestore suggestions background save note:", err.message);
  });

  return newSug;
}

export function getStoredSuggestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => s && !["sug_1", "sug_2", "sug_3", "sug_4"].includes(s.id));
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return [];
}

export async function fetchAllSuggestions() {
  const now = Date.now();
  // Return cached in-memory if fresh (< 60s)
  if (memorySuggestionsCache.data && (now - memorySuggestionsCache.timestamp < CACHE_TTL_MS)) {
    return memorySuggestionsCache.data;
  }

  let localList = getStoredSuggestions();

  try {
    const snap = await withTimeout(getDocs(collection(db, "suggestions")), NETWORK_TIMEOUT_MS);
    if (!snap.empty) {
      const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const map = new Map();
      remoteList.forEach(item => map.set(item.id || item.suggestion, item));
      localList.forEach(item => {
        if (!map.has(item.id) && !map.has(item.suggestion)) {
          map.set(item.id, item);
        }
      });
      const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(merged));
      memorySuggestionsCache = { data: merged, timestamp: now };
      return merged;
    }
  } catch (err) {
    // Network failure or timeout -> immediately serve local cache without lag
  }

  memorySuggestionsCache = { data: localList, timestamp: now };
  return localList;
}

export async function updateSuggestionItem(id, updates) {
  const current = getStoredSuggestions();
  const next = current.map(item => item.id === id ? { ...item, ...updates } : item);
  localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(next));
  memorySuggestionsCache = { data: next, timestamp: Date.now() };

  withTimeout(
    updateDoc(doc(db, "suggestions", id), updates),
    NETWORK_TIMEOUT_MS
  ).catch(() => {});

  return next;
}

export async function removeSuggestionItem(id) {
  const current = getStoredSuggestions();
  const next = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(next));
  memorySuggestionsCache = { data: next, timestamp: Date.now() };

  withTimeout(
    deleteDoc(doc(db, "suggestions", id)),
    NETWORK_TIMEOUT_MS
  ).catch(() => {});

  return next;
}

// ─── Users & Leaderboard Service (Stale-While-Revalidate & Debounced) ─────────

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(u => u && !u.uid?.startsWith("student_10"));
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return [];
}

export async function recordUserSession(user) {
  if (!user || !user.uid) return;

  const userProfile = {
    uid: user.uid,
    displayName: user.displayName || "Google Student",
    email: user.email || "",
    photoURL: user.photoURL || "",
    emailVerified: user.emailVerified !== undefined ? !!user.emailVerified : true,
    provider: user.providerData?.[0]?.providerId || "google.com",
    lastLoginAt: Date.now(),
    lastSignInTime: user.metadata?.lastSignInTime || new Date().toLocaleString(),
    creationTime: user.metadata?.creationTime || new Date().toISOString()
  };

  // 1. Update in local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    let currentUsers = raw ? JSON.parse(raw) : [];
    const idx = currentUsers.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      currentUsers[idx] = { ...currentUsers[idx], ...userProfile };
    } else {
      currentUsers.unshift(userProfile);
    }
    localStorage.setItem(STORAGE_KEYS.GOOGLE_USERS, JSON.stringify(currentUsers));
  } catch (e) {
    console.warn(e);
  }

  // 2. Also ensure they are represented in campus_foodies_registry
  try {
    const foodies = getStoredUsers();
    const fIdx = foodies.findIndex(u => u.uid === user.uid);
    if (fIdx >= 0) {
      foodies[fIdx] = { ...foodies[fIdx], ...userProfile };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(foodies));
    }
  } catch (e) {}

  // 3. Write to Firestore 'users' collection with merge: true
  try {
    await withTimeout(
      setDoc(doc(db, "users", user.uid), {
        uid: userProfile.uid,
        displayName: userProfile.displayName,
        email: userProfile.email,
        photoURL: userProfile.photoURL,
        emailVerified: userProfile.emailVerified,
        provider: userProfile.provider,
        lastLoginAt: serverTimestamp(),
        lastSignInTime: userProfile.lastSignInTime,
        creationTime: userProfile.creationTime
      }, { merge: true }),
      NETWORK_TIMEOUT_MS
    );
    console.info("✓ User profile synced to Firestore:", user.uid);
  } catch (e) {
    if (e.code === "permission-denied") {
      console.error("⚠️ Firestore Security Rules blocked user sync (permission-denied). Please update Firestore Rules in Firebase Console to: allow read, write: if true;");
    } else {
      console.warn("Firestore user sync note:", e.message);
    }
  }
}

export function syncUserMeals(user, meals) {
  if (!user) return;
  const breakfast = meals.breakfast || [];
  const lunch = meals.lunch || [];
  const dinner = meals.dinner || [];
  const snacks = meals.snacks || [];
  const totalMeals = breakfast.length + lunch.length + dinner.length + snacks.length;

  const users = getStoredUsers();
  const existingIdx = users.findIndex(u => u.uid === user.uid);
  const currentVotes = existingIdx >= 0 ? (users[existingIdx].votes || 0) : 0;

  const userRecord = {
    uid: user.uid,
    displayName: user.displayName || (user.isGuest ? "Campus Guest" : "Student Foodie"),
    email: user.email || "",
    photoURL: user.photoURL || "",
    isGuest: !!user.isGuest,
    emailVerified: user.emailVerified !== undefined ? user.emailVerified : true,
    provider: user.providerData?.[0]?.providerId || "google.com",
    meals: totalMeals,
    votes: currentVotes,
    score: totalMeals * 2 + currentVotes,
    menus: {
      Breakfast: breakfast,
      Lunch: lunch,
      Snacks: snacks,
      Dinner: dinner
    },
    updatedAt: Date.now()
  };

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...users];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...userRecord };
  } else {
    updatedList = [userRecord, ...users];
  }

  // 1. Instant local write
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedList));
    memoryUsersCache.data = updatedList;
    memoryUsersCache.timestamp = Date.now();
  } catch (e) {}

  // 2. Also keep Google users registry synchronized
  try {
    const rawGoogle = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    let googleList = rawGoogle ? JSON.parse(rawGoogle) : [];
    const gIdx = googleList.findIndex(u => u.uid === user.uid);
    if (gIdx >= 0) {
      googleList[gIdx] = {
        ...googleList[gIdx],
        ...userRecord,
        meals: totalMeals,
        menus: userRecord.menus
      };
    } else {
      googleList.unshift({
        ...userRecord,
        meals: totalMeals,
        menus: userRecord.menus
      });
    }
    localStorage.setItem(STORAGE_KEYS.GOOGLE_USERS, JSON.stringify(googleList));
  } catch (e) {}

  // 3. Direct write to Firestore for instant cross-device updates
  withTimeout(
    setDoc(doc(db, "users", user.uid), {
      displayName: userRecord.displayName,
      email: userRecord.email,
      photoURL: userRecord.photoURL,
      provider: userRecord.provider,
      emailVerified: userRecord.emailVerified,
      breakfast,
      lunch,
      dinner,
      snacks,
      votes: userRecord.votes,
      updatedAt: serverTimestamp()
    }, { merge: true }),
    NETWORK_TIMEOUT_MS
  ).catch(() => {});

  return userRecord;
}

export async function fetchLeaderboardEntries(currentUser, force = false) {
  const now = Date.now();
  if (force) {
    memoryUsersCache = { data: null, timestamp: 0 };
  }
  let list = memoryUsersCache.data;

  // If in-memory cache is fresh (< 5s), use it immediately
  if (!list || (now - memoryUsersCache.timestamp > CACHE_TTL_MS)) {
    list = getStoredUsers();

    try {
      const snap = await withTimeout(getDocs(collection(db, "users")), NETWORK_TIMEOUT_MS);
      if (!snap.empty) {
        const remoteUsers = snap.docs.map(d => {
          const d2 = d.data();
          const b = d2.breakfast || [];
          const l = d2.lunch || [];
          const s = d2.snacks || [];
          const dn = d2.dinner || [];
          const meals = b.length + l.length + s.length + dn.length;
          const votes = d2.votes || 0;
          return {
            uid: d.id,
            displayName: d2.displayName || "Student Foodie",
            photoURL: d2.photoURL || "",
            meals,
            votes,
            score: meals * 2 + votes,
            menus: {
              Breakfast: b,
              Lunch: l,
              Snacks: s,
              Dinner: dn
            }
          };
        });

        const map = new Map();
        remoteUsers.forEach(u => map.set(u.uid, u));
        list.forEach(u => {
          if (!map.has(u.uid)) map.set(u.uid, u);
        });
        list = Array.from(map.values()).filter(u => u && u.uid && !u.uid.startsWith("student_10") && !u.uid.startsWith("mock"));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
      }
    } catch (err) {
      // Timeout or permission restricted -> instant fallback to local list
    }

    memoryUsersCache = { data: list, timestamp: now };
  }

  // Ensure current user is in the list with their local meal data
  if (currentUser) {
    try {
      const rawUserMeals = localStorage.getItem(`funky_menu_meals_${currentUser.uid}`);
      if (rawUserMeals) {
        const mealsObj = JSON.parse(rawUserMeals);
        const mealsCount =
          (mealsObj.breakfast?.length || 0) +
          (mealsObj.lunch?.length || 0) +
          (mealsObj.dinner?.length || 0) +
          (mealsObj.snacks?.length || 0);

        const cloned = [...list];
        const idx = cloned.findIndex(u => u.uid === currentUser.uid);
        if (idx >= 0) {
          cloned[idx] = {
            ...cloned[idx],
            meals: mealsCount,
            score: mealsCount * 2 + (cloned[idx].votes || 0),
            menus: {
              Breakfast: mealsObj.breakfast || [],
              Lunch: mealsObj.lunch || [],
              Snacks: mealsObj.snacks || [],
              Dinner: mealsObj.dinner || []
            }
          };
        } else {
          cloned.push({
            uid: currentUser.uid,
            displayName: currentUser.displayName || "You (Student Foodie)",
            photoURL: currentUser.photoURL || "",
            meals: mealsCount,
            votes: 0,
            score: mealsCount * 2,
            menus: {
              Breakfast: mealsObj.breakfast || [],
              Lunch: mealsObj.lunch || [],
              Snacks: mealsObj.snacks || [],
              Dinner: mealsObj.dinner || []
            }
          });
        }
        list = cloned;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  list = list.filter(u => u && u.uid && !u.uid.startsWith("student_10") && !u.uid.startsWith("mock"));
  list.sort((a, b) => b.score - a.score);
  return list;
}

export async function fetchGoogleUsers() {
  const map = new Map();

  // 1. Read from localStorage "campus_google_users_registry"
  try {
    const rawGoogle = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    if (rawGoogle) {
      const parsedGoogle = JSON.parse(rawGoogle);
      if (Array.isArray(parsedGoogle)) {
        parsedGoogle.forEach(gu => {
          if (gu && gu.uid && !gu.uid.startsWith("student_10") && !gu.uid.startsWith("mock")) {
            const existing = map.get(gu.uid) || {};
            map.set(gu.uid, { ...existing, ...gu, isGoogle: true });
          }
        });
      }
    }
  } catch (e) {}

  // 2. Read from localStorage "campus_foodies_registry" (for dish counts/menus)
  try {
    const rawFoodies = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawFoodies) {
      const parsedFoodies = JSON.parse(rawFoodies);
      if (Array.isArray(parsedFoodies)) {
        parsedFoodies.forEach(fu => {
          if (fu && fu.uid && !fu.uid.startsWith("student_10") && !fu.uid.startsWith("mock")) {
            const existing = map.get(fu.uid) || {};
            map.set(fu.uid, {
              ...existing,
              ...fu,
              meals: fu.meals || existing.meals || 0,
              menus: fu.menus || existing.menus || { Breakfast: [], Lunch: [], Snacks: [], Dinner: [] }
            });
          }
        });
      }
    }
  } catch (e) {}

  // 3. Query Firestore 'users' collection to fetch live data from all devices/users
  try {
    const snap = await withTimeout(getDocs(collection(db, "users")), NETWORK_TIMEOUT_MS);
    if (!snap.empty) {
      snap.docs.forEach(docSnap => {
        if (docSnap.id.startsWith("student_10") || docSnap.id.startsWith("mock")) return;
        const d = docSnap.data();
        const existing = map.get(docSnap.id) || {};
        const b = d.breakfast || existing.menus?.Breakfast || [];
        const l = d.lunch || existing.menus?.Lunch || [];
        const s = d.snacks || existing.menus?.Snacks || [];
        const dn = d.dinner || existing.menus?.Dinner || [];
        const totalMeals = b.length + l.length + s.length + dn.length;

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
          lastLoginAt: d.lastLoginAt?.toMillis ? d.lastLoginAt.toMillis() : (d.lastLoginAt || existing.lastLoginAt || Date.now()),
          meals: totalMeals,
          votes: d.votes || existing.votes || 0,
          menus: { Breakfast: b, Lunch: l, Snacks: s, Dinner: dn },
          isGoogle: true
        });
      });
    }
  } catch (e) {
    // Offline fallback is already populated in map
  }

  const list = Array.from(map.values()).filter(u => u && u.uid && !u.uid.startsWith("student_10") && !u.uid.startsWith("mock"));
  // Sort by most recently active
  list.sort((a, b) => {
    const timeA = typeof a.lastLoginAt === "number" ? a.lastLoginAt : 0;
    const timeB = typeof b.lastLoginAt === "number" ? b.lastLoginAt : 0;
    return timeB - timeA;
  });

  return list;
}

export async function castVoteForStudent(targetUid, currentUid) {
  const users = getStoredUsers();
  const next = users.map(u => {
    if (u.uid === targetUid) {
      const nextVotes = (u.votes || 0) + 1;
      return { ...u, votes: nextVotes, score: (u.meals * 2) + nextVotes };
    }
    return u;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next));
  memoryUsersCache = { data: next, timestamp: Date.now() };

  // Allow voting for multiple students (store array in localStorage)
  if (currentUid) {
    try {
      const rawList = localStorage.getItem(`voted_list_${currentUid}`);
      const votedList = rawList ? JSON.parse(rawList) : [];
      if (!votedList.includes(targetUid)) {
        votedList.push(targetUid);
      }
      localStorage.setItem(`voted_list_${currentUid}`, JSON.stringify(votedList));
      localStorage.setItem(`voted_${currentUid}`, targetUid);
    } catch (e) {}
  }

  // Also synchronize in GOOGLE_USERS local storage
  try {
    const rawGoogle = localStorage.getItem(STORAGE_KEYS.GOOGLE_USERS);
    if (rawGoogle) {
      const gList = JSON.parse(rawGoogle);
      const gIdx = gList.findIndex(u => u.uid === targetUid);
      if (gIdx >= 0) {
        gList[gIdx] = { ...gList[gIdx], votes: (gList[gIdx].votes || 0) + 1 };
        localStorage.setItem(STORAGE_KEYS.GOOGLE_USERS, JSON.stringify(gList));
      }
    }
  } catch (e) {}

  // Direct Firestore write for instant cross-device vote synchronization
  withTimeout(
    setDoc(doc(db, "users", targetUid), { votes: increment(1) }, { merge: true }),
    NETWORK_TIMEOUT_MS
  ).catch((err) => {
    console.warn("Vote sync notice:", err.message);
  });

  return next;
}

// ─── Announcement Service ─────────────────────────────────────────────────────

export function getCampaignAnnouncement() {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
    if (custom && !custom.includes("⚡")) return custom;
  } catch (e) {}
  return "Voting opens on 5th October · Cast your vote for Akshat";
}

export function saveCampaignAnnouncement(text) {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, text);
  } catch (e) {}
  return text;
}
