import {BranchSilhouette} from "@/components/landing/BranchSilhouette";
import {MoonDisc} from "@/components/landing/MoonDisc";

/**
 * Deterministic pseudo-random values.
 *
 * A fixed-seed LCG rather than Math.random, so the server and client render identical markup (no
 * hydration mismatch) and the sky looks the same on every visit.
 */
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
    // Stars thin out toward the horizon, so bias them to the upper two thirds.
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
    // Long cycles with staggered offsets: at most one is usually visible at a time.
    duration: 17 + next() * 16,
    delay: next() * 26,
  }));
}

// Computed once at module scope, not per render.
const STARS = makeStars(64);
const SHOOTING_STARS = makeShootingStars(3);

/**
 * The shared twilight backdrop: gradient sky, drifting mist, star field, moon, corner branches.
 *
 * Everything here is decorative and `aria-hidden`. It lives in a fixed layer behind content and
 * never participates in layout, so real balances paint immediately regardless of animation state.
 * Every loop animates transform/opacity/filter only, so all of it composites on the GPU.
 */
export function TwilightScene({
  variant = "landing",
  showMoon = true,
}: {
  /** `app` is the same scene held back a stop or two so dashboard data stays dominant. */
  variant?: "landing" | "app";
  showMoon?: boolean;
}) {
  const dim = variant === "app";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base sky. */}
      <div className="absolute inset-0 bg-night-900" />

      {/* Slow-drifting gradient, the largest moving surface. */}
      <div
        className="anim-sky absolute inset-[-10%]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 26%, #1e1e24 0%, #16161b 34%, #0e0e12 64%, #0a0a0c 100%)",
          opacity: dim ? 0.72 : 1,
        }}
      />

      {/* The moon. On the dashboard it is pushed off the top edge — the balance card carries its
          own moon there, and two would compete. */}
      {!dim && showMoon && (
        <div className="absolute top-[4%] left-1/2 -translate-x-1/2">
          <MoonDisc size={300} />
        </div>
      )}
      {dim && (
        <div
          className="anim-halo absolute -top-[22%] left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,243,238,0.16) 0%, rgba(245,243,238,0.05) 40%, rgba(245,243,238,0) 68%)",
          }}
        />
      )}

      {/* Star field: the layer drifts as one composited surface, each star twinkles on its own. */}
      <div
        className="anim-star-drift absolute inset-[-4%]"
        style={{opacity: dim ? 0.5 : 1}}
      >
        {STARS.map((star) => (
          <span
            key={star.id}
            className="anim-star absolute rounded-full bg-glow"
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.baseOpacity,
                "--star-duration": `${star.duration}s`,
                "--star-delay": `${star.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Shooting stars: a bright head trailing into nothing. */}
        {SHOOTING_STARS.map((shot) => (
          <span
            key={`shot-${shot.id}`}
            className="anim-shoot absolute h-px origin-left"
            style={
              {
                left: `${shot.left}%`,
                top: `${shot.top}%`,
                width: `${shot.width}px`,
                background:
                  "linear-gradient(90deg, rgba(245,243,238,0) 0%, rgba(245,243,238,0.85) 88%, rgba(245,243,238,1) 100%)",
                "--shoot-duration": `${shot.duration}s`,
                "--shoot-delay": `${shot.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Two mist banks at different speeds and scales — this is what gives the scene depth and
          keeps the sky from reading as a flat gradient. */}
      <div
        className="anim-mist-far absolute inset-[-15%]"
        style={{
          background:
            "radial-gradient(45% 30% at 22% 62%, rgba(150,150,160,0.10) 0%, rgba(150,150,160,0) 70%), radial-gradient(50% 26% at 78% 48%, rgba(140,140,152,0.09) 0%, rgba(140,140,152,0) 72%)",
        }}
      />
      <div
        className="anim-mist-near absolute inset-[-15%]"
        style={{
          background:
            "radial-gradient(60% 34% at 50% 78%, rgba(168,168,178,0.13) 0%, rgba(168,168,178,0) 68%), radial-gradient(38% 22% at 12% 40%, rgba(150,150,162,0.08) 0%, rgba(150,150,162,0) 74%)",
        }}
      />

      {/* Corner branches. The sway is a transform on static SVG — no re-layout. */}
      <div className="anim-sway absolute -top-8 -left-10 w-[52vw] max-w-[620px] min-w-[320px]">
        <BranchSilhouette side="left" className="h-auto w-full" opacity={dim ? 0.7 : 1} />
      </div>
      <div
        className="anim-sway absolute -top-12 -right-12 w-[46vw] max-w-[560px] min-w-[280px]"
        style={{animationDelay: "-13s"}}
      >
        <BranchSilhouette side="right" className="h-auto w-full" opacity={dim ? 0.6 : 0.92} />
      </div>

      {/* Ground haze, settling the composition. */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to top, #08080a 0%, rgba(8,8,10,0.7) 34%, rgba(8,8,10,0) 100%)",
        }}
      />
    </div>
  );
}
