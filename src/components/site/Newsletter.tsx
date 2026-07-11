import { useState } from "react";
import { Ticket, Bell, Sparkles } from "lucide-react";
import couple from "@/assets/newsletter-couple.jpg";

const PERKS = [
  { icon: Ticket, label: "Cupons Exclusivos" },
  { icon: Bell, label: "Novidades em Primeira Mão" },
  { icon: Sparkles, label: "Conteúdos de Estilo" },
];

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError("Digite um e-mail válido.");
      setDone(false);
      return;
    }
    setError("");
    setDone(true);
  };

  return (
    <section className="relative bg-ink">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-stretch gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[300px_1fr_260px] lg:gap-6">
        {/* Left image */}
        <div className="overflow-hidden rounded-lg">
          <img
            src={couple}
            alt="Homem e mulher usando óculos"
            width={700}
            height={700}
            loading="lazy"
            className="h-full max-h-64 w-full object-cover lg:max-h-none"
          />
        </div>

        {/* Center form */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold tracking-[0.2em] text-brand">CADASTRE-SE E GANHE</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            10% OFF NA SUA
            <br />
            PRIMEIRA COMPRA
          </h2>
          <p className="mt-2 text-sm text-white/60">Receba promoções exclusivas e lançamentos!</p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 rounded-md border border-hairline bg-ink-2 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand/90"
            >
              EU QUERO!
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          {done && <p className="mt-2 text-xs text-brand">Cadastro realizado com sucesso!</p>}
          <p className="mt-2 text-[11px] text-white/40">
            *Válido para compras acima de R$ 200,00.
          </p>
        </div>

        {/* Right perks */}
        <div className="flex flex-col justify-center gap-5">
          {PERKS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
