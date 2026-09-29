import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLKFZRxyPyBz720ipCRfRLnIw1v1vF7UY",
  authDomain: "menu-369aa.firebaseapp.com",
  projectId: "menu-369aa",
  storageBucket: "menu-369aa.firebasestorage.app",
  messagingSenderId: "148879189689",
  appId: "1:148879189689:web:5195912c05583313f21d68",
  measurementId: "G-B871C6Q83D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;