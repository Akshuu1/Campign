import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import {
  WatermelonIcon, MangoIcon, AvocadoIcon, PineappleIcon,
  StrawberryIcon, OrangeSliceIcon, FruitBowlIcon,
  ForkKnifeIcon, PlusIcon, CloseIcon, PlateIcon,
  ArrowLeftIcon, ArrowRightIcon,
  ThaliIcon, CheckIcon
} from "./icons/Icons";
import akshatPhoto from "../assets/hero_nobg.png";
import { syncUserMeals } from "../services/dataService";
import styles from "./MealPlanner.module.css";

// ─── Funky Creative Fruits & Meals Configurations (No Studio, Zero Fluff) ────
const MEAL_CONFIGS = {
  breakfast: {
    id: "breakfast",
    label: "Breakfast",
    timing: "7:30 – 9:30 AM",
    PrimaryIcon: MangoIcon,
    SecondaryIcon: OrangeSliceIcon,
    accentColor: "#FB8500",
    accentLight: "#FEF3C7",
    accentBg: "#FFFDF5",
    accentDark: "#B45309",
    heroGradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 55%, #FED7AA 100%)",

    fruitOptions: [
      { emoji: "🍌", name: "Banana" }, { emoji: "🍎", name: "Apple" },
      { emoji: "🍊", name: "Orange" }, { emoji: "🍉", name: "Watermelon" },
      { emoji: "🍈", name: "Papaya" }, { emoji: "🍇", name: "Grapes" }
    ],
    hotSpecials: [
      "Masala Dosa", "Indori Poha", "Aloo Paratha",
      "Idli Vada", "Upma Chutney", "Moong Dal Chilla",
      "Puri Sabzi", "Uttapam", "Chole Bhature"
    ],
    sticker: "🌅 FRESH START",
    nextId: "lunch",
  },
  lunch: {
    id: "lunch",
    label: "Lunch",
    timing: "12:00 – 2:30 PM",
    PrimaryIcon: AvocadoIcon,
    SecondaryIcon: ThaliIcon,
    accentColor: "#10B981",
    accentLight: "#D1FAE5",
    accentBg: "#F4FDF9",
    accentDark: "#065F46",
    heroGradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 55%, #A7F3D0 100%)",

    thaliSections: [
      {
        title: "Curries & Dal",
        items: ["Paneer Butter Masala", "Rajma", "Dal Makhani", "Chole", "Kadai Mushroom", "Mix Veg", "Malai Kofta", "Dum Aloo"]
      },
      {
        title: "Breads & Rice",
        items: ["Ghee Roti", "Garlic Naan", "Jeera Rice", "Basmati Rice", "Tandoori Roti", "Plain Roti", "Veg Fried Rice"]
      },
      {
        title: "Sides",
        items: ["Boondi Raita", "Crisp Papad", "Green Salad", "Mango Pickle", "Onion Salad", "Plain Dahi"]
      }
    ],
    spiceLevels: ["Mild", "Medium 🌶️", "Spicy 🌶️🌶️"],
    sweetSuggestions: [
      "Gulab Jamun", "Rasgulla", "Kheer", "Gajar Halwa", "Jalebi", "Moong Dal Halwa", "Fruit Custard"
    ],
    sticker: "🥑 POWER UP",
    nextId: "snacks",
  },
  snacks: {
    id: "snacks",
    label: "Snacks",
    timing: "4:30 – 6:30 PM",
    PrimaryIcon: WatermelonIcon,
    SecondaryIcon: StrawberryIcon,
    accentColor: "#FF5A5F",
    accentLight: "#FFE4E6",
    accentBg: "#FFF9FA",
    accentDark: "#9F1239",
    heroGradient: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 55%, #FECDD3 100%)",

    snackPicks: [
      { tag: "Hot Bites", items: ["Hot Samosa", "Paneer Pakoda", "Aloo Tikki", "Bread Pakoda", "Vada Pav", "Kachori"] },
      { tag: "Hostel Hits", items: ["Cheese Maggi", "Grilled Sandwich", "Pav Bhaji", "Bhel Puri", "White Sauce Pasta"] },
      { tag: "Baked", items: ["Peri Peri Fries", "Bun Maska", "Hot Jalebi", "Corn Chaat", "Garlic Bread"] }
    ],
    drinkPicks: [
      { emoji: "☕", name: "Cold Coffee" }, { emoji: "🥛", name: "Sweet Lassi" },
      { emoji: "🥛", name: "Salted Lassi" }, { emoji: "🧋", name: "Rose Milk" },
      { emoji: "🍋", name: "Lemon Soda" }, { emoji: "🥤", name: "Mango Shake" },
      { emoji: "🧃", name: "Butter Milk" }, { emoji: "🍵", name: "Masala Chai" },
      { emoji: "🥤", name: "Oreo Shake" }, { emoji: "🍹", name: "Iced Tea" }
    ],
    sticker: "🍉 CHILL BITES",
    nextId: "dinner",
  },
  dinner: {
    id: "dinner",
    label: "Dinner",
    timing: "7:30 – 9:30 PM",
    PrimaryIcon: PineappleIcon,
    SecondaryIcon: FruitBowlIcon,
    accentColor: "#D97706",
    accentLight: "#FEF3C7",
    accentBg: "#FFFDF5",
    accentDark: "#78350F",
    heroGradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 55%, #FDE68A 100%)",

    dinnerSpecials: [
      { type: "Campus Favorites", items: ["Veg Biryani & Salan", "Dal Tadka & Rice", "Kadai Paneer & Phulka", "Matar Paneer & Roti", "Manchurian & Fried Rice"] },
      { type: "Comfort Supper", items: ["Khichdi & Papad", "Paneer Bhurji & Roti", "Veg Pulao & Raita", "Lemon Rice", "Dahi Vada"] },
      { type: "Sweet Dishes", items: ["Gulab Jamun", "Ice Cream", "Moong Dal Halwa", "Rasgulla", "Kheer", "Jalebi", "Rabri", "Brownie"] }
    ],
    sticker: "🍍 NIGHT DELIGHT",
    nextId: "breakfast",
  },
};

const ORDERED_MEALS = ["breakfast", "lunch", "snacks", "dinner"];

export default function MealPlanner() {
  const { user } = useAuth();
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], dinner: [], snacks: [] });
  const [toast, setToast] = useState("");
  const [selectedSpice, setSelectedSpice] = useState("Medium 🌶️");

  const storageKey = `funky_menu_meals_${user?.uid || "guest"}`;

  // Initial load from LocalStorage strictly for current user
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setMeals(JSON.parse(cached));
      } else {
        setMeals({ breakfast: [], lunch: [], dinner: [], snacks: [] });
      }
    } catch (e) {
      setMeals({ breakfast: [], lunch: [], dinner: [], snacks: [] });
    }
  }, [storageKey]);

  // Realtime sync with Firestore
  useEffect(() => {
    if (!user || user.isGuest) return;
    try {
      const ref = doc(db, "users", user.uid);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const remoteMeals = {
            breakfast: d.breakfast || [],
            lunch: d.lunch || [],
            dinner: d.dinner || [],
            snacks: d.snacks || [],
          };
          setMeals(remoteMeals);
          localStorage.setItem(storageKey, JSON.stringify(remoteMeals));
        }
      }, (err) => {
        if (err.code !== "permission-denied") {
          console.warn("Firestore error:", err);
        }
      });
      return unsub;
    } catch (e) {
      console.warn(e);
    }
  }, [user, storageKey]);

  // Full page UI color theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (selectedMealId) {
      const config = MEAL_CONFIGS[selectedMealId];
      root.style.setProperty('--theme-bg', config.accentBg);
      root.style.setProperty('--theme-primary', config.accentColor);
      root.style.setProperty('--theme-light', config.accentLight);
      root.style.setProperty('--theme-dark', config.accentDark);
      root.style.setProperty('--theme-gradient', config.heroGradient);
      document.body.style.backgroundColor = config.accentBg;
    } else {
      root.style.setProperty('--theme-bg', 'var(--bg-main)');
      root.style.setProperty('--theme-primary', 'var(--primary)');
      root.style.setProperty('--theme-light', 'var(--primary-light)');
      root.style.setProperty('--theme-dark', 'var(--text-main)');
      root.style.setProperty('--theme-gradient', 'none');
      document.body.style.backgroundColor = 'var(--bg-main)';
    }
    return () => {
      document.body.style.backgroundColor = "var(--bg-main)";
    };
  }, [selectedMealId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // Immediate Optimistic Adding (Zero-delay)
  const addMealItem = useCallback(async (mealId, dishName) => {
    const clean = dishName.trim();
    if (!clean) return;
    if (meals[mealId]?.includes(clean)) return showToast(`"${clean}" already added!`);

    const updatedCategory = [...(meals[mealId] || []), clean];
    const newMeals = { ...meals, [mealId]: updatedCategory };
    setMeals(newMeals);

    try {
      localStorage.setItem(storageKey, JSON.stringify(newMeals));
    } catch (err) {
      console.warn(err);
    }

    showToast(`✓ Added ${clean}`);

    // Sync meals and user profile to both Firestore and local campus registry
    if (user) {
      syncUserMeals(user, newMeals);
    }
  }, [meals, user, storageKey]);

  const handleCustomAdd = async () => {
    if (!selectedMealId) return;
    await addMealItem(selectedMealId, inputValue);
    setInputValue("");
  };

  // Immediate Optimistic Removal
  const handleRemove = async (mealId, item) => {
    const updated = (meals[mealId] || []).filter((d) => d !== item);
    const newMeals = { ...meals, [mealId]: updated };
    setMeals(newMeals);

    try {
      localStorage.setItem(storageKey, JSON.stringify(newMeals));
    } catch (e) {
      console.warn(e);
    }
    showToast(`Removed "${item}"`);

    if (user) {
      syncUserMeals(user, newMeals);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // DEDICATED MEAL INTERFACE
  // ═════════════════════════════════════════════════════════════════════════════
  if (selectedMealId) {
    const config = MEAL_CONFIGS[selectedMealId];
    const currentList = meals[selectedMealId] || [];
    const nextConfig = MEAL_CONFIGS[config.nextId];

    return (
      <div
        className={styles.dedicatedRoot}
        style={{
          "--accent-color": config.accentColor,
          "--accent-light": config.accentLight,
          "--accent-bg": config.accentBg,
          "--accent-dark": config.accentDark,
          "--hero-gradient": config.heroGradient,
        }}
      >
        {/* Navigation Bar */}
        <div className={styles.topNav}>
          <button
            className={styles.backBtn}
            onClick={() => setSelectedMealId(null)}
          >
            <ArrowLeftIcon size={18} />
            <span>All Meals</span>
          </button>

          {/* Quick switcher */}
          <div className={styles.switcherTabs}>
            {ORDERED_MEALS.map((id) => {
              const item = MEAL_CONFIGS[id];
              const isCurrent = id === selectedMealId;
              const count = (meals[id] || []).length;
              return (
                <button
                  key={id}
                  className={`${styles.switcherTab} ${isCurrent ? styles.switcherTabActive : ""}`}
                  style={{ "--tab-color": item.accentColor }}
                  onClick={() => {
                    setSelectedMealId(id);
                    setInputValue("");
                  }}
                >
                  <item.PrimaryIcon size={20} />
                  <span>{item.label}</span>
                  {count > 0 && <span className={styles.tabBadge}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Banner */}
        <div className={styles.mealDedicatedHero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIconWrapper}>
              <config.PrimaryIcon size={64} />
            </div>
            <div>
              <div className={styles.heroMetaRow}>
                <span className={styles.funkyStickerBadge}>{config.sticker}</span>
                <span className={styles.timingBadge}>{config.timing}</span>
              </div>
              <h1 className={styles.dedicatedTitle}>{config.label}</h1>
            </div>
          </div>
          <div className={styles.heroRightBadge}>
            <span className={styles.plateCountNum}>{currentList.length}</span>
            <span className={styles.plateCountLbl}>on plate</span>
          </div>
        </div>


        {/* ── BREAKFAST ── */}
        {selectedMealId === "breakfast" && (
          <>
            {/* Fruits */}
            <div className={styles.uniqueMealModule}>
              <div className={styles.moduleHeader}>
                <span style={{ fontSize: 22 }}>🍎</span>
                <h3 className={styles.moduleTitle}>Pick Your Fruits</h3>
              </div>
              <div className={styles.fruitEmojiGrid}>
                {config.fruitOptions.map((f) => {
                  const isAdded = currentList.includes(f.name);
                  return (
                    <button
                      key={f.name}
                      className={`${styles.fruitEmojiBtn} ${isAdded ? styles.fruitEmojiBtnAdded : ""}`}
                      onClick={() => addMealItem("breakfast", f.name)}
                      disabled={isAdded}
                    >
                      <span className={styles.fruitEmoji}>{f.emoji}</span>
                      <span className={styles.fruitEmojiName}>{f.name}</span>
                      {isAdded && <CheckIcon size={12} color="var(--theme-primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hot Specials */}
            <div className={styles.uniqueMealModule}>
              <div className={styles.moduleHeader}>
                <span style={{ fontSize: 22 }}>🍳</span>
                <h3 className={styles.moduleTitle}>Hot Specials</h3>
              </div>
              <div className={styles.suggestionChips}>
                {config.hotSpecials.map((dish) => {
                  const isAdded = currentList.includes(dish);
                  return (
                    <button
                      key={dish}
                      disabled={isAdded}
                      className={`${styles.suggestionChip} ${isAdded ? styles.chipAdded : ""}`}
                      onClick={() => addMealItem("breakfast", dish)}
                    >
                      <span>{dish}</span>
                      {isAdded ? <CheckIcon size={13} color="var(--theme-primary)" /> : <span className={styles.addPlus}>+</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── LUNCH ── */}
        {selectedMealId === "lunch" && (
          <>
            <div className={styles.uniqueMealModule}>
              <div className={styles.moduleHeader}>
                <ThaliIcon size={26} color="var(--theme-primary)" />
                <h3 className={styles.moduleTitle}>Thali Selections</h3>
                <div className={styles.spicePillGroup}>
                  {config.spiceLevels.map((s) => (
                    <button
                      key={s}
                      className={`${styles.spicePill} ${selectedSpice === s ? styles.spiceActive : ""}`}
                      onClick={() => setSelectedSpice(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.thaliGrid}>
                {config.thaliSections.map((sec) => (
                  <div key={sec.title} className={styles.thaliCol}>
                    <h4 className={styles.thaliColTitle}>{sec.title}</h4>
                    <div className={styles.thaliItemsWrap}>
                      {sec.items.map((item) => {
                        const isAdded = currentList.includes(item);
                        return (
                          <button
                            key={item}
                            className={`${styles.thaliItemBtn} ${isAdded ? styles.chipAdded : ""}`}
                            onClick={() => addMealItem("lunch", item)}
                            disabled={isAdded}
                          >
                            <span>{item}</span>
                            {isAdded ? <CheckIcon size={13} color="var(--theme-primary)" /> : <span className={styles.funkyAddPlus}>+</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sweet Ending */}
            <div className={styles.sweetModule}>
              <div className={styles.moduleHeader}>
                <span style={{ fontSize: 22 }}>🍮</span>
                <h3 className={styles.moduleTitle}>Sweet Ending</h3>
              </div>
              <div className={styles.suggestionChips}>
                {config.sweetSuggestions.map((sweet) => {
                  const isAdded = currentList.includes(sweet);
                  return (
                    <button
                      key={sweet}
                      disabled={isAdded}
                      className={`${styles.sweetChip} ${isAdded ? styles.chipAdded : ""}`}
                      onClick={() => addMealItem("lunch", sweet)}
                    >
                      <span>{sweet}</span>
                      {isAdded ? <CheckIcon size={13} color="var(--theme-primary)" /> : <span className={styles.addPlus}>+</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── SNACKS ── */}
        {selectedMealId === "snacks" && (
          <>
            <div className={styles.uniqueMealModule}>
              <div className={styles.moduleHeader}>
                <StrawberryIcon size={26} />
                <h3 className={styles.moduleTitle}>Canteen Munchies</h3>
              </div>
              <div className={styles.snacksSectionList}>
                {config.snackPicks.map((group) => (
                  <div key={group.tag} className={styles.snackGroup}>
                    <span className={styles.snackGroupTag}>{group.tag}</span>
                    <div className={styles.suggestionChips}>
                      {group.items.map((snk) => {
                        const isAdded = currentList.includes(snk);
                        return (
                          <button
                            key={snk}
                            className={`${styles.suggestionChip} ${isAdded ? styles.chipAdded : ""}`}
                            onClick={() => addMealItem("snacks", snk)}
                            disabled={isAdded}
                          >
                            <span>{snk}</span>
                            {isAdded ? <CheckIcon size={14} color="var(--theme-primary)" /> : <span className={styles.addPlus}>+</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drinks */}
            <div className={styles.sweetModule}>
              <div className={styles.moduleHeader}>
                <span style={{ fontSize: 22 }}>🥤</span>
                <h3 className={styles.moduleTitle}>Drinks & Refreshments</h3>
              </div>
              <div className={styles.fruitEmojiGrid}>
                {config.drinkPicks.map((d) => {
                  const isAdded = currentList.includes(d.name);
                  return (
                    <button
                      key={d.name}
                      className={`${styles.fruitEmojiBtn} ${isAdded ? styles.fruitEmojiBtnAdded : ""}`}
                      onClick={() => addMealItem("snacks", d.name)}
                      disabled={isAdded}
                    >
                      <span className={styles.fruitEmoji}>{d.emoji}</span>
                      <span className={styles.fruitEmojiName}>{d.name}</span>
                      {isAdded && <CheckIcon size={12} color="var(--theme-primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── DINNER ── */}
        {selectedMealId === "dinner" && (
          <>
            {config.dinnerSpecials.filter(c => c.type !== "Sweet Dishes").map((cat) => (
              <div key={cat.type} className={styles.uniqueMealModule}>
                <div className={styles.moduleHeader}>
                  <span style={{ fontSize: 20 }}>{cat.type === "Campus Favorites" ? "⭐" : "🌙"}</span>
                  <h3 className={styles.moduleTitle}>{cat.type}</h3>
                </div>
                <div className={styles.suggestionChips}>
                  {cat.items.map((dish) => {
                    const isAdded = currentList.includes(dish);
                    return (
                      <button
                        key={dish}
                        disabled={isAdded}
                        className={`${styles.suggestionChip} ${isAdded ? styles.chipAdded : ""}`}
                        onClick={() => addMealItem("dinner", dish)}
                      >
                        <span>{dish}</span>
                        {isAdded ? <CheckIcon size={13} color="var(--theme-primary)" /> : <span className={styles.addPlus}>+</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Sweet Dishes */}
            <div className={styles.sweetModule}>
              <div className={styles.moduleHeader}>
                <span style={{ fontSize: 22 }}>🍨</span>
                <h3 className={styles.moduleTitle}>Sweet Dishes</h3>
              </div>
              <div className={styles.fruitEmojiGrid}>
                {(config.dinnerSpecials.find(c => c.type === "Sweet Dishes")?.items || []).map((sweet) => {
                  const isAdded = currentList.includes(sweet);
                  const icons = { "Gulab Jamun": "🟤", "Ice Cream": "🍦", "Moong Dal Halwa": "🟡", "Rasgulla": "⚪", "Kheer": "🥣", "Jalebi": "🌀", "Rabri": "🥛", "Brownie": "🟫" };
                  return (
                    <button
                      key={sweet}
                      className={`${styles.fruitEmojiBtn} ${isAdded ? styles.fruitEmojiBtnAdded : ""}`}
                      onClick={() => addMealItem("dinner", sweet)}
                      disabled={isAdded}
                    >
                      <span className={styles.fruitEmoji}>{icons[sweet] || "🍬"}</span>
                      <span className={styles.fruitEmojiName}>{sweet}</span>
                      {isAdded && <CheckIcon size={12} color="var(--theme-primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Custom Add Input */}
        <div className={styles.studioCard}>
          <div className={styles.sectionHeading}>
            <PlusIcon size={20} color="var(--theme-primary)" />
            <span>Add to {config.label}</span>
          </div>
          <div className={styles.addRow}>
            <input
              type="text"
              className={styles.mealInput}
              placeholder={`Type any dish or fruit…`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
              maxLength={60}
            />
            <button className={styles.addBtn} onClick={handleCustomAdd}>
              <PlusIcon size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Selected Dishes Grid */}
        <div className={styles.dishesSection}>
          <div className={styles.dishesHeader}>
            <div className={styles.sectionHeading}>
              <ForkKnifeIcon size={20} color="var(--theme-primary)" />
              <span>Plate ({currentList.length})</span>
            </div>
          </div>

          {currentList.length === 0 ? (
            <div className={styles.emptyState}>
              <PlateIcon size={48} color="var(--theme-primary)" />
              <h3>Plate is empty</h3>
              <p>Tap any item above or type a dish to add.</p>
            </div>
          ) : (
            <div className={styles.dishGrid}>
              {currentList.map((dish, index) => (
                <div key={dish} className={styles.dishCard}>
                  <div className={styles.dishNum}>{index + 1}</div>
                  <div className={styles.dishContent}>
                    <span className={styles.dishName}>{dish}</span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(selectedMealId, dish)}
                    title={`Remove ${dish}`}
                  >
                    <CloseIcon size={14} color="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className={styles.studioFooter}>
          <button
            className={styles.footerBack}
            onClick={() => setSelectedMealId(null)}
          >
            <ArrowLeftIcon size={16} />
            Back
          </button>
          <button
            className={styles.nextMealBtn}
            onClick={() => {
              setSelectedMealId(config.nextId);
              setInputValue("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span>Next: {nextConfig.label}</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>

        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // MAIN SELECTION HUB (CLEAN, FUNKY, ENGAGING)
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>Create Your Own Meal</h2>
          <div className={styles.akshatTag}>
            <img src={akshatPhoto} alt="Akshat" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
            <span>Mess Rep: <strong>Akshat</strong> · Voting 5 Oct</span>
          </div>
        </div>
      </div>

      {/* 4 DISTINCT MEAL CARDS */}
      <div className={styles.hubGrid}>
        {ORDERED_MEALS.map((id) => {
          const cat = MEAL_CONFIGS[id];
          const items = meals[id] || [];
          return (
            <div
              key={id}
              className={styles.hubCard}
              style={{
                "--cat-color": cat.accentColor,
                "--cat-light": cat.accentLight,
                "--cat-bg": cat.accentBg,
                "--cat-dark": cat.accentDark,
              }}
              onClick={() => setSelectedMealId(id)}
            >
              <div className={styles.hubCardHeader}>
                <div className={styles.hubIconBox}>
                  <cat.PrimaryIcon size={56} />
                </div>
                <div className={styles.hubBadgeCol}>
                  <span className={styles.hubFruitBadge}>{cat.sticker}</span>
                  <span className={styles.hubTiming}>{cat.timing}</span>
                </div>
              </div>

              <div className={styles.hubCardBody}>
                <h3 className={styles.hubCardTitle}>{cat.label}</h3>
              </div>

              {/* Items chips */}
              <div className={styles.hubPreviewBox}>
                {items.length > 0 ? (
                  <div className={styles.hubChipRow}>
                    {items.slice(0, 4).map((d) => (
                      <span key={d} className={styles.hubMiniChip}>{d}</span>
                    ))}
                    {items.length > 4 && (
                      <span className={styles.hubMiniChipMore}>+{items.length - 4}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.emptyPreviewHint}>+ Tap to add dishes</span>
                )}
              </div>

              {/* Action Button */}
              <button className={styles.hubOpenBtn}>
                <span>Add your Fav {cat.label}</span>
                <span className={styles.hubCountBubble}>{items.length}</span>
              </button>
            </div>
          );
        })}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
