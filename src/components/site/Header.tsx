import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "@tanstack/react-router";
import { fetchHomePageContent, getDirectDriveUrl } from "@/lib/home-service";

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
      <Link to="/" className="flex items-center outline-none py-1">
        <img
          src={directLogoUrl}
          alt="Glasses Logo"
          className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className="flex flex-col leading-none outline-none">
      <span className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-logo-accent">Gl</span>
        <span className="text-logo-text">asses</span>
      </span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/60">
        ÓCULOS COM ESTILO
      </span>
    </Link>
  );
}

export function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "INÍCIO", href: "/", active: currentPath === "/" },
    { label: "COLEÇÕES", href: "/colecoes", active: currentPath === "/colecoes" },
    { label: "MASCULINO", href: "/masculino", active: currentPath === "/masculino" },
    { label: "FEMININO", href: "/feminino", active: currentPath === "/feminino" },
    { label: "SOLAR", href: "/solar", active: currentPath === "/solar" },
    { label: "PREMIUM", href: "/premium", active: currentPath === "/premium" },
    { label: "PROMOÇÕES", href: "/promocoes", active: currentPath === "/promocoes" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-ink">
      <div className="mx-auto flex h-[78px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-[13px] font-semibold tracking-wide transition-colors relative py-1.5 outline-none ${
                item.active ? "text-brand font-bold" : "text-white/80 hover:text-brand"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-white">
          <button aria-label="Buscar" className="cursor-pointer transition-colors hover:text-brand outline-none">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Conta" className="hidden cursor-pointer transition-colors hover:text-brand sm:block outline-none">
            <User className="h-5 w-5" />
          </button>
          <Link to="/checkout" aria-label="Carrinho" className="relative cursor-pointer transition-colors hover:text-brand outline-none">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
              {count}
            </span>
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="cursor-pointer transition-colors hover:text-brand lg:hidden outline-none"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-hairline/60 bg-ink px-4 py-3 lg:hidden flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className={`py-2 text-sm font-semibold tracking-wide outline-none relative inline-block self-start ${
                item.active ? "text-brand font-bold" : "text-white/80"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
