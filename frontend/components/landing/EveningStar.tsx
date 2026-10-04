"use client";

import React from "react";
import {motion} from "framer-motion";

export function EveningStar() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[90]">
      <motion.div
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [0.98, 1.02, 0.98],
          filter: [
            "drop-shadow(0 0 40px rgba(255,245,235,0.4))",
            "drop-shadow(0 0 60px rgba(255,245,235,0.6))",
            "drop-shadow(0 0 40px rgba(255,245,235,0.4))",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Soft radial halo */}
        <div className="absolute h-64 w-64 rounded-full bg-white/5 blur-[60px]" />
        
        {/* Subtle warm glow */}
        <div className="absolute h-32 w-32 rounded-full bg-[#FFF5EB]/20 blur-[30px]" />
        
        {/* Horizontal diffraction spike */}
        <div className="absolute h-[1px] w-[300px] bg-gradient-to-r from-transparent via-[#FFF5EB]/40 to-transparent" />
        
        {/* Vertical diffraction spike */}
        <div className="absolute h-[300px] w-[1px] bg-gradient-to-b from-transparent via-[#FFF5EB]/40 to-transparent" />
        
        {/* Tight bright core */}
        <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#FFF5EB]" />
      </motion.div>
    </div>
  );
}
