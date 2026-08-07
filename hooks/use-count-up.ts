"use client";

import { useEffect, useState } from "react";

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function useCountUpNumber(target: number, duration: number = 800): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }

    let frameId: number;
    const startTime = performance.now();

    function frame(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = target * eased;
      setDisplay(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(frame);
      }
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return display;
}
