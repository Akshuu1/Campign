import React from "react";

// ─── Food / Meal Icons ────────────────────────────────────────────────────────

export function WatermelonIcon({ size = 40, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="38" rx="26" ry="20" fill="#4CAF82"/>
      <ellipse cx="32" cy="36" rx="22" ry="16" fill="#F9645A"/>
      <path d="M10 36 Q32 16 54 36" fill="#4CAF82"/>
      <circle cx="24" cy="38" r="2" fill="#1A3A2A" opacity="0.6"/>
      <circle cx="32" cy="42" r="2" fill="#1A3A2A" opacity="0.6"/>
      <circle cx="40" cy="38" r="2" fill="#1A3A2A" opacity="0.6"/>
      <circle cx="28" cy="32" r="1.5" fill="#1A3A2A" opacity="0.5"/>
      <circle cx="37" cy="34" r="1.5" fill="#1A3A2A" opacity="0.5"/>
      <path d="M30 10 Q32 4 34 10" stroke="#4CAF82" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32 10 L32 16" stroke="#4CAF82" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function ForkKnifeIcon({ size = 28, className, color = "#F4845F" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2v7c0 1.1.9 2 2 2h1v11h2V11h1c1.1 0 2-.9 2-2V2H9v5H8V2H6v5H5V2H3z" fill={color}/>
      <path d="M16 2c-1.7 0-3 2.7-3 6v4h2v10h2V12h2V8c0-3.3-1.3-6-3-6z" fill={color}/>
    </svg>
  );
}

export function SunriseIcon({ size = 40, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Horizon line */}
      <line x1="6" y1="44" x2="58" y2="44" stroke="#E8D0A0" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Sun half */}
      <path d="M16 44 a16 16 0 0 1 32 0" fill="#F9B84A"/>
      {/* Rays */}
      <line x1="32" y1="10" x2="32" y2="16" stroke="#F9B84A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="16" x2="18" y2="20" stroke="#F9B84A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="16" x2="46" y2="20" stroke="#F9B84A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="8" y1="32" x2="14" y2="32" stroke="#F9B84A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="56" y1="32" x2="50" y2="32" stroke="#F9B84A" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SunIcon({ size = 40, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="14" fill="#F9B84A"/>
      <line x1="32" y1="6" x2="32" y2="14" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="32" y1="50" x2="32" y2="58" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="6" y1="32" x2="14" y2="32" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="32" x2="58" y2="32" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="13" y1="13" x2="19" y2="19" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="51" y1="13" x2="45" y2="19" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="13" y1="51" x2="19" y2="45" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="51" y1="51" x2="45" y2="45" stroke="#F9B84A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function MoonIcon({ size = 40, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M40 10 C26 10 16 20 16 32 C16 44 26 54 40 54 C32 54 24 50 22 42 C30 44 40 38 40 28 C40 20 36 14 40 10Z" fill="#D97706"/>
      <circle cx="46" cy="14" r="2.5" fill="#FDE68A"/>
      <circle cx="52" cy="22" r="2" fill="#FDE68A"/>
      <circle cx="42" cy="8" r="1.5" fill="#FDE68A"/>
    </svg>
  );
}

export function MangoIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Green leaf */}
      <path d="M34 10 C32 4 44 4 48 8 C48 14 40 16 34 10Z" fill="#10B981" stroke="#059669" strokeWidth="1.5"/>
      {/* Mango stem */}
      <path d="M32 10 Q34 14 33 18" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Juicy mango body */}
      <path d="M33 18 C46 18 52 28 50 42 C48 54 36 56 26 52 C16 48 14 36 18 26 C21 20 27 18 33 18 Z" fill="url(#mangoGrad)"/>
      {/* Mango cheek blush */}
      <path d="M36 24 C44 26 48 34 46 42 C44 48 38 52 30 50" stroke="#FF5E7E" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
      {/* Shine */}
      <path d="M22 28 Q20 36 24 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <defs>
        <linearGradient id="mangoGrad" x1="16" y1="18" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC837"/>
          <stop offset="0.6" stopColor="#FF8008"/>
          <stop offset="1" stopColor="#FF416C"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AvocadoIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Dark skin */}
      <path d="M32 8 C22 8 16 20 16 36 C16 50 22 58 32 58 C42 58 48 50 48 36 C48 20 42 8 32 8 Z" fill="#1B4332"/>
      {/* Light creamy green meat */}
      <path d="M32 12 C24 12 19 22 19 36 C19 48 24 55 32 55 C40 55 45 48 45 36 C45 22 40 12 32 12 Z" fill="#D8F3DC"/>
      {/* Golden halo around seed */}
      <circle cx="32" cy="40" r="13" fill="#B7E4C7"/>
      {/* Seed pit */}
      <circle cx="32" cy="40" r="9" fill="#7F4F24"/>
      <circle cx="30" cy="38" r="7" fill="#936639"/>
      {/* Light shine */}
      <circle cx="29" cy="36" r="2.5" fill="white" opacity="0.6"/>
    </svg>
  );
}

export function PineappleIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Spiky green crown leaves */}
      <path d="M32 6 L35 18 L29 18 Z" fill="#10B981"/>
      <path d="M26 8 L32 20 L22 18 Z" fill="#059669"/>
      <path d="M38 8 L42 18 L32 20 Z" fill="#059669"/>
      <path d="M20 12 L28 22 L18 20 Z" fill="#047857"/>
      <path d="M44 12 L46 20 L36 22 Z" fill="#047857"/>
      {/* Pineapple barrel body */}
      <rect x="18" y="20" width="28" height="38" rx="14" fill="#F59E0B"/>
      {/* Diagonal grid grooves */}
      <line x1="22" y1="26" x2="42" y2="46" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="36" x2="38" y2="52" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="22" x2="46" y2="42" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <line x1="42" y1="26" x2="22" y2="46" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <line x1="42" y1="36" x2="26" y2="52" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="22" x2="18" y2="42" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      {/* Diamonds dots */}
      <circle cx="32" cy="36" r="2" fill="#78350F" opacity="0.6"/>
      <circle cx="27" cy="30" r="1.5" fill="#78350F" opacity="0.6"/>
      <circle cx="37" cy="30" r="1.5" fill="#78350F" opacity="0.6"/>
      <circle cx="27" cy="42" r="1.5" fill="#78350F" opacity="0.6"/>
      <circle cx="37" cy="42" r="1.5" fill="#78350F" opacity="0.6"/>
    </svg>
  );
}

export function StrawberryIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Strawberry green leafy cap */}
      <path d="M32 10 Q32 4 33 2" stroke="#047857" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M26 12 L32 16 L38 12 L44 16 L38 18 L32 20 L26 18 L20 16 Z" fill="#10B981"/>
      {/* Strawberry heart body */}
      <path d="M18 20 C14 28 18 44 32 58 C46 44 50 28 46 20 C42 14 36 17 32 20 C28 17 22 14 18 20 Z" fill="#EF4444"/>
      {/* Cheerful seeds */}
      <circle cx="26" cy="28" r="1.5" fill="#FEF08A"/>
      <circle cx="32" cy="26" r="1.5" fill="#FEF08A"/>
      <circle cx="38" cy="28" r="1.5" fill="#FEF08A"/>
      <circle cx="24" cy="36" r="1.5" fill="#FEF08A"/>
      <circle cx="32" cy="34" r="1.5" fill="#FEF08A"/>
      <circle cx="40" cy="36" r="1.5" fill="#FEF08A"/>
      <circle cx="28" cy="44" r="1.5" fill="#FEF08A"/>
      <circle cx="36" cy="44" r="1.5" fill="#FEF08A"/>
      <circle cx="32" cy="50" r="1.5" fill="#FEF08A"/>
    </svg>
  );
}

export function OrangeSliceIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer peel */}
      <circle cx="32" cy="32" r="26" fill="#F97316"/>
      {/* White pith */}
      <circle cx="32" cy="32" r="23" fill="#FFEDD5"/>
      {/* Pulp segments */}
      <circle cx="32" cy="32" r="20" fill="#EA580C"/>
      {/* Center core */}
      <circle cx="32" cy="32" r="4" fill="#FFEDD5"/>
      {/* Segments spokes */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="#FFEDD5" strokeWidth="2.5"/>
      <line x1="12" y1="32" x2="52" y2="32" stroke="#FFEDD5" strokeWidth="2.5"/>
      <line x1="18" y1="18" x2="46" y2="46" stroke="#FFEDD5" strokeWidth="2.5"/>
      <line x1="18" y1="46" x2="46" y2="18" stroke="#FFEDD5" strokeWidth="2.5"/>
    </svg>
  );
}

export function BananaIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Stem */}
      <path d="M14 18 Q16 12 20 14" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Banana body curve */}
      <path d="M18 16 C28 26 44 32 50 48 C44 54 28 46 16 32 C12 26 14 20 18 16 Z" fill="#FBBF24"/>
      <path d="M18 16 C28 26 44 32 50 48" stroke="#D97706" strokeWidth="2" fill="none"/>
      {/* Banana tip */}
      <circle cx="50" cy="48" r="2" fill="#451A03"/>
    </svg>
  );
}

export function FruitBowlIcon({ size = 42, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Sliced fruits inside */}
      <circle cx="24" cy="24" r="8" fill="#EF4444"/>
      <circle cx="34" cy="20" r="7" fill="#F59E0B"/>
      <circle cx="42" cy="25" r="7" fill="#10B981"/>
      <path d="M22 18 Q30 14 38 22" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"/>
      {/* Bowl */}
      <path d="M12 26 C14 46 22 54 32 54 C42 54 50 46 52 26 Z" fill="#FB8500"/>
      <path d="M10 26 L54 26" stroke="#261C14" strokeWidth="3" strokeLinecap="round"/>
      {/* Bowl rim shine */}
      <path d="M18 34 Q32 44 46 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      {/* Bowl base */}
      <rect x="26" y="54" width="12" height="4" rx="2" fill="#D97706"/>
    </svg>
  );
}

export function SnackIcon({ size = 40, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Cup */}
      <path d="M18 22 L22 50 Q22 52 24 52 L40 52 Q42 52 42 50 L46 22 Z" fill="#F4845F"/>
      <path d="M16 18 Q16 22 18 22 L46 22 Q48 22 48 18 Q48 14 32 14 Q16 14 16 18Z" fill="#E8C4A0"/>
      {/* Straw */}
      <rect x="30" y="6" width="4" height="20" rx="2" fill="#52B788"/>
      {/* Dots */}
      <circle cx="27" cy="34" r="2.5" fill="white" opacity="0.3"/>
      <circle cx="37" cy="40" r="2" fill="white" opacity="0.3"/>
    </svg>
  );
}

// ─── UI Icons ─────────────────────────────────────────────────────────────────

export function TrophyIcon({ size = 40, className, color = "#F9B84A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 L44 8 L42 32 Q40 44 32 44 Q24 44 22 32 Z" fill={color}/>
      <path d="M20 8 L10 8 Q8 8 8 12 L8 20 Q8 30 20 30" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M44 8 L54 8 Q56 8 56 12 L56 20 Q56 30 44 30" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <rect x="27" y="44" width="10" height="8" fill={color} opacity="0.6"/>
      <rect x="20" y="52" width="24" height="4" rx="2" fill={color}/>
      <path d="M26 20 L30 28 L40 26 L34 34 L36 44 L28 40 L20 44 L22 34 L16 26 L26 28 Z" fill="white" opacity="0.25"/>
    </svg>
  );
}

export function VoteIcon({ size = 40, className, color = "#4CAF82" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Ballot box */}
      <rect x="10" y="28" width="44" height="28" rx="4" fill={color}/>
      <rect x="10" y="20" width="44" height="10" rx="3" fill={color} opacity="0.5"/>
      {/* Slot */}
      <rect x="26" y="22" width="12" height="3" rx="1.5" fill="white"/>
      {/* Ballot paper */}
      <rect x="24" y="8" width="16" height="22" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      <line x1="28" y1="14" x2="36" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="28" y1="18" x2="36" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Check */}
      <path d="M26 36 L30 42 L38 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ChefIcon({ size = 60, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Hat */}
      <ellipse cx="40" cy="28" rx="18" ry="12" fill="white" stroke="#E8D0A0" strokeWidth="2"/>
      <rect x="24" y="26" width="32" height="10" rx="2" fill="white" stroke="#E8D0A0" strokeWidth="2"/>
      <path d="M30 18 Q30 8 40 8 Q50 8 50 18" fill="white" stroke="#E8D0A0" strokeWidth="2"/>
      {/* Face */}
      <circle cx="40" cy="48" r="14" fill="#FDDBB4"/>
      <circle cx="35" cy="46" r="1.5" fill="#5A4030"/>
      <circle cx="45" cy="46" r="1.5" fill="#5A4030"/>
      <path d="M35 52 Q40 56 45 52" stroke="#C0845A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <path d="M24 62 Q28 58 40 58 Q52 58 56 62 L60 76 L20 76 Z" fill="white" stroke="#E8D0A0" strokeWidth="2"/>
      <line x1="40" y1="62" x2="40" y2="74" stroke="#E8D0A0" strokeWidth="1.5"/>
      <circle cx="36" cy="66" r="1.5" fill="#E8D0A0"/>
      <circle cx="44" cy="66" r="1.5" fill="#E8D0A0"/>
    </svg>
  );
}

export function PlusIcon({ size = 20, className, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L12 19 M5 12 L19 12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CloseIcon({ size = 14, className, color = "#ccc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function GoogleIcon({ size = 22, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function PlateIcon({ size = 28, className, color = "#F4845F" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
      <path d="M12 3 L12 5 M21 12 L19 12 M12 21 L12 19 M3 12 L5 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function StarIcon({ size = 16, className, filled = false, color = "#F9B84A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2 L14.9 8.6 L22 9.3 L17 13.9 L18.5 21 L12 17.3 L5.5 21 L7 13.9 L2 9.3 L9.1 8.6 Z"
        fill={filled ? color : "none"} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShareIcon({ size = 18, className, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2"/>
      <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2"/>
      <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2"/>
      <line x1="8.6" y1="10.7" x2="15.4" y2="6.3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8.6" y1="13.3" x2="15.4" y2="17.7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5 M12 19l-7-7 7-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ArrowRightIcon({ size = 20, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14 M12 5l7 7-7 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CoffeeIcon({ size = 24, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="6" y1="1" x2="6" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="1" x2="10" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="1" x2="14" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function ThaliIcon({ size = 26, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
      <circle cx="9" cy="8" r="2.5" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.2"/>
      <circle cx="15" cy="8" r="2.5" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.2"/>
      <circle cx="12" cy="15" r="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function DessertIcon({ size = 24, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a4 4 0 0 1 4 4c0 .7-.2 1.4-.5 2h-7A4.2 4.2 0 0 1 12 2z" fill={color} fillOpacity="0.6"/>
      <path d="M4 8h16l-1.5 10a3 3 0 0 1-3 2.5h-7A3 3 0 0 1 5.5 18L4 8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="4" r="1.5" fill="#EF4444"/>
    </svg>
  );
}

export function SpicyIcon({ size = 20, className, color = "#EF4444" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 3.5C12 2 9.5 3 8 4.5 4.5 8 3 13.5 5 18c1.5 3.5 4 4.5 7 3.5 4.5-1.5 8.5-6 8-11.5-.5-5-3.5-5.5-5.5-6.5z" fill={color}/>
      <path d="M13 2c1 2 2 3 4 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function SparkleIcon({ size = 20, className, color = "#F59E0B" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.4 6.8L21 11.2l-6.6 2.4L12 20.4l-2.4-6.8L3 11.2l6.6-2.4L12 2z" fill={color}/>
    </svg>
  );
}

export function CheckIcon({ size = 18, className, color = "#10B981" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CrownIcon({ size = 24, className, color = "#F9B84A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M2 19h20M4 17l2-10 5 4 4-7 4 7 5-4 2 10H4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2"/>
    </svg>
  );
}

export function ShieldIcon({ size = 24, className, color = "#4CAF82" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.15"/>
    </svg>
  );
}

export function ChatIcon({ size = 24, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function UsersIcon({ size = 24, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function TrashIcon({ size = 18, className, color = "#EF4444" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SearchIcon({ size = 20, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RefreshIcon({ size = 20, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M23 4v6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function LockIcon({ size = 20, className, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function MegaphoneIcon({ size = 22, className, color = "#FB8500" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11l15-7v14L3 11z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 15v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8c1.5 1 2 2.5 2 4s-.5 3-2 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
