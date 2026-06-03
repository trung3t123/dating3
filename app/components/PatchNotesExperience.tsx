"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import HimMascot, { type MascotExpression } from "./HimMascot";

import {
  EventSetupScreen,
  ExitScreen,
  FinalScreen,
} from "./EventSetupFlow";
import { submitEventConfig } from "@/lib/submit-event-config";

type Phase = "boot" | "main" | "setup" | "final" | "exit";

const spring = { type: "spring" as const, stiffness: 140, damping: 22 };
const softSpring = { type: "spring" as const, stiffness: 100, damping: 18 };

const BOOT_LOGS = [
  "reviewing last night's incident report...",
  "recalibrating clinginess levels...",
  "flagging questionable bar selection 🍺",
  "patching missed tired signals...",
];

type PatchCategory = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  mascot: MascotExpression;
  items: string[];
  variant?: "default" | "warning";
};

const PATCH_CATEGORIES: PatchCategory[] = [
  {
    id: "stability",
    label: "self-system improvements 🖥️",
    hint: "post-night recovery patch",
    icon: "◎",
    mascot: "embarrassed",
    items: [
      "clinginess levels reduced by approximately 37% 😭",
      "improved detection of sleepy user behavior 🌙",
      "reduced resistance when being told “go home” 🚪",
      "emotional overheating threshold slightly increased 🍺",
    ],
  },
  {
    id: "social",
    label: "social patches 💬",
    hint: "should've noticed user was tired 😔",
    icon: "◐",
    mascot: "nervous",
    items: [
      "now more capable of recognizing when the night is ending 😔",
      "fewer attempts to extend conversations past safe operating hours 🕒",
      "improved awareness of nearby tired user 🫠",
      "drinking decision-making improved ( reduced ) 🍻",
      "bar selection module improved ( follow user's music preferences ) 🍷",
    ],
  },
  {
    id: "issues",
    label: "known issues ⚠️",
    hint: "not pretending these are fixed yet",
    icon: "△",
    mascot: "overheating",
    variant: "warning",
    items: [
      "still slightly vulnerable to wanting “just 5 more minutes” 😭",
      "occasionally forgets that good nights are allowed to end 🌙",
      "emotional shutdown sequence may fail during enjoyable conversations 🫠",
      "him.exe is still learning how not to panic during delayed online responses 📱",
    ],
  },
];

const DEBUG_LOGS = [
  "clinginess_reduction.dll updated 🫠",
  "go_home_when_asked() priority raised 🚪",
  "sleepy_signal_detection.dll updated 🌙",
  "bar_selection_logic flagged for review 🍺",
  "alcohol_throttle cap lowered slightly 🍻",
];

type HiddenLog = {
  type: string;
  text: string;
  tone?: "warning" | "notice" | "error" | "status";
};

const HIDDEN_LOGS: HiddenLog[] = [
  {
    type: "WARNING",
    text: "user may accidentally choose emotionally dangerous drinking locations 🍺",
    tone: "warning",
  },
  {
    type: "NOTICE",
    text: "natural interaction mode currently being restored 🌙",
    tone: "notice",
  },
  {
    type: "ERROR 418",
    text: "system failed to recognize “i’m tired” signals 😭",
    tone: "error",
  },
  {
    type: "SYSTEM STATUS",
    text: "him.exe still trying his best ✨",
    tone: "status",
  },
];

const TOAST_MESSAGES = [
  "WARNING: user may accidentally choose emotionally dangerous drinking locations 🍺",
  "ERROR 418: system failed to recognize “i’m tired” signals 😭",
  "NOTICE: natural interaction mode currently being restored 🌙",
  "him.exe is quietly grateful user opened this ✨",
];

function useTypingSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      /* audio unavailable */
    }
  }, [enabled]);

  return play;
}

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 8 + Math.random() * 14,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/15"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.08, 0.35, 0.08] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function LoadingBar({ progress }: { progress: number }) {
  return (
    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-neutral-900">
      <motion.div
        className="h-full rounded-full bg-emerald-500/40"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={softSpring}
      className="fixed left-1/2 top-[max(1.5rem,env(safe-area-inset-top))] z-50 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded border border-amber-900/40 bg-neutral-950/90 px-3 py-2 text-[10px] leading-relaxed text-amber-600/80 shadow-[0_0_20px_rgba(251,191,36,0.08)] backdrop-blur-sm"
    >
      {message}
    </motion.div>
  );
}

function BootScreen({
  onOpenChangelog,
  playTick,
}: {
  onOpenChangelog: () => void;
  playTick: () => void;
}) {
  const [bootText, setBootText] = useState("");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showVersion, setShowVersion] = useState(false);
  const [ready, setReady] = useState(false);
  const [mascotExpr, setMascotExpr] = useState<MascotExpression>("buffering");
  const playTickRef = useRef(playTick);

  playTickRef.current = playTick;

  const fullBootText = "launching him.exe...";

  useEffect(() => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= fullBootText.length) {
        setBootText(fullBootText.slice(0, charIndex));
        if (charIndex > 0 && charIndex % 3 === 0) playTickRef.current();
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 55 + Math.random() * 25);
    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    if (bootText !== fullBootText) return;

    setVisibleLogs([]);
    setProgress(0);
    setShowVersion(false);
    setReady(false);

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let logIndex = 0;

    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(setTimeout(fn, ms));
    };

    const showNextLog = () => {
      if (cancelled) return;
      if (logIndex < BOOT_LOGS.length) {
        const entry = BOOT_LOGS[logIndex];
        setVisibleLogs((prev) => [...prev, entry]);
        setProgress(((logIndex + 1) / (BOOT_LOGS.length + 1)) * 85);
        playTickRef.current();
        logIndex++;
        schedule(showNextLog, 550 + Math.random() * 450);
      } else {
        setProgress(95);
        setMascotExpr("nervous");
        schedule(() => {
          if (cancelled) return;
          setShowVersion(true);
          setProgress(100);
          setMascotExpr("embarrassed");
          playTickRef.current();
          schedule(() => {
            if (cancelled) return;
            setReady(true);
            setMascotExpr("default");
          }, 1400);
        }, 500);
      }
    };

    schedule(showNextLog, 400);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [bootText, playTick]);

  return (
    <motion.div
      className="flex min-h-dvh flex-col justify-center overflow-y-auto px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="text-sm text-emerald-400/90">
            <span>{bootText}</span>
            {!ready && bootText.length < fullBootText.length && (
              <span className="cursor-blink inline" />
            )}
          </p>
          <HimMascot expression={mascotExpr} size="sm" />
        </div>

        <LoadingBar progress={progress} />

        <div className="mt-6 space-y-2">
          {visibleLogs.map((log, i) => (
            <motion.p
              key={`boot-log-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: i * 0.05 }}
              className="text-xs text-neutral-500"
            >
              <span className="text-neutral-600">&gt;</span> {log}
            </motion.p>
          ))}
        </div>

        <AnimatePresence>
          {showVersion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-10"
            >
              <p className="text-xs tracking-widest text-neutral-600">
                ─────────────────
              </p>
              <p className="mt-3 text-sm font-medium tracking-wide text-emerald-300/80">
                SYSTEM UPDATE — version 1.0.3
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 border-t border-neutral-800/80 pt-8"
            >
              <p className="text-sm text-emerald-400/80">
                system ready ✨
                <span className="cursor-blink inline" />
              </p>
              <motion.button
                type="button"
                onClick={onOpenChangelog}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 24px rgba(110,231,160,0.12)",
                }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 0 12px rgba(110,231,160,0.06)",
                    "0 0 20px rgba(110,231,160,0.1)",
                    "0 0 12px rgba(110,231,160,0.06)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mt-6 w-full rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-3.5 text-sm text-emerald-400/80 transition-colors hover:border-emerald-700/50 hover:text-emerald-300"
              >
                [ open changelog ]
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AccordionCard({
  category,
  isOpen,
  onToggle,
  index,
}: {
  category: PatchCategory;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const isWarning = category.variant === "warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, ...spring }}
      className="overflow-hidden rounded-xl border border-neutral-800/70 bg-neutral-950/40 transition-shadow"
    >
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{
          boxShadow: isWarning
            ? "0 0 16px rgba(251,191,36,0.08)"
            : "0 0 16px rgba(110,231,160,0.08)",
        }}
        whileTap={{ scale: 0.985 }}
        className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors sm:px-5 sm:py-4 ${
          isOpen
            ? isWarning
              ? "bg-amber-950/20"
              : "bg-emerald-950/15"
            : "hover:bg-neutral-900/40"
        }`}
      >
        <span
          className={`text-sm ${
            isWarning ? "text-amber-600/60" : "text-emerald-600/50"
          }`}
          title={category.hint}
        >
          {category.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm tracking-wide ${
              isWarning ? "text-amber-700/70" : "text-neutral-300"
            }`}
          >
            {category.label}
          </p>
          {!isOpen && (
            <p className="mt-1 text-xs text-neutral-500">{category.hint}</p>
          )}
        </div>
        <HimMascot expression={category.mascot} size="sm" />
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={spring}
          className="text-sm text-neutral-500"
        >
          ›
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 border-t border-neutral-800/50 px-4 py-4 sm:px-5">
              {category.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, ...spring }}
                  className={`flex gap-3 text-sm leading-relaxed ${
                    isWarning ? "text-neutral-400" : "text-neutral-300"
                  }`}
                >
                  <span
                    className={`shrink-0 pt-0.5 ${
                      isWarning ? "text-amber-600/50" : "text-emerald-600/60"
                    }`}
                  >
                    *
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PatchNotesCard({ onContinue }: { onContinue: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [mascotExpr, setMascotExpr] = useState<MascotExpression>("default");
  const [toast, setToast] = useState<string | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [footerTaps, setFooterTaps] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const toastIndex = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setCanContinue(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const showToast = useCallback(() => {
    const msg = TOAST_MESSAGES[toastIndex.current % TOAST_MESSAGES.length];
    toastIndex.current++;
    setToast(msg);
  }, []);

  const handleToggle = (id: string) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next && next !== openId) {
      setDiscoveredCount((c) => c + 1);
      const cat = PATCH_CATEGORIES.find((c) => c.id === id);
      if (cat) setMascotExpr(cat.mascot);
      if (Math.random() > 0.6) showToast();
    }
  };

  const handleFooterTap = () => {
    const next = footerTaps + 1;
    setFooterTaps(next);
    if (next >= 3) {
      setHiddenOpen(true);
      setMascotExpr("embarrassed");
      showToast();
    }
  };

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 pb-[max(4.5rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-lg sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+2rem)]"
      >
        <div className="ui-drift flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_48px_rgba(110,231,160,0.08)] backdrop-blur-sm">
          <div className="shrink-0 border-b border-neutral-800/80 p-6 pb-5 sm:p-7 sm:pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm tracking-widest text-emerald-400/80 sm:text-base">
                  SYSTEM UPDATE — version 1.0.3
                </p>
                <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
                  tap modules to inspect changes
                </p>
              </div>
              <HimMascot
                expression={mascotExpr}
                size="md"
                interactive
                onExpressionChange={setMascotExpr}
              />
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="card-scroll h-full overflow-y-auto overscroll-y-contain">
              <div className="p-6 pt-4 sm:p-7 sm:pt-5">
                <div className="space-y-3">
                  {PATCH_CATEGORIES.map((cat, i) => (
                    <AccordionCard
                      key={cat.id}
                      category={cat}
                      isOpen={openId === cat.id}
                      onToggle={() => handleToggle(cat.id)}
                      index={i}
                    />
                  ))}
                </div>

                {discoveredCount >= 2 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 text-xs text-neutral-500 sm:text-sm"
                  >
                    {discoveredCount}/{PATCH_CATEGORIES.length} modules
                    inspected
                  </motion.p>
                )}

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-sm text-neutral-400"
                >
                  thank user for patience 🫡
                </motion.p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => {
                    setDebugOpen((d) => !d);
                    setMascotExpr("proud");
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-5 w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-500 transition-colors hover:border-emerald-900/40 hover:text-emerald-400/70 sm:text-sm"
                >
                  {debugOpen ? "hide debug logs" : "view debug logs"}
                </motion.button>

                <AnimatePresence>
                  {debugOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2 rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                        <p className="mb-2 text-xs tracking-wider text-emerald-600/70 sm:text-sm">
                          Bug fixed
                        </p>
                        {DEBUG_LOGS.map((entry, i) => (
                          <motion.p
                            key={entry}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="text-xs text-neutral-400 sm:text-sm"
                          >
                            <span className="text-emerald-600/60">[✓]</span>{" "}
                            {entry}
                          </motion.p>
                        ))}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 }}
                          className="mt-4 flex items-start gap-3 border-t border-neutral-800/50 pt-4 text-xs leading-relaxed text-amber-700/60 sm:text-sm"
                        >
                          <HimMascot expression="overheating" size="sm" />
                          <span>
                            warning:
                            <br />
                            alcohol-related decision making still slightly
                            unstable 🍺
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {hiddenOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden rounded-lg border border-neutral-800/30 bg-black/30 p-4"
                    >
                      <p className="mb-3 text-xs tracking-wider text-neutral-500 sm:text-sm">
                        hidden system logs 📂
                      </p>
                      {HIDDEN_LOGS.map((log, i) => (
                        <motion.p
                          key={log.type}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.12 }}
                          className="text-xs leading-relaxed text-neutral-500 sm:text-sm"
                        >
                          <span
                            className={
                              log.tone === "warning"
                                ? "text-amber-700/70"
                                : log.tone === "error"
                                ? "text-rose-700/60"
                                : log.tone === "status"
                                ? "text-emerald-700/60"
                                : "text-neutral-600"
                            }
                          >
                            {log.type}:
                          </span>{" "}
                          {log.text}
                        </motion.p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-950/90 to-transparent" />
          </div>
        </div>

        <AnimatePresence>
          {canContinue && discoveredCount >= 1 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={onContinue}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mx-auto mt-4 shrink-0 text-sm text-neutral-500 transition-colors hover:text-emerald-400/70"
            >
              continue →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <button
        type="button"
        onClick={handleFooterTap}
        className="pointer-events-auto fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 text-center"
      >
        <p className="text-[9px] tracking-widest text-neutral-800 transition-colors hover:text-neutral-700">
          him.exe · build 1.0.3 · 2026
        </p>
      </button>
    </>
  );
}

function AmbientHum() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let gain: GainNode | null = null;

    try {
      ctx = new AudioContext();
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 55;
      gain.gain.value = 0.006;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    } catch {
      /* audio unavailable */
    }

    return () => {
      osc?.stop();
      ctx?.close();
    };
  }, []);

  return null;
}

export default function PatchNotesExperience() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const playTick = useTypingSound(true);

  const handleSubmitConfig = useCallback(async () => {
    if (!selectedDate || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitEventConfig({
      date: selectedDate,
      viewingMode: "cinema",
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setPhase("final");
  }, [selectedDate, submitting]);

  const showFooter = phase !== "main" && phase !== "exit";

  return (
    <>
      <AnimatePresence>
        {submitError && (
          <Toast
            message={`ERROR: failed to save — ${submitError}`}
            onDone={() => setSubmitError(null)}
          />
        )}
      </AnimatePresence>

      <div className="scanline terminal-flicker relative min-h-dvh overflow-hidden bg-[#050505]">
      <div className="ambient-glow pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(110,231,160,0.06),transparent_60%)]" />
      <FloatingParticles />
      <AmbientHum />

      <div className="relative z-10 flex h-dvh w-full items-stretch justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "boot" && (
            <BootScreen
              key="boot"
              onOpenChangelog={() => setPhase("main")}
              playTick={playTick}
            />
          )}
          {phase === "main" && (
            <motion.div
              key="main"
              className="flex h-dvh w-full flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <PatchNotesCard onContinue={() => setPhase("setup")} />
            </motion.div>
          )}
          {phase === "setup" && (
            <EventSetupScreen
              key="setup"
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSubmit={handleSubmitConfig}
              submitting={submitting}
            />
          )}
          {phase === "final" && (
            <FinalScreen
              key="final"
              onRereadChangelog={() => setPhase("main")}
              onExit={() => setPhase("exit")}
            />
          )}
        </AnimatePresence>
        {phase === "exit" && <ExitScreen key="exit" />}
      </div>

      {showFooter && (
        <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 text-center">
          <p className="text-[9px] tracking-widest text-neutral-800">
            him.exe · build 1.0.3 · 2026
          </p>
        </div>
      )}
    </div>
    </>
  );
}
