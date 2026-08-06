import { useCart } from "@/hooks/use-cart";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { getDirectDriveUrl } from "@/lib/home-service";
import { PRODUCTS } from "@/lib/shop-data";

const IMAGE_MAP: Record<string, string> = {
  prod1: PRODUCTS[0].image,
  prod2: PRODUCTS[1].image,
  prod3: PRODUCTS[2].image,
  prod4: PRODUCTS[3].image,
};

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.priceVal * item.quantity, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate({ to: "/checkout", search: { action: "" } });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#101217] border-l border-[#282C32]/40 shadow-2xl flex flex-col z-50 animate-slide-in text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-[#282C32]/45 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-wider uppercase text-sm">
            <ShoppingBag className="h-4.5 w-4.5 text-[#FF8A00]" />
            Minha Sacola ({items.reduce((s, i) => s + i.quantity, 0)})
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-20">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-white/50">Sua sacola está vazia.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="text-xs text-[#FF8A00] font-bold hover:underline cursor-pointer"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imageSrc =
                (item.imageUrl && getDirectDriveUrl(item.imageUrl)) ||
                IMAGE_MAP[item.imageKey || ""] ||
                PRODUCTS[Number(item.id) - 1]?.image;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 bg-[#15181D] border border-[#282C32]/25 p-3 rounded-lg relative group transition-colors hover:border-[#282C32]/55"
                >
                  {/* Image */}
                  <div className="h-16 w-16 bg-white rounded overflow-hidden p-1 flex items-center justify-center shrink-0">
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="object-contain h-full w-full"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col pr-6">
                    <span className="text-xs font-black text-white leading-tight">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5 capitalize">
                      {item.category || "Armação de Grau"}
                    </span>
                    
                    {/* Preço e Qtd */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-extrabold text-[#FF8A00]">
                        R$ {(item.priceVal * item.quantity).toFixed(2).replace(".", ",")}
                      </span>

                      {/* Selector */}
                      <div className="flex items-center border border-[#282C32]/45 rounded bg-[#101217] p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#FF8A00] transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-[10px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#FF8A00] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-1 text-white/30 hover:text-red-500 rounded transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#282C32]/45 bg-[#15181D]/50 flex flex-col gap-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-white/60">Subtotal:</span>
              <span className="text-lg font-black text-[#FF8A00]">
                R$ {subtotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full h-11 bg-[#FF8A00] hover:bg-[#E97800] text-white text-xs font-black tracking-wider uppercase rounded flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              Finalizar Compra
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
