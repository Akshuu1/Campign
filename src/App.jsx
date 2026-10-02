import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import styles from "./App.module.css";
import LoginScreen from "./components/LoginScreen";
import CampaignPage from "./components/CampaignPage";
import SuggestionsPage from "./components/SuggestionsPage";
import Leaderboard from "./components/Leaderboard";
import MealPlanner from "./components/MealPlanner";
import SwipeVoting from "./components/SwipeVoting";
import {
  VoteIcon, TrophyIcon, PlateIcon, WatermelonIcon, CrownIcon,
  ChatIcon, SparkleIcon
} from "./components/icons/Icons";
import { getCampaignAnnouncement } from "./services/dataService";
import { verifyAdminEmail } from "./utils/security";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import akshatCartoon from "./assets/akshat_avatar.jpg";

const AdminPortal = React.lazy(() => import("./components/AdminPortal"));

const BASE_TABS = [
  { id: "campaign", label: "Why to Vote Me", Icon: VoteIcon },
  { id: "swipe", label: "Swipe Food like ur EX", Icon: SparkleIcon },
  { id: "planner", label: "Add your Meal", Icon: PlateIcon },
  { id: "leaderboard", label: "Leaderboard", Icon: TrophyIcon, highlight: true },
  { id: "suggestions", label: "Suggestions", Icon: ChatIcon },
];

export default function App() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("planner");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bannerText, setBannerText] = useState(getCampaignAnnouncement());
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [badFoodClicks, setBadFoodClicks] = useState(0);

  // Securely verify whether the logged-in user is the authorized Admin
  useEffect(() => {
    let isMounted = true;
    if (!user || !user.email) {
      setIsCurrentUserAdmin(false);
    } else {
      verifyAdminEmail(user.email).then((isAdmin) => {
        if (isMounted) {
          setIsCurrentUserAdmin(isAdmin);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Tabs constructed dynamically: Admin tab is ONLY present if logged in as Admin
  const allTabs = isCurrentUserAdmin
    ? [...BASE_TABS, { id: "admin", label: "Admin Portal", Icon: CrownIcon, adminPill: true }]
    : BASE_TABS;

  // Crucial: Suggestions button and other tabs ONLY appear after login!
  // Unauthenticated users only see the Campaign tab.
  const visibleTabs = user
    ? allTabs
    : allTabs.filter(t => t.id === "campaign");

  // Keep active tab safe and automatically close login modal on login
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false);
    }
    if (user === null && activeTab !== "campaign") {
      setActiveTab("campaign");
    } else if (user && activeTab === "admin" && !isCurrentUserAdmin) {
      setActiveTab("planner");
    }
  }, [user, showLoginModal, isCurrentUserAdmin, activeTab]);
  // Auto-reset login gate if user returns to tab without completing login
  useEffect(() => {
    const handleReturnToTab = () => {
      if (badFoodClicks >= 3 && !user) {
        // Wait 1.5s to let Firebase process a successful login first
        setTimeout(() => {
          setBadFoodClicks(prev => (prev >= 3 ? 0 : prev));
        }, 1500);
      }
    };

    window.addEventListener("focus", handleReturnToTab);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleReturnToTab();
    });

    return () => {
      window.removeEventListener("focus", handleReturnToTab);
      document.removeEventListener("visibilitychange", handleReturnToTab);
    };
  }, [badFoodClicks, user]);

  // ── Auth loading splash ──
  if (user === undefined) {
    return (
      <div className={styles.authSplash}>
        <WatermelonIcon size={54} />
        <p className={styles.authSplashText}>Loading…</p>
      </div>
    );
  }

  // ── NOT signed in → full-screen login gate ──
  if (user === null) {
    return (
      <div className={styles.loginGate}>
        {/* Animated background blobs */}
        <div className={styles.gateBlob1} />
        <div className={styles.gateBlob2} />
        <div className={styles.gateBlob3} />

        <motion.div 
          className={styles.gateInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Left: Talking Avatar & Game Logic */}
          <div className={styles.gateLeft}>
            
            <div className={styles.interactiveAvatarSection}>
              <motion.div 
                className={styles.avatarWrap}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              >
                <img src={akshatCartoon} alt="Akshat Avatar" className={styles.avatarImgLarge} />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={badFoodClicks >= 3 ? "unlocked" : "locked"}
                  className={styles.speechBubble}
                  initial={{ opacity: 0, scale: 0.5, x: -20, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  {badFoodClicks >= 3 ? (
                    <>
                      <p><strong>BOOM! 💥</strong></p>
                      <p>You destroyed the tasteless food! Portal unlocked. Sign in and let's fix the menu!</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Hold up! ✋</strong></p>
                      <p>Prove you hate bad mess food. Smash that gross Cucumber {3 - badFoodClicks} more time{3 - badFoodClicks === 1 ? '' : 's'} to unlock the portal!</p>
                    </>
                  )}
                  <div className={styles.speechBubbleTail} />
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div 
              className={styles.gateHeadline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className={styles.gateH2} style={{ fontSize: '3.2rem', lineHeight: '1.05', letterSpacing: '-0.04em' }}>
                The campus mess,<br />
                <span className={styles.gateAccent} style={{ background: 'linear-gradient(135deg, #FF3366, #FF9900)', WebkitBackgroundClip: 'text', color: 'transparent' }}>reimagined by you.</span>
              </h2>
            </motion.div>

            <div className={styles.gateFeatures} style={{ marginTop: '1.5rem' }}>
              {[
                { label: "Vote on Daily Menus", color: "#FF3366" },
                { label: "Suggest New Dishes", color: "#FB8500" },
                { label: "Direct Suggestions", color: "#00CC99" },
              ].map(({ color, label }, index) => (
                <motion.div 
                  key={label} 
                  className={styles.gateFeatureItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + (index * 0.1) }}
                  style={{ gap: '1rem', fontSize: '1.05rem', fontWeight: 700 }}
                >
                  <div className={styles.gateFeatureIcon} style={{ background: color, border: 'none', width: '28px', height: '28px', borderRadius: '50%', minWidth: '28px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Game Area */}
          <div className={styles.gateRight} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {badFoodClicks < 3 ? (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -20, 0] }}
                  exit={{ opacity: 0, scale: 0, rotate: 360 }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    default: { duration: 0.5, type: "spring", bounce: 0.5 }
                  }}
                  onClick={async () => {
                    const newClicks = badFoodClicks + 1;
                    setBadFoodClicks(newClicks);
                    if (newClicks >= 3) {
                      try {
                        await signInWithGoogle();
                        setActiveTab("planner");
                      } catch (error) {
                        console.error("Login failed:", error);
                        // Reset if login fails so they can try again
                        setBadFoodClicks(0);
                      }
                    }
                  }}
                  className={styles.smashFood}
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.8 }}
                >
                  🥒
                </motion.div>
              ) : (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                >
                  <span className={styles.spinner} style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>Connecting securely...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Signed in → full app ──
  return (
    <div className={styles.appRoot}>
      {/* Dynamic Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerTrack}>

          <span className={styles.bannerText}>
            Voting opens on <strong>5th October</strong> · Support &amp; Vote for <strong>Akshat Agrawal</strong>!
          </span>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft} onClick={() => setActiveTab("campaign")} style={{ cursor: "pointer" }}>
          <WatermelonIcon size={38} />
          <div>
            <h1 className={styles.headerTitle}>Create Your Own Meal</h1>
            <p className={styles.headerSub}>Mess Rep Candidate: <strong>Akshat</strong> · Vote 5 Oct</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {isCurrentUserAdmin && (
            <button
              className={`${styles.adminHeaderBtn} ${activeTab === "admin" ? styles.adminHeaderBtnActive : ""}`}
              onClick={() => setActiveTab("admin")}
              title="Akshat's Admin Portal"
            >
              <CrownIcon size={16} color="#FB8500" />
              <span>Admin</span>
              <span className={styles.adminLiveDot} />
            </button>
          )}

          <div className={styles.userPill}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.userInitial}>
                {user.displayName?.charAt(0).toUpperCase() || "S"}
              </div>
            )}
            <span className={styles.userName}>{user.displayName?.split(" ")[0]}</span>
          </div>
          <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </header>

      {/* Nav */}
      <nav className={styles.nav}>
        {allTabs.map(({ id, label, Icon, highlight, adminPill }) => (
          <button
            key={id}
            className={`${styles.navTab}
              ${activeTab === id ? styles.navTabActive : ""}
              ${highlight ? styles.navTabHighlight : ""}
              ${adminPill ? styles.navTabAdmin : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon
              size={16}
              color={
                activeTab === id ? "white"
                  : adminPill ? "#FB8500"
                    : highlight ? "#10B981"
                      : "#8E8273"
              }
            />
            {label}
            {adminPill && <span className={styles.adminNavActiveDot} />}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className={styles.main}>
        {activeTab === "campaign" && (
          <CampaignPage
            onNavigateToSuggestions={() => setActiveTab("suggestions")}
          />
        )}
        {activeTab === "suggestions" && (
          <SuggestionsPage onBackToCampaign={() => setActiveTab("campaign")} />
        )}
        {activeTab === "swipe" && <SwipeVoting />}
        {activeTab === "planner" && <MealPlanner />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "admin" && isCurrentUserAdmin && (
          <React.Suspense fallback={<div style={{ textAlign: "center", padding: "4rem", color: "#8E8273", fontWeight: 800 }}>Loading Command Center...</div>}>
            <AdminPortal onAnnouncementChange={setBannerText} />
          </React.Suspense>
        )}
      </main>
    </div>
  );
}
