import { ChevronDown } from "lucide-react";

interface AddressFormProps {
  values: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  errors: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  onChange: (field: string, value: any) => void;
}

export function AddressForm({ values, errors, onChange }: AddressFormProps) {
  // Format CEP as XXXXX-XXX
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    
    let formatted = input;
    if (input.length > 5) {
      formatted = `${input.substring(0, 5)}-${input.substring(5)}`;
    }
    
    onChange("cep", formatted);
  };

  const states = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <h3 className="text-base font-bold text-ink border-b border-gray-100 pb-2">
        2. Endereço de Entrega
      </h3>

      {/* Row 1: CEP (left) and Street (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CEP */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <div className="flex items-center justify-between">
            <label htmlFor="cep" className="text-xs font-semibold text-ink">
              CEP
            </label>
            <a href="#" className="text-[10px] font-bold text-brand hover:text-brand-dark transition-colors">
              Não sei meu CEP
            </a>
          </div>
          <input
            id="cep"
            type="text"
            value={values.cep}
            onChange={handleCepChange}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.cep ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="00000-000"
          />
          {errors.cep && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.cep}</span>
          )}
        </div>

        {/* Street (aligned, no label) */}
        <div className="flex flex-col gap-1.5 md:col-span-2 justify-end">
          <input
            id="street"
            type="text"
            value={values.street}
            onChange={(e) => onChange("street", e.target.value)}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.street ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="Endereço (Rua, Avenida...)"
          />
          {errors.street && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.street}</span>
          )}
        </div>
      </div>

      {/* Row 2: Number (left) and Complement (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label htmlFor="number" className="text-xs font-semibold text-ink">
            Número
          </label>
          <input
            id="number"
            type="text"
            value={values.number}
            onChange={(e) => onChange("number", e.target.value)}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.number ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="123"
          />
          {errors.number && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.number}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="complement" className="text-xs font-semibold text-ink text-opacity-80">
            Complemento (opcional)
          </label>
          <input
            id="complement"
            type="text"
            value={values.complement}
            onChange={(e) => onChange("complement", e.target.value)}
            className="w-full h-[38px] px-3 bg-white border border-[#D9DDE2] rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors"
            placeholder="Apto, Bloco, Conjunto..."
          />
        </div>
      </div>

      {/* Row 3: Bairro, Cidade, Estado */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Bairro */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="neighborhood" className="text-xs font-semibold text-ink">
            Bairro
          </label>
          <input
            id="neighborhood"
            type="text"
            value={values.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.neighborhood ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="Bairro"
          />
          {errors.neighborhood && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.neighborhood}</span>
          )}
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="city" className="text-xs font-semibold text-ink">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={`w-full h-[38px] px-3 bg-white border ${
              errors.city ? "border-red-500" : "border-[#D9DDE2]"
            } rounded-[4px] text-sm text-ink outline-none focus:border-brand transition-colors`}
            placeholder="Cidade"
          />
          {errors.city && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.city}</span>
          )}
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label htmlFor="state" className="text-xs font-semibold text-ink">
            Estado
          </label>
          <div className="relative">
            <select
              id="state"
              value={values.state}
              onChange={(e) => onChange("state", e.target.value)}
              className={`w-full h-[38px] pl-3 pr-8 bg-white border ${
                errors.state ? "border-red-500" : "border-[#D9DDE2]"
              } rounded-[4px] text-sm text-ink outline-none focus:border-brand appearance-none cursor-pointer transition-colors`}
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666A72]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {errors.state && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.state}</span>
          )}
        </div>
      </div>
    </div>
  );
}
