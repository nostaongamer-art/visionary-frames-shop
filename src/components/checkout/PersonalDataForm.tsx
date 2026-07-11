import { Phone } from "lucide-react";

interface PersonalDataFormProps {
  values: {
    fullName: string;
    email: string;
    phone: string;
    acceptOffers: boolean;
  };
  errors: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  onChange: (field: string, value: any) => void;
}

export function PersonalDataForm({ values, errors, onChange }: PersonalDataFormProps) {
  // Format phone as (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 11) {
      input = input.substring(0, 11);
    }
    
    let formatted = input;
    if (input.length > 2) {
      formatted = `(${input.substring(0, 2)}) ${input.substring(2)}`;
    }
    if (input.length > 7) {
      formatted = `(${input.substring(0, 2)}) ${input.substring(2, 7)}-${input.substring(7)}`;
    }
    
    onChange("phone", formatted);
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <h3 className="text-base font-bold text-ink border-b border-gray-100 pb-2">
        1. Dados Pessoais
      </h3>

      {/* Nome completo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-xs font-semibold text-ink">
          Nome completo
        </label>
        <input
          id="fullName"
          type="text"
          value={values.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          className={`w-full h-[38px] px-3 bg-white border ${
            errors.fullName ? "border-red-500" : "border-[#D9DDE2]"
          } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
          placeholder="Ex: João Silva"
        />
        {errors.fullName && (
          <span className="text-[10px] text-red-500 font-semibold">{errors.fullName}</span>
        )}
      </div>

      {/* E-mail & Telefone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* E-mail */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-ink">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.email ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="joao@exemplo.com"
          />
          {errors.email && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.email}</span>
          )}
        </div>

        {/* Telefone/WhatsApp */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-ink">
            Telefone/WhatsApp
          </label>
          <div className="relative">
            <input
              id="phone"
              type="text"
              value={values.phone}
              onChange={handlePhoneChange}
              className={`w-full h-[38px] pl-3 pr-10 bg-white border ${
                errors.phone ? "border-red-500" : "border-[#D9DDE2]"
              } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
              placeholder="(11) 99999-9999"
            />
            {/* WhatsApp Green Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <svg
                className="h-4.5 w-4.5 fill-[#18C75A] text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.5 0 10-4.5 10-10S16.9 1 11.4 1c-5.5 0-10 4.5-10 10 0 1.9.5 3.7 1.5 5.3L1.9 22.1l4.8-1.25zM17.5 14.3c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.1.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-1-.9-1.6-1.9-1.8-2.2-.2-.3-.02-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C9.6 9 9 7.5 8.7 6.9c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.2 1.3 3.4.1.2 2.3 3.6 5.7 5.1.8.3 1.5.5 2 .7.8.2 1.6.2 2.2.1.7-.1 2.1-.8 2.4-1.6.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.4z" />
              </svg>
            </div>
          </div>
          {errors.phone && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.phone}</span>
          )}
        </div>
      </div>

      {/* Ofertas checkbox */}
      <div className="flex items-start gap-2 mt-1">
        <input
          id="acceptOffers"
          type="checkbox"
          checked={values.acceptOffers}
          onChange={(e) => onChange("acceptOffers", e.target.checked)}
          className="h-4 w-4 rounded border-[#D9DDE2] text-brand focus:ring-brand cursor-pointer mt-0.5 accent-brand"
        />
        <label htmlFor="acceptOffers" className="text-xs text-[#666A72] leading-tight cursor-pointer">
          Quero receber ofertas exclusivas no meu e-mail e WhatsApp
        </label>
      </div>
    </div>
  );
}
