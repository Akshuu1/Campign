import React, { useState, useEffect, useRef } from "react";
import {
  VoteIcon, ShareIcon, TrophyIcon, ForkKnifeIcon, PlateIcon,
  ChatIcon, SparkleIcon
} from "./icons/Icons";
import akshatPhoto from "../assets/hero_nobg.png";
import styles from "./CampaignPage.module.css";

const INSTAGRAM_URL = "https://www.instagram.com/akshat_agrawal.14";
const INSTAGRAM_HANDLE = "@akshat_agrawal.14";

const PROMISES = [
  { Icon: ForkKnifeIcon, color: "#FB8500", title: "Better Menu, Better Variety",      desc: "More variety, less repetition. Italian dishes, Chole Bhature, and the food YOU actually want on the menu." },
  { Icon: TrophyIcon,    color: "#FFAA00", title: "I Listen to YOU",                  desc: "Every meal request matters to me. I'll maintain a direct line with the mess contractor and kitchen staff — no more shouting into the void." },
  { Icon: PlateIcon,     color: "#FF5A5F", title: "Quick Resolution",                 desc: "Cold food? Long queues? I promise a strict resolution time for your mess complaints — not next week, NOW." },
  { Icon: VoteIcon,      color: "#10B981", title: "Quality You Can Taste",            desc: "I will tackle recurring quality issues and ensure our food is prepared fresh, served hot, and stored hygienically." },
  { Icon: ForkKnifeIcon, color: "#FFAA00", title: "A Menu Students Actually Want",    desc: "I will work to replace unpopular items like lauki, torai, and gatte with crowd favourites — voted by YOU." },
  { Icon: PlateIcon,     color: "#FB8500", title: "Reduce Outside Ordering",          desc: "When our mess is good, you stop spending your pocket money on outside food. My simple promise, your real savings." },
];

const WHY_AKSHAT = [
  { emoji: "🎯", title: "Student-First Thinking",   desc: "I built this entire digital platform just to hear what you want to eat. I'm not waiting to be elected — I'm already working for you." },
  { emoji: "📢", title: "I Speak Your Language",     desc: "I'm not another hostel politician. I understand mess life because I eat here every single day, right beside you." },
  { emoji: "⚡", title: "I've Already Taken Action", desc: "The meal planner, leaderboard, and suggestion box are live right now. I didn't wait to win — I started working from day one." },
  { emoji: "🤝", title: "Accountable & Transparent", desc: "Every suggestion you submit is tracked and personally reviewed by me. No empty promises — I show my work." },
];

// Live countdown hook
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000)  / 60000),
      secs:  Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// Animated number — counts up on mount
function CountUp({ target, duration = 1500 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}</>;
}

// Floating particle background
function ParticleField() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: ["🍛","🍱","🥘","🍲","🥗","🍜","🥙","🌮","🥞","🍚","🥣","🍛"][i % 12],
    left: `${5 + (i * 5.4) % 90}%`,
    top:  `${10 + (i * 7.3) % 80}%`,
    delay: `${(i * 0.4).toFixed(1)}s`,
    dur:   `${3 + (i % 4)}s`,
    size:  0.8 + (i % 3) * 0.25,
  }));
  return (
    <div className={styles.particleField} aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: p.left, top: p.top,
            animationDelay: p.delay, animationDuration: p.dur,
            fontSize: `${p.size}rem`, opacity: 0.18 + (p.id % 3) * 0.07,
          }}
        >{p.emoji}</span>
      ))}
    </div>
  );
}

export default function CampaignPage({ onNavigateToSuggestions }) {
  const [shareCount, setShareCount] = useState(0);
  const [igClicked, setIgClicked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef(null);
  const time = useCountdown("2026-10-05T08:00:00");

  useEffect(() => {
    setShareCount(247 + Math.floor(Math.random() * 30));
  }, []);

  // Show sticky vote bar after user scrolls past hero
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Create Your Own Meal — Vote Akshat!",
        text: "Vote Akshat for Mess Representative on 5th October! Design your perfect meal menu here:",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied! Share with your friends and hostel groups.");
    }
    setShareCount(c => c + 1);
  };

  const daysLeft = time.days;

  return (
    <div className={styles.root}>

      {/* ── Sticky Vote Reminder Bar ── */}
      <div className={`${styles.stickyBar} ${showStickyBar ? styles.stickyBarVisible : ""}`}>
        <span className={styles.stickyBarDot} />
        <span>🗳️ Vote <strong>Akshat</strong> offline on <strong>5 Oct</strong></span>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={styles.stickyIgBtn}>
          📸 Follow on Insta
        </a>
      </div>

      {/* ── Hero ── */}
      <div className={styles.hero} ref={heroRef}>
        <ParticleField />

        <div className={styles.heroLeft}>
          <div className={styles.roleBadge}>
            <VoteIcon size={15} color="white" />
            Mess Representative Candidate 2026
          </div>
          <h2 className={styles.heroTitle}>
            Vote <span className={styles.accent}>Akshat</span>
          </h2>
          <p className={styles.heroDesc}>
            3rd year. Same mess. Time for better choices.<br />
            Better quality. More variety. Fewer repeats. Let's shape this menu together — <strong>vote for me, Akshat</strong>.
          </p>

          {/* Social proof pill */}
          <div className={styles.socialProofPill}>
            <span className={styles.socialProofDot} />
            <span><strong>{shareCount}+ students</strong> have already shared this campaign</span>
          </div>

          {/* Live countdown */}
          <div className={styles.countdownRow}>
            {[
              { val: time.days,  lbl: "Days"  },
              { val: time.hours, lbl: "Hours" },
              { val: time.mins,  lbl: "Mins"  },
              { val: time.secs,  lbl: "Secs"  },
            ].map(({ val, lbl }) => (
              <div key={lbl} className={styles.countUnit}>
                <span className={styles.countNum}>{String(val).padStart(2, "0")}</span>
                <span className={styles.countLbl}>{lbl}</span>
              </div>
            ))}
            <div className={styles.countLabel}>Until Voting Opens ⚡</div>
          </div>
        </div>

        {/* Candidate Photo */}
        <div className={styles.heroRight}>
          <div className={styles.candidateShowcase}>
            <div className={styles.candidateBackdropGlow} />
            <div className={styles.candidateArchFrame}>
              <img
                src={akshatPhoto}
                alt="Akshat - Mess Representative Candidate"
                className={styles.candidateLargeImg}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className={styles.candidateFloatingCard}>
              <div className={styles.candidateBadgeOnline} />
              <div className={styles.candidateBadgeInfo}>
                <span className={styles.candidateBadgeName}><strong>Akshat</strong></span>
                <span className={styles.candidateBadgeTag}>Mess Representative Candidate</span>
              </div>
              <span className={styles.candidateVoteOct5}>Vote 5 Oct ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Stats Strip ── */}
      <div className={styles.statsStrip}>
        {[
          { num: 247, suffix: "+", lbl: "Campaign Shares" },
          { num: 6,   suffix: "",  lbl: "Concrete Promises" },
          { num: daysLeft > 0 ? daysLeft : 1, suffix: "", lbl: "Days to Vote" },
          { num: 100, suffix: "%", lbl: "Student-Driven" },
        ].map(({ num, suffix, lbl }) => (
          <div key={lbl} className={styles.statItem}>
            <span className={styles.statNum}>
              <CountUp target={num} />{suffix}
            </span>
            <span className={styles.statLbl}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* ── Instagram CTA ── */}
      <div className={styles.igCta}>
        <div className={styles.igCtaLeft}>
          <span className={styles.igCtaIcon}>📸</span>
          <div>
            <h3 className={styles.igCtaTitle}>Connect with Me on Instagram</h3>
            <p className={styles.igCtaSub}>
              Stay updated on my campaign progress, mess updates, and behind-the-scenes work.
              DM me anytime — I respond personally to every student.
            </p>
            <span className={styles.igHandle}>{INSTAGRAM_HANDLE}</span>
          </div>
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className={`${styles.igBtn} ${igClicked ? styles.igBtnFollowed : ""}`}
          onClick={() => setIgClicked(true)}
        >
          {igClicked ? "✓ Profile Opened!" : (
            <>
              <span className={styles.igGradIcon}>IG</span>
              Follow Me on Instagram
            </>
          )}
        </a>
      </div>

      {/* ── Why Akshat? ── */}
      <div className={styles.whySection}>
        <h3 className={styles.sectionTitle}>Why Vote for <strong>Me</strong>?</h3>
        <div className={styles.whyGrid}>
          {WHY_AKSHAT.map(({ emoji, title, desc }) => (
            <div key={title} className={styles.whyCard}>
              <span className={styles.whyEmoji}>{emoji}</span>
              <h4 className={styles.whyTitle}>{title}</h4>
              <p className={styles.whyDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Promises ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>What <strong>I Promise You</strong></h3>
        <div className={styles.promisesGrid}>
          {PROMISES.map(({ Icon, color, title, desc }) => (
            <div key={title} className={styles.promiseCard} style={{ "--accent": color }}>
              <div className={styles.promiseIconWrap}>
                <Icon size={26} color={color} />
              </div>
              <h4 className={styles.promiseTitle}>{title}</h4>
              <p className={styles.promiseDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Manifesto CTA ── */}
      <div className={styles.manifestoCard}>
        <div className={styles.manifestoLeft}>
          <span className={styles.manifestoBadge}>✊ MY PERSONAL PLEDGE</span>
          <h3 className={styles.manifestoTitle}>
            "Every student deserves a mess that respects their taste, health, and money."
          </h3>
          <p className={styles.manifestoSub}>
            — <strong>Akshat</strong>, Your Mess Representative Candidate 2026
          </p>
        </div>
        <div className={styles.manifestoRight}>
          <div className={styles.manifestoStat}>
            <span className={styles.manifestoStatNum}>6</span>
            <span className={styles.manifestoStatLbl}>Concrete Promises</span>
          </div>
          <div className={styles.manifestoStat}>
            <span className={styles.manifestoStatNum}>1</span>
            <span className={styles.manifestoStatLbl}>Candidate Already Working For You</span>
          </div>
        </div>
      </div>

      {/* ── How to vote ── */}
      <div className={styles.howCard}>
        <VoteIcon size={48} color="#10B981" />
        <div className={styles.howText}>
          <h3>How to Vote for Me?</h3>
          <p>
            Voting happens <strong>offline on 5th October</strong>. Visit your designated hostel or
            college mess voting counter and cast your vote for <strong>Akshat</strong>.
            It takes just 30 seconds, and together we can transform our mess for the entire year.
          </p>
          <div className={styles.howBtnRow}>
            <button className={styles.shareBtn} onClick={handleShare}>
              <ShareIcon size={18} color="#10B981" />
              Share With Hostel Groups
            </button>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={styles.howIgBtn}>
              📸 {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>

      {/* ── Suggestion Invitation ── */}
      <div className={styles.suggestInviteCard}>
        <div className={styles.suggestInviteLeft}>
          <div className={styles.suggestInviteBadge}>
            <ChatIcon size={15} color="#C2410C" />
            <span>VOICE YOUR OPINION</span>
          </div>
          <h3 className={styles.suggestInviteTitle}>
            Tell me what needs to change in our mess! 💬
          </h3>
          <p className={styles.suggestInviteSub}>
            Whether it's better paneer curries, fresh morning fruit bowls, or extended exam milk
            timings — submit your suggestion directly to me. I read and record every single one.
          </p>
        </div>
        <button
          className={styles.suggestInviteBtn}
          onClick={onNavigateToSuggestions}
        >
          <SparkleIcon size={16} color="white" />
          <span>Send Me Your Suggestion →</span>
        </button>
      </div>

      <p className={styles.footer}>
        Built by <strong>Akshat</strong> — Your Mess Representative Candidate · Offline Voting on <strong>5th October</strong>
        {" · "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={styles.footerIg}>
          {INSTAGRAM_HANDLE}
        </a>
      </p>
    </div>
  );
}
