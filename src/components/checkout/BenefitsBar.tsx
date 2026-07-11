import { Users, CreditCard, Truck, Shield } from "lucide-react";

export function BenefitsBar() {
  const items = [
    {
      icon: Users,
      text: "Mais de 500 modelos exclusivos",
    },
    {
      icon: CreditCard,
      text: "Até 12x sem juros no cartão",
    },
    {
      icon: Truck,
      text: "Frete grátis para todo Brasil",
    },
    {
      icon: Shield,
      text: "Satisfação ou seu dinheiro de volta",
    },
  ];

  return (
    <div className="w-full bg-[#101217] py-4 border-b border-[#282C32]/30 select-none">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-1 text-center sm:text-left">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center justify-center lg:justify-start gap-3">
                <Icon className="h-5 w-5 text-brand shrink-0" />
                <span className="text-xs font-semibold text-white/90 tracking-wide uppercase text-[10px] md:text-xs">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
