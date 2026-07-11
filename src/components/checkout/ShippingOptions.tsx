import { Truck } from "lucide-react";

export type ShippingType = "free" | "express";

interface ShippingOptionsProps {
  selectedOption: ShippingType;
  onSelect: (option: ShippingType) => void;
}

export function ShippingOptions({ selectedOption, onSelect }: ShippingOptionsProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
      {/* Option 1: Free Shipping */}
      <div
        onClick={() => onSelect("free")}
        className={`h-[74px] border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
          selectedOption === "free"
            ? "border-brand bg-white ring-1 ring-brand/10"
            : "border-[#D9DDE2] bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Custom radio button */}
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

          {/* Truck Icon */}
          <Truck className={`h-6 w-6 stroke-[1.5] ${selectedOption === "free" ? "text-brand" : "text-gray-400"}`} />

          {/* Text details */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ink">Frete Grátis</span>
            <span className="text-[10px] text-[#666A72]">7 a 12 dias úteis</span>
          </div>
        </div>
      </div>

      {/* Option 2: Express Shipping */}
      <div
        onClick={() => onSelect("express")}
        className={`h-[74px] border rounded-[4px] p-3 flex items-center justify-between cursor-pointer transition-all ${
          selectedOption === "express"
            ? "border-brand bg-white ring-1 ring-brand/10"
            : "border-[#D9DDE2] bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Custom radio button */}
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

          {/* Truck Icon */}
          <Truck className={`h-6 w-6 stroke-[1.5] ${selectedOption === "express" ? "text-brand" : "text-gray-400"}`} />

          {/* Text details */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ink">R$ 29,90</span>
            <span className="text-[10px] font-semibold text-ink">Entrega Expressa</span>
            <span className="text-[9px] text-[#666A72]">3 a 5 dias úteis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
