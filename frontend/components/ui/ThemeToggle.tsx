"use client";

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

export function ThemeToggle() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-xl border border-edge/50" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-edge text-muted transition-colors hover:border-muted hover:text-ink"
      aria-label="Toggle theme"
    >
      {isDark ? "☾" : "☀"}
    </button>
  );
}
