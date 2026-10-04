"use client";

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

export function ThemeTransition() {
  const {resolvedTheme} = useTheme();
  const [prevTheme, setPrevTheme] = useState<string | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (resolvedTheme && prevTheme && resolvedTheme !== prevTheme) {
      // Only transition if prefers-reduced-motion is false
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
        setPrevTheme(resolvedTheme);
        return () => clearTimeout(timer);
      }
    }
    setPrevTheme(resolvedTheme);
  }, [resolvedTheme, prevTheme]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{opacity: 0, backdropFilter: "blur(0px)"}}
          animate={{opacity: 1, backdropFilter: "blur(12px)"}}
          exit={{opacity: 0, backdropFilter: "blur(0px)"}}
          transition={{duration: 0.5, ease: "easeInOut"}}
          className="fixed inset-0 z-[100] bg-night-900/40 pointer-events-none flex items-center justify-center"
        >
          {/* Subtle flare indicating transition */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="w-[200vw] h-[200vh] bg-[radial-gradient(circle_at_center,rgba(255,245,235,0.15)_0%,transparent_50%)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
