import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { fetchHomePageContent, DEFAULT_HOME_PAGE_DATA } from "@/lib/home-service";

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-display text-[15px] font-bold tabular-nums text-white">{value}</span>
      <span className="mt-0.5 text-[8px] font-semibold tracking-wide text-white/80">{label}</span>
    </div>
  );
}

export function PromoBar({ text: propText }: { text?: string }) {
  const [promoData, setPromoData] = useState(DEFAULT_HOME_PAGE_DATA.promoBar);
  const [open, setOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Tentar ler do localStorage primeiro para carregamento instantâneo
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.promoBar) {
            setPromoData(parsed.promoBar);
            setIsLoaded(true);
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage in PromoBar:", e);
      }
    }

    // 2. Fetch do banco de dados para garantir que está atualizado
    async function loadPromo() {
      try {
        const data = await fetchHomePageContent();
        if (data && data.promoBar) {
          setPromoData(data.promoBar);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to fetch promo bar content:", e);
      }
    }

    loadPromo();

    // 3. Ouvir alterações feitas na área administrativa no mesmo navegador
    const handleStorageChange = () => {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.promoBar) {
            setPromoData(parsed.promoBar);
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

  const duration = promoData.timerDuration !== undefined ? promoData.timerDuration : (2 * 3600 + 15 * 60 + 30);
  const { hours, minutes, seconds } = useCountdown(duration, "promo_countdown_target", isLoaded);

  // If the promo bar is explicitly disabled by admin, or closed by user, don't show it
  if (!open || promoData.show === false) return null;

  const displayText = propText || promoData.text;

  return (
    <div className="w-full bg-brand text-white">
      <div className="mx-auto flex min-h-[44px] max-w-[1240px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-1.5 sm:flex-nowrap sm:justify-between">
        <div className="flex items-center gap-2 text-center mx-auto sm:mx-0">
          <Clock className="hidden h-4 w-4 shrink-0 sm:block" />
          <p className="text-[11px] font-semibold tracking-wide sm:text-xs">
            {displayText}
          </p>
        </div>
        {(promoData.showTimer !== false) && (
          <div className="flex items-center gap-3 mx-auto sm:mx-0 mt-1 sm:mt-0">
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
              className="cursor-pointer text-white/80 transition-colors hover:text-white ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
