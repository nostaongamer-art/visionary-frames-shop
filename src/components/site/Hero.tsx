import { ArrowRight, Truck, ShieldCheck, Users, CreditCard } from "lucide-react";
import heroMan from "@/assets/hero-man.jpg";
import { getDirectDriveUrl } from "@/lib/home-service";

const BENEFITS = [
  { icon: Truck, title: "FRETE GRÁTIS", subtitle: "Para todo Brasil" },
  { icon: ShieldCheck, title: "TROCA GARANTIDA", subtitle: "Até 7 dias após o recebimento" },
  { icon: Users, title: "10.000+ CLIENTES", subtitle: "Satisfeitos" },
  { icon: CreditCard, title: "ATÉ 12X SEM JUROS", subtitle: "No cartão de crédito" },
];

export interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  imageUrl?: string;
}

export function Hero({ data }: { data?: HeroData }) {
  const title = data?.title || "Encontre o\nÓculos Perfeito\nPara Seu Estilo";
  const subtitle = data?.subtitle || "Mais de 200 modelos exclusivos para transformar sua aparência e sua confiança.";
  const buttonText = data?.buttonText || "COMPRAR AGORA";
  const buttonLink = data?.buttonLink || "#mais-vendidos";
  const secondaryButtonText = data?.secondaryButtonText || "VER COLEÇÃO";
  const secondaryButtonLink = data?.secondaryButtonLink || "#categorias";
  const imageSrc = (data?.imageUrl && getDirectDriveUrl(data.imageUrl)) || heroMan;

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

  return (
    <section id="top" className="relative bg-ink">
      <div className="relative">
        {/* Hero content */}
        <div className="relative min-h-[560px] overflow-hidden md:min-h-[600px]">
          {/* Background image on the right */}
          <div className="absolute inset-0 bg-ink">
            <img
              src={imageSrc}
              alt="Homem jovem usando óculos escuros pretos"
              width={1200}
              height={1200}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-right"
            />
            {/* Gradient from left to right for text readability and side blending */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[70%] bg-gradient-to-r from-ink via-ink/90 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent z-0" />
            {/* Gradient from bottom to top to fade out the image bottom crop line */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink via-ink/80 to-transparent z-20" />
          </div>

          <div className="relative mx-auto flex h-full max-w-[1240px] items-center px-4 py-16 sm:px-6">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {renderTitle(title)}
              </h1>
              <p className="mt-5 max-w-md text-sm text-white/70 sm:text-base">
                {subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={buttonLink}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand/90"
                >
                  {buttonText}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={secondaryButtonLink}
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/40 bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:border-brand hover:text-brand"
                >
                  {secondaryButtonText}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits bar overlapping bottom of hero */}
        <div className="relative z-10 mx-auto -mt-8 max-w-[1240px] px-4 pb-8 sm:px-6">
          <div className="grid grid-cols-2 gap-y-6 rounded-lg border border-hairline/70 bg-ink-2 p-6 shadow-lg md:grid-cols-4 md:divide-x md:divide-hairline/60">
            {BENEFITS.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3 px-2 md:px-5">
                <Icon className="h-8 w-8 shrink-0 text-brand" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-white">{title}</p>
                  <p className="text-[11px] text-white/60">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
