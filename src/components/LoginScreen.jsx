import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  WatermelonIcon, GoogleIcon, VoteIcon, PlateIcon,
  TrophyIcon, ChatIcon, SparkleIcon, ShieldIcon
} from "./icons/Icons";
import akshatPhoto from "../assets/hero_nobg.png";
import styles from "./LoginScreen.module.css";

const FLOATERS = [
  { icon: <WatermelonIcon size={34} />, x: "6%",  y: "10%" },
  { icon: <PlateIcon size={32} color="#FB8500" />, x: "84%", y: "12%" },
  { icon: <VoteIcon size={30} color="#10B981" />, x: "5%",  y: "74%" },
  { icon: <WatermelonIcon size={26} />, x: "88%", y: "68%" },
];

export default function LoginScreen({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completion. Please try again.");
      } else if (err.message && err.message.includes("Cross-Origin-Opener-Policy")) {
        setError("Local dev environment blocked popup. This works automatically in production.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Ambient background mesh */}
      <div className={styles.mesh} />

      {/* Floating SVG decorations */}
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className={styles.floater}
          style={{ left: f.x, top: f.y, animationDelay: `${i * 0.8}s` }}
          aria-hidden="true"
        >
          {f.icon}
        </span>
      ))}

      <div className={styles.card}>
        {onClose && (
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            title="Close"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {/* Campaign pill */}
        <div className={styles.campaignPill}>
          <VoteIcon size={15} color="white" />
          <span>Mess Representative Candidate · Oct 5 Offline Voting</span>
        </div>

        {/* Logo and Headings */}
        <div className={styles.logoArea}>
          <div className={styles.watermelonWrap}>
            <WatermelonIcon size={56} />
            <span className={styles.watermelonGlow} />
          </div>
          <h1 className={styles.title}>
            Create Your <span className={styles.titleGradient}>Own Meal</span>
          </h1>
          <p className={styles.subtitle}>
            Sign in with your student Google account to curate your daily thali &amp; help Akshat upgrade the campus mess.
          </p>
        </div>

        {/* Candidate spotlight card */}
        <div className={styles.candidateCard}>
          <div className={styles.candidateAvatarWrap}>
            <img
              src={akshatPhoto}
              alt="Akshat"
              className={styles.candidateImg}
              loading="eager"
            />
            <span className={styles.onlineDot} title="Online Candidate" />
          </div>
          <div className={styles.candidateInfo}>
            <div className={styles.candidateNameRow}>
              <strong className={styles.candidateName}>Akshat</strong>
              <span className={styles.voteTag}>
                <SparkleIcon size={12} color="white" />
                VOTE 5 OCT
              </span>
            </div>
            <span className={styles.candidateRole}>Mess Rep Candidate 2026</span>
            <span className={styles.candidateQuote}>
              "Real student menus for real student appetites."
            </span>
          </div>
        </div>

        {/* What You Can Do - Benefits Preview */}
        <div className={styles.benefitsRow}>
          <div className={styles.benefitItem}>
            <PlateIcon size={18} color="#FF3366" />
            <span>Design Custom Meals</span>
          </div>
          <div className={styles.benefitItem}>
            <TrophyIcon size={18} color="#FB8500" />
            <span>Campus Leaderboard</span>
          </div>
          <div className={styles.benefitItem}>
            <ChatIcon size={18} color="#00CC99" />
            <span>Direct Suggestions</span>
          </div>
        </div>

        {/* Error notification alert */}
        {error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Google sign in button */}
        <button
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <div className={styles.googleIconBox}>
              <GoogleIcon size={22} />
            </div>
          )}
          <span className={styles.googleBtnText}>
            {loading ? "Connecting to Google…" : "Continue with Google"}
          </span>
        </button>

        {/* Trust & Privacy Note */}
        <div className={styles.trustNote}>
          <ShieldIcon size={13} color="#059669" />
          <span>Fast, 1-click sign in · Recommended @nst.rishihood.edu.in</span>
        </div>
      </div>
    </div>
  );
}
