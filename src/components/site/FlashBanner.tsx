import { Zap } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-14 w-14 place-items-center rounded-md bg-ink-2 font-display text-2xl font-extrabold tabular-nums text-brand">
        {value}
      </div>
      <span className="mt-1 text-[10px] font-semibold tracking-wide text-white/60">{label}</span>
    </div>
  );
}

export function FlashBanner() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <section id="oferta" className="bg-white pb-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-lg border border-hairline/70 bg-gradient-to-r from-ink to-ink-2 p-6 shadow-sm lg:flex-row lg:justify-between lg:gap-8 lg:p-7">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border-2 border-brand text-brand">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] text-brand">OFERTA RELÂMPAGO</p>
              <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
                15% OFF EM TODO O SITE!
              </h2>
              <p className="text-xs text-white/60">Aproveite agora e garanta o seu favorito.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TimeBox value={hours} label="HORAS" />
            <span className="pb-4 font-display text-2xl font-bold text-white/50">:</span>
            <TimeBox value={minutes} label="MINUTOS" />
            <span className="pb-4 font-display text-2xl font-bold text-white/50">:</span>
            <TimeBox value={seconds} label="SEGUNDOS" />
          </div>

          <button className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand/90">
            APROVEITAR AGORA
          </button>
        </div>
      </div>
    </section>
  );
}
