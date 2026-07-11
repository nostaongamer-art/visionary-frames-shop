import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/shop-data";
import { useCart } from "@/hooks/use-cart";

function Logo() {
  return (
    <a href="#top" className="flex flex-col leading-none">
      <span className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-brand">Gl</span>
        <span className="text-white">asses</span>
      </span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/60">
        ÓCULOS COM ESTILO
      </span>
    </a>
  );
}

export function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-ink">
      <div className="mx-auto flex h-[78px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-[13px] font-semibold tracking-wide transition-colors ${
                item.active ? "text-brand" : "text-white/80 hover:text-brand"
              }`}
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
              {count}
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
        <nav className="border-t border-hairline/60 bg-ink px-4 py-3 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-semibold tracking-wide ${
                item.active ? "text-brand" : "text-white/80"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
