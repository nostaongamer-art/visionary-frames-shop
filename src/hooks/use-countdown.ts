import { useEffect, useState } from "react";

// Countdown that starts at 02:15:30 and ticks down each second.
export function useCountdown(initialSeconds = 2 * 3600 + 15 * 60 + 30) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? initialSeconds : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [initialSeconds]);

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
