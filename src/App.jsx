import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import styles from "./App.module.css";
import LoginScreen from "./components/LoginScreen";
import CampaignPage from "./components/CampaignPage";
import SuggestionsPage from "./components/SuggestionsPage";
import Leaderboard from "./components/Leaderboard";
import MealPlanner from "./components/MealPlanner";
import {
  VoteIcon, TrophyIcon, PlateIcon, WatermelonIcon, CrownIcon,
  ChatIcon, SparkleIcon
} from "./components/icons/Icons";
import { getCampaignAnnouncement } from "./services/dataService";
import { verifyAdminEmail } from "./utils/security";

const AdminPortal = React.lazy(() => import("./components/AdminPortal"));

const BASE_TABS = [
  { id: "campaign", label: "Why to Vote Me", Icon: VoteIcon },
  { id: "planner", label: "Add your Meal", Icon: PlateIcon },
  { id: "leaderboard", label: "Leaderboard", Icon: TrophyIcon, highlight: true },
  { id: "suggestions", label: "Suggestions", Icon: ChatIcon },
];

export default function App() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("campaign");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bannerText, setBannerText] = useState(getCampaignAnnouncement());
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

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
    if (!user && activeTab !== "campaign") {
      setActiveTab("campaign");
    } else if (activeTab === "admin" && !isCurrentUserAdmin) {
      setActiveTab("campaign");
    }
  }, [user, showLoginModal, isCurrentUserAdmin, activeTab]);

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

        <div className={styles.gateInner}>
          {/* Left: branding + copy */}
          <div className={styles.gateLeft}>
            <div className={styles.gateLogoRow}>
              <WatermelonIcon size={44} />
              <div>
                <h1 className={styles.gateTitle}>Create Your Own Meal</h1>
                <p className={styles.gateSub}>by <strong>Akshat</strong></p>
              </div>
            </div>

            <div className={styles.gateHeadline}>
              <span className={styles.gateHeadlineBadge}>
                <VoteIcon size={14} color="white" /> Vote 5 Oct
              </span>
              <h2 className={styles.gateH2}>
                The campus mess,<br />
                <span className={styles.gateAccent}>reimagined by you.</span>
              </h2>
              <p className={styles.gateDesc}>
                Design your daily thali, vote on the leaderboard, and send direct suggestions
                to <strong>me</strong> — all in one place. Sign in to get started.
              </p>
            </div>

            <div className={styles.gateFeatures}>
              {[
                { Icon: PlateIcon,   color: "#FF3366", label: "Design Custom Meals" },
                { Icon: TrophyIcon,  color: "#FB8500", label: "Campus Leaderboard"  },
                { Icon: ChatIcon,    color: "#00CC99", label: "Direct Suggestions"  },
              ].map(({ Icon, color, label }) => (
                <div key={label} className={styles.gateFeatureItem}>
                  <div className={styles.gateFeatureIcon}>
                    <Icon size={18} color={color} />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: login card */}
          <div className={styles.gateRight}>
            <LoginScreen />
          </div>
        </div>
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
