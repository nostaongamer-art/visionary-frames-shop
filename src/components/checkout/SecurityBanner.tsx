import { ShieldCheck, Lock, Shield } from "lucide-react";

export function SecurityBanner() {
  return (
    <div className="w-full bg-white border border-[#D9DDE2] rounded-md py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-6 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left Item */}
      <div className="flex items-center gap-4 border-b md:border-b-0 pb-4 md:pb-0 border-[#D9DDE2] w-full md:w-auto">
        <ShieldCheck className="h-10 w-10 text-brand stroke-[1.5]" />
        <div>
          <h4 className="text-xs font-bold text-ink tracking-wider uppercase">COMPRA 100% SEGURA</h4>
          <p className="text-[11px] text-[#666A72] mt-0.5">Seus dados estão protegidos conosco.</p>
        </div>
      </div>

      {/* Right Items Grid */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 md:gap-8 w-full md:w-auto">
        {/* Sub-item 1 */}
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-ink stroke-[1.5]" />
          <div>
            <h5 className="text-[10px] font-bold text-ink uppercase tracking-wide">SITE SEGURO</h5>
            <p className="text-[9px] text-[#666A72]">SSL Encryption</p>
          </div>
        </div>

        {/* Sub-item 2 */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-ink stroke-[1.5]" />
          <div>
            <h5 className="text-[10px] font-bold text-ink uppercase tracking-wide">SATISFAÇÃO</h5>
            <p className="text-[9px] text-[#666A72]">ou seu dinheiro de volta</p>
          </div>
        </div>

        {/* Sub-item 3 */}
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-ink stroke-[1.5]" />
          <div>
            <h5 className="text-[10px] font-bold text-ink uppercase tracking-wide">PRIVACIDADE</h5>
            <p className="text-[9px] text-[#666A72]">Seus dados protegidos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
