---
name: Twilight DeFi
description: A calm, cinematic wallet dashboard for Arbitrum Sepolia.
colors:
  primary: "#f5f3ee"
  neutral-bg: "#090a0f"
  neutral-surface: "#171a26"
  neutral-border: "rgba(255,255,255,0.08)"
  text-primary: "#eeeeef"
  text-secondary: "#8a8a90"
  text-tertiary: "#5c5c63"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 500
    letterSpacing: "-0.02em"
  brand:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    letterSpacing: "0.14em"
  sans:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: Twilight DeFi

## Overview

**Creative North Star: "The Editorial Sanctuary"**

Twilight DeFi is a high-contrast, premium, dark-mode visual interface designed to evoke a sense of calm, precision, and verifiability. By stripping away typical DeFi tropes—such as neon colors, flashing green/red tags, and confusing charts—the interface establishes trust through typographic hierarchy and structural clarity.

Every layout, state transition, and typography choice is designed to feel cohesive, intentional, and high-end.

**Key Characteristics:**
- Strict grayscale visual discipline (all structural states, directions, and values are monochrome).
- A single warm-white accent (#f5f3ee) reserved exclusively for the moon and its halo.
- Tactile, high-end transitions using a custom exponential ease-out curve.
- Complete on-chain transparency (never show a number that is not live-fetched).

---

## Colors

The palette relies on a deep, true-black base with high-contrast monochrome values. It avoids washed-out grays in favor of crisp, structural definition.

### Primary
- **Warm Moon Glow** (#f5f3ee): The singular warm accent color. Reserved *exclusively* for the rendering of the celestial moon disc and its halo. Never used for buttons, navigation, highlights, or status alerts.

### Neutral
- **True Midnight** (#090a0f): The primary canvas background color. High contrast and deep.
- **Deep Velvet** (#0d0f17): The container and sub-surface background fill.
- **Slate Panel** (#171a26): The card and primary container background (applied at 55% opacity with backdrop blur).
- **Ink Primary** (#eeeeef): The primary text color. High legibility.
- **Muted Silver** (#8a8a90): Secondary text for labels, captions, and non-critical stats.
- **Faint Ash** (#5c5c63): Tertiary metadata, hash values, and disabled/placeholder labels.
- **Structural Border** (rgba(255,255,255,0.08)): Subtle, semi-transparent border lines.

**The Grayscale Discipline Rule.** No green or red is ever used to indicate direction or status. Up/down movements are indicated solely via directional glyphs (`↑` or `↓`) and typography weights.

---

## Typography

**Display Font:** Playfair Display (serif)  
**Body Font:** Inter (sans-serif)  
**Brand/Label Font:** Space Grotesk (sans-serif)

### Hierarchy
- **Display Serif** (Playfair Display, Medium, 44px-54px, line-height 1): Used only for the hero wallet balance inside the moon.
- **Brand Headings** (Space Grotesk, Semibold, 12px-14px, tracking-wide uppercase): Used for navigation items, section headers, and tab text.
- **Body Text** (Inter, Regular, 14px, line-height 1.5, measure 65–75ch): Used for body text, form labels, and descriptions.
- **Tabular Figures** (Inter, Medium, 14px, font-variant-numeric: tabular-nums): Applied to all transaction values, quantities, and balances to ensure vertical column alignment.

**The Display Serif Isolation Rule.** The serif typeface must *only* appear on the primary hero balance value inside the moon disc. Every other number and text label uses the sans-serif geometric face.

---

## Layout

The spatial layout is anchored by a strict base-8 grid system (`8px`, `16px`, `24px`, `32px`).
- Panels and containers are set up symmetrically.
- Layout blocks are separated by generous negative space (`32px` to `48px` margins) to avoid cognitive clutter.
- Side-by-side structures collapse to full-bleed vertical containers on mobile devices to prevent horizontal overflow.

---

## Elevation & Depth

Twilight is a flat, layered, frosted interface. It uses subtle semi-transparent borders and deep background blur (`backdrop-blur-md`) rather than heavy drop shadows to create a layered glass effect over the drifting night sky.

### Elevation Schema
- **Level 0 (Backdrop)**: Drifting night sky gradient.
- **Level 1 (Card Rest)**: Panel fill (`#171a26` at 55% opacity) with a `rgba(255,255,255,0.08)` border.
- **Level 2 (Card Hover)**: Slight border opacity increase (`rgba(255,255,255,0.16)`) and a deeper, softer shadow offset to convey lift without color shifts.

---

## Shapes

- **Primary Cards**: Large rounded corners (`24px` radius) with a 1px border.
- **Action Buttons & Form Inputs**: Medium rounded corners (`12px` radius).
- **Tab Indicators & Badges**: Small rounded corners (`8px` radius).

---

## Components

### Buttons
- **Shape**: `12px` rounded corner.
- **Primary**: Solid `#eeeeef` background with `#090a0f` text. Scale down slightly (`active:scale-[0.98]`) on click.
- **Ghost**: Transparent background, `1px border border-white/8%` border, `#eeeeef` text. On hover, slightly brighten the border (`border-white/16%`) and fade in a soft `#1d2130` background.

### Panels / Cards
- **Background**: `#171a26` at 55% opacity with `backdrop-filter: blur(12px)`.
- **Border**: `1px solid rgba(255,255,255,0.08)`.
- **Hover Transition**: Smoothly interpolate border color and shadow over a `300ms` custom ease curve.

### Inputs
- **Base**: `1px solid rgba(255,255,255,0.08)` border, `#0d0f17` background fill, `12px` border-radius.
- **Focus**: Transition the border to `rgba(255,255,255,0.24)` and apply a clean, non-offset focus ring.

---

## Do's and Don'ts

### Do:
- **Do** align columns of numbers using the `tnum` class.
- **Do** use the custom `cubic-bezier(0.16, 1, 0.3, 1)` easing curve for all state transitions.
- **Do** provide clear, descriptive empty states that guide the user on their next steps.

### Don't:
- **Don't** use the warm-white glow color (`#f5f3ee`) on buttons, labels, active borders, or focus outlines.
- **Don't** use any green or red colors for gain, loss, success, or error status messages.
- **Don't** use monospaced fonts for anything other than transaction hashes or code elements.
