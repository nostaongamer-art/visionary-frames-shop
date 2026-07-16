import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { fetchHomePageContent, getDirectDriveUrl } from "@/lib/home-service";

const NAV_ITEMS = [
  { label: "INÍCIO", href: "/" },
  { label: "COLEÇÕES", href: "/#categorias" },
  { label: "MASCULINO", href: "/#categorias" },
  { label: "FEMININO", href: "/#categorias" },
  { label: "SOLAR", href: "/#categorias" },
  { label: "PREMIUM", href: "/#categorias" },
  { label: "PROMOÇÕES", href: "/#oferta" },
];

function Logo() {
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    function readLogo() {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("glasses_home_page_content");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.colors?.logoUrl) {
              setLogoUrl(parsed.colors.logoUrl);
              return;
            }
          }
          setLogoUrl("");
        } catch (e) {
          console.error("Error reading logoUrl from localStorage:", e);
        }
      }
    }
    readLogo();

    async function loadFromDb() {
      try {
        const data = await fetchHomePageContent();
        if (data?.colors?.logoUrl) {
          setLogoUrl(data.colors.logoUrl);
        }
      } catch (e) {
        console.error("Error loading logoUrl from db:", e);
      }
    }
    loadFromDb();

    const handleStorage = () => {
      readLogo();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const directLogoUrl = logoUrl ? getDirectDriveUrl(logoUrl) : "";

  if (directLogoUrl) {
    return (
      <a href="/" className="flex items-center outline-none py-1">
        <img
          src={directLogoUrl}
          alt="Glasses Logo"
          className="h-9 md:h-11 w-auto object-contain max-w-[200px]"
        />
      </a>
    );
  }

  return (
    <a href="/" className="flex flex-col items-center leading-none group py-0.5">
      <svg viewBox="0 0 100 100" className="w-7 h-7 mb-1 transition-transform group-hover:scale-105">
        <defs>
          <linearGradient id="checkout-logo-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--logo-accent, #FF8A00)" />
            <stop offset="100%" stopColor="var(--logo-text, #FFFFFF)" opacity="0.8" />
          </linearGradient>
        </defs>
        <path
          d="M 73 30 A 32 32 0 1 0 73 70"
          fill="none"
          stroke="url(#checkout-logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 73 30 L 53 30"
          fill="none"
          stroke="url(#checkout-logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 50 50 L 73 50"
          fill="none"
          stroke="url(#checkout-logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight">
        <span className="text-logo-accent">Gl</span>
        <span className="text-logo-text">asses</span>
      </span>
    </a>
  );
}

export function CheckoutHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#282C32]/40 bg-ink h-[72px] flex items-center">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] font-semibold tracking-wide text-white/80 hover:text-brand transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-white">
          <button aria-label="Buscar" className="cursor-pointer transition-colors hover:text-brand">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Conta" className="hidden cursor-pointer transition-colors hover:text-brand sm:block">
            <User className="h-5 w-5" />
          </button>
          <button aria-label="Carrinho" className="relative cursor-pointer transition-colors hover:text-brand">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
              1
            </span>
          </button>
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="cursor-pointer transition-colors hover:text-brand lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="absolute top-[72px] left-0 w-full border-t border-[#282C32]/60 bg-ink px-4 py-3 lg:hidden flex flex-col gap-2 z-50">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold tracking-wide text-white/80 hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
