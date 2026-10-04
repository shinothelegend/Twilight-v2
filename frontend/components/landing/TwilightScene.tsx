"use client";

import {useEffect, useRef} from "react";
import {BranchSilhouette} from "@/components/landing/BranchSilhouette";
import {MoonDisc} from "@/components/landing/MoonDisc";
import {EveningStar} from "@/components/landing/EveningStar";

function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0xffff_ffff;
  };
}

function makeStars(count: number) {
  const next = makeRandom(0x5eed_1a37);
  return Array.from({length: count}, (_, index) => ({
    id: index,
    left: next() * 100,
    top: next() * 72,
    size: 0.7 + next() * 1.7,
    duration: 4 + next() * 8,
    delay: next() * 9,
    baseOpacity: 0.2 + next() * 0.5,
  }));
}

function makeShootingStars(count: number) {
  const next = makeRandom(0x1c3f_a5d1);
  return Array.from({length: count}, (_, index) => ({
    id: index,
    left: next() * 55,
    top: 4 + next() * 34,
    width: 60 + next() * 70,
    duration: 17 + next() * 16,
    delay: next() * 26,
  }));
}

const STARS = makeStars(64);
const SHOOTING_STARS = makeShootingStars(3);

export function TwilightScene({
  variant = "landing",
  showMoon = true,
}: {
  variant?: "landing" | "app";
  showMoon?: boolean;
}) {
  const dim = variant === "app";
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Disable on touch devices and respects reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReducedMotion) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const {innerWidth, innerHeight} = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      if (sceneRef.current) {
        sceneRef.current.style.setProperty("--px", currentX.toFixed(4));
        sceneRef.current.style.setProperty("--py", currentY.toFixed(4));
      }

      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        perspective: "1200px",
        "--px": "0",
        "--py": "0",
      } as React.CSSProperties}
    >
      {/* Z0: Sky */}
      <div 
        className="absolute inset-0 bg-night-900"
        style={{ transform: "translateZ(0px)" }}
      />
      <div
        className="anim-sky absolute inset-[-10%]"
        style={{
          background: "radial-gradient(120% 80% at 50% 26%, #121625 0%, #0d0f17 34%, #090a0f 70%, #06070a 100%)",
          opacity: dim ? 0.72 : 1,
          transform: "translateZ(0px)",
        }}
      />

      {/* Z20: Far mist */}
      <div
        className="anim-mist-far absolute inset-[-15%]"
        style={{
          background: "radial-gradient(45% 30% at 22% 62%, rgba(150,150,160,0.10) 0%, rgba(150,150,160,0) 70%), radial-gradient(50% 26% at 78% 48%, rgba(140,140,152,0.09) 0%, rgba(140,140,152,0) 72%)",
          transform: "translate3d(calc(var(--px) * -10px), calc(var(--py) * -10px), 20px)",
        }}
      />

      {/* Z45: Star field */}
      <div
        className="anim-star-drift absolute inset-[-4%]"
        style={{
          opacity: dim ? 0.5 : 1,
          transform: "translate3d(calc(var(--px) * -20px), calc(var(--py) * -20px), 45px)",
        }}
      >
        {STARS.map((star) => (
          <span
            key={star.id}
            className="anim-star absolute rounded-full bg-glow"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.baseOpacity,
              "--star-duration": `${star.duration}s`,
              "--star-delay": `${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        {SHOOTING_STARS.map((shot) => (
          <span
            key={`shot-${shot.id}`}
            className="anim-shoot absolute h-px origin-left"
            style={{
              left: `${shot.left}%`,
              top: `${shot.top}%`,
              width: `${shot.width}px`,
              background: "linear-gradient(90deg, rgba(245,243,238,0) 0%, rgba(245,243,238,0.85) 88%, rgba(245,243,238,1) 100%)",
              "--shoot-duration": `${shot.duration}s`,
              "--shoot-delay": `${shot.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Z70: Near mist */}
      <div
        className="anim-mist-near absolute inset-[-15%]"
        style={{
          background: "radial-gradient(60% 34% at 50% 78%, rgba(168,168,178,0.13) 0%, rgba(168,168,178,0) 68%), radial-gradient(38% 22% at 12% 40%, rgba(150,150,162,0.08) 0%, rgba(150,150,162,0) 74%)",
          transform: "translate3d(calc(var(--px) * -30px), calc(var(--py) * -30px), 70px)",
        }}
      />

      {/* Z90: Evening Star (or Moon) */}
      <div className="absolute inset-0" style={{ transform: "translate3d(calc(var(--px) * -40px), calc(var(--py) * -40px), 90px)" }}>
        {!dim && !showMoon && <EveningStar />}
        {!dim && showMoon && (
          <div className="absolute top-[4%] left-1/2 -translate-x-1/2">
            <MoonDisc size={300} />
          </div>
        )}
        {dim && (
          <div
            className="anim-halo absolute -top-[22%] left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245,243,238,0.16) 0%, rgba(245,243,238,0.05) 40%, rgba(245,243,238,0) 68%)",
            }}
          />
        )}
      </div>

      {/* Z110: Far branches */}
      <div
        className="anim-sway absolute -top-12 -right-12 w-[46vw] max-w-[560px] min-w-[280px]"
        style={{
          animationDelay: "-13s",
          transform: "translate3d(calc(var(--px) * -50px), calc(var(--py) * -50px), 110px)",
        }}
      >
        <BranchSilhouette side="right" className="h-auto w-full" opacity={dim ? 0.6 : 0.92} />
      </div>

      {/* Z120: Near branches */}
      <div
        className="anim-sway absolute -top-8 -left-10 w-[52vw] max-w-[620px] min-w-[320px]"
        style={{
          transform: "translate3d(calc(var(--px) * -60px), calc(var(--py) * -60px), 120px)",
        }}
      >
        <BranchSilhouette side="left" className="h-auto w-full" opacity={dim ? 0.7 : 1} />
      </div>

      {/* Ground haze */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: "linear-gradient(to top, #08080a 0%, rgba(8,8,10,0.7) 34%, rgba(8,8,10,0) 100%)",
          transform: "translateZ(130px)",
        }}
      />
    </div>
  );
}
