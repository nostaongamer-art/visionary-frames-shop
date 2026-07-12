import { useState, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/shop-data";
import { getDirectDriveUrl, fetchHomePageContent, DEFAULT_HOME_PAGE_DATA } from "@/lib/home-service";

const CLIENT_IMAGE_MAP: Record<string, string> = {
  client1: TESTIMONIALS[0]?.image || "",
  client2: TESTIMONIALS[1]?.image || "",
  client3: TESTIMONIALS[2]?.image || "",
};

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
      ))}
    </div>
  );
}

export interface TestimonialsData {
  show?: boolean;
  title: string;
  subtitle: string;
  list: Array<{
    name: string;
    text: string;
    imageKey: string;
    imageUrl?: string;
  }>;
}

export function Testimonials({ data: propData }: { data?: TestimonialsData }) {
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsData>(propData || DEFAULT_HOME_PAGE_DATA.testimonials);
  const [brandsData, setBrandsData] = useState(DEFAULT_HOME_PAGE_DATA.brands);

  useEffect(() => {
    // 1. Tentar ler do localStorage primeiro para carregamento instantâneo
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.testimonials) setTestimonialsData(parsed.testimonials);
          if (parsed.brands) setBrandsData(parsed.brands);
        }
      } catch (e) {
        console.error("Failed to read from localStorage in Testimonials:", e);
      }
    }

    // 2. Fetch do banco de dados para garantir que está atualizado
    async function loadTestimonialsAndBrands() {
      try {
        const content = await fetchHomePageContent();
        if (content.testimonials) setTestimonialsData(content.testimonials);
        if (content.brands) setBrandsData(content.brands);
      } catch (e) {
        console.error("Failed to fetch testimonials and brands content:", e);
      }
    }
    loadTestimonialsAndBrands();

    // 3. Ouvir alterações feitas na área administrativa no mesmo navegador
    const handleStorageChange = () => {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.testimonials) setTestimonialsData(parsed.testimonials);
          if (parsed.brands) setBrandsData(parsed.brands);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [propData]);

  const showTestimonials = testimonialsData.show !== false;
  const list = testimonialsData.list || [];

  return (
    <>
      {showTestimonials && list.length > 0 && (
        <section className="bg-background py-4">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
            <div className="relative mb-8 text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">{testimonialsData.subtitle}</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground">
                {testimonialsData.title}
              </h2>
              <div className="mt-4 flex justify-center sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
                <a
                  href="#"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-ink px-4 py-2.5 text-xs font-bold tracking-wide text-white transition-colors hover:border-brand"
                >
                  VER TODOS
                  <ArrowRight className="h-3.5 w-3.5 text-brand" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {list.map((t, idx) => {
                const imageSrc = (t.imageUrl && getDirectDriveUrl(t.imageUrl)) || CLIENT_IMAGE_MAP[t.imageKey] || TESTIMONIALS[idx]?.image;
                return (
                  <div
                    key={`${t.name}-${idx}`}
                    className="flex gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                  >
                    <img
                      src={imageSrc}
                      alt={t.name}
                      width={120}
                      height={120}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <div className="mt-0.5">
                        <Stars />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">"{t.text}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Brand logos with continuous rotating animation */}
      {brandsData.show !== false && brandsData.list && brandsData.list.length > 0 && (
        <section className="bg-banner py-12 border-t border-hairline/15 overflow-hidden relative w-full">
          <div className="flex w-full overflow-hidden select-none relative">
            {/* Gradient shadow overlays for visual blending */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--banner)] via-[var(--banner)]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--banner)] via-[var(--banner)]/80 to-transparent z-10 pointer-events-none" />

            <div className="flex shrink-0 items-center justify-around gap-16 min-w-full animate-marquee">
              {brandsData.list.map((brand, idx) => (
                <span
                  key={`${brand}-${idx}`}
                  className="font-display text-xl font-bold tracking-widest text-foreground/40 uppercase sm:text-2xl whitespace-nowrap hover:text-brand transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex shrink-0 items-center justify-around gap-16 min-w-full animate-marquee" aria-hidden="true">
              {brandsData.list.map((brand, idx) => (
                <span
                  key={`${brand}-dup-${idx}`}
                  className="font-display text-xl font-bold tracking-widest text-foreground/40 uppercase sm:text-2xl whitespace-nowrap hover:text-brand transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
