import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "@tanstack/react-router";

function Logo() {
  return (
    <Link to="/" className="flex flex-col items-center leading-none outline-none group py-0.5">
      <svg viewBox="0 0 100 100" className="w-8 h-8 mb-1 transition-transform group-hover:scale-105">
        <defs>
          <linearGradient id="logo-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--logo-accent, #FF8A00)" />
            <stop offset="100%" stopColor="var(--logo-text, #FFFFFF)" opacity="0.8" />
          </linearGradient>
        </defs>
        <path
          d="M 73 30 A 32 32 0 1 0 73 70"
          fill="none"
          stroke="url(#logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 73 30 L 53 30"
          fill="none"
          stroke="url(#logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 50 50 L 73 50"
          fill="none"
          stroke="url(#logo-gold-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight">
        <span className="text-logo-accent">Gl</span>
        <span className="text-logo-text">asses</span>
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
