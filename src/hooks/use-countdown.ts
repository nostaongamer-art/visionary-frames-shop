import { useEffect, useState } from "react";

// Countdown that starts at initialSeconds, ticks down each second, and persists across page reloads.
export function useCountdown(initialSeconds = 2 * 3600 + 15 * 60 + 30, storageKey?: string) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      setRemaining(initialSeconds);
      return;
    }

    const loadOrInitTargetTime = () => {
      try {
        const storedTarget = localStorage.getItem(storageKey);
        const storedDuration = localStorage.getItem(`${storageKey}_duration`);
        
        // If the configured duration changed, or if there is no target timestamp, or if target is invalid
        if (storedDuration !== String(initialSeconds) || !storedTarget) {
          const newTarget = Date.now() + initialSeconds * 1000;
          localStorage.setItem(storageKey, String(newTarget));
          localStorage.setItem(`${storageKey}_duration`, String(initialSeconds));
          return newTarget;
        }
        
        const target = parseInt(storedTarget);
        if (isNaN(target)) {
          const newTarget = Date.now() + initialSeconds * 1000;
          localStorage.setItem(storageKey, String(newTarget));
          localStorage.setItem(`${storageKey}_duration`, String(initialSeconds));
          return newTarget;
        }
        
        return target;
      } catch (e) {
        console.error("Error managing countdown state:", e);
        return Date.now() + initialSeconds * 1000;
      }
    };

    const targetTime = loadOrInitTargetTime();
    const remainingTime = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
    setRemaining(remainingTime);
  }, [initialSeconds, storageKey]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // When expired, restart the countdown to the initial duration
          if (storageKey && typeof window !== "undefined") {
            const newTarget = Date.now() + initialSeconds * 1000;
            try {
              localStorage.setItem(storageKey, String(newTarget));
            } catch (e) {
              console.error(e);
            }
          }
          return initialSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initialSeconds, storageKey]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}
