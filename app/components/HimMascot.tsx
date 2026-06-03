"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type MascotExpression =
  | "default"
  | "nervous"
  | "sleepy"
  | "embarrassed"
  | "proud"
  | "buffering"
  | "overheating";

export const EXPRESSION_ORDER: MascotExpression[] = [
  "default",
  "nervous",
  "embarrassed",
  "proud",
  "buffering",
  "overheating",
  "sleepy",
];

type HimMascotProps = {
  expression?: MascotExpression;
  size?: "xs" | "sm" | "md" | "lg";
  interactive?: boolean;
  onExpressionChange?: (expr: MascotExpression) => void;
  asleep?: boolean;
  className?: string;
};

const sizes = {
  xs: 36,
  sm: 48,
  md: 64,
  lg: 88,
};

function Face({
  expression,
  blink,
  asleep,
}: {
  expression: MascotExpression;
  blink: boolean;
  asleep: boolean;
}) {
  const eyeClosed = asleep || blink;
  const sleepy = expression === "sleepy" || asleep;

  const leftEye =
    eyeClosed || sleepy ? (
      <path
        d="M18 22 Q22 24 26 22"
        stroke="#6ee7a0"
        strokeWidth="1.5"
        fill="none"
      />
    ) : expression === "nervous" ? (
      <circle cx="22" cy="22" r="3.5" fill="#6ee7a0" />
    ) : expression === "buffering" ? (
      <rect
        x="18"
        y="19"
        width="8"
        height="6"
        rx="1"
        fill="none"
        stroke="#6ee7a0"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    ) : expression === "overheating" ? (
      <>
        <circle cx="22" cy="22" r="3" fill="#fbbf24" opacity="0.9" />
        <path
          d="M19 19 L25 25 M25 19 L19 25"
          stroke="#050505"
          strokeWidth="1"
        />
      </>
    ) : (
      <circle cx="22" cy="22" r="2.5" fill="#6ee7a0" />
    );

  const rightEye =
    eyeClosed || sleepy ? (
      <path
        d="M34 22 Q38 24 42 22"
        stroke="#6ee7a0"
        strokeWidth="1.5"
        fill="none"
      />
    ) : expression === "nervous" ? (
      <circle cx="38" cy="22" r="3.5" fill="#6ee7a0" />
    ) : expression === "buffering" ? (
      <rect
        x="34"
        y="19"
        width="8"
        height="6"
        rx="1"
        fill="none"
        stroke="#6ee7a0"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    ) : expression === "overheating" ? (
      <>
        <circle cx="38" cy="22" r="3" fill="#fbbf24" opacity="0.9" />
        <path
          d="M35 19 L41 25 M41 19 L35 25"
          stroke="#050505"
          strokeWidth="1"
        />
      </>
    ) : (
      <circle cx="38" cy="22" r="2.5" fill="#6ee7a0" />
    );

  const mouth = asleep ? (
    <circle cx="32" cy="30" r="2" fill="#6ee7a0" opacity="0.5" />
  ) : expression === "embarrassed" ? (
    <path
      d="M26 31 Q32 29 38 31"
      stroke="#6ee7a0"
      strokeWidth="1.5"
      fill="none"
    />
  ) : expression === "proud" ? (
    <path
      d="M26 30 Q32 34 38 30"
      stroke="#6ee7a0"
      strokeWidth="1.5"
      fill="none"
    />
  ) : expression === "nervous" ? (
    <path d="M28 32 L36 32" stroke="#6ee7a0" strokeWidth="1.5" />
  ) : expression === "overheating" ? (
    <ellipse
      cx="32"
      cy="32"
      rx="4"
      ry="2"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="1"
    />
  ) : (
    <path d="M28 31 L36 31" stroke="#6ee7a0" strokeWidth="1.5" opacity="0.7" />
  );

  return (
    <>
      {leftEye}
      {rightEye}
      {mouth}
      {expression === "embarrassed" && !asleep && (
        <>
          <circle cx="16" cy="26" r="2" fill="#f472b6" opacity="0.35" />
          <circle cx="48" cy="26" r="2" fill="#f472b6" opacity="0.35" />
        </>
      )}
      {(sleepy || asleep) && (
        <text
          x="46"
          y="16"
          fill="#6ee7a0"
          opacity="0.4"
          fontSize="7"
          fontFamily="monospace"
        >
          z
        </text>
      )}
      {expression === "overheating" && !asleep && (
        <>
          <path
            d="M14 14 Q16 10 18 14"
            stroke="#fbbf24"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M46 12 Q48 8 50 12"
            stroke="#fbbf24"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
        </>
      )}
    </>
  );
}

function MascotSvg({
  expression,
  size,
  asleep,
}: {
  expression: MascotExpression;
  size: number;
  asleep: boolean;
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (asleep) return;
    const blinkLoop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    };
    const interval = setInterval(blinkLoop, 2800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [asleep]);

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 64 70"
      fill="none"
      className="drop-shadow-[0_0_8px_rgba(110,231,160,0.15)]"
    >
      <rect
        x="8"
        y="10"
        width="48"
        height="36"
        rx="3"
        fill="#0a0a0a"
        stroke="#333"
        strokeWidth="1.5"
      />
      <rect
        x="12"
        y="14"
        width="40"
        height="28"
        rx="1"
        fill="#050505"
        stroke="#1a1a1a"
        strokeWidth="1"
      />
      <Face expression={expression} blink={blink} asleep={asleep} />
      <rect x="20" y="46" width="24" height="4" rx="1" fill="#1a1a1a" />
      <rect x="28" y="50" width="8" height="6" fill="#141414" />
      <rect x="22" y="56" width="20" height="3" rx="1" fill="#1a1a1a" />
      {expression === "buffering" && !asleep && (
        <motion.rect
          x="12"
          y="14"
          width="40"
          height="1"
          fill="#6ee7a0"
          opacity="0.3"
          animate={{ y: [14, 40, 14] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}

export default function HimMascot({
  expression = "default",
  size = "md",
  interactive = false,
  onExpressionChange,
  asleep = false,
  className = "",
}: HimMascotProps) {
  const px = sizes[size];

  const handleClick = () => {
    if (!interactive || asleep) return;
    const idx = EXPRESSION_ORDER.indexOf(expression);
    const next = EXPRESSION_ORDER[(idx + 1) % EXPRESSION_ORDER.length];
    onExpressionChange?.(next);
  };

  const motionProps = {
    className: `inline-flex shrink-0 items-center justify-center ${interactive && !asleep ? "cursor-pointer" : "cursor-default"} ${className}`,
    animate: {
      y: asleep ? [0, 1, 0] : [0, -3, 0],
      scale: asleep ? [1, 1.01, 1] : [1, 1.03, 1],
    },
    transition: {
      duration: asleep ? 4 : 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
    whileHover: interactive && !asleep ? { scale: 1.08 } : undefined,
    whileTap: interactive && !asleep ? { scale: 0.95 } : undefined,
  };

  if (interactive) {
    return (
      <motion.button
        type="button"
        aria-label="him.exe mascot"
        onClick={handleClick}
        disabled={asleep}
        {...motionProps}
      >
        <MascotSvg expression={expression} size={px} asleep={asleep} />
      </motion.button>
    );
  }

  return (
    <motion.div role="img" aria-label="him.exe mascot" {...motionProps}>
      <MascotSvg expression={expression} size={px} asleep={asleep} />
    </motion.div>
  );
}
