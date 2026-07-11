import { useState } from "react";
import prod4 from "@/assets/prod-4.jpg";

interface OrderSummaryProps {
  shippingType: "free" | "express";
}

export function OrderSummary({ shippingType }: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const subtotal = 269.90;
  const initialDiscount = 40.49; // 15% OFF
  const shippingCost = shippingType === "express" ? 29.90 : 0;
  
  // Calculate extra coupon discount if applicable
  const extraDiscount = appliedCoupon ? 22.94 : 0; // 10% extra
  
  const total = subtotal - initialDiscount - extraDiscount + shippingCost;
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
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-white rounded-[4px] p-1 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={prod4} alt="Óculos Solar Polarizado" className="object-contain h-full w-full" />
          </div>
          <div className="flex flex-col text-xs md:text-sm">
            <span className="font-semibold text-white/90 leading-tight">Óculos Solar Polarizado</span>
            <span className="text-white/60 text-[10px] md:text-xs">Premium Black</span>
            <span className="text-white/40 text-[10px] mt-1">Qtde: 1</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-brand">R$ 269,90</span>
        </div>
      </div>

      {/* Financial lines */}
      <div className="border-t border-white/10 py-3 flex flex-col gap-2.5 text-xs text-white/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-white/90">R$ 269,90</span>
        </div>
        <div className="flex justify-between">
          <span>Desconto (15% OFF)</span>
          <span className="font-medium text-[#00C83C]">- R$ 40,49</span>
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
            className="h-9 px-4 bg-transparent border border-brand hover:bg-brand text-white text-xs font-bold rounded-[4px] transition-colors"
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
