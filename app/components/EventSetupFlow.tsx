"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import HimMascot, { type MascotExpression } from "./HimMascot";

const spring = { type: "spring" as const, stiffness: 140, damping: 22 };
const softSpring = { type: "spring" as const, stiffness: 100, damping: 18 };

function ScreenShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto flex h-dvh w-full max-w-md flex-col px-4 pb-[max(4.5rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-lg sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+2rem)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function TerminalCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="ui-drift flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-6 shadow-[0_0_48px_rgba(110,231,160,0.08)] backdrop-blur-sm sm:p-7">
      {children}
    </div>
  );
}

function formatChipDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function EventSetupScreen({
  selectedDate,
  onSelectDate,
  onSubmit,
  submitting = false,
}: {
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  onSubmit: (mode: "cinema") => void | Promise<void>;
  submitting?: boolean;
}) {
  const [onlineState, setOnlineState] = useState<
    "idle" | "loading" | "crashed"
  >("idle");
  const [onlineDisabled, setOnlineDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cinemaSelected, setCinemaSelected] = useState(false);
  const [mascotExpr, setMascotExpr] = useState<MascotExpression>("nervous");
  const [loadProgress, setLoadProgress] = useState(0);

  const chips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return { iso: d.toISOString().slice(0, 10), label: formatChipDate(d) };
    });
  }, []);

  const handleOnline = () => {
    if (onlineDisabled || onlineState !== "idle") return;
    setOnlineState("loading");
    setLoadProgress(0);
    setMascotExpr("buffering");

    const progressInterval = setInterval(() => {
      setLoadProgress((p) => Math.min(p + 18, 92));
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadProgress(100);
      setOnlineState("crashed");
      setMascotExpr("overheating");
    }, 1600);

    setTimeout(() => {
      setShowModal(true);
      setOnlineDisabled(true);
      setMascotExpr("embarrassed");
    }, 2000);
  };

  const handleCinema = () => {
    setCinemaSelected(true);
    setMascotExpr("proud");
  };

  const canSubmit = selectedDate && cinemaSelected && !submitting;

  return (
    <>
      <AnimatePresence>
        {showModal && <OnlineCrashModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <ScreenShell>
        <TerminalCard>
          <div className="relative min-h-0 flex-1">
            <div className="card-scroll h-full max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-y-contain">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-emerald-400/80 sm:text-base">
                    Software fixing date selection 📅
                  </p>
                  <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                    when should we go out? ✨
                  </p>
                </div>
                <HimMascot expression={mascotExpr} size="sm" />
              </div>

              <div className="mt-6 h-px bg-neutral-800" />

              <div className="mt-6 flex flex-wrap gap-2">
                {chips.map((chip, i) => {
                  const selected = selectedDate === chip.iso;
                  return (
                    <motion.button
                      key={chip.iso}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, ...spring }}
                      onClick={() => onSelectDate(chip.iso)}
                      whileTap={{ scale: 0.96 }}
                      className={`rounded-lg border px-3 py-2 text-xs transition-all sm:text-sm ${
                        selected
                          ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-300 shadow-[0_0_16px_rgba(110,231,160,0.1)]"
                          : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {chip.label}
                    </motion.button>
                  );
                })}
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                  or pick a date
                </span>
                <input
                  type="date"
                  value={selectedDate ?? ""}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) =>
                    e.target.value && onSelectDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-black/40 px-3 py-2.5 text-sm text-neutral-300 [color-scheme:dark] focus:border-emerald-900/50 focus:outline-none"
                />
              </label>

              <div className="mt-8 h-px bg-neutral-800" />

              <div className="mt-8">
                <p className="text-sm text-emerald-400/80 sm:text-base">
                  Movie mode selection 🎬
                </p>
                <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                  please choose preferred movie experience.
                </p>
              </div>

              <div className="mt-5 space-y-3 pb-2">
                <motion.button
                  type="button"
                  disabled={onlineDisabled}
                  onClick={handleOnline}
                  animate={
                    onlineState === "crashed"
                      ? { x: [0, -3, 3, -2, 2, 0], opacity: [1, 0.7, 1] }
                      : {}
                  }
                  transition={{ duration: 0.35 }}
                  whileTap={!onlineDisabled ? { scale: 0.98 } : undefined}
                  className={`relative w-full overflow-hidden rounded-lg border px-4 py-4 text-left text-sm transition-all ${
                    onlineDisabled
                      ? "cursor-not-allowed border-neutral-800/60 bg-neutral-900/20 text-neutral-700 line-through"
                      : onlineState === "loading"
                      ? "border-amber-900/40 bg-amber-950/10 text-amber-600/70"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {onlineState === "loading" ? (
                    <span className="flex items-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block h-3.5 w-3.5 rounded-full border border-amber-600/40 border-t-amber-500"
                      />
                      processing online mode...
                    </span>
                  ) : (
                    "[ online ]"
                  )}
                  {onlineState === "loading" && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-900">
                      <motion.div
                        className="h-full bg-amber-600/40"
                        animate={{ width: `${loadProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleCinema}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={
                    cinemaSelected
                      ? {
                          boxShadow: [
                            "0 0 16px rgba(110,231,160,0.08)",
                            "0 0 28px rgba(110,231,160,0.15)",
                            "0 0 16px rgba(110,231,160,0.08)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className={`w-full rounded-lg border px-4 py-4 text-left text-sm transition-colors ${
                    cinemaSelected
                      ? "border-emerald-700/50 bg-emerald-950/25 text-emerald-300"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-emerald-900/30"
                  }`}
                >
                  [ cinema ] {cinemaSelected && "✨"}
                </motion.button>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-950/90 to-transparent" />
          </div>
        </TerminalCard>

        <motion.button
          type="button"
          disabled={!canSubmit}
          onClick={() => void onSubmit("cinema")}
          whileHover={canSubmit ? { scale: 1.03 } : undefined}
          whileTap={canSubmit ? { scale: 0.97 } : undefined}
          className="mx-auto mt-5 shrink-0 rounded-lg border px-6 py-3 text-sm transition-colors disabled:border-neutral-800 disabled:text-neutral-700 enabled:border-emerald-900/40 enabled:bg-emerald-950/20 enabled:text-emerald-400/80 enabled:hover:border-emerald-700/50"
        >
          {submitting ? "uploading configuration..." : "[ submit configuration ]"}
        </motion.button>
      </ScreenShell>
    </>
  );
}

function OnlineCrashModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={softSpring}
        onClick={(e) => e.stopPropagation()}
        className="glitch-shake w-full max-w-sm rounded-xl border border-amber-900/50 bg-neutral-950 p-5 shadow-[0_0_32px_rgba(251,191,36,0.08)]"
      >
        <p className="text-sm text-amber-600/90">WARNING ⚠️</p>
        <p className="mt-4 text-xs leading-relaxed text-neutral-400 sm:text-sm">
          online mode is currently unavailable.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500 sm:text-sm">
          reason:
          <br />
          this build performs significantly better in real life 😭
        </p>
        <p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
          please contact the manufacturer for future updates.
        </p>
        <motion.button
          type="button"
          onClick={onClose}
          whileTap={{ scale: 0.97 }}
          className="mt-5 w-full rounded-lg border border-neutral-800 py-2.5 text-xs text-neutral-500 hover:text-neutral-400"
        >
          acknowledge
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function FinalScreen({
  onRereadChangelog,
  onExit,
}: {
  onRereadChangelog: () => void;
  onExit: () => void;
}) {
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAsleep(true), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScreenShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-emerald-400/80"
        >
          configuration saved successfully ✨
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-neutral-500 sm:text-sm"
        >
          thank you for your patience with him.exe 🫡
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-neutral-500 sm:text-sm"
        >
          wishing you a very nice day 🌙
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, ...softSpring }}
          className="mt-2"
        >
          <HimMascot expression="sleepy" size="lg" asleep={asleep} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-6 flex w-full max-w-xs flex-col gap-3"
        >
          <motion.button
            type="button"
            onClick={onRereadChangelog}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg border border-neutral-800 py-3 text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-400 sm:text-sm"
          >
            [ reread changelog ]
          </motion.button>
          <motion.button
            type="button"
            onClick={onExit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg border border-neutral-800/80 py-3 text-xs text-neutral-600 hover:text-neutral-500 sm:text-sm"
          >
            [ exit system ]
          </motion.button>
        </motion.div>
      </div>
    </ScreenShell>
  );
}

export function ExitScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-black"
    />
  );
}
