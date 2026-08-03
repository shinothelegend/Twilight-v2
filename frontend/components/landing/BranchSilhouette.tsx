/**
 * Bare-branch silhouette that reaches in from the edge of the frame.
 *
 * Drawn as tapering strokes rather than filled outlines: a limb is one curve whose stroke width
 * carries the taper, which is a fraction of the path data a filled outline would need and reads
 * as bark at silhouette scale. Fine twigs at the tips are what sell it as a real tree — a bare
 * branch is mostly twigs, and stopping at the second fork looks like a diagram.
 *
 * Rendered in --color-branch, marginally darker than the sky so the limbs read as depth rather
 * than as a hard black cutout.
 */
export function BranchSilhouette({
  side = "left",
  className,
  opacity = 1,
}: {
  side?: "left" | "right";
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 480 340"
      fill="none"
      aria-hidden
      className={className}
      style={{transform: side === "right" ? "scaleX(-1)" : undefined, opacity}}
      preserveAspectRatio="xMinYMin slice"
    >
      <g stroke="var(--color-branch)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Primary limb: thickest at the frame edge, tapering as it reaches inward. */}
        <path d="M-24 -18 Q 62 30 132 68 Q 208 110 286 186" strokeWidth="24" />
        <path d="M286 186 Q 322 222 348 274" strokeWidth="12" />
        <path d="M348 274 Q 364 300 370 330" strokeWidth="6" />
        <path d="M370 330 Q 374 340 376 348" strokeWidth="3" />

        {/* Second limb, flatter, running across the top of the frame. */}
        <path d="M-26 14 Q 78 42 168 52 Q 262 62 352 52" strokeWidth="15" />
        <path d="M352 52 Q 402 46 440 30" strokeWidth="7.5" />
        <path d="M440 30 Q 462 22 480 10" strokeWidth="4" />

        {/* Third limb, dropping steeply — gives the corner some vertical mass. */}
        <path d="M-20 46 Q 40 96 74 168" strokeWidth="11" />
        <path d="M74 168 Q 96 218 100 272" strokeWidth="6" />
        <path d="M100 272 Q 102 306 94 336" strokeWidth="3" />

        {/* Secondary forks off the primary limb. */}
        <path d="M132 68 Q 156 116 164 172" strokeWidth="8.5" />
        <path d="M164 172 Q 170 206 160 234" strokeWidth="4.5" />
        <path d="M164 172 Q 198 188 220 214" strokeWidth="3.5" />
        <path d="M208 110 Q 246 98 286 104" strokeWidth="6.5" />
        <path d="M286 104 Q 322 108 344 128" strokeWidth="3.5" />
        <path d="M168 52 Q 184 18 180 -16" strokeWidth="6.5" />
        <path d="M262 62 Q 276 32 268 4" strokeWidth="4.5" />
        <path d="M74 168 Q 42 182 26 206" strokeWidth="4" />

        {/* Twigs. Short, thin, and deliberately irregular in direction. */}
        <path d="M62 30 Q 70 6 62 -16" strokeWidth="3.5" />
        <path d="M220 214 Q 240 224 252 242" strokeWidth="2.2" />
        <path d="M252 242 Q 262 252 266 264" strokeWidth="1.4" />
        <path d="M160 234 Q 148 254 150 276" strokeWidth="2.2" />
        <path d="M150 276 Q 152 292 146 304" strokeWidth="1.4" />
        <path d="M344 128 Q 366 138 378 156" strokeWidth="2.2" />
        <path d="M378 156 Q 390 166 394 180" strokeWidth="1.4" />
        <path d="M286 186 Q 260 196 244 216" strokeWidth="2.8" />
        <path d="M352 52 Q 358 78 350 100" strokeWidth="2.8" />
        <path d="M350 100 Q 344 116 348 132" strokeWidth="1.6" />
        <path d="M100 272 Q 78 286 68 306" strokeWidth="2" />
        <path d="M26 206 Q 12 220 8 238" strokeWidth="1.8" />
        <path d="M180 -16 Q 196 -4 204 12" strokeWidth="2" />
        <path d="M268 4 Q 286 12 296 26" strokeWidth="1.8" />
        <path d="M440 30 Q 444 50 438 66" strokeWidth="2" />
        <path d="M348 274 Q 326 286 316 304" strokeWidth="2" />
      </g>
    </svg>
  );
}
