/**
 * The moon: a lit disc with a soft atmospheric halo.
 *
 * Built from layered radial gradients rather than an image, so it stays crisp at any size and
 * costs nothing to download. The surface has three parts — a base gradient lit from the upper
 * left, a handful of very low-contrast maria (the darker "seas"), and a bright rim light — then
 * an outer halo painted behind it in the same warm white as the rest of the palette.
 *
 * `children` renders centred on the disc, which is how the dashboard puts the real balance
 * inside the moon.
 */
export function MoonDisc({
  size = 420,
  children,
  className,
  showHalo = true,
}: {
  size?: number;
  children?: React.ReactNode;
  className?: string;
  showHalo?: boolean;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className ?? ""}`}
      style={{width: size, height: size}}
    >
      {/* Outer atmospheric halo, well beyond the disc itself. */}
      {showHalo && (
        <div
          aria-hidden
          className="anim-halo pointer-events-none absolute rounded-full"
          style={{
            width: size * 2.1,
            height: size * 2.1,
            background:
              "radial-gradient(circle, rgba(245,243,238,0.22) 0%, rgba(245,243,238,0.10) 22%, rgba(245,243,238,0.035) 42%, rgba(245,243,238,0) 65%)",
          }}
        />
      )}

      {/* The disc. */}
      <div
        aria-hidden
        className="anim-moon absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `
            radial-gradient(circle at 62% 72%, rgba(180,178,172,0.30) 0%, rgba(180,178,172,0) 34%),
            radial-gradient(circle at 34% 30%, rgba(255,254,250,0.95) 0%, rgba(238,236,229,0.9) 38%, rgba(206,204,197,0.85) 68%, rgba(168,166,160,0.8) 100%)
          `,
          boxShadow:
            "0 0 60px 12px rgba(245,243,238,0.28), 0 0 160px 40px rgba(245,243,238,0.14), inset -18px -22px 60px rgba(90,89,86,0.35), inset 14px 16px 44px rgba(255,255,255,0.35)",
        }}
      >
        {/* Maria — kept very low contrast so the disc reads as luminous, not textured. */}
        <span
          className="absolute rounded-full"
          style={{
            top: "22%",
            left: "26%",
            width: "26%",
            height: "22%",
            background:
              "radial-gradient(circle, rgba(120,119,115,0.20) 0%, rgba(120,119,115,0) 70%)",
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            top: "52%",
            left: "50%",
            width: "34%",
            height: "30%",
            background:
              "radial-gradient(circle, rgba(120,119,115,0.16) 0%, rgba(120,119,115,0) 72%)",
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            top: "38%",
            left: "14%",
            width: "16%",
            height: "14%",
            background:
              "radial-gradient(circle, rgba(120,119,115,0.14) 0%, rgba(120,119,115,0) 70%)",
          }}
        />
      </div>

      {/* Content sits above the disc, in normal flow order so it paints with the rest of the UI. */}
      {children && <div className="relative z-10 px-6 text-center">{children}</div>}
    </div>
  );
}
