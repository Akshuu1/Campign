import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  TrophyIcon, PlateIcon, VoteIcon, StarIcon, SearchIcon, SparkleIcon
} from "./icons/Icons";
import { fetchLeaderboardEntries, castVoteForStudent } from "../services/dataService";
import styles from "./Leaderboard.module.css";

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [votedUids, setVotedUids] = useState(() => {
    try {
      const voterKey = user?.uid || "guest";
      const rawList = localStorage.getItem(`voted_list_${voterKey}`);
      if (rawList) return JSON.parse(rawList);
      const single = localStorage.getItem(`voted_${voterKey}`);
      return single ? [single] : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "topVoted" | "mostMeals"

  const loadLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchLeaderboardEntries(user);
      setEntries(data);
    } catch (err) {
      console.warn("Leaderboard load err:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Periodic background live sync every 10s so dishes and votes stay updated
  useEffect(() => {
    const timer = setInterval(() => {
      loadLeaderboard(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [loadLeaderboard]);

  useEffect(() => {
    const voterKey = user?.uid || "guest";
    try {
      const rawList = localStorage.getItem(`voted_list_${voterKey}`);
      if (rawList) {
        setVotedUids(JSON.parse(rawList));
      } else {
        const single = localStorage.getItem(`voted_${voterKey}`);
        setVotedUids(single ? [single] : []);
      }
    } catch {
      setVotedUids([]);
    }
  }, [user]);

  const handleVote = async (targetUid) => {
    if (votedUids.includes(targetUid)) return;
    const voterKey = user?.uid || "guest";
    const nextVoted = [...votedUids, targetUid];
    setVotedUids(nextVoted);
    try {
      localStorage.setItem(`voted_list_${voterKey}`, JSON.stringify(nextVoted));
      localStorage.setItem(`voted_${voterKey}`, targetUid);
    } catch (e) {}

    await castVoteForStudent(targetUid, voterKey);
    // Optimistically update entry list
    setEntries(prev => prev.map(item => {
      if (item.uid === targetUid) {
        const nextVotes = (item.votes || 0) + 1;
        return { ...item, votes: nextVotes, score: (item.meals * 2) + nextVotes };
      }
      return item;
    }).sort((a, b) => b.score - a.score));
  };

  const MEDAL_COLORS = ["#F9B84A", "#9EA3B0", "#CD7F50"];
  const [visibleLimit, setVisibleLimit] = useState(35);

  // Memoized search and sorting to prevent performance lag under 3000 users
  const filteredEntries = React.useMemo(() => {
    return entries
      .filter(entry => {
        if (!searchQuery) return true;
        return entry.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (filterType === "topVoted") return b.votes - a.votes;
        if (filterType === "mostMeals") return b.meals - a.meals;
        return b.score - a.score;
      });
  }, [entries, searchQuery, filterType]);

  const displayedEntries = React.useMemo(() => {
    return filteredEntries.slice(0, visibleLimit);
  }, [filteredEntries, visibleLimit]);

  return (
    <div className={styles.root}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIconWrap}>
          <TrophyIcon size={56} color="#FB8500" />
        </div>
        <div className={styles.heroText}>
          <div className={styles.heroBadge}>
            <SparkleIcon size={14} color="#FB8500" />
            <span>CAMPUS FOODIE RANKINGS</span>
          </div>
          <h2 className={styles.heroTitle}>Meal Champions</h2>
          <p className={styles.heroSub}>
            Ranked by <strong>Meals Added × 2 + Votes Received</strong> · Click any student to view their custom menu!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchIcon size={18} color="#8E8273" />
          <input
            type="text"
            placeholder="Search students or hostel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterBtn} ${filterType === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Overall
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === "topVoted" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilterType("topVoted")}
          >
            ⭐ Most Voted
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === "mostMeals" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilterType("mostMeals")}
          >
            🍽️ Most Meals
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Syncing campus leaderboard…</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No champions found matching "{searchQuery}".</p>
          <button onClick={() => setSearchQuery("")} className={styles.resetBtn}>Clear Search</button>
        </div>
      ) : (
        <div className={styles.table}>
          {/* Header */}
          <div className={styles.headerRow}>
            <span className={styles.colRank}>#</span>
            <span className={styles.colName}>Student Foodie</span>
            <span className={styles.colMeals}>Dishes</span>
            <span className={styles.colVotes}>Votes</span>
            <span className={styles.colAction}>Vote</span>
          </div>

          {displayedEntries.map((entry, i) => (
            <div
              key={entry.uid}
              className={`${styles.row} ${entry.uid === user?.uid ? styles.myRow : ""}`}
              onClick={() => setSelectedUser(entry)}
              title="Click to view full custom menu"
            >
              <span className={styles.colRank}>
                {i < 3 ? (
                  <span className={styles.medalBadge} style={{ background: `${MEDAL_COLORS[i]}22`, color: MEDAL_COLORS[i], borderColor: MEDAL_COLORS[i] }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className={styles.rankNum}>{i + 1}</span>
                )}
              </span>

              <span className={styles.colName}>
                {entry.photoURL ? (
                  <img
                    src={entry.photoURL}
                    alt={entry.displayName}
                    className={styles.avatar}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.nameBlock}>
                  <span className={styles.nameText}>
                    {entry.displayName}
                    {entry.uid === user?.uid && <span className={styles.youTag}>You</span>}
                  </span>
                  <span className={styles.viewMenuHint}>Tap to view menu →</span>
                </div>
              </span>

              <span className={styles.colMeals}>
                <span className={styles.mealPill}>
                  <PlateIcon size={14} color="#FB8500" />
                  {entry.meals}
                </span>
              </span>

              <span className={styles.colVotes}>
                <span className={styles.votePill}>
                  <StarIcon size={13} filled color="#FF3366" />
                  {entry.votes}
                </span>
              </span>

              <span className={styles.colAction}>
                {entry.uid !== user?.uid && (
                  <button
                    className={`${styles.voteBtn} ${votedUids.includes(entry.uid) ? styles.votedBtn : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleVote(entry.uid); }}
                    disabled={votedUids.includes(entry.uid)}
                    title={votedUids.includes(entry.uid) ? "You voted for this student" : "Vote for this meal creator"}
                  >
                    {votedUids.includes(entry.uid) ? (
                      <><StarIcon size={13} filled color="#10B981" /> Supported</>
                    ) : (
                      <><VoteIcon size={13} color="white" /> Vote</>
                    )}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {filteredEntries.length > visibleLimit && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            onClick={() => setVisibleLimit(prev => prev + 35)}
            className={styles.resetBtn}
            style={{ padding: "0.8rem 1.8rem", fontSize: "0.95rem" }}
          >
            Load More Champions ({filteredEntries.length - visibleLimit} more) ↓
          </button>
        </div>
      )}

      {/* CTA */}
      <div className={styles.ctaCard}>
        <div className={styles.ctaIconBox}>
          <VoteIcon size={38} color="#10B981" />
        </div>
        <div className={styles.ctaText}>
          <strong>Support Akshat for Mess Representative</strong>
          <p>Every menu item you add helps design the official mess calendar. Cast your vote in the voting booth on <strong>5th October</strong>.</p>
        </div>
      </div>

      {/* User Menu Modal */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleBlock}>
                <h3>{selectedUser.displayName}'s Menu</h3>
                <span className={styles.modalSubTitle}>
                  {selectedUser.meals} custom dishes selected · {selectedUser.votes} votes
                </span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {selectedUser.menus && Object.entries(selectedUser.menus).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={category} className={styles.menuCategory}>
                    <h4 className={styles.categoryTitle}>{category}</h4>
                    <div className={styles.menuItems}>
                      {items.map(item => (
                        <div key={item} className={styles.menuItem}>
                          <span className={styles.categoryTag}>{category}</span>
                          <span className={styles.itemName}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(!selectedUser.menus || selectedUser.meals === 0) && (
                <div className={styles.emptyMenu}>
                  🍽️ This student hasn't picked their dishes yet. Head to "My Meals" to create yours!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
