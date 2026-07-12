import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { fetchHomePageContent, DEFAULT_HOME_PAGE_DATA } from "@/lib/home-service";

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
  const [flashData, setFlashData] = useState(DEFAULT_HOME_PAGE_DATA.flashBanner || {
    show: true,
    title: "15% OFF EM TODO O SITE!",
    subtitle: "Aproveite agora e garanta o seu favorito.",
    buttonText: "APROVEITAR AGORA",
    buttonLink: "#mais-vendidos",
    showTimer: true,
    timerDuration: 2 * 3600 + 15 * 60 + 23,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Tentar ler do localStorage primeiro para carregamento instantâneo
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.flashBanner) {
            setFlashData(parsed.flashBanner);
            setIsLoaded(true);
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage in FlashBanner:", e);
      }
    }

    // 2. Fetch do banco de dados para garantir que está atualizado
    async function loadFlash() {
      try {
        const data = await fetchHomePageContent();
        if (data && data.flashBanner) {
          setFlashData(data.flashBanner);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to fetch flash banner content:", e);
      }
    }
    loadFlash();

    // 3. Ouvir alterações feitas na área administrativa no mesmo navegador
    const handleStorageChange = () => {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.flashBanner) {
            setFlashData(parsed.flashBanner);
            setIsLoaded(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const duration = flashData.timerDuration !== undefined ? flashData.timerDuration : (2 * 3600 + 15 * 60 + 23);
  const { hours, minutes, seconds } = useCountdown(duration, "flash_countdown_target", isLoaded);

  if (flashData.show === false) return null;

  return (
    <section id="oferta" className="bg-background pb-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-lg border border-hairline/70 bg-gradient-to-r from-ink to-ink-2 p-6 shadow-sm lg:flex-row lg:justify-between lg:gap-8 lg:p-7">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border-2 border-brand text-brand">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] text-brand font-mono">OFERTA RELÂMPAGO</p>
              <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
                {flashData.title}
              </h2>
              <p className="text-xs text-white/60">{flashData.subtitle}</p>
            </div>
          </div>

          {flashData.showTimer !== false && (
            <div className="flex items-center gap-2">
              <TimeBox value={hours} label="HORAS" />
              <span className="pb-4 font-display text-2xl font-bold text-white/50">:</span>
              <TimeBox value={minutes} label="MINUTOS" />
              <span className="pb-4 font-display text-2xl font-bold text-white/50">:</span>
              <TimeBox value={seconds} label="SEGUNDOS" />
            </div>
          )}

          <a 
            href={flashData.buttonLink || "#mais-vendidos"}
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand-2"
          >
            {flashData.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
