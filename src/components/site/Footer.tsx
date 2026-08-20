import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { fetchHomePageContent, DEFAULT_HOME_PAGE_DATA, DEFAULT_FOOTER_PAGES, FooterPageContent, getDirectDriveUrl } from "@/lib/home-service";
import { FooterPageModal } from "@/components/site/FooterPageModal";
import iconInstagram from "@/assets/icon-instagram.png";
import iconFacebook from "@/assets/icon-facebook.png";
import iconWhatsapp from "@/assets/icon-whatsapp.png";
import iconYoutube from "@/assets/icon-youtube.png";

export function Footer() {
  const [footerData, setFooterData] = useState(DEFAULT_HOME_PAGE_DATA.footer);
  const [footerPages, setFooterPages] = useState<FooterPageContent[]>(DEFAULT_FOOTER_PAGES);
  const [selectedPage, setSelectedPage] = useState<FooterPageContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Tentar ler do localStorage primeiro para carregamento instantâneo
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.footer) {
            setFooterData(parsed.footer);
          }
          if (parsed && Array.isArray(parsed.footerPages)) {
            setFooterPages(parsed.footerPages);
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage in Footer:", e);
      }
    }

    // 2. Fetch do banco de dados para garantir que está atualizado
    async function loadFooter() {
      try {
        const data = await fetchHomePageContent();
        if (data && data.footer) {
          setFooterData(data.footer);
        }
        if (data && Array.isArray(data.footerPages)) {
          setFooterPages(data.footerPages);
        }
      } catch (e) {
        console.error("Failed to fetch footer content:", e);
      }
    }

    loadFooter();

    // 3. Ouvir alterações feitas na área administrativa no mesmo navegador
    const handleStorageChange = () => {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.footer) {
            setFooterData(parsed.footer);
          }
          if (parsed && Array.isArray(parsed.footerPages)) {
            setFooterPages(parsed.footerPages);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openFooterModal = (label: string, category: "institucional" | "ajuda") => {
    const norm = label.toLowerCase().trim();
    let page = footerPages.find(p => p.title.toLowerCase().trim() === norm);
    
    if (!page) {
      if (norm.includes("sobre")) page = footerPages.find(p => p.id === "sobre-nos");
      else if (norm.includes("nossa loja") || norm.includes("loja")) page = footerPages.find(p => p.id === "nossa-loja");
      else if (norm.includes("privacidade")) page = footerPages.find(p => p.id === "politica-privacidade");
      else if (norm.includes("troca")) page = footerPages.find(p => p.id === "trocas-devolucoes");
      else if (norm.includes("termo")) page = footerPages.find(p => p.id === "termos-uso");
      else if (norm.includes("como comprar")) page = footerPages.find(p => p.id === "como-comprar");
      else if (norm.includes("prazo") || norm.includes("entrega")) page = footerPages.find(p => p.id === "prazos-entrega");
      else if (norm.includes("rastre")) page = footerPages.find(p => p.id === "rastreamento");
      else if (norm.includes("pergunta") || norm.includes("faq")) page = footerPages.find(p => p.id === "perguntas-frequentes");
    }

    if (!page) {
      page = {
        id: norm.replace(/\s+/g, "-"),
        title: label,
        category,
        content: `Informações sobre ${label}.`,
      };
    }

    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const socialsMap = [
    { icon: iconInstagram, label: "Instagram", url: footerData.instagramUrl, show: footerData.showInstagram !== false },
    { icon: iconFacebook, label: "Facebook", url: footerData.facebookUrl, show: footerData.showFacebook !== false },
    { icon: iconWhatsapp, label: "WhatsApp", url: footerData.whatsappUrl, show: footerData.showWhatsapp !== false },
    { icon: iconYoutube, label: "YouTube", url: footerData.youtubeUrl, show: footerData.showYoutube !== false },
  ];

  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          {footerData.showSobre !== false && (
            <div className="lg:col-span-1">
              <span className="font-display text-2xl font-extrabold tracking-tight">
                <span className="text-logo-accent">Gl</span>
                <span className="text-logo-text">asses</span>
              </span>
              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/60">
                ÓCULOS COM ESTILO
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                {footerData.description}
              </p>
              {footerData.showSocials !== false && (
                <div className="mt-5 flex items-center gap-3">
                  {socialsMap.filter(s => s.show).map((social, i) => {
                    return (
                      <a
                        key={i}
                        href={social.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 duration-200 shrink-0"
                      >
                        <img
                          src={social.icon}
                          alt={social.label}
                          className="h-8 w-8 object-contain rounded"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Column 2: Institucional */}
          {footerData.showInstitucional !== false && (
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
                {footerData.institucionalTitle}
              </h3>
              <ul className="space-y-2.5">
                {footerData.institucionalLinks.filter(l => l.show !== false).map((link, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => openFooterModal(link.label, "institucional")}
                      className="text-sm text-white/60 transition-colors hover:text-brand text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3: Ajuda */}
          {footerData.showAjuda !== false && (
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
                {footerData.ajudaTitle}
              </h3>
              <ul className="space-y-2.5">
                {footerData.ajudaLinks.filter(l => l.show !== false).map((link, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => openFooterModal(link.label, "ajuda")}
                      className="text-sm text-white/60 transition-colors hover:text-brand text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Atendimento */}
          {footerData.showAtendimento !== false && (
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
                {footerData.atendimentoTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                {footerData.atendimentoLines.filter(line => line.show !== false).map((line, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  return (
                    <li key={idx} className={isLast ? "font-semibold text-white mt-1" : ""}>
                      {line.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Column 5: Formas de Pagamento */}
          {footerData.showPayments !== false && (
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
                {footerData.paymentsTitle}
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {footerData.payments.filter(p => p.show !== false).map((p, idx) => {
                  if (p.imageUrl) {
                    return (
                      <img
                        key={idx}
                        src={getDirectDriveUrl(p.imageUrl)}
                        alt={p.label}
                        className="h-8 max-w-[60px] object-contain rounded bg-white p-0.5 border border-hairline"
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                  return (
                    <span
                      key={idx}
                      className="rounded border border-hairline bg-ink-2 px-2.5 py-1.5 text-[11px] font-semibold text-white/80"
                    >
                      {p.label}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/70">
                <Lock className="h-4 w-4 text-brand" />
                <span className="text-xs font-bold tracking-wide uppercase">COMPRA 100% SEGURA</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-hairline/60 py-5">
        <p className="text-center text-xs text-white/50">
          © 2024 Glasses. Todos os direitos reservados.
        </p>
      </div>

      {/* Footer Page Modal Component */}
      <FooterPageModal
        page={selectedPage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </footer>
  );
}
