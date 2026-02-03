import { motion } from "motion/react";

/**
 * Emotion Icon Props
 * All emotion icons accept the same props for consistency
 */
interface EmotionIconProps {
  isSelected: boolean;
  className?: string;
}

/**
 * EMOTION ICONS
 * Each icon is a discrete, standalone component that can be easily swapped or replaced.
 * To swap an icon: simply replace the component function with your own implementation.
 * All icons must accept EmotionIconProps and return an SVG element.
 */

// Startled - Wide eyes with surprised expression
export function StartledIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="64"
        r="56"
        fill="url(#startled-gradient)"
        animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="startled-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="44"
        cy="54"
        r="8"
        fill="#1e293b"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <motion.circle
        cx="84"
        cy="54"
        r="8"
        fill="#1e293b"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <motion.ellipse
        cx="64"
        cy="82"
        rx="12"
        ry="16"
        fill="#1e293b"
        animate={{ scaleY: [1, 1.3, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </svg>
  );
}

// Warmth - Smiling with warm colors
export function WarmthIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="64"
        r="56"
        fill="url(#warmth-gradient)"
        animate={isSelected ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="warmth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 36 54 Q 44 48 52 54"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 76 54 Q 84 48 92 54"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 40 76 Q 64 92 88 76"
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        animate={{ d: ["M 40 76 Q 64 92 88 76", "M 40 76 Q 64 96 88 76", "M 40 76 Q 64 92 88 76"] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  );
}

// Curiosity - Tilted head with inquisitive look
export function CuriosityIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { rotate: [-5, 5, -5] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#curiosity-gradient)" />
      <defs>
        <linearGradient id="curiosity-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="44"
        cy="58"
        r="6"
        fill="#1e293b"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="84"
        cy="58"
        r="6"
        fill="#1e293b"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.path
        d="M 50 78 Q 64 82 78 78"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 84 50 Q 90 44 96 48"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{ transformOrigin: "90px 48px" }}
      />
    </motion.svg>
  );
}

// Frustration - Furrowed brow, frowning
export function FrustrationIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="64"
        r="56"
        fill="url(#frustration-gradient)"
        animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="frustration-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 32 48 L 48 56"
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
        animate={{ d: ["M 32 48 L 48 56", "M 32 50 L 48 54", "M 32 48 L 48 56"] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.path
        d="M 96 48 L 80 56"
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
        animate={{ d: ["M 96 48 L 80 56", "M 96 50 L 80 54", "M 96 48 L 80 56"] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <circle cx="44" cy="62" r="5" fill="#1e293b" />
      <circle cx="84" cy="62" r="5" fill="#1e293b" />
      <motion.path
        d="M 44 88 Q 64 80 84 88"
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Fear - Wide eyes, trembling
export function FearIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { x: [-2, 2, -2] } : {}}
      transition={{ duration: 0.15, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#fear-gradient)" />
      <defs>
        <linearGradient id="fear-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="54" r="10" fill="#1e293b" />
      <circle cx="84" cy="54" r="10" fill="#1e293b" />
      <circle cx="44" cy="52" r="4" fill="#ffffff" />
      <circle cx="84" cy="52" r="4" fill="#ffffff" />
      <motion.ellipse
        cx="64"
        cy="84"
        rx="10"
        ry="14"
        fill="#1e293b"
        animate={{ scaleY: [1, 1.2, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
      <motion.path
        d="M 36 46 Q 44 42 52 46"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
      <motion.path
        d="M 76 46 Q 84 42 92 46"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
      />
    </motion.svg>
  );
}

// Heaviness - Sad, drooping features
export function HeavinessIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { y: [0, 3, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#heaviness-gradient)" />
      <defs>
        <linearGradient id="heaviness-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 36 52 Q 44 48 52 52"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 76 52 Q 84 48 92 52"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="44" cy="60" r="4" fill="#1e293b" />
      <circle cx="84" cy="60" r="4" fill="#1e293b" />
      <motion.path
        d="M 44 88 Q 64 82 84 88"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        animate={{ d: ["M 44 88 Q 64 82 84 88", "M 44 90 Q 64 84 84 90", "M 44 88 Q 64 82 84 88"] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.path
        d="M 42 68 Q 44 72 44 72"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
        animate={{ pathLength: [0, 1], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </motion.svg>
  );
}

// Revulsion - Disgusted expression
export function RevulsionIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#revulsion-gradient)" />
      <defs>
        <linearGradient id="revulsion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 34 50 L 50 58"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ d: ["M 34 50 L 50 58", "M 34 52 L 50 56", "M 34 50 L 50 58"] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <motion.path
        d="M 94 50 L 78 58"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ d: ["M 94 50 L 78 58", "M 94 52 L 78 56", "M 94 50 L 78 58"] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <path d="M 40 64 L 48 64" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <path d="M 80 64 L 88 64" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <motion.path
        d="M 50 86 Q 64 78 78 86"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        animate={{ d: ["M 50 86 Q 64 78 78 86", "M 50 84 Q 64 76 78 84", "M 50 86 Q 64 78 78 86"] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.path
        d="M 58 72 L 70 72"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// Aversion - Turning away, avoiding
export function AversionIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { x: [0, -3, 0] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#aversion-gradient)" />
      <defs>
        <linearGradient id="aversion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 36 54 Q 42 50 48 54"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 76 54 Q 82 50 88 54"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.circle
        cx="42"
        cy="60"
        r="4"
        fill="#1e293b"
        animate={{ x: [-2, 0, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="80"
        cy="60"
        r="4"
        fill="#1e293b"
        animate={{ x: [-2, 0, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M 48 82 L 80 82"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// Shame - Looking down, small
export function ShameIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isSelected ? { scale: [1, 0.95, 1], y: [0, 2, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <circle cx="64" cy="64" r="56" fill="url(#shame-gradient)" />
      <defs>
        <linearGradient id="shame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 36 56 Q 42 54 48 56"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 76 56 Q 82 54 88 56"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 38 66 Q 42 68 46 66"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 78 66 Q 82 68 86 66"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 50 86 Q 64 84 78 86"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={{ d: ["M 50 86 Q 64 84 78 86", "M 50 88 Q 64 86 78 88", "M 50 86 Q 64 84 78 86"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <ellipse cx="64" cy="48" rx="20" ry="8" fill="#1e293b" opacity="0.15" />
    </motion.svg>
  );
}