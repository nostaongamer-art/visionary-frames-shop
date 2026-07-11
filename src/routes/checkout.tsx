import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CartProvider } from "@/hooks/use-cart";
import { PromotionalBar } from "@/components/checkout/PromotionalBar";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { SecurityBanner } from "@/components/checkout/SecurityBanner";
import { PersonalDataForm } from "@/components/checkout/PersonalDataForm";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ShippingOptions, ShippingType } from "@/components/checkout/ShippingOptions";
import { PaymentMethods, PaymentMethodType } from "@/components/checkout/PaymentMethods";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PurchaseBenefits } from "@/components/checkout/PurchaseBenefits";
import { CustomerTestimonial } from "@/components/checkout/CustomerTestimonial";
import { BenefitsBar } from "@/components/checkout/BenefitsBar";
import { Footer } from "@/components/site/Footer";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutRoute,
});

function CheckoutRoute() {
  return (
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  );
}

function CheckoutPage() {
  // Form States
  const [personalData, setPersonalData] = useState({
    fullName: "João Silva",
    email: "joaosilva@email.com",
    phone: "(11) 98765-4321",
    acceptOffers: false,
  });

  const [addressData, setAddressData] = useState({
    cep: "01310-100",
    street: "Avenida Paulista",
    number: "1578",
    complement: "Conjunto 42",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  });

  const [shippingType, setShippingType] = useState<ShippingType>("free");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("credit_card");

  // Form Errors States
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePersonalDataChange = (field: string, value: any) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    if (personalErrors[field]) {
      setPersonalErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddressDataChange = (field: string, value: any) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const pErrors: Record<string, string> = {};
    const aErrors: Record<string, string> = {};

    // Validate personal data
    if (!personalData.fullName.trim()) {
      pErrors.fullName = "Nome completo é obrigatório.";
    }
    if (!personalData.email.trim()) {
      pErrors.email = "E-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(personalData.email)) {
      pErrors.email = "E-mail inválido.";
    }
    if (!personalData.phone.trim()) {
      pErrors.phone = "Telefone é obrigatório.";
    } else if (personalData.phone.replace(/\D/g, "").length < 10) {
      pErrors.phone = "Telefone inválido.";
    }

    // Validate address data
    if (!addressData.cep.trim()) {
      aErrors.cep = "CEP é obrigatório.";
    } else if (addressData.cep.replace(/\D/g, "").length !== 8) {
      aErrors.cep = "CEP deve conter 8 dígitos.";
    }
    if (!addressData.street.trim()) {
      aErrors.street = "Endereço é obrigatório.";
    }
    if (!addressData.number.trim()) {
      aErrors.number = "Número é obrigatório.";
    }
    if (!addressData.neighborhood.trim()) {
      aErrors.neighborhood = "Bairro é obrigatório.";
    }
    if (!addressData.city.trim()) {
      aErrors.city = "Cidade é obrigatório.";
    }
    if (!addressData.state.trim()) {
      aErrors.state = "Estado é obrigatório.";
    }

    setPersonalErrors(pErrors);
    setAddressErrors(aErrors);

    return Object.keys(pErrors).length === 0 && Object.keys(aErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      toast.success("Pedido finalizado com sucesso! Redirecionando...", {
        duration: 3000,
        icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      });
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    } else {
      toast.error("Por favor, corrija os erros no formulário.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-ink">
      {/* 1. Barra promocional */}
      <PromotionalBar />

      {/* 2. Cabeçalho principal */}
      <CheckoutHeader />

      {/* 3. Indicador de etapas do checkout */}
      <CheckoutStepper />

      {/* Main container */}
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 flex flex-col gap-6">
        {/* 4. Faixa de segurança */}
        <SecurityBanner />

        {/* 5. Área principal */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-2">
          {/* Coluna Esquerda (Formulários) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* 5.1. Dados Pessoais */}
              <PersonalDataForm
                values={personalData}
                errors={personalErrors}
                onChange={handlePersonalDataChange}
              />
            </div>

            <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* 5.2. Endereço de Entrega */}
              <AddressForm
                values={addressData}
                errors={addressErrors}
                onChange={handleAddressDataChange}
              />

              {/* 5.3. Opções de Frete */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-semibold text-ink">Forma de Envio</span>
                <ShippingOptions
                  selectedOption={shippingType}
                  onSelect={setShippingType}
                />
              </div>
            </div>

            <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* 5.4. Método de Pagamento */}
              <PaymentMethods
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF8A00] hover:bg-[#E97800] text-white text-base font-bold py-3.5 px-6 rounded-[4px] shadow-sm transition-colors cursor-pointer select-none text-center disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isSubmitting ? "Processando..." : "Finalizar Compura com Segurança"}
            </button>
          </div>

          {/* Coluna Direita (Resumo e Depoimentos) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 6. Resumo do Pedido */}
            <OrderSummary shippingType={shippingType} />

            {/* 7. Card de diferenciais */}
            <PurchaseBenefits />

            {/* 8. Depoimento do cliente */}
            <CustomerTestimonial />
          </div>
        </form>
      </main>

      {/* 9. Barra horizontal de diferenciais */}
      <BenefitsBar />

      {/* 10. Rodapé completo e 11. Copyright */}
      <Footer />
    </div>
  );
}
