"use client";

import {useTour} from "./TourContext";
import {useTourAnchor} from "./TourOverlay";
import {Button} from "@/components/ui/primitives";
import {motion} from "framer-motion";
import {useRouter} from "next/navigation";

export function TourPopover() {
  const {steps, currentStepIndex, goNext, goPrev, endTour, fillAmount} = useTour();
  const {rect, activeAnchor, step} = useTourAnchor();
  const router = useRouter();

  if (!step) return null;

  const isCentered = !activeAnchor || !rect;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  // Derive positioning: place right if space, else left, else bottom
  let popoverStyle: React.CSSProperties = {};
  if (!isMobile && !isCentered && rect) {
    // Default to right of the target
    const spaceRight = window.innerWidth - rect.right;
    if (spaceRight > 320) {
      popoverStyle = { left: rect.right + 24, top: rect.top };
    } else {
      popoverStyle = { right: window.innerWidth - rect.left + 24, top: rect.top };
    }
  }

  const handleNavigate = () => {
    if (step.route) router.push(step.route);
  };

  const bodyContent = activeAnchor === step.anchor ? step.body : (step.fallbackBody || step.body);

  return (
    <div
      role="dialog"
      className={`fixed z-[120] flex ${isCentered ? "inset-0 items-center justify-center" : isMobile ? "inset-x-0 bottom-0 p-4" : ""}`}
      style={!isCentered && !isMobile ? popoverStyle : undefined}
    >
      <motion.div
        layout
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        className="w-full max-w-sm rounded-3xl border border-edge bg-panel/90 backdrop-blur-xl p-6 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.98)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow/50 to-transparent" />
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-glow text-lg leading-none">✦</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-faint">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        <h3 className="text-lg font-display text-ink mb-2">{step.title}</h3>
        
        <div className="text-sm text-muted leading-relaxed mb-6">
          {bodyContent}
          {step.id === "stake" && activeAnchor === step.anchor && (
            <div className="mt-3">
              <button 
                onClick={() => fillAmount("50")}
                className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 hover:bg-white/10 transition-colors"
              >
                Use 50 TWLT
              </button>
            </div>
          )}
          {step.waitForTx && (
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-glow animate-pulse">
              <span>Waiting for confirmation...</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={endTour}
            className="text-xs font-bold tracking-wider uppercase text-faint hover:text-ink transition-colors"
          >
            Skip Tour
          </button>
          
          <div className="flex gap-2">
            {!isCentered && !step.waitForTx && currentStepIndex > 0 && (
              <Button variant="ghost" className="px-4 py-2" onClick={goPrev}>Back</Button>
            )}
            
            {isCentered && !rect && step.route && (
              <Button variant="primary" className="px-4 py-2" onClick={handleNavigate}>
                Take me there
              </Button>
            )}

            {(!step.waitForTx || step.primaryAction) && (
              <Button 
                variant="primary" 
                className="px-4 py-2" 
                onClick={step.primaryAction === "done" ? endTour : goNext}
              >
                {step.primaryAction === "done" ? "Done" : "Next"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
