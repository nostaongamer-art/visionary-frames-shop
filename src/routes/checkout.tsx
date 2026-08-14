import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { ShieldCheck, User, Package, Calendar, MapPin, CreditCard, LogOut, CheckCircle2, Circle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCustomer } from "@/hooks/use-customer";
import { saveOrder, saveCustomerAccount, findCustomerByEmailAndName } from "@/lib/orders-service";
import type { Order } from "@/lib/orders-service";
import { fetchPaymentSettings } from "@/lib/payment-service";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout Seguro | Glasses" },
      { name: "description", content: "Finalize sua compra de óculos com segurança na Glasses." },
      { property: "og:title", content: "Checkout Seguro | Glasses" },
      { property: "og:description", content: "Finalize sua compra de óculos com segurança na Glasses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: (search.action as string) || "",
    };
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { action } = Route.useSearch();
  const { items, clearCart } = useCart();
  const { customer, orders, login, logout, refreshOrders } = useCustomer();

  // Form States (Starts Completely BLANK for Real Customer)
  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    acceptOffers: false,
  });

  const [addressData, setAddressData] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [shippingType, setShippingType] = useState<ShippingType>("free");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("credit_card");

  // Form Errors States
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-purchase flow steps: "checkout" | "registration-offer" | "registration-form" | "registration-success" | "thank-you" | "login"
  const [checkoutStep, setCheckoutStep] = useState<
    "checkout" | "registration-offer" | "registration-form" | "registration-success" | "thank-you" | "login"
  >(action === "login" ? "login" : "checkout");
  
  const [lastSavedOrder, setLastSavedOrder] = useState<any>(null);

  // Registration Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCpf, setRegCpf] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regError, setRegError] = useState("");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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
    if (!personalData.cpf.trim()) {
      pErrors.cpf = "CPF é obrigatório.";
    } else if (personalData.cpf.replace(/\D/g, "").length !== 11) {
      pErrors.cpf = "CPF deve conter 11 dígitos.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Sua sacola está vazia.");
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const subtotal = items.reduce((sum, item) => sum + item.priceVal * item.quantity, 0);
        const discount = subtotal * 0.15;
        const shippingCost = shippingType === "express" ? 29.90 : 0;
        const total = subtotal - discount + shippingCost;

        const orderPayload = {
          customerName: personalData.fullName,
          customerEmail: personalData.email,
          customerPhone: personalData.phone,
          customerCpf: personalData.cpf,
          address: { ...addressData },
          shippingType,
          paymentMethod: paymentMethod as Order["paymentMethod"],
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            priceVal: item.priceVal,
            quantity: item.quantity,
          })),
          subtotal,
          discount,
          shippingCost,
          total,
          tags: {
            paymentStatus: (paymentMethod === "pix" ? "pendente" : "pago") as Order["tags"]["paymentStatus"],
            shippingStatus: (shippingCost > 0 ? "com_frete" : "sem_frete") as Order["tags"]["shippingStatus"],
          },
        };

        const saved = await saveOrder(orderPayload);
        setLastSavedOrder(saved);

        // Check if Mercado Pago is enabled
        try {
          const settings = await fetchPaymentSettings();
          if (settings && settings.enabled) {
            const response = await fetch("/api/create-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: saved.id,
                items: items.map((item) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  priceVal: item.priceVal,
                  quantity: item.quantity,
                })),
                customer: {
                  fullName: personalData.fullName,
                  email: personalData.email,
                  phone: personalData.phone,
                  cpf: personalData.cpf,
                },
                paymentMethod: paymentMethod,
                shippingCost: shippingCost,
              }),
            });

            const paymentResult = await response.json();
            if (paymentResult.success && paymentResult.initPoint) {
              clearCart();
              setIsSubmitting(false);
              toast.success("Pedido registrado! Redirecionando para o pagamento...");
              
              // Redirect to Mercado Pago checkout
              window.location.href = paymentResult.initPoint;
              return;
            } else {
              console.error("Failed to generate payment:", paymentResult.error);
              toast.error("Erro ao iniciar pagamento com Mercado Pago. Continuando com o pedido...");
            }
          }
        } catch (paymentErr) {
          console.error("Mercado Pago flow error:", paymentErr);
        }

        clearCart();
        setIsSubmitting(false);
        toast.success("Pedido finalizado com sucesso!");
        
        // Go to registration offer
        setCheckoutStep("registration-offer");
      } catch (error) {
        setIsSubmitting(false);
        console.error(error);
        toast.error("Erro ao salvar o pedido. Tente novamente.");
      }
    } else {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente.");
    }
  };

  // Pre-fill search during registration
  const handleRegSearchContinue = async () => {
    if (!regName.trim() || !regEmail.trim()) {
      setRegError("Nome e e-mail são obrigatórios.");
      return;
    }

    setRegError("");
    // Find customer in database (could have created an account or placed orders)
    const existing = await findCustomerByEmailAndName(regName, regEmail);
    
    // Auto populate details from previous records or the order just completed
    if (existing) {
      setRegPhone(existing.phone);
      setRegCpf(existing.cpf);
    } else if (lastSavedOrder && lastSavedOrder.customerName.trim().toLowerCase() === regName.trim().toLowerCase()) {
      setRegPhone(lastSavedOrder.customerPhone);
      setRegCpf(lastSavedOrder.customerCpf);
    }

    setRegStep(2);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPassword || !regConfirmPassword) {
      setRegError("Senha e confirmação são obrigatórias.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("As senhas não coincidem.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await saveCustomerAccount({
        fullName: regName,
        email: regEmail,
        phone: regPhone,
        cpf: regCpf,
        password: regPassword,
      });

      toast.success("Cadastro efetuado com sucesso!");
      setCheckoutStep("login");
      // Pre-fill login email
      setLoginEmail(regEmail);
    } catch (err) {
      setRegError("Erro ao salvar cadastro. Tente novamente.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const success = await login(loginEmail, loginPassword);
    if (success) {
      toast.success("Login efetuado com sucesso!");
      // Redirect or refresh orders list
      setCheckoutStep("checkout"); // The component will render dashboard automatically because customer is logged in!
    } else {
      setLoginError("E-mail ou senha incorretos.");
    }
  };

  // Format CPF in registration form
  const handleRegCpfChange = (val: string) => {
    let input = val.replace(/\D/g, "");
    if (input.length > 11) input = input.substring(0, 11);
    let formatted = input;
    if (input.length > 3) formatted = `${input.substring(0, 3)}.${input.substring(3)}`;
    if (input.length > 6) formatted = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6)}`;
    if (input.length > 9) formatted = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6, 9)}-${input.substring(9)}`;
    setRegCpf(formatted);
  };

  // If customer is already logged in, render the dashboard page
  if (customer && checkoutStep === "checkout") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-ink">
        <PromotionalBar />
        <CheckoutHeader />
        
        <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
          <div className="bg-white border border-[#D9DDE2] rounded-md p-6 shadow-sm flex flex-col gap-6">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink">Olá, {customer.fullName}!</h2>
                  <p className="text-xs text-muted-foreground">E-mail: {customer.email} | CPF: {customer.cpf}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Package className="h-5 w-5 text-brand" />
                Acompanhar Meus Pedidos
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-muted-foreground font-semibold">Nenhum pedido localizado para esta conta.</p>
                  <Link to="/" className="mt-4 inline-block text-xs bg-brand text-white font-bold py-2 px-4 rounded hover:bg-brand-2 transition-colors">
                    Começar a Comprar
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((ord) => {
                    const trackingSteps = [
                      { label: "Recebido", active: true },
                      { label: "Aprovado", active: ord.tags.paymentStatus === "pago" },
                      { label: "Em Trânsito", active: ord.tags.paymentStatus === "pago" },
                      { label: "Entregue", active: false },
                    ];

                    return (
                      <div key={ord.id} className="border border-[#D9DDE2] rounded-md p-4 bg-[#FAFAFA] flex flex-col gap-4">
                        
                        {/* Order Meta Header */}
                        <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-[#D9DDE2] p-3 rounded">
                          <div className="flex items-center gap-4 text-xs font-bold text-ink">
                            <span>Código: <span className="text-brand">{ord.id}</span></span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(ord.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Payment Status Tag */}
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                              ord.tags.paymentStatus === "pago"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {ord.tags.paymentStatus === "pago" ? "✓ Pago" : "⌛ Pendente"}
                            </span>
                            {/* Shipping Status Tag */}
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                              ord.tags.shippingStatus === "com_frete"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {ord.tags.shippingStatus === "com_frete" ? "Com Frete" : "Sem Frete (Grátis)"}
                            </span>
                          </div>
                        </div>

                        {/* Tracking Timeline Bar */}
                        <div className="flex flex-col gap-2 bg-white border border-[#D9DDE2] p-4 rounded">
                          <span className="text-[11px] font-extrabold text-ink uppercase tracking-wider block">Status da Entrega:</span>
                          <div className="grid grid-cols-4 items-center justify-between mt-3 text-center relative">
                            {/* Timeline Line */}
                            <div className="absolute top-[9px] left-1/8 right-1/8 h-[2px] bg-gray-200 z-0">
                              <div
                                className="h-full bg-brand transition-all duration-500"
                                style={{
                                  width: ord.tags.paymentStatus === "pago" ? "66%" : "0%"
                                }}
                              />
                            </div>

                            {trackingSteps.map((step, idx) => (
                              <div key={step.label} className="flex flex-col items-center gap-1.5 z-10 relative">
                                {step.active ? (
                                  <CheckCircle2 className="h-5 w-5 text-brand fill-white" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300 fill-white" />
                                )}
                                <span className={`text-[10px] font-bold ${step.active ? "text-brand" : "text-gray-400"}`}>
                                  {step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Items Column */}
                          <div className="md:col-span-8 bg-white border border-[#D9DDE2] p-4 rounded flex flex-col gap-2 text-xs">
                            <span className="font-extrabold text-ink border-b border-gray-100 pb-1.5 mb-1 block">Produtos Comprados</span>
                            {ord.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-1">
                                <span className="font-semibold text-ink/90">{item.name} <span className="text-muted-foreground text-[10px]">x{item.quantity}</span></span>
                                <span className="font-bold text-brand">{item.price}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Shipping details */}
                          <div className="md:col-span-4 bg-white border border-[#D9DDE2] p-4 rounded flex flex-col gap-2 text-xs">
                            <span className="font-extrabold text-ink border-b border-gray-100 pb-1.5 mb-1 block">Endereço de Envio</span>
                            <div className="flex gap-1.5 items-start text-muted-foreground leading-tight">
                              <MapPin className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                              <div>
                                <p className="font-bold text-ink">{ord.customerName}</p>
                                <p>{ord.address.street}, {ord.address.number}</p>
                                <p>{ord.address.neighborhood}</p>
                                <p>{ord.address.city} - {ord.address.state}</p>
                                <p className="mt-1 font-semibold">CEP: {ord.address.cep}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial total */}
                        <div className="flex justify-between items-baseline bg-white border border-[#D9DDE2] p-3 rounded">
                          <span className="text-xs font-bold text-muted-foreground">Valor Total do Pedido:</span>
                          <span className="text-base font-black text-brand">R$ {ord.total.toFixed(2).replace(".", ",")}</span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>

        <BenefitsBar />
        <Footer />
      </div>
    );
  }

  // RENDER CORRESPONDING STEP
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-ink">
      <PromotionalBar />
      <CheckoutHeader />

      {checkoutStep === "checkout" && (
        <>
          <CheckoutStepper />
          <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 flex flex-col gap-6">
            <SecurityBanner />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-2">
              <div className="lg:col-span-7 flex flex-col gap-8">
                <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <PersonalDataForm
                    values={personalData}
                    errors={personalErrors}
                    onChange={handlePersonalDataChange}
                  />
                </div>

                <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <AddressForm
                    values={addressData}
                    errors={addressErrors}
                    onChange={handleAddressDataChange}
                  />
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-semibold text-ink">Forma de Envio</span>
                    <ShippingOptions
                      selectedOption={shippingType}
                      onSelect={setShippingType}
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#D9DDE2] rounded-md p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <PaymentMethods
                    selectedMethod={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF8A00] hover:bg-[#E97800] text-white text-base font-bold py-3.5 px-6 rounded-[4px] shadow-sm transition-colors cursor-pointer select-none text-center disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isSubmitting ? "Processando..." : "Finalizar Compra com Segurança"}
                </button>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6">
                <OrderSummary shippingType={shippingType} />
                <PurchaseBenefits />
                <CustomerTestimonial />
              </div>
            </form>
          </main>
        </>
      )}

      {checkoutStep === "registration-offer" && lastSavedOrder && (
        <main className="mx-auto max-w-[600px] px-4 py-16 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-ink uppercase tracking-wide">Compra Realizada! 🎉</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Sua compra de <span className="font-bold text-brand">R$ {lastSavedOrder.total.toFixed(2).replace(".", ",")}</span> foi registrada. Código: <span className="font-bold text-brand">{lastSavedOrder.id}</span>
          </p>

          <div className="bg-white border border-[#D9DDE2] p-6 rounded-md shadow-sm w-full mt-4 flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider">
              Deseja criar uma conta de acesso rápida?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Criando uma senha para sua conta, você poderá acompanhar o envio do pedido em tempo real e agilizar suas próximas compras usando seus dados salvos!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => setCheckoutStep("thank-you")}
                className="h-11 border border-[#D9DDE2] text-muted-foreground hover:text-ink hover:bg-gray-50 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                Não, obrigado
              </button>
              <button
                onClick={() => {
                  setRegName(lastSavedOrder.customerName);
                  setRegEmail(lastSavedOrder.customerEmail);
                  setCheckoutStep("registration-form");
                }}
                className="h-11 bg-brand hover:bg-brand-2 text-white rounded text-xs font-bold transition-colors cursor-pointer"
              >
                Sim, criar conta!
              </button>
            </div>
          </div>
        </main>
      )}

      {checkoutStep === "registration-form" && (
        <main className="mx-auto max-w-[500px] px-4 py-12 flex flex-col gap-6">
          <div className="bg-white border border-[#D9DDE2] p-6 rounded-md shadow-sm flex flex-col gap-5">
            <h2 className="text-base font-black text-ink border-b border-gray-100 pb-2 uppercase tracking-wider">
              Cadastro de Acesso
            </h2>
            
            {regError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded font-semibold text-left">
                {regError}
              </div>
            )}

            {regStep === 1 ? (
              <div className="flex flex-col gap-4 text-left">
                <p className="text-xs text-muted-foreground">Digite seu nome e e-mail para validar seus dados.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Nome Completo</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">E-mail</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                    placeholder="joao@email.com"
                  />
                </div>
                <button
                  onClick={handleRegSearchContinue}
                  className="w-full h-11 bg-brand hover:bg-brand-2 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer mt-2"
                >
                  Continuar
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-left">
                <p className="text-xs text-green-600 font-semibold">✓ Dados localizados! Complete com seu CPF e crie uma senha.</p>
                
                <div className="flex flex-col gap-1.5 opacity-60">
                  <label className="text-xs font-semibold">Nome Completo</label>
                  <input
                    type="text"
                    value={regName}
                    disabled
                    className="w-full h-10 px-3 bg-gray-50 border border-[#D9DDE2] rounded text-sm text-ink outline-none cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5 opacity-60">
                  <label className="text-xs font-semibold">E-mail</label>
                  <input
                    type="email"
                    value={regEmail}
                    disabled
                    className="w-full h-10 px-3 bg-gray-50 border border-[#D9DDE2] rounded text-sm text-ink outline-none cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">WhatsApp</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">CPF</label>
                    <input
                      type="text"
                      value={regCpf}
                      onChange={(e) => handleRegCpfChange(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Senha</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Repetir Senha</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                    placeholder="Repita sua senha"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full h-11 bg-brand hover:bg-brand-2 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer mt-2"
                >
                  Finalizar Cadastro
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {checkoutStep === "login" && (
        <main className="mx-auto max-w-[400px] px-4 py-16 flex flex-col gap-6">
          <div className="bg-white border border-[#D9DDE2] p-6 rounded-md shadow-sm flex flex-col gap-5">
            <h2 className="text-base font-black text-ink border-b border-gray-100 pb-2 uppercase tracking-wider text-left">
              Acessar Conta
            </h2>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded font-semibold text-left">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                  placeholder="Seu e-mail cadastrado"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Senha</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D9DDE2] rounded text-sm text-ink outline-none focus:border-brand"
                  placeholder="Digite sua senha"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-brand hover:bg-brand-2 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer mt-2"
              >
                Entrar
              </button>
              <div className="flex flex-col gap-2.5 mt-3 text-center border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRegName("");
                    setRegEmail("");
                    setRegStep(1);
                    setCheckoutStep("registration-form");
                  }}
                  className="text-xs text-brand font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Não tem uma conta? Crie uma aqui
                </button>
                <Link
                  to="/"
                  className="text-xs text-muted-foreground hover:text-ink font-semibold hover:underline"
                >
                  Voltar para a Loja
                </Link>
              </div>
            </form>
          </div>
        </main>
      )}

      {checkoutStep === "thank-you" && (
        <main className="mx-auto max-w-[500px] px-4 py-16 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-ink uppercase tracking-wide">Obrigado pela Compra!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seu pedido <span className="font-bold text-brand">{lastSavedOrder?.id || "P-12942"}</span> foi processado com sucesso. Agradecemos a preferência!
          </p>

          <Link
            to="/"
            className="mt-4 px-6 h-11 bg-brand hover:bg-brand-2 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center shadow transition-colors cursor-pointer"
          >
            Voltar para o Site
          </Link>
        </main>
      )}

      <BenefitsBar />
      <Footer />
    </div>
  );
}
