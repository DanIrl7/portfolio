"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { gsap } from "gsap";

// The scroll position ScrollSmoother is actually drawing at. Raw window scroll
// runs ahead of the eased content, so anything tied to it drifts out of step.
// Reading the content's transform each tick keeps overlays in step with it.
export function useSmoothScrollY(): MotionValue<number> {
  const y = useMotionValue(0);

  useEffect(() => {
    const content = document.getElementById("smooth-content");
    if (!content) return;

    const tick = () => y.set(-Number(gsap.getProperty(content, "y")));
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [y]);

  return y;
}
