import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PromotionalBar } from "@/components/checkout/PromotionalBar";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { SecurityBanner } from "@/components/checkout/SecurityBanner";
import { PersonalDataForm } from "@/components/checkout/PersonalDataForm";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ShippingOptions, ShippingType } from "@/components/checkout/ShippingOptions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { PaymentMethodType } from "@/components/checkout/PaymentMethods";
import { PurchaseBenefits } from "@/components/checkout/PurchaseBenefits";
import { CustomerTestimonial } from "@/components/checkout/CustomerTestimonial";
import { BenefitsBar } from "@/components/checkout/BenefitsBar";
import { Footer } from "@/components/site/Footer";
import { toast } from "sonner";
import { ShieldCheck, User, Package, Calendar, MapPin, CreditCard, LogOut, CheckCircle2, Circle, Truck, ExternalLink, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCustomer } from "@/hooks/use-customer";
import { saveOrder, saveCustomerAccount, findCustomerByEmailAndName } from "@/lib/orders-service";
import type { Order } from "@/lib/orders-service";
import { fetchPaymentSettings } from "@/lib/payment-service";
import { fetchShippingSettings } from "@/lib/shipping-service";
import { decrementProductStock } from "@/lib/page-service";

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
  >(
    action === "login" 
      ? "login" 
      : (action === "success" || action === "pending" || action === "thank-you")
      ? (customer ? "thank-you" : "registration-offer")
      : "checkout"
  );
  
  const [lastSavedOrder, setLastSavedOrder] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const [customShippingPrice, setCustomShippingPrice] = useState<number>(0);
  const [dynamicShippingOptions, setDynamicShippingOptions] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [collapsedCustomerOrders, setCollapsedCustomerOrders] = useState<Record<string, boolean>>({});

  // Carrega as configurações de frete
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchShippingSettings();
        setShippingSettings(settings);
      } catch (e) {
        console.error("Erro ao carregar settings no checkout:", e);
      }
    }
    loadSettings();
  }, []);

  // Auto-preenche os dados pessoais e de endereço no checkout se o cliente estiver logado
  useEffect(() => {
    if (customer) {
      setPersonalData((prev) => ({
        fullName: prev.fullName || customer.fullName || "",
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
        cpf: prev.cpf || customer.cpf || "",
        acceptOffers: prev.acceptOffers,
      }));

      if (orders && orders.length > 0) {
        const lastOrder = orders[0];
        if (lastOrder.address) {
          setAddressData((prev) => ({
            cep: prev.cep || lastOrder.address.cep || "",
            street: prev.street || lastOrder.address.street || "",
            number: prev.number || lastOrder.address.number || "",
            complement: prev.complement || lastOrder.address.complement || "",
            neighborhood: prev.neighborhood || lastOrder.address.neighborhood || "",
            city: prev.city || lastOrder.address.city || "",
            state: prev.state || lastOrder.address.state || "",
          }));
        }
      }
    }
  }, [customer, orders]);

  // Se o cliente já estiver logado, pula a oferta de criação de conta
  useEffect(() => {
    if (customer && checkoutStep === "registration-offer") {
      setCheckoutStep("thank-you");
    }
  }, [customer, checkoutStep]);

  // Sincroniza o checkoutStep quando a URL mudar (ex: clicar em Meus Pedidos no Header)
  useEffect(() => {
    if (action === "login") {
      if (customer) {
        navigate({ to: "/checkout", search: { action: "account" } });
        setCheckoutStep("checkout");
      } else {
        setCheckoutStep("login");
      }
    } else if (action === "account" || action === "orders" || action === "dashboard") {
      setCheckoutStep("checkout");
      refreshOrders();
    } else if (action === "success" || action === "pending" || action === "thank-you") {
      setCheckoutStep(customer ? "thank-you" : "registration-offer");
    } else {
      setCheckoutStep("checkout");
    }
  }, [action, customer]);

  useEffect(() => {
    const rawCep = (addressData.cep || "").replace(/\D/g, "");
    if (rawCep.length === 8) {
      async function calculateRealShipping() {
        setShippingLoading(true);
        try {
          const res = await fetch("/api/calculate-shipping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cep: rawCep }),
          });
          const json = await res.json();
          if (json.success && Array.isArray(json.options) && json.options.length > 0) {
            setDynamicShippingOptions(json.options);
          } else {
            setDynamicShippingOptions([]);
          }
        } catch (err) {
          console.error("Erro ao calcular frete no checkout:", err);
          setDynamicShippingOptions([]);
        } finally {
          setShippingLoading(false);
        }
      }
      calculateRealShipping();
    }
  }, [addressData.cep]);

  // Recupera o último pedido do localStorage se retornar da tela do Mercado Pago
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("glasses_last_order");
        if (saved) {
          const parsed = JSON.parse(saved);
          setLastSavedOrder(parsed);
          setRegName(parsed.customerName || "");
          setRegEmail(parsed.customerEmail || "");
          setRegPhone(parsed.customerPhone || "");
          setRegCpf(parsed.customerCpf || "");
        }
      } catch (e) {
        console.error("Failed to parse last order from localStorage:", e);
      }
    }
  }, []);

  // Limpeza de carrinho e decremento de estoque no retorno do Mercado Pago (ou conclusão local)
  useEffect(() => {
    const isSuccessStep = checkoutStep === "registration-offer";
    const hasSuccessAction = action === "thank-you" || action === "success" || action === "pending";

    if (isSuccessStep || hasSuccessAction) {
      const orderId = (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("orderId") : null) || lastSavedOrder?.id;
      if (!orderId) return;

      const processedKey = `glasses_processed_order_${orderId}`;
      if (localStorage.getItem(processedKey)) {
        clearCart();
        return;
      }

      localStorage.setItem(processedKey, "true");
      clearCart();

      async function processOrderCompletion() {
        try {
          const orders = await fetchOrders();
          const order = orders.find((o) => o.id === orderId);

          if (order) {
            if (!order.tags?.stockDecremented) {
              // Decrementa o estoque de forma cruzada em todas as categorias
              for (const item of order.items) {
                try {
                  await decrementProductStock(item.name, item.quantity);
                } catch (e) {
                  console.error("Erro ao decrementar estoque no retorno do MP:", item.name, e);
                }
              }

              // Atualiza o status do pedido na lista global, adiciona a flag de decrementado e deleta outros pendentes duplicados do mesmo cliente
              const updated = orders.map((o) => {
                if (o.id === orderId) {
                  return {
                    ...o,
                    tags: {
                      ...o.tags,
                      paymentStatus: "pago" as const,
                      stockDecremented: true
                    }
                  };
                }
                return o;
              }).filter((o) => {
                // Mantém o pedido atual pago
                if (o.id === orderId) return true;
                
                // Se for outro pedido pendente do mesmo cliente, deleta ele!
                if (
                  o.tags?.paymentStatus === "pendente" &&
                  o.customerEmail?.trim().toLowerCase() === order.customerEmail?.trim().toLowerCase()
                ) {
                  console.log(`[Checkout] Deletando pedido pendente duplicado ${o.id} de ${o.customerEmail}`);
                  return false;
                }
                return true;
              });

              const { data, error } = await supabase.from("home_page_content").upsert({
                id: "orders_list",
                content: { orders: updated } as any,
                updated_at: new Date().toISOString(),
              });
              if (error) {
                console.error("Erro ao atualizar status do pedido no Supabase:", error);
              } else {
                console.log(`Order ${orderId} marked as approved/pago and stock decremented.`);
                await refreshOrders(); // Atualiza a lista de pedidos do cliente logado imediatamente
              }
            }
          }
        } catch (err) {
          console.error("Error processing order completion on return:", err);
        }
      }

      processOrderCompletion();
    }
  }, [action, checkoutStep, lastSavedOrder]);

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
        
        let catalogDiscount = 0;
        items.forEach((item) => {
          const pctMatch = item.discount ? item.discount.match(/(\d+)/) : null;
          const pct = pctMatch ? parseInt(pctMatch[1]) : 0;
          catalogDiscount += (item.priceVal * item.quantity) * (pct / 100);
        });

        const extraDiscount = appliedCoupon ? (subtotal - catalogDiscount) * 0.10 : 0;
        const discount = catalogDiscount + extraDiscount;
        const shippingCost = shippingType === "free" ? 0 : (shippingType === "express" ? 29.90 : customShippingPrice);
        const total = Math.max(0, subtotal - discount + shippingCost);

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
            paymentStatus: "pendente" as Order["tags"]["paymentStatus"],
            shippingStatus: (shippingCost > 0 ? "com_frete" : "sem_frete") as Order["tags"]["shippingStatus"],
            stockDecremented: false,
          },
        };

        const saved = await saveOrder(orderPayload);
        setLastSavedOrder(saved);
        if (typeof window !== "undefined") {
          localStorage.setItem("glasses_last_order", JSON.stringify(saved));
        }

        // Envia as informações do pedido diretamente ao backend para processar o pagamento
        try {
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
                discount: item.discount, // Envia o selo de desconto
              })),
              customer: {
                fullName: personalData.fullName,
                email: personalData.email,
                phone: personalData.phone,
                cpf: personalData.cpf,
              },
              paymentMethod: "all",
              shippingCost: shippingCost,
              couponApplied: !!appliedCoupon, // Envia se cupom foi aplicado
            }),
          });

          const contentType = response.headers.get("content-type") || "";
          if (!response.ok || !contentType.includes("application/json")) {
            const errorText = await response.text();
            throw new Error(`Erro do servidor (${response.status}): ${errorText.substring(0, 100)}`);
          }

          const paymentResult = await response.json();
          if (paymentResult.success && paymentResult.initPoint) {
            setPaymentUrl(paymentResult.initPoint);
            setIsSubmitting(false);
            toast.success("Pedido registrado com sucesso!");
            
            // Se estiver rodando dentro de um iframe (como no preview do Lovable),
            // abrimos o link do Mercado Pago em uma nova aba para evitar erros de abortamento
            // e bloqueio de frame. No site de produção real, redirecionamos diretamente.
            const isIframe = typeof window !== "undefined" && window.self !== window.top;
            if (isIframe) {
              window.open(paymentResult.initPoint, "_blank");
              // Avança a tela para a confirmação de compra realizada no preview
              setCheckoutStep(customer ? "thank-you" : "registration-offer");
            } else {
              window.location.href = paymentResult.initPoint;
            }
            return;
          } else {
            console.error("Failed to generate payment:", paymentResult.error);
            // Apenas exibe alerta se o Mercado Pago não estiver intencionalmente desativado
            if (!paymentResult.isMpDisabled) {
              toast.error(`Erro ao iniciar pagamento: ${paymentResult.error || "Erro desconhecido."}`);
            }
          }
        } catch (paymentErr: any) {
          console.error("Mercado Pago flow error:", paymentErr);
          toast.error(`Erro no processamento do pagamento: ${paymentErr.message || paymentErr}`);
        }

        setIsSubmitting(false);
        toast.success("Pedido registrado com sucesso!");
        
        // Go to registration offer (or thank you directly if logged in)
        setCheckoutStep(customer ? "thank-you" : "registration-offer");
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
      // Redireciona para exibir a página de pedidos (dashboard)
      navigate({ to: "/checkout", search: { action: "account" } });
      setCheckoutStep("checkout");
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

  function OrderTrackingSection({ trackingCode, isPaid }: { trackingCode?: string; isPaid: boolean }) {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trackingCode) return;
    async function loadTracking() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tracking?code=${encodeURIComponent(trackingCode!)}`);
        const json = await res.json();
        if (json.success && json.tracking) {
          setTrackingData(json.tracking);
        }
      } catch (err) {
        console.error("Erro ao buscar rastreio:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTracking();
  }, [trackingCode]);

  const events = trackingData?.events || [];
  const statusStr = (trackingData?.status || "").toLowerCase();
  
  let stepIndex = 0;
  if (statusStr.includes("entregue") || statusStr === "delivered") {
    stepIndex = 3;
  } else if (events.length > 0 || statusStr.includes("transito") || statusStr === "in_transit" || statusStr === "posted") {
    stepIndex = 2;
  } else if (isPaid) {
    stepIndex = 1;
  }

  const steps = [
    { label: "Recebido", active: stepIndex >= 0 },
    { label: "Aprovado", active: stepIndex >= 1 },
    { label: "Em Trânsito", active: stepIndex >= 2 },
    { label: "Entregue", active: stepIndex >= 3 },
  ];

  const progressPercent = stepIndex === 3 ? "100%" : stepIndex === 2 ? "66%" : stepIndex === 1 ? "33%" : "0%";

  return (
    <div className="flex flex-col gap-3 bg-white border border-[#D9DDE2] p-4 rounded">
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-[11px] font-extrabold text-ink uppercase tracking-wider block flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-brand" /> Status da Entrega:
        </span>
        {trackingCode && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              Cód: <span className="text-brand font-mono">{trackingCode}</span>
            </span>
            <a
              href={`https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(trackingCode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-ink font-bold px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              Rastrear nos Correios <ExternalLink className="h-3 w-3 text-brand" />
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 items-center justify-between mt-3 text-center relative">
        <div className="absolute top-[9px] left-1/8 right-1/8 h-[2px] bg-gray-200 z-0">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: progressPercent }}
          />
        </div>

        {steps.map((step) => (
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

      {loading && (
        <p className="text-[10px] text-muted-foreground animate-pulse text-center mt-2">
          Consultando movimentações do pacote em tempo real...
        </p>
      )}

      {events && events.length > 0 && (
        <div className="mt-3 bg-[#FAFAFA] border border-gray-100 rounded p-3 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Histórico de Movimentação em Tempo Real:</span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {events.map((evt: any, i: number) => (
              <div key={i} className="text-[11px] border-l-2 border-brand pl-2 py-0.5 flex flex-col text-left">
                <span className="font-bold text-ink">{evt.title || evt.description || evt.status || "Atualização"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {evt.created_at ? new Date(evt.created_at).toLocaleString("pt-BR") : evt.date || ""}
                  {evt.location ? ` — ${evt.location}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

  // Exibe a página Meus Pedidos apenas se o cliente clicar explicitamente em Meus Pedidos/Conta ou se a sacola estiver vazia
  const isExplicitAccountView = action === "account" || action === "orders" || action === "dashboard";
  const showDashboard = customer && (isExplicitAccountView || (items.length === 0 && checkoutStep === "checkout"));

  if (showDashboard) {
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

              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      // Permite ir direto para a finalização de compra dos itens da sacola
                      navigate({ to: "/checkout", search: { action: "" } });
                      setCheckoutStep("checkout");
                    }}
                    className="h-10 px-4 bg-[#FF8A00] hover:bg-[#e07900] text-white rounded text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Ir para o Checkout / Comprar ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </button>
                )}

                <button
                  onClick={logout}
                  className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </div>
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
                    const isCollapsed = !!collapsedCustomerOrders[ord.id];

                    return (
                      <div key={ord.id} className="border border-[#D9DDE2] rounded-md p-4 bg-[#FAFAFA] flex flex-col gap-4 shadow-sm transition-all">
                        
                        {/* Order Meta Header */}
                        <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-[#D9DDE2] p-3 rounded">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setCollapsedCustomerOrders((prev) => ({ ...prev, [ord.id]: !isCollapsed }))}
                              className="p-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors cursor-pointer text-ink flex items-center gap-1 text-[11px] font-bold"
                              title={isCollapsed ? "Expandir Detalhes do Pedido" : "Recolher Pedido"}
                            >
                              <span>{isCollapsed ? "Expandir" : "Recolher"}</span>
                              {isCollapsed ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronUp className="h-4 w-4 text-brand" />}
                            </button>

                            <div className="flex items-center gap-4 text-xs font-bold text-ink">
                              <span>Código: <span className="text-brand">{ord.id}</span></span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(ord.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
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

                        {/* Order Details Body (Hidden when collapsed) */}
                        {!isCollapsed && (
                          <div className="flex flex-col gap-4 animate-fadeIn">
                            {/* Tracking Timeline Bar with Real-Time Data */}
                            <OrderTrackingSection trackingCode={ord.trackingCode} isPaid={ord.tags.paymentStatus === "pago"} />

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
                        )}

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
                      onSelect={(opt, price) => {
                        setShippingType(opt);
                        setCustomShippingPrice(price);
                      }}
                      dynamicOptions={dynamicShippingOptions}
                      loading={shippingLoading}
                      freeShippingEnabled={shippingSettings?.freeShippingEnabled !== false}
                    />
                  </div>
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
                <OrderSummary 
                  shippingType={shippingType}
                  customShippingCost={customShippingPrice}
                  appliedCoupon={appliedCoupon} 
                  setAppliedCoupon={setAppliedCoupon} 
                />
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

          {paymentUrl && (
            <div className="bg-[#FFF5E6] border border-[#FFE0B2] p-5 rounded-md w-full flex flex-col items-center gap-3 animate-fadeIn mt-4">
              <span className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">Aguardando Pagamento</span>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-[#FF8A00] hover:bg-[#E97800] text-white text-sm font-extrabold flex items-center justify-center gap-2 rounded shadow-md transition-colors cursor-pointer select-none text-center"
              >
                <CreditCard className="h-4 w-4" />
                <span>PAGAR AGORA COM MERCADO PAGO</span>
              </a>
              <span className="text-[10px] text-muted-foreground text-center">
                Clique no botão acima para abrir a tela de pagamento e gerar o seu Pix ou pagar com Cartão de Crédito.
              </span>
            </div>
          )}

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
                  setRegPhone(lastSavedOrder.customerPhone || "");
                  setRegCpf(lastSavedOrder.customerCpf || "");
                  setRegStep(2);
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

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-4">
            {customer && (
              <Link
                to="/checkout"
                search={{ action: "account" }}
                onClick={() => {
                  setCheckoutStep("checkout");
                  refreshOrders();
                }}
                className="px-6 h-11 bg-brand hover:bg-[#E97800] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <Package className="h-4 w-4" />
                <span>Acompanhar Meus Pedidos</span>
              </Link>
            )}
            
            <Link
              to="/"
              className="px-6 h-11 bg-ink hover:bg-brand text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center shadow transition-colors cursor-pointer"
            >
              Voltar para o Site
            </Link>
          </div>
        </main>
      )}

      <BenefitsBar />
      <Footer />
    </div>
  );
}
