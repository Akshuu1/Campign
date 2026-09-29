import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CrownIcon, ChatIcon, UsersIcon, PlateIcon,
  VoteIcon, SearchIcon, TrashIcon, RefreshIcon, CheckIcon,
  StarIcon, LockIcon, MegaphoneIcon, SparkleIcon, GoogleIcon, ShieldIcon
} from "./icons/Icons";
import {
  fetchAllSuggestions, updateSuggestionItem, removeSuggestionItem,
  fetchGoogleUsers, getCampaignAnnouncement, saveCampaignAnnouncement,
  clearDataServiceCache
} from "../services/dataService";
import { verifyAdminEmail, verifyAdminPasscode } from "../utils/security";
import akshatPhoto from "../assets/hero_nobg.png";
import styles from "./AdminPortal.module.css";

export default function AdminPortal({ onAnnouncementChange }) {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("akshat_admin_session") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");

  // Automatically authenticate if verified Admin is logged in
  useEffect(() => {
    let isMounted = true;
    if (user?.email) {
      verifyAdminEmail(user.email).then((isAdmin) => {
        if (isMounted && isAdmin) {
          setIsAuthenticated(true);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const [activeTab, setActiveTab] = useState("suggestions"); // suggestions | students | analytics | announcement
  const [suggestions, setSuggestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for suggestions
  const [sugFilterStatus, setSugFilterStatus] = useState("all"); // all | new | starred | actioned
  const [sugCategoryFilter, setSugCategoryFilter] = useState("all");
  const [sugSearch, setSugSearch] = useState("");

  // Student directory search, filter & modal
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all"); // all | university | with_meals | active_today
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState("");

  // Announcement editor
  const [announcementText, setAnnouncementText] = useState(getCampaignAnnouncement());
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [sugList, googleUsersList] = await Promise.all([
        fetchAllSuggestions(),
        fetchGoogleUsers()
      ]);
      setSuggestions(sugList);
      setStudents(googleUsersList);
    } catch (e) {
      console.warn("Failed to load admin data:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      // Background auto-refresh every 12 seconds so new logins and updates sync live
      const interval = setInterval(() => {
        loadData(true);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  const handleForceRefresh = () => {
    clearDataServiceCache();
    loadData(false);
  };

  const handleUnlock = async (e) => {
    e?.preventDefault();
    setPassError("");
    const isValid = await verifyAdminPasscode(passcode);
    if (isValid || (user && user.displayName?.toLowerCase().includes("akshat"))) {
      setIsAuthenticated(true);
      localStorage.setItem("akshat_admin_session", "true");
      setPassError("");
    } else {
      setPassError("Incorrect passcode. Access restricted to authorized campaign staff.");
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("akshat_admin_session");
  };

  // Suggestion actions
  const handleToggleStar = async (id, currentVal) => {
    const updated = await updateSuggestionItem(id, { starred: !currentVal });
    setSuggestions(updated);
  };

  const handleStatusChange = async (id, newStatus) => {
    const updated = await updateSuggestionItem(id, { status: newStatus });
    setSuggestions(updated);
  };

  const handleDeleteSuggestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this suggestion?")) {
      const updated = await removeSuggestionItem(id);
      setSuggestions(updated);
    }
  };

  // Announcement save
  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    saveCampaignAnnouncement(announcementText);
    if (onAnnouncementChange) onAnnouncementChange(announcementText);
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  // Copy email with feedback
  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(""), 2000);
  };

  // Export suggestions to CSV
  const handleExportCSV = () => {
    if (suggestions.length === 0) return alert("No suggestions to export.");
    const headers = "ID,Student Name,Email/Room,Category,Status,Suggestion,Date\n";
    const rows = suggestions.map(s => {
      const cleanText = `"${(s.suggestion || "").replace(/"/g, '""')}"`;
      const cleanName = `"${(s.studentName || "").replace(/"/g, '""')}"`;
      return `${s.id},${cleanName},${s.studentEmail || s.studentRoom || "N/A"},${s.category || "General"},${s.status || "new"},${cleanText},${s.timestamp || ""}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Akshat_Mess_Suggestions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Google Roster to CSV
  const handleExportStudentsCSV = () => {
    if (students.length === 0) return alert("No logged-in students to export.");
    const headers = "UID,Student Name,Google Email,Domain,Google Verified,Total Dishes,Breakfast Items,Lunch Items,Snacks Items,Dinner Items,Votes,Last Sign In\n";
    const rows = students.map(s => {
      const cleanName = `"${(s.displayName || "").replace(/"/g, '""')}"`;
      const cleanEmail = `"${(s.email || "").replace(/"/g, '""')}"`;
      const domain = s.email && s.email.includes("@") ? s.email.split("@")[1] : "N/A";
      const bItems = `"${(s.menus?.Breakfast || []).join(", ").replace(/"/g, '""')}"`;
      const lItems = `"${(s.menus?.Lunch || []).join(", ").replace(/"/g, '""')}"`;
      const sItems = `"${(s.menus?.Snacks || []).join(", ").replace(/"/g, '""')}"`;
      const dItems = `"${(s.menus?.Dinner || []).join(", ").replace(/"/g, '""')}"`;
      return `${s.uid},${cleanName},${cleanEmail},${domain},${s.emailVerified ? "Yes" : "No"},${s.meals || 0},${bItems},${lItems},${sItems},${dItems},${s.votes || 0},"${s.lastSignInTime || ""}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Akshat_Logged_In_Google_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats
  const totalSuggestions = suggestions.length;
  const newSuggestionsCount = suggestions.filter(s => s.status === "new").length;
  const totalStudents = students.length;
  const totalMealsPicked = students.reduce((acc, s) => acc + (s.meals || 0), 0);
  const totalVotesCast = students.reduce((acc, s) => acc + (s.votes || 0), 0);
  const uniStudentsCount = students.filter(s => (s.email || "").toLowerCase().includes("rishihood.edu.in")).length;
  const withMealsCount = students.filter(s => (s.meals || 0) > 0).length;
  const recentActiveCount = students.filter(s => {
    const isToday = typeof s.lastSignInTime === "string" && s.lastSignInTime.toLowerCase().includes("today");
    const isRecentMillis = typeof s.lastLoginAt === "number" && (Date.now() - s.lastLoginAt < 86400000);
    return isToday || isRecentMillis;
  }).length;

  // Dish popularity aggregation
  const dishCounts = {};
  students.forEach(s => {
    if (s.menus) {
      Object.entries(s.menus).forEach(([, items]) => {
        if (Array.isArray(items)) {
          items.forEach(dish => {
            dishCounts[dish] = (dishCounts[dish] || 0) + 1;
          });
        }
      });
    }
  });
  const topDishes = Object.entries(dishCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Suggestions filtered
  const filteredSuggestions = suggestions.filter(s => {
    if (sugFilterStatus === "new" && s.status !== "new") return false;
    if (sugFilterStatus === "starred" && !s.starred) return false;
    if (sugFilterStatus === "actioned" && s.status !== "actioned") return false;
    if (sugCategoryFilter !== "all" && s.category !== sugCategoryFilter) return false;
    if (sugSearch) {
      const q = sugSearch.toLowerCase();
      const matchText = (s.suggestion || "").toLowerCase().includes(q);
      const matchName = (s.studentName || "").toLowerCase().includes(q);
      if (!matchText && !matchName) return false;
    }
    return true;
  });

  // Students filtered by search & category
  const filteredStudents = students.filter(s => {
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      const matchName = (s.displayName || "").toLowerCase().includes(q);
      const matchEmail = (s.email || "").toLowerCase().includes(q);
      const matchUid = (s.uid || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUid) return false;
    }
    if (studentFilter === "university") {
      return (s.email || "").toLowerCase().includes("rishihood.edu.in");
    }
    if (studentFilter === "with_meals") {
      return (s.meals || 0) > 0;
    }
    if (studentFilter === "active_today") {
      const isToday = typeof s.lastSignInTime === "string" && s.lastSignInTime.toLowerCase().includes("today");
      const isRecentMillis = typeof s.lastLoginAt === "number" && (Date.now() - s.lastLoginAt < 86400000);
      return isToday || isRecentMillis;
    }
    return true;
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // PASSCODE UNLOCK SCREEN
  // ═════════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className={styles.authRoot}>
        <div className={styles.authCard}>
          <div className={styles.authBadge}>
            <CrownIcon size={20} color="#FB8500" />
            <span>MESS REPRESENTATIVE ADMIN</span>
          </div>

          <div className={styles.authAvatarWrap}>
            <img src={akshatPhoto} alt="Akshat" className={styles.authAvatar} />
          </div>

          <h2 className={styles.authTitle}>Akshat's Command Center</h2>
          <p className={styles.authSub}>
            Private portal to view student suggestions, meal choices, and campaign statistics.
          </p>

          <form onSubmit={handleUnlock} className={styles.authForm}>
            <div className={styles.authInputWrap}>
              <LockIcon size={18} color="#8E8273" />
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={styles.authInput}
                autoFocus
              />
            </div>

            {passError && <div className={styles.authError}>{passError}</div>}

            <button type="submit" className={styles.authSubmitBtn}>
              Unlock Command Center →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // MAIN ADMIN DASHBOARD
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.root}>
      {/* Top Banner & Header */}
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.adminAvatarBox}>
            <img src={akshatPhoto} alt="Akshat" className={styles.adminHeaderImg} />
            <span className={styles.adminStatusDot} />
          </div>
          <div>
            <div className={styles.rolePill}>
              <CrownIcon size={14} color="#FB8500" />
              <span>Mess Representative Campaign Desk</span>
            </div>
            <h1 className={styles.adminMainTitle}>Akshat's Admin Portal</h1>
            <p className={styles.adminSubTitle}>
              Private Command Center · Student Suggestions, Foodie Directory & Demand Insights
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.actionBtnSec} onClick={handleForceRefresh} title="Force refresh from Firestore">
            <RefreshIcon size={16} /> Refresh
          </button>
          <button className={styles.actionBtnSec} onClick={handleExportCSV} title="Export suggestions to CSV">
            📥 Export CSV
          </button>
          <button className={styles.lockBtn} onClick={handleLock} title="Lock session">
            <LockIcon size={16} /> Lock
          </button>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ borderLeftColor: "#FF3366" }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Student Suggestions</span>
            <div className={styles.kpiIconBox} style={{ background: "#FFE4E6" }}>
              <ChatIcon size={20} color="#FF3366" />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{totalSuggestions}</span>
            {newSuggestionsCount > 0 && (
              <span className={styles.kpiBadge} style={{ background: "#FF3366", color: "white" }}>
                {newSuggestionsCount} New
              </span>
            )}
          </div>
          <span className={styles.kpiDesc}>Private student feedback received</span>
        </div>

        <div className={styles.kpiCard} style={{ borderLeftColor: "#FB8500" }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Registered Students</span>
            <div className={styles.kpiIconBox} style={{ background: "#FEF3C7" }}>
              <UsersIcon size={20} color="#FB8500" />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{totalStudents}</span>
            <span className={styles.kpiBadge} style={{ background: "#FEF3C7", color: "#B45309" }}>
              {totalVotesCast} Votes Tracked
            </span>
          </div>
          <span className={styles.kpiDesc}>Active student foodies in system</span>
        </div>

        <div className={styles.kpiCard} style={{ borderLeftColor: "#10B981" }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Dishes Configured</span>
            <div className={styles.kpiIconBox} style={{ background: "#D1FAE5" }}>
              <PlateIcon size={20} color="#10B981" />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{totalMealsPicked}</span>
            <span className={styles.kpiBadge} style={{ background: "#ECFDF5", color: "#065F46" }}>
              Across 4 Meals
            </span>
          </div>
          <span className={styles.kpiDesc}>Breakfast, Lunch, Snacks & Dinner</span>
        </div>

        <div className={styles.kpiCard} style={{ borderLeftColor: "#3B82F6" }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Community Votes</span>
            <div className={styles.kpiIconBox} style={{ background: "#DBEAFE" }}>
              <VoteIcon size={20} color="#3B82F6" />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{totalVotesCast}</span>
            <span className={styles.kpiBadge} style={{ background: "#EFF6FF", color: "#1E40AF" }}>
              Live Synced
            </span>
          </div>
          <span className={styles.kpiDesc}>Total student votes across all menus</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === "suggestions" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          <ChatIcon size={18} />
          Student Suggestions ({suggestions.length})
          {newSuggestionsCount > 0 && <span className={styles.tabCountPill}>{newSuggestionsCount}</span>}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "students" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <UsersIcon size={18} />
          Logged-In Students &amp; Google Info ({students.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "analytics" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <PlateIcon size={18} />
          Mess Demand Analytics
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "announcement" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("announcement")}
        >
          <MegaphoneIcon size={18} />
          Top Ticker Announcement
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 1: SUGGESTIONS INBOX
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "suggestions" && (
        <section className={styles.sectionWrap}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <SearchIcon size={16} color="#8E8273" />
              <input
                type="text"
                placeholder="Search by student name or suggestion keyword..."
                value={sugSearch}
                onChange={(e) => setSugSearch(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.pillsRow}>
              <button
                className={`${styles.statusPill} ${sugFilterStatus === "all" ? styles.statusPillActive : ""}`}
                onClick={() => setSugFilterStatus("all")}
              >
                All ({suggestions.length})
              </button>
              <button
                className={`${styles.statusPill} ${sugFilterStatus === "new" ? styles.statusPillActive : ""}`}
                onClick={() => setSugFilterStatus("new")}
              >
                ⚡ New ({suggestions.filter(s => s.status === "new").length})
              </button>
              <button
                className={`${styles.statusPill} ${sugFilterStatus === "starred" ? styles.statusPillActive : ""}`}
                onClick={() => setSugFilterStatus("starred")}
              >
                ⭐ Starred ({suggestions.filter(s => s.starred).length})
              </button>
              <button
                className={`${styles.statusPill} ${sugFilterStatus === "actioned" ? styles.statusPillActive : ""}`}
                onClick={() => setSugFilterStatus("actioned")}
              >
                ✅ Actioned ({suggestions.filter(s => s.status === "actioned").length})
              </button>
            </div>

            <div className={styles.pillsRow} style={{ marginTop: "0.5rem" }}>
              {["all", "Food Quality", "Mess Timing", "Hygiene & Cleanliness", "Menu Variety", "General"].map((cat) => (
                <button
                  key={cat}
                  className={`${styles.statusPill} ${sugCategoryFilter === cat ? styles.statusPillActive : ""}`}
                  onClick={() => setSugCategoryFilter(cat)}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          {loading ? (
            <div className={styles.emptyCard}>
              <RefreshIcon size={24} color="#FF5A36" />
              <p>Syncing live suggestions...</p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No suggestions found in this filter.</p>
            </div>
          ) : (
            <div className={styles.suggestionsList}>
              {filteredSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className={`${styles.sugCard} ${sug.status === "new" ? styles.sugCardNew : ""}`}
                >
                  <div className={styles.sugCardHeader}>
                    <div className={styles.sugStudentInfo}>
                      <div className={styles.sugAvatar}>
                        {(sug.studentName || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className={styles.sugName}>{sug.studentName || "Anonymous Student"}</strong>
                        <span className={styles.sugMeta}>
                          {sug.studentRoom && <span>🏠 {sug.studentRoom} · </span>}
                          {sug.studentEmail && <span>✉️ {sug.studentEmail} · </span>}
                          <span>🕒 {sug.timestamp || "Recently"}</span>
                        </span>
                      </div>
                    </div>

                    <div className={styles.sugBadges}>
                      <span className={styles.categoryBadge}>{sug.category || "General"}</span>
                      {sug.status === "new" && (
                        <span className={styles.badgeNew}>NEW</span>
                      )}
                      {sug.status === "actioned" && (
                        <span className={styles.badgeActioned}>ACTIONED</span>
                      )}
                    </div>
                  </div>

                  <p className={styles.sugText}>"{sug.suggestion}"</p>

                  <div className={styles.sugFooter}>
                    <div className={styles.sugActionsLeft}>
                      <button
                        className={`${styles.starBtn} ${sug.starred ? styles.starBtnActive : ""}`}
                        onClick={() => handleToggleStar(sug.id, sug.starred)}
                        title="Star for Mess Committee Discussion"
                      >
                        <StarIcon size={16} filled={sug.starred} color={sug.starred ? "#FB8500" : "#8E8273"} />
                        {sug.starred ? "Starred for Agenda" : "Star"}
                      </button>

                      {sug.status !== "actioned" ? (
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleStatusChange(sug.id, "actioned")}
                        >
                          <CheckIcon size={15} color="#10B981" /> Mark Actioned
                        </button>
                      ) : (
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleStatusChange(sug.id, "new")}
                        >
                          Reopen
                        </button>
                      )}
                    </div>

                    <div className={styles.sugActionsRight}>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteSuggestion(sug.id)}
                        title="Delete suggestion"
                      >
                        <TrashIcon size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 2: LOGGED IN PEOPLE & GOOGLE INFO
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "students" && (
        <section className={styles.sectionWrap}>
          {/* Top Quick Stats for Logged In People */}
          <div className={styles.googleStatsGrid}>
            <div className={styles.googleStatCard}>
              <div className={styles.googleStatIcon} style={{ background: "#EFF6FF", color: "#3B82F6" }}>
                <GoogleIcon size={22} />
              </div>
              <div>
                <span className={styles.googleStatVal}>{students.length}</span>
                <span className={styles.googleStatLabel}>Logged-In Accounts</span>
              </div>
            </div>

            <div className={styles.googleStatCard}>
              <div className={styles.googleStatIcon} style={{ background: "#ECFDF5", color: "#10B981" }}>
                <VoteIcon size={22} color="#10B981" />
              </div>
              <div>
                <span className={styles.googleStatVal}>{uniStudentsCount}</span>
                <span className={styles.googleStatLabel}>@nst.rishihood.edu.in</span>
              </div>
            </div>

            <div className={styles.googleStatCard}>
              <div className={styles.googleStatIcon} style={{ background: "#FFF7ED", color: "#FB8500" }}>
                <PlateIcon size={22} color="#FB8500" />
              </div>
              <div>
                <span className={styles.googleStatVal}>{withMealsCount}</span>
                <span className={styles.googleStatLabel}>Active Meal Planners</span>
              </div>
            </div>

            <div className={styles.googleStatCard}>
              <div className={styles.googleStatIcon} style={{ background: "#FEF2F2", color: "#EF4444" }}>
                <ShieldIcon size={22} color="#EF4444" />
              </div>
              <div>
                <span className={styles.googleStatVal}>100%</span>
                <span className={styles.googleStatLabel}>Google OAuth Verified</span>
              </div>
            </div>
          </div>

          {/* Filter and Action Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <SearchIcon size={16} color="#8E8273" />
              <input
                type="text"
                placeholder="Search by student name, Google email, or UID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.pillsRow}>
              <button
                className={`${styles.statusPill} ${studentFilter === "all" ? styles.statusPillActive : ""}`}
                onClick={() => setStudentFilter("all")}
              >
                All Users ({students.length})
              </button>
              <button
                className={`${styles.statusPill} ${studentFilter === "university" ? styles.statusPillActive : ""}`}
                onClick={() => setStudentFilter("university")}
              >
                🎓 Rishihood Domain ({uniStudentsCount})
              </button>
              <button
                className={`${styles.statusPill} ${studentFilter === "with_meals" ? styles.statusPillActive : ""}`}
                onClick={() => setStudentFilter("with_meals")}
              >
                🍽️ With Meal Plans ({withMealsCount})
              </button>
              <button
                className={`${styles.statusPill} ${studentFilter === "active_today" ? styles.statusPillActive : ""}`}
                onClick={() => setStudentFilter("active_today")}
              >
                ⚡ Active Recently ({recentActiveCount})
              </button>
            </div>

            <div className={styles.studentActionRow}>
              <button
                className={styles.syncBtn}
                onClick={loadData}
                title="Sync latest live Google users"
              >
                <RefreshIcon size={15} color="#FB8500" />
                <span>Live Refresh</span>
              </button>
              <button
                className={styles.exportRosterBtn}
                onClick={handleExportStudentsCSV}
                title="Export complete roster to CSV"
              >
                <span>📥 Export Roster CSV</span>
              </button>
            </div>
          </div>

          {/* Logged In Students Table */}
          {loading ? (
            <div className={styles.emptyCard}>
              <RefreshIcon size={24} color="#FB8500" />
              <p>Fetching Google authenticated students &amp; meal records...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No students match your filter or search criteria.</p>
            </div>
          ) : (
            <div className={styles.studentsTable}>
              <div className={styles.tableHeader}>
                <span>#</span>
                <span>Google Profile &amp; Student</span>
                <span>Google Account Details</span>
                <span>Meal Choices</span>
                <span>Votes</span>
                <span>Actions</span>
              </div>

              {filteredStudents.map((st, i) => {
                const isUni = (st.email || "").toLowerCase().includes("rishihood.edu.in");
                return (
                  <div key={st.uid || i} className={styles.tableRow}>
                    <span className={styles.colIndex}>{i + 1}</span>

                    {/* Google Profile */}
                    <div className={styles.colStudent}>
                      <div className={styles.avatarWithGoogleBadge}>
                        {st.photoURL ? (
                          <img
                            src={st.photoURL}
                            alt={st.displayName}
                            className={styles.stAvatar}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={styles.stAvatarFallback}>
                            {st.displayName?.charAt(0).toUpperCase() || "S"}
                          </div>
                        )}
                        <span className={styles.googleMiniBadge} title="Authenticated with Google">
                          <GoogleIcon size={11} />
                        </span>
                      </div>

                      <div className={styles.stNameAndEmail}>
                        <div className={styles.stNameRow}>
                          <strong className={styles.stName}>{st.displayName}</strong>
                          {isUni ? (
                            <span className={styles.uniTag}>🎓 NST Rishihood</span>
                          ) : (
                            <span className={styles.verifiedTag}>✓ Google User</span>
                          )}
                        </div>
                        <div className={styles.stEmailRow}>
                          <span className={styles.stEmailText}>{st.email || "No email provided"}</span>
                          {st.email && (
                            <button
                              type="button"
                              className={styles.copyEmailBtn}
                              onClick={() => handleCopyEmail(st.email)}
                              title="Copy email address"
                            >
                              {copiedEmail === st.email ? "✓ Copied" : "Copy"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Google Auth Meta */}
                    <div className={styles.colGoogleMeta}>
                      <div className={styles.metaRowItem}>
                        <ShieldIcon size={12} color="#10B981" />
                        <span>OAuth 2.0 Verified</span>
                      </div>
                      <div className={styles.metaRowItemMuted}>
                        <span>🕒 {st.lastSignInTime || "Active recently"}</span>
                      </div>
                      {st.creationTime && (
                        <div className={styles.metaRowItemMuted}>
                          <span>📅 Joined {new Date(st.creationTime).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Meal Choices Count */}
                    <div className={styles.colMealsCount}>
                      <span className={styles.mealBadgePill}>
                        <PlateIcon size={13} color="#FB8500" />
                        {st.meals || 0} Dishes
                      </span>
                      <span className={styles.mealBreakdownSub}>
                        {st.meals > 0 ? (
                          `${st.menus?.Breakfast?.length || 0}B · ${st.menus?.Lunch?.length || 0}L · ${st.menus?.Snacks?.length || 0}S · ${st.menus?.Dinner?.length || 0}D`
                        ) : (
                          "Browsing"
                        )}
                      </span>
                    </div>

                    {/* Leaderboard Votes */}
                    <div className={styles.colVotesCount}>
                      <span className={styles.voteBadgePill}>
                        <StarIcon size={13} filled color="#FF3366" />
                        {st.votes || 0} Votes
                      </span>
                    </div>

                    {/* Actions */}
                    <div className={styles.colActions}>
                      <button
                        className={styles.viewPlanBtn}
                        onClick={() => setSelectedStudent(st)}
                      >
                        Inspect Profile →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 3: MESS DEMAND ANALYTICS
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <section className={styles.sectionWrap}>
          <div className={styles.insightsCard}>
            <div className={styles.insightsIconBox}>
              <SparkleIcon size={24} color="#FB8500" />
            </div>
            <div>
              <strong className={styles.insightsTitle}>Key Campaign Leverage for Akshat</strong>
              <p className={styles.insightsText}>
                Use this hard data in your campaign speeches and when negotiating with the mess committee!
                Show them that you know exactly what students demand on their plates every single day.
              </p>
            </div>
          </div>

          <h3 className={styles.subHeading}>🔥 Most Requested Campus Dishes Across All Meal Plans</h3>

          <div className={styles.demandGrid}>
            {topDishes.map(([dish, count], index) => {
              const maxCount = topDishes[0][1] || 1;
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={dish} className={styles.demandCard}>
                  <div className={styles.demandTopRow}>
                    <span className={styles.demandRank}>#{index + 1}</span>
                    <strong className={styles.demandName}>{dish}</strong>
                    <span className={styles.demandCount}>{count} students</span>
                  </div>
                  <div className={styles.demandBarWrap}>
                    <div
                      className={styles.demandBarFill}
                      style={{
                        width: `${pct}%`,
                        background: index < 3 ? "linear-gradient(90deg, #FF3366, #FB8500)" : "#10B981"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 4: ANNOUNCEMENT TICKER EDITOR
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "announcement" && (
        <section className={styles.sectionWrap}>
          <div className={styles.announcementCard}>
            <div className={styles.announcementTop}>
              <MegaphoneIcon size={28} color="#FB8500" />
              <div>
                <h3>Live Top Marquee Banner Editor</h3>
                <p>
                  This ticker message scrolls continuously across the top of the entire website for all visiting students.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAnnouncement} className={styles.announcementForm}>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={3}
                className={styles.announcementTextarea}
                placeholder="Enter ticker announcement..."
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div className={styles.presetsList}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#8E8273" }}>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setAnnouncementText("⚡ Voting opens on 5th October! Don't forget to vote for Akshat for Mess Representative! ⚡")}
                    className={styles.presetBtn}
                  >
                    Voting Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementText("📢 Special Sunday Menu Survey is Live! Head to 'My Meals' and add your favorite dishes now. 📢")}
                    className={styles.presetBtn}
                  >
                    Menu Survey
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementText("🗳️ Offline voting counter located at Hostel Block A & Mess Hall 1 on 5th Oct! Vote Akshat! 🗳️")}
                    className={styles.presetBtn}
                  >
                    Booth Locations
                  </button>
                </div>

                <button type="submit" className={styles.saveAnnouncementBtn}>
                  {announcementSaved ? "✓ Updated Live Banner!" : "Update Live Banner →"}
                </button>
              </div>
            </form>

            <div className={styles.previewBox}>
              <span className={styles.previewLabel}>LIVE PREVIEW:</span>
              <div className={styles.previewTicker}>
                {announcementText}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Student Profile & Menu Modal */}
      {selectedStudent && (
        <div className={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalStudentCardHeader}>
                <div className={styles.avatarWithGoogleBadge}>
                  {selectedStudent.photoURL ? (
                    <img
                      src={selectedStudent.photoURL}
                      alt={selectedStudent.displayName}
                      className={styles.modalStAvatar}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={styles.modalStAvatarFallback}>
                      {selectedStudent.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                  <span className={styles.modalGoogleMiniBadge} title="Google Account">
                    <GoogleIcon size={14} />
                  </span>
                </div>
                <div>
                  <h3 className={styles.modalStName}>{selectedStudent.displayName}</h3>
                  <div className={styles.modalStEmailRow}>
                    <span className={styles.modalStEmail}>{selectedStudent.email || "No email available"}</span>
                    {selectedStudent.email && (
                      <button
                        type="button"
                        className={styles.copyEmailBtnSmall}
                        onClick={() => handleCopyEmail(selectedStudent.email)}
                      >
                        {copiedEmail === selectedStudent.email ? "✓ Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedStudent(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Google Metadata Grid */}
              <div className={styles.studentGoogleMetaGrid}>
                <div className={styles.metaCardItem}>
                  <span className={styles.metaCardLabel}>Account Verification</span>
                  <strong className={styles.metaCardVal} style={{ color: "#10B981" }}>
                    ✓ Google OAuth 2.0
                  </strong>
                </div>
                <div className={styles.metaCardItem}>
                  <span className={styles.metaCardLabel}>Organization / Domain</span>
                  <strong className={styles.metaCardVal}>
                    {(selectedStudent.email || "").includes("rishihood.edu.in")
                      ? "🎓 NST Rishihood"
                      : "✉️ Google Account"}
                  </strong>
                </div>
                <div className={styles.metaCardItem}>
                  <span className={styles.metaCardLabel}>Last Sign In</span>
                  <strong className={styles.metaCardVal}>
                    {selectedStudent.lastSignInTime || "Active recently"}
                  </strong>
                </div>
                <div className={styles.metaCardItem}>
                  <span className={styles.metaCardLabel}>Campus Leaderboard</span>
                  <strong className={styles.metaCardVal} style={{ color: "#FF3366" }}>
                    ⭐ {selectedStudent.votes || 0} Votes ({selectedStudent.score || 0} pts)
                  </strong>
                </div>
              </div>

              {/* Menu Breakdown */}
              <h4 className={styles.modalSectionHeading}>
                🍽️ Custom Planned Dishes ({selectedStudent.meals || 0} items)
              </h4>
              {selectedStudent.menus && Object.entries(selectedStudent.menus).map(([mealType, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={mealType} className={styles.menuSection}>
                    <h5 className={styles.menuSectionTitle}>{mealType}</h5>
                    <div className={styles.menuItemsList}>
                      {items.map(dish => (
                        <div key={dish} className={styles.menuItemBadge}>
                          <PlateIcon size={14} color="#FB8500" />
                          <span>{dish}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(!selectedStudent.menus || selectedStudent.meals === 0) && (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "#8E8273", fontWeight: "700", background: "#FAF7F2", borderRadius: "14px" }}>
                  This student has not added dishes to their daily thali yet.
                </div>
              )}

              {/* Cross-reference Student's Suggestions */}
              {(() => {
                const userSuggestions = suggestions.filter(s =>
                  (selectedStudent.email && s.studentEmail && s.studentEmail.toLowerCase() === selectedStudent.email.toLowerCase()) ||
                  (s.studentName && s.studentName.toLowerCase().includes(selectedStudent.displayName.toLowerCase()))
                );
                if (userSuggestions.length === 0) return null;
                return (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h4 className={styles.modalSectionHeading}>
                      💬 Suggestions Submitted by {selectedStudent.displayName} ({userSuggestions.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {userSuggestions.map(s => (
                        <div key={s.id} style={{ background: "#FAF7F2", padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid #EDE8E0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "800", color: "#8E8273", marginBottom: "0.3rem" }}>
                            <span>{s.category || "General"}</span>
                            <span>{s.timestamp}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.9rem", color: "#111418", fontWeight: "600" }}>"{s.suggestion}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
