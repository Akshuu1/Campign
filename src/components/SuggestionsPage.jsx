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
          {/* Clean modern header */}
          <div className={styles.cleanHeader}>
            <div className={styles.headerLeftInfo}>
              <h2 className={styles.suggestMainTitle}>
                Suggestions for the Mess
              </h2>
              <p className={styles.suggestSubtitle}>
                Tell <strong>Akshat</strong> what dishes or improvements you want. Your feedback goes directly to him.
              </p>
            </div>
            <div className={styles.candidateMiniBadge}>
              <img
                src={akshatPhoto}
                alt="Akshat"
                className={styles.badgeAkshatImg}
              />
              <span className={styles.badgeOnlineDot} />
            </div>
          </div>

          {submitted ? (
            <div className={styles.successCelebration}>
              <div className={styles.successCheckIconWrap}>
                <CheckIcon size={28} color="white" />
              </div>
              <h3 className={styles.successTitle}>Thank you! Suggestion Received</h3>
              <p className={styles.successDesc}>
                Your feedback has been sent directly to Akshat to present to the Mess Committee.
              </p>
              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.anotherSugBtn}
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another
                </button>
                {onBackToCampaign && (
                  <button
                    type="button"
                    className={styles.returnCampaignBtn}
                    onClick={onBackToCampaign}
                  >
                    Back to Campaign →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form className={styles.suggestFormWrap} onSubmit={handleSuggestionSubmit}>
              {/* Category Dropdown & Quick Ideas Selector */}
              <div className={styles.categorySelectRow}>
                <label className={styles.fieldLabel} htmlFor="category-select">Topic</label>
                <div className={styles.categoryPillsWrap}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`${styles.catPillBtn} ${category === cat.id ? styles.catPillBtnActive : ""}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main suggestion textarea */}
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.fieldLabel}>
                    Your message
                  </label>
                  <span className={styles.charCounter}>{suggestion.length}/500</span>
                </div>
                <textarea
                  className={styles.styledTextarea}
                  placeholder="e.g. Better paneer on Fridays, crispier dosas, fresh fruits in breakfast, milk timings..."
                  value={suggestion}
                  maxLength={500}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Quick inspiration chips */}
              <div className={styles.quickChipsInline}>
                <span className={styles.quickPromptLabel}>Quick add:</span>
                {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
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

              {/* Bottom bar */}
              <div className={styles.suggestFooterBar}>
                <span className={styles.trustSub}>
                  🔒 Private &amp; direct to Akshat
                </span>

                <button
                  type="submit"
                  className={styles.sendSuggestionBtn}
                  disabled={isSubmitting || !suggestion.trim()}
                >
                  <span>{isSubmitting ? "Sending..." : "Send Suggestion"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
