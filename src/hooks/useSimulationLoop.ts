import { useEffect, useRef } from "react";
import { usePressStore } from "../store/usePressStore";

export default function useSimulationLoop() {
  const status = usePressStore((s) => s.simulationState.status);
  const tick = usePressStore((s) => s.tickSimulation);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (status !== "running") {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = now - lastTickRef.current;
      if (elapsed >= 80) {
        tick();
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [status, tick]);
}
