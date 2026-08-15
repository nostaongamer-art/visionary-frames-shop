import { Truck, PackageCheck, Loader2 } from "lucide-react";

export type ShippingType = "free" | "express" | string;

export interface DynamicShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
  deliveryRange: string;
}

interface ShippingOptionsProps {
  selectedOption: ShippingType;
  onSelect: (option: ShippingType, price: number) => void;
  dynamicOptions?: DynamicShippingOption[];
  loading?: boolean;
}

export function ShippingOptions({
  selectedOption,
  onSelect,
  dynamicOptions = [],
  loading = false,
}: ShippingOptionsProps) {
  if (loading) {
    return (
      <div className="w-full border border-brand/20 bg-brand/5 rounded-[4px] p-4 flex items-center justify-center gap-3 text-xs font-semibold text-brand animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        Calculando frete dos Correios em tempo real para o seu CEP...
      </div>
    );
  }

  if (dynamicOptions.length > 0) {
    return (
      <div className="w-full flex flex-col gap-3 select-none">
        <span className="text-[11px] font-extrabold text-ink uppercase tracking-wider block flex items-center gap-1">
          <Truck className="h-3.5 w-3.5 text-brand" /> Opções de Frete Calculadas (Melhor Envio / Correios):
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Always offer Free Shipping option as 1st choice if promotion active */}
          <div
            onClick={() => onSelect("free", 0)}
            className={`border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
              selectedOption === "free"
                ? "border-brand bg-white ring-1 ring-brand/10"
                : "border-[#D9DDE2] bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedOption === "free" ? "border-brand" : "border-gray-400"
                  }`}
                >
                  {selectedOption === "free" && (
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                  )}
                </div>
              </div>
              <Truck className={`h-5 w-5 stroke-[1.5] ${selectedOption === "free" ? "text-brand" : "text-gray-400"}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-ink">Frete Grátis (Promocional)</span>
                <span className="text-[10px] text-[#666A72]">7 a 12 dias úteis</span>
              </div>
            </div>
            <span className="text-xs font-black text-green-600 uppercase">Grátis</span>
          </div>

          {/* Dynamic Correios / Carrier options */}
          {dynamicOptions.map((opt) => {
            const isSelected = selectedOption === opt.id || selectedOption === opt.name;
            return (
              <div
                key={opt.id}
                onClick={() => onSelect(opt.id, opt.price)}
                className={`border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "border-brand bg-white ring-1 ring-brand/10"
                    : "border-[#D9DDE2] bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-brand" : "border-gray-400"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-brand"></div>
                      )}
                    </div>
                  </div>
                  <PackageCheck className={`h-5 w-5 stroke-[1.5] ${isSelected ? "text-brand" : "text-gray-400"}`} />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-ink">{opt.company} - {opt.name}</span>
                    <span className="text-[10px] text-[#666A72]">Chega em {opt.deliveryRange}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-brand">
                  R$ {opt.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback default static options
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
      {/* Option 1: Free Shipping */}
      <div
        onClick={() => onSelect("free", 0)}
        className={`h-[74px] border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
          selectedOption === "free"
            ? "border-brand bg-white ring-1 ring-brand/10"
            : "border-[#D9DDE2] bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                selectedOption === "free" ? "border-brand" : "border-gray-400"
              }`}
            >
              {selectedOption === "free" && (
                <div className="h-2 w-2 rounded-full bg-brand"></div>
              )}
            </div>
          </div>

          <Truck className={`h-6 w-6 stroke-[1.5] ${selectedOption === "free" ? "text-brand" : "text-gray-400"}`} />

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-ink">Frete Grátis</span>
            <span className="text-[10px] text-[#666A72]">7 a 12 dias úteis</span>
          </div>
        </div>
      </div>

      {/* Option 2: Express Shipping */}
      <div
        onClick={() => onSelect("express", 29.90)}
        className={`h-[74px] border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
          selectedOption === "express"
            ? "border-brand bg-white ring-1 ring-brand/10"
            : "border-[#D9DDE2] bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                selectedOption === "express" ? "border-brand" : "border-gray-400"
              }`}
            >
              {selectedOption === "express" && (
                <div className="h-2 w-2 rounded-full bg-brand"></div>
              )}
            </div>
          </div>

          <Truck className={`h-6 w-6 stroke-[1.5] ${selectedOption === "express" ? "text-brand" : "text-gray-400"}`} />

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-ink">R$ 29,90</span>
            <span className="text-[10px] font-semibold text-ink">Entrega Expressa</span>
            <span className="text-[9px] text-[#666A72]">3 a 5 dias úteis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
