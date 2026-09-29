import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { recordUserSession } from "../services/dataService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Check if guest user was previously saved
    const savedGuest = localStorage.getItem("guest_user");

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        recordUserSession(u).catch(() => {});
      } else if (savedGuest) {
        try {
          setUser(JSON.parse(savedGuest));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      localStorage.removeItem("guest_user");
      if (res.user) {
        recordUserSession(res.user).catch(() => {});
      }
      return res;
    } catch (err) {
      console.warn("Google popup error:", err);
      throw err;
    }
  };

  const signInAsGuest = (guestName = "Campus Student") => {
    const guest = {
      uid: "guest_" + Math.random().toString(36).substr(2, 9),
      displayName: guestName,
      photoURL: "",
      isGuest: true,
    };
    localStorage.setItem("guest_user", JSON.stringify(guest));
    setUser(guest);
  };

  const signOut = async () => {
    localStorage.removeItem("guest_user");
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("SignOut error:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
