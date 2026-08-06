import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { fetchHomePageContent, getDirectDriveUrl } from "@/lib/home-service";
import { useCart } from "@/hooks/use-cart";
import { useCustomer } from "@/hooks/use-customer";
import { Link } from "@tanstack/react-router";

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
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed?.colors?.logoUrl || "";
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "";
  });

  const [logoWidth, setLogoWidth] = useState<string | number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed?.colors?.logoWidth || "";
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "";
  });

  const [logoHeight, setLogoHeight] = useState<string | number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("glasses_home_page_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed?.colors?.logoHeight || "";
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "";
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    function readLogo() {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("glasses_home_page_content");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.colors?.logoUrl) {
              setLogoUrl(parsed.colors.logoUrl);
              setLogoWidth(parsed.colors.logoWidth || "");
              setLogoHeight(parsed.colors.logoHeight || "");
              return;
            }
          }
          setLogoUrl("");
          setLogoWidth("");
          setLogoHeight("");
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
          setLogoWidth(data.colors.logoWidth || "");
          setLogoHeight(data.colors.logoHeight || "");
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

  if (!isMounted) {
    return (
      <div style={{ height: "40px", width: "150px" }} />
    );
  }

  if (directLogoUrl) {
    const widthStyle = logoWidth ? `${logoWidth}px` : "auto";
    const heightStyle = logoHeight ? `${logoHeight}px` : "auto";
    return (
      <a href="/" className="flex items-center outline-none py-1">
        <img
          src={directLogoUrl}
          alt="Glasses Logo"
          style={{ width: widthStyle, height: heightStyle }}
          className="object-contain max-w-[350px] max-h-[70px]"
        />
      </a>
    );
  }

  return (
    <a href="/" className="flex flex-col leading-none">
      <span className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-logo-accent">Gl</span>
        <span className="text-logo-text">asses</span>
      </span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/60">
        ÓCULOS COM ESTILO
      </span>
    </a>
  );
}

export function CheckoutHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setCartOpen } = useCart();
  const { customer, logout } = useCustomer();

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
          {/* Profile / Account Dropdown */}
          <div className="relative group hidden sm:block">
            {customer ? (
              <div className="flex items-center gap-1 cursor-pointer hover:text-brand py-2">
                <User className="h-5 w-5 text-brand" />
                <span className="text-[10px] font-bold max-w-[70px] truncate uppercase">{customer.fullName.split(" ")[0]}</span>
                {/* Dropdown Options */}
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#15181D] border border-[#282C32]/45 rounded-md shadow-xl py-1 hidden group-hover:block z-50 text-left">
                  <Link
                    to="/checkout"
                    search={{ action: "" }}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-[#FF8A00] hover:text-white transition-colors font-bold uppercase"
                  >
                    📦 Meus Pedidos
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-4 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-white transition-colors font-bold uppercase bg-transparent border-none cursor-pointer"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/checkout"
                search={{ action: "login" }}
                aria-label="Conta"
                className="cursor-pointer transition-colors hover:text-brand outline-none block py-2"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Carrinho"
            className="relative cursor-pointer transition-colors hover:text-brand bg-transparent border-none p-0 outline-none"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                {count}
              </span>
            )}
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
