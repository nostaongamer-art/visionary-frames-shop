import { Star } from "lucide-react";
import client3 from "@/assets/client-3.jpg";

export function CustomerTestimonial() {
  return (
    <div className="w-full bg-white border border-[#D9DDE2] rounded-md p-4 flex gap-4 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Client avatar */}
      <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 border border-gray-100">
        <img src={client3} alt="Ricardo S." className="h-full w-full object-cover" />
      </div>

      {/* Review details */}
      <div className="flex flex-col gap-1.5">
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
          ))}
        </div>

        {/* Text */}
        <p className="text-xs text-[#282C32] italic leading-relaxed">
          "A qualidade dos óculos é incrível! Chegou rápido e o atendimento foi excelente."
        </p>

        {/* Client Name & ID */}
        <div className="flex flex-col leading-tight mt-1">
          <span className="text-xs font-bold text-ink">Ricardo S.</span>
          <span className="text-[10px] text-[#666A72]">Cliente Glasses</span>
        </div>
      </div>
    </div>
  );
}
