import { ShoppingCart } from "lucide-react";

export function CheckoutStepper() {
  return (
    <div className="w-full bg-[#111318] py-8 border-b border-[#282C32]/30 select-none">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex items-center justify-center max-w-[700px] mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-white/70">Carrinho</span>
          </div>

          {/* Line 1 -> 2 */}
          <div className="flex-1 h-[2px] bg-brand -mt-6 mx-2"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold text-sm shadow-sm ring-4 ring-brand/20">
              2
            </div>
            <span className="mt-2 text-xs font-bold text-white">Checkout</span>
          </div>

          {/* Line 2 -> 3 */}
          <div className="flex-1 h-[2px] bg-[#282C32] -mt-6 mx-2"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#282C32] text-white/50 font-bold text-sm">
              3
            </div>
            <span className="mt-2 text-xs font-semibold text-white/40">Pagamento</span>
          </div>

          {/* Line 3 -> 4 */}
          <div className="flex-1 h-[2px] bg-[#282C32] -mt-6 mx-2"></div>

          {/* Step 4 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#282C32] text-white/50 font-bold text-sm">
              4
            </div>
            <span className="mt-2 text-xs font-semibold text-white/40">Confirmação</span>
          </div>
        </div>
      </div>
    </div>
  );
}
