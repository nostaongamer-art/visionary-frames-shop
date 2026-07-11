import { Instagram, Facebook, Youtube, MessageCircle, Lock } from "lucide-react";

const INSTITUCIONAL = [
  "Sobre Nós",
  "Nossa Loja",
  "Política de Privacidade",
  "Trocas e Devoluções",
  "Termos de Uso",
];
const AJUDA = [
  "Como Comprar",
  "Formas de Pagamento",
  "Prazos de Entrega",
  "Rastreamento",
  "Perguntas Frequentes",
];
const PAYMENTS = ["Visa", "Master", "Amex", "Boleto", "Pix"];

function Column({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold tracking-wide text-white">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-white/60 transition-colors hover:text-brand">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-brand">Gl</span>
              <span className="text-white">asses</span>
            </span>
            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/60">
              ÓCULOS COM ESTILO
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              A Glasses nasceu para transformar seu estilo e sua visão. Aqui você encontra os
              melhores óculos com qualidade e preço justo.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, MessageCircle, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-white/70 transition-colors hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <Column title="INSTITUCIONAL" links={INSTITUCIONAL} />
          <Column title="AJUDA" links={AJUDA} />

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wide text-white">ATENDIMENTO</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>WhatsApp</li>
              <li>E-mail</li>
              <li>Horário de Atendimento</li>
              <li className="font-semibold text-white">Seg a Sex 08h às 18h</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wide text-white">FORMAS DE PAGAMENTO</h3>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded border border-hairline bg-ink-2 px-2.5 py-1.5 text-[11px] font-semibold text-white/80"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-white/70">
              <Lock className="h-4 w-4 text-brand" />
              <span className="text-xs font-bold tracking-wide">COMPRA 100% SEGURA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline/60 py-5">
        <p className="text-center text-xs text-white/50">
          © 2024 Glasses. Todos os direitos reservados. | v1.3.4
        </p>
      </div>
    </footer>
  );
}
