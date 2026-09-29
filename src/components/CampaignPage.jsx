import React from "react";
import {
  VoteIcon, ShareIcon, TrophyIcon, ForkKnifeIcon, PlateIcon,
  ChatIcon, SparkleIcon
} from "./icons/Icons";
import akshatPhoto from "../assets/hero_nobg.png";
import styles from "./CampaignPage.module.css";

const PROMISES = [
  { Icon: ForkKnifeIcon, color: "#FB8500", title: "Better Menu, Better Variety",      desc: "Improve the menu with more variety and reduce unnecessary repetition with addition of Italian dishes and CHOLE BHATURE." },
  { Icon: TrophyIcon,    color: "#FFAA00", title: "Listen to You",      desc: "Every meal request matters. Direct line to the mess contractor and kitchen staff." },
  { Icon: PlateIcon,     color: "#FF5A5F", title: "Quick Resolution",   desc: "Cold food? Long queues? Strict resolution time for student mess complaints." },
  { Icon: VoteIcon,      color: "#10B981", title: "Improve Food Quality", desc: "Address recurring quality issues and ensure food is prepared and served properly." },
  { Icon: ForkKnifeIcon, color: "#FFAA00", title: "A Menu Students Actually Want", desc: "Take student feedback seriously and work to replace unpopular items like lauki, torai, gatte, etc. with better alternatives." },
  { Icon: PlateIcon,     color: "#FB8500", title: "Reduce the Need to Order Outside", desc: "Improve mess food so students have fewer reasons to spend extra money ordering food from outside" },
];

export default function CampaignPage({ onNavigateToSuggestions }) {
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
  };

  const today = new Date();
  const voteDate = new Date("2026-10-05T00:00:00");
  const daysLeft = Math.max(0, Math.ceil((voteDate - today) / 86400000));

  return (
    <div className={styles.root}>
      {/* Hero section */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.roleBadge}>
            <VoteIcon size={15} color="white" />
            Mess Representative Candidate 2026
          </div>
          <h2 className={styles.heroTitle}>
            Vote <span className={styles.accent}>Akshat</span>
          </h2>
          <p className={styles.heroDesc}>
            A delicious, hygienic mess experience tailored to what students actually want to eat. Your meals, your voice.
          </p>
          <div className={styles.voteDateRow}>
            <div className={styles.voteDateCard}>
              <span className={styles.voteDateNum}>{daysLeft > 0 ? daysLeft : "Today!"}</span>
              <span className={styles.voteDateLbl}>{daysLeft > 0 ? "days to go" : "Vote Now"}</span>
            </div>
            <div className={styles.voteDateInfo}>
              <strong>Offline Voting Day</strong>
              <span>5th October · Cast your ballot in the hostel booth</span>
            </div>
          </div>
        </div>

        {/* Large Prominent Hero Candidate Showcase (Upper Half Body) */}
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
                <span className={styles.candidateBadgeName}>Akshat</span>
                <span className={styles.candidateBadgeTag}>Mess Representative Candidate</span>
              </div>
              <span className={styles.candidateVoteOct5}>Vote 5 Oct ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promises */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>What I Promise You</h3>
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

      {/* How to vote */}
      <div className={styles.howCard}>
        <VoteIcon size={48} color="#10B981" />
        <div className={styles.howText}>
          <h3>How to Cast Your Vote?</h3>
          <p>
            Voting happens <strong>offline on 5th October</strong>. Visit your designated hostel or college mess voting counter and stamp your vote for <strong>Akshat</strong>.
          </p>
          <button className={styles.shareBtn} onClick={handleShare}>
            <ShareIcon size={18} color="#10B981" />
            Share With Hostel Groups
          </button>
        </div>
      </div>

      {/* Suggestion Invitation Card (Routes to dedicated Suggestions Page) */}
      <div className={styles.suggestInviteCard}>
        <div className={styles.suggestInviteLeft}>
          <div className={styles.suggestInviteBadge}>
            <ChatIcon size={15} color="#C2410C" />
            <span>VOICE YOUR OPINION</span>
          </div>
          <h3 className={styles.suggestInviteTitle}>
            Have an idea to improve the mess menu? 💬
          </h3>
          <p className={styles.suggestInviteSub}>
            Whether it's better paneer curries, fresh morning fruit bowls, or extended exam milk timings — submit your suggestion privately to Akshat.
          </p>
        </div>
        <button
          className={styles.suggestInviteBtn}
          onClick={onNavigateToSuggestions}
        >
          <SparkleIcon size={16} color="white" />
          <span>Submit Your Suggestion →</span>
        </button>
      </div>

      <p className={styles.footer}>
        Made by <strong>Akshat</strong> — Your Mess Representative Candidate · Offline Voting on <strong>5th October</strong>
      </p>
    </div>
  );
}
