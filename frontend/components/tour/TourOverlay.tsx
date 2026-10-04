"use client";

import {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {useTour} from "./TourContext";

export function useTourAnchor() {
  const {steps, currentStepIndex} = useTour();
  const step = steps[currentStepIndex];
  
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (!step) return;

    const update = () => {
      let target: HTMLElement | null = null;
      let anchorMatched = step.anchor;

      if (step.anchor) {
        target = document.querySelector(step.anchor) as HTMLElement;
      }
      if (!target && step.fallbackAnchor) {
        target = document.querySelector(step.fallbackAnchor) as HTMLElement;
        anchorMatched = step.fallbackAnchor;
      }

      if (target) {
        setRect(target.getBoundingClientRect());
        setActiveAnchor(anchorMatched);
      } else {
        setRect(null);
        setActiveAnchor(null);
      }
    };

    update();
    // Re-check periodically in case React renders it slightly later
    const interval = setInterval(update, 200);

    window.addEventListener("scroll", update, {passive: true});
    window.addEventListener("resize", update, {passive: true});

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [step]);

  return {rect, activeAnchor, step};
}

export function TourOverlay() {
  const {rect, activeAnchor} = useTourAnchor();
  
  if (!rect) return null;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden">
      <motion.div
        layout
        initial={false}
        animate={{
          x: rect.left - 8,
          y: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        }}
        transition={{type: "spring", bounce: 0.2, duration: 0.6}}
        className="absolute rounded-2xl shadow-[0_0_0_200vmax_rgba(5,6,10,0.72)]"
      >
        {/* The Arrow */}
        <motion.div
          animate={{ x: [-4, 4, -4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -left-8 -translate-y-1/2 text-glow"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
