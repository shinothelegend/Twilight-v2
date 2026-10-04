# Submission Notes: Arbitrum Open House Singapore Online Buildathon

## Initial Project Status
The project started as a functional but unpolished dashboard with working smart contracts, deployed to Arbitrum Sepolia, and a Next.js 15 frontend using `wagmi`. However, the UI was visually flat, the timers were frozen due to static evaluation, the repository documentation had stale links, and the theme was hardcoded to grayscale.

## Today's Changes
- **Deployment Verification**: Verified that the Arbitrum Sepolia contracts are correctly deployed and working. The stale `startBlock` metadata in `421614.json` was purged.
- **Bug Fixes**: Repaired the frozen countdown timers in the Staking and Faucet cards by implementing a local `useEffect` stateful clock that animates the remaining time without sacrificing blockchain truth. Stuck skeletons during RPC failures were also fixed.
- **Security Pass**: Conducted a thorough manual audit of the contracts, verifying the `ReentrancyGuard` protections, strict math bounds, and supply limits. Findings compiled into `SECURITY.md`.
- **Visual Redesign & Depth Diorama**: Implemented the `EveningStar` centerpiece using pure CSS and SVGs. Constructed a multi-layered depth diorama in `TwilightScene.tsx` using `translate3d` and pointer parallax (disabled on mobile and for users with `prefers-reduced-motion`).
- **Light/Dark Mode System**: Migrated hardcoded hex values in `globals.css` to a semantic variable system with `.dark` (Twilight) and `:root` (Daybreak) modes. Added a cinematic `ThemeTransition` crossfade that respects user motion preferences, and dynamically syncs the RainbowKit modal theme.
- **Trust/Provenance Feature**: Added "WHY THIS NUMBER?" hints to `StakingPanel.tsx` and `FaucetCard.tsx` to help users trace the source of the data they see (e.g., `TwilightStaking.earned(wallet)`).
- **Final Documentation**: Wrote a judge-friendly `README.md` and prepared this `SUBMISSION_NOTES.md` file.

## Remaining Limitations & Blockers
- **Vercel Deployment**: Unable to link to a live Vercel URL due to lack of an authenticated API token for `npx vercel`. The README explicitly requests judges to run the application locally.
- **USDG Integration**: USDG stablecoin support is documented in the roadmap but deferred since verifying real testnet USDG mechanics safely in a few hours was deemed too high-risk for the deadline.
- **Video**: Video generation via Remotion was skipped to prioritize delivering a highly robust, functioning codebase.

## Final Commit
The repository is fully submission-ready for HackQuest. All systems have been checked, no fake data is present, and the core philosophy of "Derived Truths Only" remains intact.
