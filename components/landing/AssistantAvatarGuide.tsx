"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type GuideStep = {
  targetId: string;
  title: string;
  description: string;
};

// One stop per real landing section (ids added directly on each section's
// ScrollReveal wrapper) so "guide the user through key features" walks the
// actual page rather than a fabricated/separate tour surface.
const STEPS: GuideStep[] = [
  {
    targetId: "hero",
    title: "Welcome",
    description: "This week's picks, drag the card stack or just keep scrolling to explore.",
  },
  {
    targetId: "categories",
    title: "Shop by category",
    description: "Whole, ground, blended, or ready-made spices — grouped so you can jump straight in.",
  },
  {
    targetId: "spotlight",
    title: "Featured this week",
    description: "A closer look at one standout product, straight from the current catalog.",
  },
  {
    targetId: "collection",
    title: "Our collection",
    description: "Browse the full lineup, add anything to your cart in one click.",
  },
  {
    targetId: "why-us",
    title: "Quality you can taste",
    description: "What makes the sourcing and packing different — worth a quick read.",
  },
  {
    targetId: "explore",
    title: "Ready when you are",
    description: "Head to the shop to start building your order.",
  },
];

const HINT_SEEN_KEY = "assistant-guide-hint-seen";
const AUTOPLAY_SEEN_KEY = "assistant-guide-autoplayed-seen";
const HIGHLIGHT_MS = 1600;
const IDLE_TRIGGER_MS = 5000;
const AUTO_ADVANCE_MS = 3800;

// Broad set for detecting "is the visitor idle at all" — used to (re)arm the
// 5s auto-walkthrough timer. Deliberately includes mousemove: any sign of
// life should keep delaying an unsolicited tour.
const IDLE_RESET_EVENTS = ["mousemove", "scroll", "keydown", "wheel", "touchstart", "pointerdown"] as const;
// Narrower set for cancelling an already-running auto-walkthrough. Excludes
// mousemove (too noisy — incidental cursor drift shouldn't kill a tour the
// user hasn't even registered yet) and scroll (the tour's own
// highlight()-driven scrollIntoView fires a native "scroll" event with no
// way to tell it apart from a user-initiated one, which would make the tour
// cancel itself the instant it tried to scroll to step two).
const AUTOPLAY_CANCEL_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

type RingRect = { top: number; left: number; width: number; height: number };

/**
 * Floating bottom-right avatar (UIX-09-style entry point) that walks the
 * visitor through the landing page's real sections rather than a fake
 * "assistant" — clicking a step scrolls to and briefly highlights the
 * matching section already on the page. No new dependencies: built on
 * Framer Motion (already used sitewide) and a plain fixed-position button.
 * Landing-page only (rendered from app/(shop)/page.tsx), never on
 * checkout/admin per FRONTEND_RULES.md §16's "don't animate checkout".
 */
export function AssistantAvatarGuide() {
  const shouldReduceMotion = useReducedMotion();
  const [showHint, setShowHint] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [ringRect, setRingRect] = useState<RingRect | null>(null);
  const [ringVisible, setRingVisible] = useState(false);
  const ringTimeouts = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimeout = useRef<number | null>(null);
  // Bumped on every highlight() call so a scrollend/fallback callback from a
  // step the user has since clicked past (e.g. clicking Next again before
  // the previous step's scroll settled) is a no-op instead of clobbering
  // the current step's ring with stale target/position data.
  const highlightToken = useRef(0);

  useEffect(() => {
    if (sessionStorage.getItem(HINT_SEEN_KEY)) return;
    const showTimer = window.setTimeout(() => setShowHint(true), 1800);
    const hideTimer = window.setTimeout(() => dismissHint(), 8000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    return () => {
      ringTimeouts.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Arms a 5s "visitor is idle" timer that auto-starts the walkthrough once,
  // the first time this session no one touches the page. Any sign of life
  // (mousemove/scroll/key/wheel/touch/click) pushes it back out, same as a
  // standard idle-timeout. Skips entirely once the tour has been seen or
  // used this session (manually or automatically) and while reduced motion
  // is requested — an unsolicited auto-scrolling tour is the opposite of
  // "doesn't interrupt" for a visitor who's asked for less motion.
  useEffect(() => {
    if (shouldReduceMotion || isOpen || sessionStorage.getItem(AUTOPLAY_SEEN_KEY)) return;

    const resetIdleTimer = () => {
      if (idleTimeout.current) window.clearTimeout(idleTimeout.current);
      idleTimeout.current = window.setTimeout(startAutoPlay, IDLE_TRIGGER_MS);
    };

    resetIdleTimer();
    IDLE_RESET_EVENTS.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    return () => {
      IDLE_RESET_EVENTS.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
      if (idleTimeout.current) window.clearTimeout(idleTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, shouldReduceMotion]);

  // Drives the auto-advance while a tour is playing unattended: dwell on
  // each step, then move on — or, on the last step, close gracefully rather
  // than sitting there waiting for a click that may never come. Re-running
  // this effect on every stepIndex change (and cleaning up the previous
  // timer) is what makes a manual Back/Next click — which also changes
  // stepIndex — correctly reset the dwell clock instead of firing early.
  useEffect(() => {
    if (!isAutoPlaying) return;
    const isLast = stepIndex === STEPS.length - 1;
    const timer = window.setTimeout(() => {
      if (isLast) {
        closeGuide();
      } else {
        goTo(stepIndex + 1);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying, stepIndex]);

  // The moment the visitor does anything real elsewhere on the page while
  // the tour is auto-playing, get out of the way immediately — a tour that
  // keeps talking while someone's already clicked into a product is the
  // "interrupting" this feature is explicitly meant to avoid. Clicks on the
  // tour's own controls (Back/Next/Close) are handled by those buttons
  // directly, not here, since deliberately engaging with the tour should
  // hand over manual control rather than close it.
  useEffect(() => {
    if (!isAutoPlaying) return;
    const handleOutsideInteraction = (event: Event) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      closeGuide();
    };
    AUTOPLAY_CANCEL_EVENTS.forEach((ev) => window.addEventListener(ev, handleOutsideInteraction, { passive: true }));
    return () => {
      AUTOPLAY_CANCEL_EVENTS.forEach((ev) => window.removeEventListener(ev, handleOutsideInteraction));
    };
  }, [isAutoPlaying]);

  function dismissHint() {
    setShowHint(false);
    sessionStorage.setItem(HINT_SEEN_KEY, "1");
  }

  function clearRingTimeouts() {
    ringTimeouts.current.forEach((id) => window.clearTimeout(id));
    ringTimeouts.current = [];
  }

  function highlight(targetId: string) {
    const el = document.getElementById(targetId);
    if (!el) return;

    const token = ++highlightToken.current;
    clearRingTimeouts();
    setRingVisible(false);
    setRingRect(null);

    // The ring is a self-owned overlay (state-driven, positioned via
    // getBoundingClientRect) rather than a class toggled directly on the
    // section's own DOM node — every landing section is itself a
    // Framer-Motion-animated element (ScrollReveal's whileInView), and a
    // manually-mutated classList there gets silently wiped the next time
    // that section re-renders. It's a plain CSS opacity transition, not
    // Framer Motion: mounted "invisible" first, then flipped visible a
    // tick later so the transition actually runs (a plain conditional mount
    // would just appear instantly with no fade). A short setTimeout does
    // that tick rather than requestAnimationFrame — rAF callbacks are
    // suspended for backgrounded/hidden documents, and a step forward
    // shouldn't silently lose its ring just because the tab lost focus.
    let rung = false;
    const applyRing = () => {
      if (rung || token !== highlightToken.current) return;
      rung = true;
      const rect = el.getBoundingClientRect();
      setRingRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      ringTimeouts.current.push(
        window.setTimeout(() => {
          if (token === highlightToken.current) setRingVisible(true);
        }, 20),
      );
      ringTimeouts.current.push(
        window.setTimeout(() => {
          if (token !== highlightToken.current) return;
          setRingVisible(false);
          ringTimeouts.current.push(window.setTimeout(() => setRingRect(null), 300));
        }, HIGHLIGHT_MS),
      );
    };

    // Ring only once the section is actually in view — a fixed delay would
    // fire it mid-scroll on longer sections (categories/why-us sit far down
    // the page). "scrollend" (Chrome/Edge) reports true arrival; a flat
    // delay is the fallback (older browsers, or the rare case scrollend
    // never fires for a given scroll). Both are safe to leave live even
    // after being superseded — the token check above makes a late one inert.
    el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });

    if (!shouldReduceMotion) {
      window.addEventListener("scrollend", applyRing, { once: true });
    }
    window.setTimeout(applyRing, shouldReduceMotion ? 0 : 900);
  }

  function beginTour() {
    // Seen/used this session either way — an auto-tour that reappears every
    // time the visitor pauses for 5s would stop feeling premium fast.
    sessionStorage.setItem(AUTOPLAY_SEEN_KEY, "1");
    dismissHint();
    setIsOpen(true);
    setStepIndex(0);
    highlight(STEPS[0].targetId);
  }

  function openGuide() {
    setIsAutoPlaying(false);
    beginTour();
  }

  function startAutoPlay() {
    setIsAutoPlaying(true);
    beginTour();
  }

  function goTo(nextIndex: number) {
    setStepIndex(nextIndex);
    highlight(STEPS[nextIndex].targetId);
  }

  function goToManually(nextIndex: number) {
    setIsAutoPlaying(false);
    goTo(nextIndex);
  }

  function closeGuide() {
    setIsOpen(false);
    setIsAutoPlaying(false);
  }

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <>
      {ringRect && (
        <div
          aria-hidden
          className={`pointer-events-none fixed z-40 rounded-2xl ring-1 ring-brand-400/60 transition-opacity duration-300 ${
            ringVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ top: ringRect.top, left: ringRect.left, width: ringRect.width, height: ringRect.height }}
        />
      )}

      <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="dialog"
              aria-label="Guided tour"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.96 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, ease: "easeOut" }}
              className="w-72 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={closeGuide}
                  aria-label="Close guide"
                  className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Framer Motion's AnimatePresence exit/re-enter choreography (mode="wait"/"popLayout")
                  never resolved its exit on this key-cycling text swap under this project's
                  React 19 + framer-motion 13 pairing — the outgoing node stayed mounted
                  indefinitely. A plain keyed motion.div sidesteps that: React swaps the node
                  immediately on key change, and it still fades/slides in via initial->animate. */}
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </motion.div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.targetId}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i === stepIndex ? "bg-brand-500" : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => goToManually(stepIndex - 1)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Back
                    </button>
                  )}
                  {isLastStep ? (
                    <Link
                      href="/shop"
                      onClick={closeGuide}
                      className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                      Start shopping
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goToManually(stepIndex + 1)}
                      className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.25 }}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 py-2 pl-4 pr-2 text-sm text-zinc-700 shadow-lg shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-200"
            >
              Need help finding something?
              <button
                type="button"
                onClick={dismissHint}
                aria-label="Dismiss hint"
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => (isOpen ? closeGuide() : openGuide())}
          aria-label={isOpen ? "Close guided tour" : "Open guided tour"}
          aria-expanded={isOpen}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-900/30"
        >
          {!isOpen && !shouldReduceMotion && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-brand-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span className="relative">
            {isOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c-4 0-7 2.7-7 6.5 0 1.8.7 3.4 1.9 4.6L6 18l3.4-1.3c.8.2 1.6.3 2.6.3 4 0 7-2.7 7-6.5S16 3 12 3Z"
                />
                <circle cx="9.5" cy="9.7" r="1" fill="currentColor" stroke="none" />
                <circle cx="14.5" cy="9.7" r="1" fill="currentColor" stroke="none" />
              </svg>
            )}
          </span>
        </motion.button>
      </div>
    </>
  );
}
