import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ChatIcon, ShieldIcon, CheckIcon, SparkleIcon, ArrowLeftIcon
} from "./icons/Icons";
import { submitSuggestion } from "../services/dataService";
import akshatPhoto from "../assets/hero_nobg.png";
import styles from "./SuggestionsPage.module.css";

const CATEGORIES = [
  { id: "Menu Variety", label: "Menu Variety", icon: "🍛" },
  { id: "Food Quality", label: "Food Quality", icon: "✨" },
  { id: "Mess Timings", label: "Mess Timings", icon: "⏰" },
  { id: "Hygiene & Service", label: "Hygiene & Cleanliness", icon: "🧼" },
  { id: "Special Day Requests", label: "Special Feasts", icon: "🎉" },
  { id: "General Feedback", label: "General Feedback", icon: "💡" },
];

const QUICK_PROMPTS = [
  "🥭 Daily fresh fruit bowl in breakfast",
  "🧀 Better paneer curries on Friday dinner",
  "☕ Hot milk & tea till 9:45 AM during exams",
  "🥞 Extra crisp dosas on Sunday mornings",
  "🥗 Fresh chilled chhaas / lime shikanji at lunch"
];

export default function SuggestionsPage({ onBackToCampaign }) {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState("Menu Variety");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitSuggestion({
        suggestion: suggestion.trim(),
        category,
        studentName: user?.displayName || "Campus Student",
        studentEmail: user?.email || "",
        studentRoom: ""
      });
      setSubmitted(true);
      setSuggestion("");
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const appendQuickPrompt = (promptText) => {
    if (!suggestion.trim()) {
      setSuggestion(promptText);
    } else {
      setSuggestion((prev) => `${prev.trim()}, and ${promptText.toLowerCase()}`);
    }
  };

  return (
    <div className={styles.root}>
      {/* Top Bar with Back Button */}
      {onBackToCampaign && (
        <button className={styles.backBtn} onClick={onBackToCampaign}>
          <ArrowLeftIcon size={16} color="#5A534A" />
          <span>Back to Campaign</span>
        </button>
      )}

      {/* Main Glass Card */}
      <div className={styles.suggestSection}>
        <div className={styles.suggestCardGlow} />

        <div className={styles.suggestCard}>
          {/* Header Row */}
          <div className={styles.suggestHeaderRow}>
            <div className={styles.suggestTopBadges}>
              <span className={styles.directPill}>
                <ChatIcon size={14} color="#C2410C" />
                DIRECT LINE TO CANDIDATE
              </span>
              <span className={styles.privatePill}>
                <ShieldIcon size={14} color="#059669" />
                100% Confidential to Akshat
              </span>
            </div>

            <div className={styles.avatarThumbnailBadge}>
              <img
                src={akshatPhoto}
                alt="Akshat"
                className={styles.badgeAkshatImg}
                loading="eager"
                decoding="async"
              />
              <span className={styles.badgeOnlineDot} />
            </div>
          </div>

          <div className={styles.suggestIntro}>
            <h2 className={styles.suggestMainTitle}>
              Submit a Suggestion to <span className={styles.titleGradient}>Akshat</span> 💬
            </h2>
            <p className={styles.suggestSubtitle}>
              Have an idea for new dishes, timing changes, or kitchen hygiene? Speak up! Every word is delivered <strong>privately</strong> into Akshat's Mess Committee Dossier.
            </p>
          </div>

          {submitted ? (
            <div className={styles.successCelebration}>
              <div className={styles.successCheckIconWrap}>
                <CheckIcon size={32} color="white" />
              </div>
              <h3 className={styles.successTitle}>Suggestion Privately Delivered! 🎉</h3>
              <p className={styles.successDesc}>
                Thank you for speaking up! Akshat will personally review your feedback in his private Admin Command Center and bring it to the Mess Committee table.
              </p>
              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.anotherSugBtn}
                  onClick={() => setSubmitted(false)}
                >
                  + Submit Another Idea
                </button>
                {onBackToCampaign && (
                  <button
                    type="button"
                    className={styles.returnCampaignBtn}
                    onClick={onBackToCampaign}
                  >
                    View Akshat's Campaign →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form className={styles.suggestFormWrap} onSubmit={handleSuggestionSubmit}>
              {/* Auto-detected Student Identity Badge */}
              <div className={styles.autoIdentityBadge}>
                <div className={styles.autoAvatar}>
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className={styles.autoAvatarImg}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{(user?.displayName || "S").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.autoIdentityText}>
                  <span className={styles.autoIdentityLabel}>Submitting as:</span>
                  <strong className={styles.autoIdentityName}>
                    {user?.displayName || "Campus Student"}
                  </strong>
                </div>
              </div>

              {/* Category selector */}
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.fieldLabel}>Select Topic Area</label>
                  <span className={styles.labelHint}>Choose where your idea belongs</span>
                </div>
                <div className={styles.categoryPillsGrid}>
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`${styles.catPillBtn} ${isSelected ? styles.catPillBtnActive : ""}`}
                      >
                        <span className={styles.catEmoji}>{cat.icon}</span>
                        <span>{cat.label}</span>
                        {isSelected && <span className={styles.catActiveTick}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick inspiration chips */}
              <div className={styles.quickInspirationsBox}>
                <span className={styles.quickPromptTitle}>
                  <SparkleIcon size={14} color="#FB8500" />
                  Quick Ideas to Tap &amp; Add:
                </span>
                <div className={styles.chipsRow}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className={styles.quickPromptChip}
                      onClick={() => appendQuickPrompt(prompt)}
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main suggestion textarea */}
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.fieldLabel}>
                    What would you like to improve or add to the mess? <span className={styles.requiredStar}>*</span>
                  </label>
                  <span className={styles.charCounter}>{suggestion.length} / 500 characters</span>
                </div>
                <textarea
                  className={styles.styledTextarea}
                  placeholder="Tell Akshat: What specific dishes do you miss? Are rotis soft? Any timing or quantity issues? Share your honest thoughts..."
                  value={suggestion}
                  maxLength={500}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {/* Bottom bar with trust badge and submit button */}
              <div className={styles.suggestFooterBar}>
                <div className={styles.trustInfoBox}>
                  <div className={styles.shieldPulseBox}>
                    <ShieldIcon size={20} color="#059669" />
                  </div>
                  <div>
                    <strong className={styles.trustTitle}>Private Submission Guarantee</strong>
                    <span className={styles.trustSub}>
                      Your suggestion is never displayed publicly. Only Akshat can read it.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.sendSuggestionBtn}
                  disabled={isSubmitting || !suggestion.trim()}
                >
                  <span>{isSubmitting ? "Delivering..." : "Submit Privately to Akshat"}</span>
                  <span className={styles.btnArrow}>→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
