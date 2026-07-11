import { Lock } from "lucide-react";

export type PaymentMethodType = "credit_card" | "pix" | "boleto" | "wallets";

interface PaymentMethodsProps {
  selectedMethod: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
}

export function PaymentMethods({ selectedMethod, onSelect }: PaymentMethodsProps) {
  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <h3 className="text-base font-bold text-ink border-b border-gray-100 pb-2">
        3. Método de Pagamento
      </h3>

      <div className="flex flex-col gap-3">
        {/* Method 1: Credit Card */}
        <div
          onClick={() => onSelect("credit_card")}
          className={`border rounded-[4px] p-4 cursor-pointer transition-all ${
            selectedMethod === "credit_card"
              ? "border-brand bg-white ring-1 ring-brand/10"
              : "border-[#D9DDE2] bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Radio */}
              <div className="flex h-5 items-center">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === "credit_card" ? "border-brand" : "border-gray-400"
                  }`}
                >
                  {selectedMethod === "credit_card" && (
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                  )}
                </div>
              </div>

              {/* Text info */}
              <div className="flex flex-col">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold text-ink">Cartão de Crédito</span>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-brand border border-brand rounded">
                    Até 12x sem juros
                  </span>
                </div>
                <span className="text-[10px] text-[#666A72] mt-1">Pague com seu cartão de crédito</span>
              </div>
            </div>

            {/* Card logos */}
            <div className="flex items-center gap-1.5 ml-8 sm:ml-0 self-start sm:self-center">
              {/* Visa */}
              <div className="h-6 w-9 border border-gray-200 rounded bg-[#1A1F71] flex items-center justify-center text-white text-[10px] font-extrabold italic tracking-tight">
                VISA
              </div>
              {/* MasterCard */}
              <div className="h-6 w-9 border border-gray-200 rounded bg-[#222] flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-0.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                  <div className="h-3.5 w-3.5 rounded-full bg-[#F79E1B] opacity-90 -ml-2"></div>
                </div>
              </div>
              {/* Elo */}
              <div className="h-6 w-9 border border-gray-200 rounded bg-white flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[9px] font-black tracking-tighter text-[#00A1E4]">e<span className="text-[#E4002B]">l</span><span className="text-[#FFC20E]">o</span></span>
                </div>
              </div>
              {/* Amex */}
              <div className="h-6 w-9 border border-gray-200 rounded bg-[#0170B9] flex items-center justify-center text-white text-[7px] font-black tracking-tighter uppercase px-0.5 text-center">
                AMEX
              </div>
              {/* Diners */}
              <div className="h-6 w-9 border border-gray-200 rounded bg-[#004A97] flex items-center justify-center text-white text-[7px] font-bold tracking-tighter uppercase text-center">
                DINERS
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: PIX */}
        <div
          onClick={() => onSelect("pix")}
          className={`border rounded-[4px] p-3.5 cursor-pointer transition-all ${
            selectedMethod === "pix"
              ? "border-brand bg-white ring-1 ring-brand/10"
              : "border-[#D9DDE2] bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Radio */}
              <div className="h-5 flex items-center">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === "pix" ? "border-brand" : "border-gray-400"
                  }`}
                >
                  {selectedMethod === "pix" && (
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink">PIX</span>
                  {/* Pix Icon */}
                  <svg className="h-3.5 w-3.5 fill-[#77A23B] stroke-none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm-35.8 358.4L102.4 256l29.8-29.8 88 88 159.2-159.2 29.8 29.8-189 189.6z" fill="#00BDF2"/>
                  </svg>
                  <span className="inline-block px-1 py-0.5 text-[8px] font-semibold text-[#00BDF2] bg-[#00BDF2]/10 rounded">
                    Aprovação imediata
                  </span>
                </div>
                <span className="text-[10px] text-[#666A72] mt-0.5">Aprovação imediata</span>
              </div>
            </div>
          </div>
        </div>

        {/* Method 3: Boleto */}
        <div
          onClick={() => onSelect("boleto")}
          className={`border rounded-[4px] p-3.5 cursor-pointer transition-all ${
            selectedMethod === "boleto"
              ? "border-brand bg-white ring-1 ring-brand/10"
              : "border-[#D9DDE2] bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Radio */}
              <div className="h-5 flex items-center">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === "boleto" ? "border-brand" : "border-gray-400"
                  }`}
                >
                  {selectedMethod === "boleto" && (
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink">Boleto Bancário</span>
                <span className="text-[10px] text-[#666A72] mt-0.5">Aprovação em até 2 dias úteis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Method 4: Digital Wallets */}
        <div
          onClick={() => onSelect("wallets")}
          className={`border rounded-[4px] p-3.5 cursor-pointer transition-all ${
            selectedMethod === "wallets"
              ? "border-brand bg-white ring-1 ring-brand/10"
              : "border-[#D9DDE2] bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Radio */}
              <div className="h-5 flex items-center">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === "wallets" ? "border-brand" : "border-gray-400"
                  }`}
                >
                  {selectedMethod === "wallets" && (
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink">Carteiras Digitais</span>
                <span className="text-[10px] text-[#666A72] mt-0.5">PayPal, Mercado Pago, PicPay e mais</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security statement */}
      <div className="flex items-center gap-2 text-[#666A72] text-[10px] mt-1">
        <Lock className="h-3.5 w-3.5 text-[#666A72]" />
        <span>Seus dados estão protegidos com criptografia SSL de 256 bits.</span>
      </div>
    </div>
  );
}
