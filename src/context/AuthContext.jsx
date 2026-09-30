import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, getAdditionalUserInfo, deleteUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

  const ALLOWED_DOMAIN = "rishihood.edu.in";

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const email = res.user?.email || "";
      const uid   = res.user?.uid   || "";

      // ── Domain gate: allow @rishihood.edu.in OR any subdomain ──
      const isRishihoodEmail =
        email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`) ||
        email.toLowerCase().endsWith(`.${ALLOWED_DOMAIN}`);

      if (!isRishihoodEmail) {
        const additionalInfo = getAdditionalUserInfo(res);
        const isNewUser = additionalInfo?.isNewUser;

        if (isNewUser) {
          // Brand-new user with a non-Rishihood email → block immediately and delete their Auth record
          try {
            await deleteUser(res.user);
          } catch (e) {
            await firebaseSignOut(auth);
          }
          const err = new Error(
            `Only Rishihood email IDs (ending in .${ALLOWED_DOMAIN}) are allowed.`
          );
          err.code = "auth/unauthorized-email-domain";
          throw err;
        }
        // Existing user with non-Rishihood email → allow (grandfathered in)
      }

      localStorage.removeItem("guest_user");
      recordUserSession(res.user).catch(() => {});
      return res;
    } catch (err) {
      console.warn("Google sign-in error:", err);
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
