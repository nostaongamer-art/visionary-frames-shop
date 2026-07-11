import { Truck, Shield, CreditCard, ShieldCheck } from "lucide-react";

export function PurchaseBenefits() {
  const benefits = [
    {
      icon: Truck,
      title: "Frete Grátis",
      description: "Para todo o Brasil",
    },
    {
      icon: Shield,
      title: "Troca Garantida",
      description: "Até 7 dias após o recebimento",
    },
    {
      icon: CreditCard,
      title: "Pagamento Seguro",
      description: "Ambiente 100% seguro",
    },
    {
      icon: ShieldCheck,
      title: "Satisfação Garantida",
      description: "Mais de 10.000 clientes satisfeitos",
    },
  ];

  return (
    <div className="w-full bg-white border border-[#D9DDE2] rounded-md p-4 flex flex-col gap-4 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {benefits.map((benefit, i) => {
        const Icon = benefit.icon;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5">
              <Icon className="h-5 w-5 text-brand stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink leading-tight">{benefit.title}</span>
              <span className="text-[10px] text-[#666A72] mt-0.5">{benefit.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
