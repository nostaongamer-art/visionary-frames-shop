import { ArrowRight, Truck, ShieldCheck, Users, CreditCard } from "lucide-react";
import heroMan from "@/assets/hero-man.jpg";

const BENEFITS = [
  { icon: Truck, title: "FRETE GRÁTIS", subtitle: "Para todo Brasil" },
  { icon: ShieldCheck, title: "TROCA GARANTIDA", subtitle: "Até 7 dias após o recebimento" },
  { icon: Users, title: "10.000+ CLIENTES", subtitle: "Satisfeitos" },
  { icon: CreditCard, title: "ATÉ 12X SEM JUROS", subtitle: "No cartão de crédito" },
];

export function Hero() {
  return (
    <section id="top" className="relative bg-ink">
      <div className="relative">
        {/* Hero content */}
        <div className="relative min-h-[560px] overflow-hidden md:min-h-[600px]">
          {/* Background image on the right */}
          <div className="absolute inset-0">
            <img
              src={heroMan}
              alt="Homem jovem usando óculos escuros pretos"
              width={1200}
              height={1200}
              className="ml-auto h-full w-full object-cover object-center md:w-[62%]"
            />
            {/* Dark gradient over the left for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-transparent md:via-ink/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent md:hidden" />
          </div>

          <div className="relative mx-auto flex h-full max-w-[1240px] items-center px-4 py-16 sm:px-6">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Encontre o
                <br />
                <span className="text-brand">Óculos Perfeito</span>
                <br />
                Para Seu Estilo
              </h1>
              <p className="mt-5 max-w-md text-sm text-white/70 sm:text-base">
                Mais de 500 modelos exclusivos para transformar sua aparência e sua confiança.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#mais-vendidos"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand/90"
                >
                  COMPRAR AGORA
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#categorias"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/40 bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:border-brand hover:text-brand"
                >
                  VER COLEÇÃO
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
