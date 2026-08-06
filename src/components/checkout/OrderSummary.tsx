import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { getDirectDriveUrl } from "@/lib/home-service";
import { PRODUCTS } from "@/lib/shop-data";

const IMAGE_MAP: Record<string, string> = {
  prod1: PRODUCTS[0].image,
  prod2: PRODUCTS[1].image,
  prod3: PRODUCTS[2].image,
  prod4: PRODUCTS[3].image,
};

interface OrderSummaryProps {
  shippingType: "free" | "express";
}

export function OrderSummary({ shippingType }: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const { items } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.priceVal * item.quantity, 0);
  const initialDiscount = subtotal * 0.15; // 15% OFF standard store discount
  const shippingCost = shippingType === "express" ? 29.90 : 0;
  
  // Calculate extra coupon discount if applicable
  const extraDiscount = appliedCoupon ? subtotal * 0.10 : 0; // 10% extra coupon discount
  
  const total = Math.max(0, subtotal - initialDiscount - extraDiscount + shippingCost);
  const installmentAmount = total / 12;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === "GLASSES10" || couponCode.toUpperCase() === "DESCONTO10") {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponError("");
      setCouponCode("");
    } else {
      setCouponError("Cupom inválido.");
      setAppliedCoupon(null);
    }
  };

  return (
    <div className="w-full bg-[#101217] rounded-md p-5 text-white select-none shadow-md">
      <h3 className="text-base font-bold tracking-wide border-b border-white/10 pb-3 mb-4">
        Resumo do Pedido
      </h3>

      {/* Product list */}
      <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-1 pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-white/40 italic py-4 text-center">Nenhum produto selecionado</p>
        ) : (
          items.map((item) => {
            const imageSrc =
              (item.imageUrl && getDirectDriveUrl(item.imageUrl)) ||
              IMAGE_MAP[item.imageKey || ""] ||
              PRODUCTS[Number(item.id) - 1]?.image;

            return (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 bg-white rounded-[4px] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={imageSrc} alt={item.name} className="object-contain h-full w-full" />
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-white/90 leading-tight">{item.name}</span>
                    <span className="text-white/60 text-[10px] capitalize">{item.category || "Armação de Grau"}</span>
                    <span className="text-white/40 text-[10px] mt-0.5">Qtde: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand">
                    R$ {(item.priceVal * item.quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Financial lines */}
      <div className="border-t border-white/10 py-3 flex flex-col gap-2.5 text-xs text-white/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-white/90">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="flex justify-between">
          <span>Desconto (15% OFF)</span>
          <span className="font-medium text-[#00C83C]">- R$ {initialDiscount.toFixed(2).replace(".", ",")}</span>
        </div>
        
        {appliedCoupon && (
          <div className="flex justify-between animate-fadeIn">
            <span>Cupom ({appliedCoupon})</span>
            <span className="font-medium text-[#00C83C]">- R$ {extraDiscount.toFixed(2).replace(".", ",")}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Frete</span>
          <span className={`font-medium ${shippingCost === 0 ? "text-[#00C83C]" : "text-white/90"}`}>
            {shippingCost === 0 ? "Grátis" : `R$ ${shippingCost.toFixed(2).replace(".", ",")}`}
          </span>
        </div>
      </div>

      {/* Total block */}
      <div className="border-t border-white/10 py-4 flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-xl font-bold text-brand">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] md:text-xs text-white/70">
            em até <span className="font-bold text-brand">12x de R$ {installmentAmount.toFixed(2).replace(".", ",")}</span> sem juros
          </span>
        </div>
      </div>

      {/* Coupon form */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <span className="text-[11px] text-white/70 block mb-2">Tem um cupom de desconto?</span>
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Digite seu cupom"
            className="flex-1 h-9 px-3 bg-[#15181D] border border-white/10 rounded-[4px] text-xs text-white outline-none focus:border-brand transition-colors"
          />
          <button
            type="submit"
            className="h-9 px-4 bg-transparent border border-brand hover:bg-brand-2 text-white text-xs font-bold rounded-[4px] transition-colors"
          >
            Aplicar
          </button>
        </form>

        {appliedCoupon && (
          <p className="text-[10px] text-[#00C83C] font-semibold mt-1.5 animate-fadeIn">
            ✓ Cupom {appliedCoupon} aplicado com sucesso!
          </p>
        )}

        {couponError && (
          <p className="text-[10px] text-red-500 font-semibold mt-1.5 animate-fadeIn">
            ✗ {couponError} Tente "GLASSES10"
          </p>
        )}
      </div>
    </div>
  );
}
