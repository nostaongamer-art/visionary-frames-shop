import { useState } from "react";
import { Clock, X } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-display text-[15px] font-bold tabular-nums text-white">{value}</span>
      <span className="mt-0.5 text-[8px] font-semibold tracking-wide text-white/80">{label}</span>
    </div>
  );
}

export function PromoBar() {
  const { hours, minutes, seconds } = useCountdown();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="w-full bg-brand text-white">
      <div className="mx-auto flex min-h-[44px] max-w-[1240px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-1.5 sm:flex-nowrap sm:justify-between">
        <div className="flex items-center gap-2 text-center">
          <Clock className="hidden h-4 w-4 shrink-0 sm:block" />
          <p className="text-[11px] font-semibold tracking-wide sm:text-xs">
            PROMOÇÃO POR TEMPO LIMITADO! 15% OFF EM TODO O SITE + FRETE GRÁTIS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Unit value={hours} label="HORAS" />
            <span className="font-display text-sm font-bold text-white/70">:</span>
            <Unit value={minutes} label="MIN" />
            <span className="font-display text-sm font-bold text-white/70">:</span>
            <Unit value={seconds} label="SEG" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar promoção"
            className="cursor-pointer text-white/80 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
