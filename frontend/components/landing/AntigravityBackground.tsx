"use client";

import React, {useEffect, useRef} from "react";

interface StardustParticle {
  x: number;
  y: number;
  baseSpeedY: number;
  speedX: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  forceX: number;
  forceY: number;
  parallaxFactor: number;
}

interface StarStreak {
  x: number;
  y: number;
  speedY: number;
  length: number;
  width: number;
  alpha: number;
  decay: number;
}

interface FallingStar {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  length: number;
  width: number;
  alpha: number;
  decay: number;
}

interface StarSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
}

export function AntigravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef(0);
  const heightRef = useRef(0);

  // Mouse tracking references
  const mouseRef = useRef({x: -1000, y: -1000, active: false});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: StardustParticle[] = [];
    let streaks: StarStreak[] = [];
    let fallingStars: FallingStar[] = [];
    let sparks: StarSpark[] = [];

    // Visual configurations
    const isMobile = () => window.innerWidth < 768;
    const maxParticles = isMobile() ? 40 : 120;
    const maxStreaks = isMobile() ? 1 : 3;
    const maxFallingStars = isMobile() ? 1 : 2;
    const forceRadius = 120; // Cursor interaction distance
    const pushStrength = 2.5; // Repulsion strength

    // Resize handler with High-DPI support
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      widthRef.current = rect.width;
      heightRef.current = rect.height;

      // Re-initialize particles to fit the new size
      initParticles();
    };

    const initParticles = () => {
      const w = widthRef.current || window.innerWidth;
      const h = heightRef.current || window.innerHeight;
      particles = Array.from({length: maxParticles}, () => {
        const baseOpacity = 0.2 + Math.random() * 0.6;
        const parallaxFactor = 0.3 + Math.random() * 0.7; // Closer particles move faster
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          baseSpeedY: -(0.25 + Math.random() * 0.45) * parallaxFactor,
          speedX: (Math.random() - 0.5) * 0.15,
          radius: (0.5 + Math.random() * 1.25) * parallaxFactor,
          opacity: baseOpacity,
          baseOpacity,
          forceX: 0,
          forceY: 0,
          parallaxFactor,
        };
      });
      streaks = [];
      fallingStars = [];
      sparks = [];
    };

    // Initialize dimensions and particles
    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse inputs
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          active: true,
        };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, {passive: true});
    window.addEventListener("touchend", handleTouchEnd);

    let lastTime = performance.now();

    // Main animation loop
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.666, 4); // Clamp dt to prevent jumps on tab focus loss
      lastTime = time;

      const w = widthRef.current;
      const h = heightRef.current;

      ctx.clearRect(0, 0, w, h);

      // 0. Update and draw Star Sparks (meteor exhaust trail)
      sparks = sparks.filter((sp) => {
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.alpha -= sp.decay * dt;

        if (sp.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 243, 238, ${sp.alpha})`;
        ctx.fill();

        return true;
      });

      // 1. Draw and update Ambient Stardust
      particles.forEach((p) => {
        // Cursor force physics
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            // Push away from cursor
            const angle = Math.atan2(dy, dx);
            const repelStrength = force * pushStrength * p.parallaxFactor;

            // Apply acceleration forces
            p.forceX += Math.cos(angle) * repelStrength;
            p.forceY += Math.sin(angle) * repelStrength;
          }
        }

        // Apply friction/dampening to dynamic forces
        p.forceX *= 0.92;
        p.forceY *= 0.92;

        // Update position
        p.x += (p.speedX + p.forceX) * dt;
        // Float upward (negative Y)
        p.y += (p.baseSpeedY + p.forceY) * dt;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
          p.forceX = 0;
          p.forceY = 0;
        }
        if (p.x < -10) {
          p.x = w + 10;
        } else if (p.x > w + 10) {
          p.x = -10;
        }

        // Subtle twinkling based on Y position and random drift
        p.opacity = p.baseOpacity * (0.8 + Math.sin(time * 0.002 + p.y * 0.01) * 0.2);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 243, 238, ${p.opacity})`;
        ctx.fill();
      });

      // 2. Spawn and update Star Streaks (Upward meteors)
      if (streaks.length < maxStreaks && Math.random() < 0.008 * dt) {
        streaks.push({
          x: Math.random() * w,
          y: h + 50,
          speedY: -(3.5 + Math.random() * 5.0),
          length: 50 + Math.random() * 80,
          width: 0.75 + Math.random() * 0.75,
          alpha: 0.1,
          decay: 0.008 + Math.random() * 0.012,
        });
      }

      streaks = streaks.filter((s) => {
        // Star streaks rise and fade out
        s.y += s.speedY * dt;
        s.alpha -= s.decay * dt;

        if (s.alpha <= 0 || s.y < -s.length) {
          return false;
        }

        // Soft fade-in at first, then decay
        if (s.y > h - 100 && s.alpha < 0.6) {
          s.alpha += 0.08 * dt;
        }

        // Draw upward streak (fade tail at bottom)
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y - s.length);
        grad.addColorStop(0, "rgba(245, 243, 238, 0)");
        grad.addColorStop(0.2, `rgba(245, 243, 238, ${s.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha})`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y - s.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Spawn trail sparks at the head of the upward streak
        if (Math.random() < 0.25 * dt) {
          sparks.push({
            x: s.x,
            y: s.y - s.length,
            vx: (Math.random() - 0.5) * 0.4,
            vy: s.speedY * 0.2 + (Math.random() - 0.5) * 0.3,
            radius: 0.35 + Math.random() * 0.6,
            alpha: s.alpha * 0.6,
            decay: 0.02 + Math.random() * 0.02,
          });
        }

        return true;
      });

      // 3. Spawn and update Falling Stars (falling from top-right side diagonally)
      if (fallingStars.length < maxFallingStars && Math.random() < 0.005 * dt) {
        let startX, startY;
        if (Math.random() < 0.5) {
          // Spawn from the top of the right half
          startX = w * 0.4 + Math.random() * (w * 0.6);
          startY = -50;
        } else {
          // Spawn from the right edge of the top half
          startX = w + 50;
          startY = Math.random() * (h * 0.4);
        }
        fallingStars.push({
          x: startX,
          y: startY,
          speedX: -(4.0 + Math.random() * 5.0),
          speedY: 2.0 + Math.random() * 3.0,
          length: 80 + Math.random() * 100,
          width: 0.8 + Math.random() * 0.8,
          alpha: 0.8,
          decay: 0.008 + Math.random() * 0.012,
        });
      }

      fallingStars = fallingStars.filter((fs) => {
        fs.x += fs.speedX * dt;
        fs.y += fs.speedY * dt;
        fs.alpha -= fs.decay * dt;

        if (fs.alpha <= 0 || fs.y > h + fs.length || fs.x < -fs.length) {
          return false;
        }

        // Direction vector of the streak
        const speed = Math.sqrt(fs.speedX * fs.speedX + fs.speedY * fs.speedY);
        const dx = fs.speedX / speed;
        const dy = fs.speedY / speed;

        // Draw diagonal gradient line from head back to tail
        const tailX = fs.x - fs.length * dx;
        const tailY = fs.y - fs.length * dy;

        const grad = ctx.createLinearGradient(tailX, tailY, fs.x, fs.y);
        grad.addColorStop(0, "rgba(245, 243, 238, 0)");
        grad.addColorStop(0.3, `rgba(245, 243, 238, ${fs.alpha * 0.3})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${fs.alpha})`);

        ctx.beginPath();
        ctx.moveTo(fs.x, fs.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = fs.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Spawn trail sparks at the head of the falling star
        if (Math.random() < 0.35 * dt) {
          sparks.push({
            x: fs.x,
            y: fs.y,
            vx: fs.speedX * 0.2 + (Math.random() - 0.5) * 0.5,
            vy: fs.speedY * 0.2 + (Math.random() - 0.5) * 0.5,
            radius: 0.4 + Math.random() * 0.7,
            alpha: fs.alpha * 0.7,
            decay: 0.015 + Math.random() * 0.025,
          });
        }

        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      // Clean up window/canvas events
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto select-none"
        style={{mixBlendMode: "screen"}}
      />
      {/* Dual atmospheric vignette overlays */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-night-900 via-transparent to-night-900/60 pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(9,10,15,0.7)_100%)] pointer-events-none" 
        aria-hidden="true"
      />
    </div>
  );
}
