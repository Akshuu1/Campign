import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "framer-motion";
import styles from "./SwipeVoting.module.css";
import { CheckIcon, CloseIcon } from "./icons/Icons";

const DISHES = [
  // ── SOUTH INDIAN ──
  { name: "Masala Dosa", type: "Breakfast", emoji: "🫔", color: "#D35400" },
  { name: "Idli Sambar", type: "Breakfast", emoji: "🍚", color: "#FF9900" },
  { name: "Medu Vada", type: "Breakfast", emoji: "🍩", color: "#E67E22" },
  { name: "Rava Dosa", type: "Breakfast", emoji: "🫔", color: "#D35400" },
  { name: "Onion Uttapam", type: "Breakfast", emoji: "🥞", color: "#F39C12" },
  { name: "Dosa", type: "Breakfast", emoji: "🫔", color: "#C0392B" },
  { name: "Ven Pongal", type: "Breakfast", emoji: "🍲", color: "#F1C40F" },
  { name: "Lemon Rice", type: "Lunch", emoji: "🍋", color: "#F1C40F" },
  { name: "Tamarind Rice", type: "Lunch", emoji: "🍚", color: "#8E44AD" },
  { name: "Curd Rice (Thayir Sadam)", type: "Lunch", emoji: "🥣", color: "#BDC3C7" },
  { name: "Upma", type: "Breakfast", emoji: "🥣", color: "#F1C40F" },
  { name: "Gobi 65", type: "Snack", emoji: "🥦", color: "#E74C3C" },

  // ── NORTH INDIAN / PUNJABI ──
  { name: "Paneer Butter Masala", type: "Lunch", emoji: "🥘", color: "#FF3366" },
  { name: "Dal Makhani", type: "Dinner", emoji: "🍲", color: "#8E44AD" },
  { name: "Shahi Paneer", type: "Dinner", emoji: "🥘", color: "#F39C12" },
  { name: "Palak Paneer", type: "Lunch", emoji: "🥬", color: "#27AE60" },
  { name: "Matar Paneer", type: "Lunch", emoji: "🥘", color: "#FF9900" },
  { name: "Aloo Gobi", type: "Lunch", emoji: "🥔", color: "#F1C40F" },
  { name: "Bhindi Masala", type: "Lunch", emoji: "🥗", color: "#2ECC71" },
  { name: "Baingan Bharta", type: "Lunch", emoji: "🍆", color: "#8E44AD" },
  { name: "Sarson Ka Saag", type: "Dinner", emoji: "🥬", color: "#27AE60" },
  { name: "Makki Ki Roti", type: "Dinner", emoji: "🫓", color: "#F1C40F" },
  { name: "Kadhi Pakora", type: "Lunch", emoji: "🥣", color: "#F1C40F" },
  { name: "Rogan Josh", type: "Dinner", emoji: "🥘", color: "#C0392B" },
  { name: "Lachha Paratha", type: "Dinner", emoji: "🫓", color: "#D35400" },
  { name: "Jeera Rice", type: "Lunch", emoji: "🍚", color: "#BDC3C7" },
  { name: "Veg Biryani", type: "Dinner", emoji: "🍲", color: "#27AE60" },

  // ── EVERYDAY MESS FOOD (THE GOOD, BAD & UGLY) ──
  { name: "Lauki ki Sabzi", type: "Dinner", emoji: "🥒", color: "#00CC99" },
  { name: "Tori / Ridge Gourd", type: "Lunch", emoji: "🤢", color: "#4CAF82" },
  { name: "Karela Sabzi", type: "Lunch", emoji: "🥒", color: "#27AE60" },
  { name: "Tinda Masala", type: "Dinner", emoji: "🤢", color: "#1ABC9C" },
  { name: "Kaddu (Pumpkin)", type: "Lunch", emoji: "🎃", color: "#E67E22" },
  { name: "Soyabean chunks", type: "Lunch", emoji: "🍲", color: "#8E44AD" },
  { name: "Dal Tadka", type: "Lunch", emoji: "🥣", color: "#F1C40F" },
  { name: "Mix Veg", type: "Lunch", emoji: "🥗", color: "#2ECC71" },
  { name: "Chana Masala", type: "Dinner", emoji: "🍲", color: "#D35400" },
  { name: "Aloo Matar", type: "Lunch", emoji: "🥔", color: "#F39C12" },
  { name: "Cabbage Sabzi", type: "Lunch", emoji: "🥬", color: "#2ECC71" },
  { name: "Plain Roti", type: "Lunch", emoji: "🫓", color: "#BDC3C7" },
  { name: "Boondi Raita", type: "Lunch", emoji: "🥣", color: "#F1C40F" },
  { name: "Mango Pickle", type: "Side", emoji: "🥭", color: "#E67E22" },
  { name: "Papad", type: "Side", emoji: "🫓", color: "#F1C40F" },

  // ── STREET FOOD & SNACKS ──
  { name: "Pani Puri / Golgappa", type: "Snack", emoji: "🧆", color: "#27AE60" },
  { name: "Bhel Puri", type: "Snack", emoji: "🥗", color: "#F1C40F" },
  { name: "Sev Puri", type: "Snack", emoji: "🌮", color: "#E67E22" },
  { name: "Vada Pav", type: "Snack", emoji: "🍔", color: "#D35400" },
  { name: "Misal Pav", type: "Breakfast", emoji: "🥣", color: "#C0392B" },
  { name: "Pav Bhaji", type: "Snack", emoji: "🍔", color: "#E74C3C" },
  { name: "Samosa", type: "Snack", emoji: "🥟", color: "#D35400" },
  { name: "Kachori", type: "Snack", emoji: "🧆", color: "#F39C12" },
  { name: "Aloo Tikki Chaat", type: "Snack", emoji: "🥔", color: "#E67E22" },
  { name: "Papdi Chaat", type: "Snack", emoji: "🥗", color: "#F1C40F" },
  { name: "Veg Momos", type: "Snack", emoji: "🥟", color: "#E74C3C" },
  { name: "Spring Rolls", type: "Snack", emoji: "🌯", color: "#27AE60" },
  { name: "Veg Manchurian", type: "Snack", emoji: "🍲", color: "#C0392B" },
  { name: "Chilli Paneer", type: "Snack", emoji: "🥘", color: "#E74C3C" },
  { name: "Indori Poha", type: "Breakfast", emoji: "🥗", color: "#F1C40F" },
  { name: "Dhokla", type: "Breakfast", emoji: "🧽", color: "#F1C40F" },
  { name: "Khandvi", type: "Snack", emoji: "🍥", color: "#F1C40F" },
  { name: "Cheese Maggi", type: "Snack", emoji: "🍜", color: "#F39C12" },
  { name: "Bread Pakoda", type: "Snack", emoji: "🥪", color: "#D35400" },
  { name: "Mirchi Bada", type: "Snack", emoji: "🌶️", color: "#C0392B" },

  // ── DESSERTS & SWEETS ──
  { name: "Gulab Jamun", type: "Dessert", emoji: "🍮", color: "#F9B84A" },
  { name: "Rasgulla", type: "Dessert", emoji: "⚪", color: "#BDC3C7" },
  { name: "Gajar Ka Halwa", type: "Dessert", emoji: "🥕", color: "#E67E22" },
  { name: "Moong Dal Halwa", type: "Dessert", emoji: "🥣", color: "#F1C40F" },
  { name: "Rasmalai", type: "Dessert", emoji: "🍨", color: "#F1C40F" },
  { name: "Kulfi", type: "Dessert", emoji: "🍧", color: "#8E44AD" },
  { name: "Falooda", type: "Dessert", emoji: "🥤", color: "#FF3366" },
  { name: "Mysore Pak", type: "Dessert", emoji: "🧽", color: "#F39C12" },
  { name: "Payasam", type: "Dessert", emoji: "🥣", color: "#E67E22" },
  { name: "Sandesh", type: "Dessert", emoji: "⚪", color: "#BDC3C7" },
  { name: "Cham Cham", type: "Dessert", emoji: "🍬", color: "#E67E22" },
  { name: "Kaju Katli", type: "Dessert", emoji: "💠", color: "#BDC3C7" },
  { name: "Motichoor Ladoo", type: "Dessert", emoji: "🟠", color: "#E67E22" },
  { name: "Jalebi", type: "Dessert", emoji: "🥨", color: "#F39C12" },
  { name: "Soan Papdi", type: "Dessert", emoji: "🧊", color: "#F1C40F" },
];

const generateRandomDish = () => {
  const randomItem = DISHES[Math.floor(Math.random() * DISHES.length)];
  return { ...randomItem, id: Date.now().toString() + Math.random().toString(36).substring(2) };
};

const INITIAL_CARDS = Array.from({ length: 5 }).map(() => generateRandomDish());

function Card({ dish, removeCard, zIndex, externalSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacityLike = useTransform(x, [50, 150], [0, 1]);
  const opacityNope = useTransform(x, [-50, -150], [0, 1]);
  const [exitX, setExitX] = useState(-300);

  useEffect(() => {
    if (externalSwipe && externalSwipe.id === dish.id) {
      const targetX = externalSwipe.direction === 'right' ? 300 : -300;
      setExitX(targetX);
      animate(x, targetX, { 
        duration: 0.3, 
        onComplete: () => {
          removeCard(dish.id, externalSwipe.direction);
        }
      });
    }
  }, [externalSwipe, dish.id, removeCard, x]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      setExitX(300);
      removeCard(dish.id, "right");
    } else if (info.offset.x < -100) {
      setExitX(-300);
      removeCard(dish.id, "left");
    }
  };

  return (
    <motion.div
      className={styles.card}
      style={{ x, rotate, zIndex }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div className={`${styles.stamp} ${styles.stampLike}`} style={{ opacity: opacityLike }}>
        VOTE!
      </motion.div>
      <motion.div className={`${styles.stamp} ${styles.stampNope}`} style={{ opacity: opacityNope }}>
        BAN
      </motion.div>

      <div className={styles.cardImage}>{dish.emoji}</div>
      <div className={styles.cardType} style={{ color: dish.color, border: `1px solid ${dish.color}` }}>
        {dish.type}
      </div>
      <h2 className={styles.cardTitle}>{dish.name}</h2>

      <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>
        Swipe Right to Vote • Swipe Left to Ban
      </p>
    </motion.div>
  );
}

export default function SwipeVoting() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [externalSwipe, setExternalSwipe] = useState(null);

  const removeCard = (id, direction) => {
    const swipedCard = cards.find(c => c.id === id);
    if (swipedCard) {
      // Save vote to local storage for Admin Portal
      const key = "akshat_swipe_votes";
      let votes = [];
      try { votes = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { }
      votes.push({
        dishName: swipedCard.name,
        emoji: swipedCard.emoji,
        direction,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(votes));
    }

    setCards((prev) => {
      const remaining = prev.filter((card) => card.id !== id);
      return [...remaining, generateRandomDish()];
    });
    setExternalSwipe(null);
  };

  const handleButtonSwipe = (direction) => {
    if (cards.length === 0 || externalSwipe) return;
    const topCard = cards[0];
    setExternalSwipe({ id: topCard.id, direction });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu Voting</h1>
        <p className={styles.subtitle}>Swipe Right to Add • Swipe Left to Ban</p>
      </div>

      <div className={styles.cardContainer}>
        <AnimatePresence>
          {cards.map((dish, index) => (
            <Card
              key={dish.id}
              dish={dish}
              removeCard={removeCard}
              zIndex={cards.length - index}
              externalSwipe={externalSwipe}
            />
          ))}
        </AnimatePresence>

        {cards.length === 0 && (
          <div className={styles.endScreen}>
            <h2>All done! 🎉</h2>
            <p>Your votes have been securely recorded.</p>
          </div>
        )}
      </div>

      {cards.length > 0 && (
        <div className={styles.controls}>
          <button className={`${styles.btn} ${styles.btnBan}`} onClick={() => handleButtonSwipe('left')}>
            <CloseIcon size={30} color="white" />
          </button>
          <button className={`${styles.btn} ${styles.btnLove}`} onClick={() => handleButtonSwipe('right')}>
            <CheckIcon size={30} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}
