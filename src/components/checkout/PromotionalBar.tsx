import { useState, useEffect } from "react";
import { Zap, ChevronRight } from "lucide-react";

export function PromotionalBar() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 15,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset timer when it reaches 0
              hours = 2;
              minutes = 15;
              seconds = 30;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="w-full bg-gradient-to-r from-[#FF8A00] to-[#FF9900] text-white py-1.5 px-4 flex items-center justify-between text-xs md:text-sm font-semibold h-[40px] select-none">
      {/* Spacer to help center the main content on desktop */}
      <div className="hidden md:block w-36"></div>

      <div className="flex items-center gap-2 mx-auto md:mx-0">
        <Zap className="h-4 w-4 fill-white text-white animate-pulse" />
        <span className="tracking-wider uppercase text-[10px] md:text-xs font-extrabold">
          PROMOÇÃO POR TEMPO LIMITADO! 15% OFF EM TODO O SITE + FRETE GRÁTIS
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono text-[10px] md:text-xs">
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm leading-none">{formatNumber(timeLeft.hours)}</span>
            <span className="text-[7px] md:text-[8px] font-semibold text-white/80 tracking-wide mt-0.5 uppercase">HORAS</span>
          </div>
          <span className="text-sm font-bold leading-none -mt-3.5 mx-0.5">:</span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm leading-none">{formatNumber(timeLeft.minutes)}</span>
            <span className="text-[7px] md:text-[8px] font-semibold text-white/80 tracking-wide mt-0.5 uppercase">MIN</span>
          </div>
          <span className="text-sm font-bold leading-none -mt-3.5 mx-0.5">:</span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm leading-none">{formatNumber(timeLeft.seconds)}</span>
            <span className="text-[7px] md:text-[8px] font-semibold text-white/80 tracking-wide mt-0.5 uppercase">SEG</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-white/80 cursor-pointer hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
