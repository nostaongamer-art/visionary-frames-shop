import { useEffect } from "react";
import { ArrowRight, Truck, ShieldCheck, Users, CreditCard } from "lucide-react";
import heroMan from "@/assets/hero-man.jpg";
import { getDirectDriveUrl } from "@/lib/home-service";

const ICONS = [Truck, ShieldCheck, Users, CreditCard];

function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unique = Array.from(new Set(fonts.filter(f => f && f !== "default" && f !== "")));
    if (unique.length === 0) return;
    
    const linkId = "dynamic-google-fonts";
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${unique.map(f => `family=${f.replace(/\s+/g, "+")}:wght@400;500;700;800`).join("&")}&display=swap`;
  }, [fonts]);
}

export interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  imageUrl?: string;
  showBenefits?: boolean;
  benefits?: Array<{
    title: string;
    subtitle: string;
  }>;
  titleFont?: string;
  subtitleFont?: string;
  buttonFont?: string;
  secondaryButtonFont?: string;
}

export function Hero({ data }: { data?: HeroData }) {
  const title = data?.title || "Encontre o\nÓculos Perfeito\nPara Seu Estilo";
  const subtitle = data?.subtitle || "Mais de 200 modelos exclusivos para transformar sua aparência e sua confiança.";
  const buttonText = data?.buttonText || "COMPRAR AGORA";
  const buttonLink = data?.buttonLink || "#mais-vendidos";
  const secondaryButtonText = data?.secondaryButtonText || "VER COLEÇÃO";
  const secondaryButtonLink = data?.secondaryButtonLink || "#categorias";
  const imageSrc = data?.imageUrl === undefined 
    ? heroMan 
    : (data.imageUrl ? getDirectDriveUrl(data.imageUrl) : "");
  
  const showBenefits = data?.showBenefits !== false;
  const benefitsList = data?.benefits || [
    { title: "FRETE GRÁTIS", subtitle: "Para todo Brasil" },
    { title: "TROCA GARANTIDA", subtitle: "Até 7 dias após o recebimento" },
    { title: "10.000+ CLIENTES", subtitle: "Satisfeitos" },
    { title: "ATÉ 12X SEM JUROS", subtitle: "No cartão de crédito" },
  ];

  // Font choices
  const titleFont = data?.titleFont || "default";
  const subtitleFont = data?.subtitleFont || "default";
  const buttonFont = data?.buttonFont || "default";
  const secondaryButtonFont = data?.secondaryButtonFont || "default";

  // Inject fonts dynamically
  useGoogleFonts([titleFont, subtitleFont, buttonFont, secondaryButtonFont]);

  const renderTitle = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.trim().toLowerCase() === "óculos perfeito") {
        return (
          <span key={i} className="text-brand block">
            {line}
          </span>
        );
      }
      return (
        <span key={i} className="block">
          {line}
        </span>
      );
    });
  };

  const getStyleForFont = (fontName: string) => {
    return fontName && fontName !== "default"
      ? { fontFamily: `'${fontName}', sans-serif` }
      : undefined;
  };

  return (
    <section id="top" className="relative bg-ink">
      <div className="relative">
        {/* Hero content */}
        <div className="relative min-h-[560px] overflow-hidden md:min-h-[600px]">
          {/* Background image on the right */}
          <div className="absolute inset-0 bg-ink z-0">
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Homem jovem usando óculos escuros pretos"
                width={1200}
                height={1200}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-right"
              />
            )}
            {/* Gradient from left to right for text readability and side blending */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[70%] bg-gradient-to-r from-ink via-ink/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
            {/* Gradient from bottom to top to fade out the image bottom crop line */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex h-full max-w-[1240px] items-center px-4 py-16 sm:px-6">
            <div className="max-w-xl">
              <h1 
                style={getStyleForFont(titleFont)}
                className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {renderTitle(title)}
              </h1>
              <p 
                style={getStyleForFont(subtitleFont)}
                className="mt-5 max-w-md text-sm text-white/70 sm:text-base"
              >
                {subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={buttonLink}
                  style={getStyleForFont(buttonFont)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand/90"
                >
                  {buttonText}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={secondaryButtonLink}
                  style={getStyleForFont(secondaryButtonFont)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/40 bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:border-brand hover:text-brand"
                >
                  {secondaryButtonText}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits bar overlapping bottom of hero */}
        {showBenefits && (
          <div className="relative z-20 mx-auto -mt-8 max-w-[1240px] px-4 pb-8 sm:px-6">
            <div className="grid grid-cols-2 gap-y-6 rounded-lg border border-hairline/70 bg-ink-2 p-6 shadow-lg md:grid-cols-4 md:divide-x md:divide-hairline/60">
              {benefitsList.slice(0, 4).map((benefit, idx) => {
                const Icon = ICONS[idx] || Truck;
                return (
                  <div key={idx} className="flex items-center gap-3 px-2 md:px-5">
                    <Icon className="h-8 w-8 shrink-0 text-brand" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wide text-white">{benefit.title}</p>
                      <p className="text-[11px] text-white/60">{benefit.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
