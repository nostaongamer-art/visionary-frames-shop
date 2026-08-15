import { useState, useEffect, Component, ReactNode, ErrorInfo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchHomePageContent, saveHomePageContent, HomePageData, DEFAULT_HOME_PAGE_DATA, getDirectDriveUrl } from "@/lib/home-service";
import { fetchPageContent, savePageContent, CategoryPageData, PageProduct, DEFAULT_PAGES_DATA } from "@/lib/page-service";
import { toast } from "sonner";
import { fetchOrders, updateOrderTags, deleteOrderAndCustomer } from "@/lib/orders-service";
import { LogOut, Save, LayoutGrid, Info, Star, Edit, ArrowLeft, RefreshCw, Mail, Image, Link, AlertCircle, Layout, Zap, Plus, Trash2, Palette, Search, Ticket, CreditCard, Eye, EyeOff, Copy, Check, Lock, Truck, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { fetchPaymentSettings, savePaymentSettings, MercadoPagoSettings, DEFAULT_MERCADO_PAGO_SETTINGS } from "@/lib/payment-service";
import { fetchShippingSettings, saveShippingSettings, MelhorEnvioSettings, DEFAULT_MELHOR_ENVIO_SETTINGS } from "@/lib/shipping-service";

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0F12] text-white p-8 flex flex-col gap-4 font-mono select-text">
          <h1 className="text-xl font-bold text-red-500">⚠️ Erro Detectado no Painel</h1>
          <p className="text-sm text-white/80">
            O painel administrativo encontrou um erro ao processar esta ação.
          </p>
          <div className="bg-black/50 border border-white/10 p-4 rounded text-xs overflow-auto max-h-[400px] flex flex-col gap-2">
            <span className="font-bold text-[#FF8A00]">Erro: {this.state.error?.message}</span>
            <span className="text-white/60 whitespace-pre-wrap">{this.state.error?.stack}</span>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E97800] text-white font-bold text-xs rounded self-start cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const GOOGLE_FONTS_LIST = [
  { value: "default", label: "Padrão do Site (Outfit/Inter)" },
  { value: "Playfair Display", label: "Playfair Display (Serif Elegante)" },
  { value: "Montserrat", label: "Montserrat (Sans Moderno)" },
  { value: "Lora", label: "Lora (Serif Clássico)" },
  { value: "Cinzel", label: "Cinzel (Romano Luxo)" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond (Serif Fino)" },
  { value: "Syne", label: "Syne (Display Artístico)" },
  { value: "Oswald", label: "Oswald (Condensado Forte)" },
  { value: "Outfit", label: "Outfit (Geométrico Limpo)" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans (Moderno Clean)" },
  { value: "Libre Baskerville", label: "Libre Baskerville (Serif Tradicional)" },
  { value: "DM Serif Display", label: "DM Serif Display (Serif Impacto)" },
  { value: "Bodoni Moda", label: "Bodoni Moda (Moda & Luxo)" },
  { value: "Poppins", label: "Poppins (Geométrico Arredondado)" },
  { value: "Merriweather", label: "Merriweather (Serif Editorial)" },
  { value: "Raleway", label: "Raleway (Sans Sofisticado)" },
  { value: "Cardo", label: "Cardo (Serif Antigo)" },
  { value: "Prata", label: "Prata (Didone Elegante)" },
  { value: "Unbounded", label: "Unbounded (Sans Negrito Moderno)" },
  { value: "Archivo", label: "Archivo (Sans Técnico)" },
  { value: "Julius Sans One", label: "Julius Sans One (Minimalista Fino)" },
  { value: "Tenor Sans", label: "Tenor Sans (Feminino Elegante)" },
  { value: "Italiana", label: "Italiana (Design Italiano)" },
  { value: "Marcellus", label: "Marcellus (Romano Monumental)" },
  { value: "Gilda Display", label: "Gilda Display (Fino & Delicado)" },
  { value: "Forum", label: "Forum (Proporções Clássicas)" },
  { value: "Antic Didone", label: "Antic Didone (Contraste Luxo)" },
  { value: "Oranienbaum", label: "Oranienbaum (Serif Clássico Contraste)" },
  { value: "Castoro", label: "Castoro (Orgânico Serif)" },
  { value: "Lustria", label: "Lustria (Serif Amplo)" },
  { value: "Spectral", label: "Spectral (Editorial Premium)" },
  { value: "Sorts Mill Goudy", label: "Sorts Mill Goudy (Serif Suave)" },
  { value: "Crimson Pro", label: "Crimson Pro (Serif Humanista)" },
  { value: "Volkhov", label: "Volkhov (Serif Estruturado)" },
  { value: "Alice", label: "Alice (Fantasia Serif)" },
  { value: "Playfair", label: "Playfair (Display Serif)" },
  { value: "Domine", label: "Domine (Serif Leitura)" },
  { value: "Fraunces", label: "Fraunces (Expansivo & Vintage)" },
  { value: "Newsreader", label: "Newsreader (Serif Premium)" },
  { value: "Bricolage Grotesque", label: "Bricolage Grotesque (Moderno Expressivo)" },
  { value: "Space Grotesk", label: "Space Grotesk (Futurista)" },
  { value: "Lexend", label: "Lexend (Legibilidade)" },
  { value: "Urbanist", label: "Urbanist (Moda Minimalista)" },
  { value: "Quicksand", label: "Quicksand (Sans Amigável)" },
  { value: "Jost", label: "Jost (Geométrico Futura)" },
  { value: "Cabin", label: "Cabin (Sans Humanista)" },
  { value: "Fira Sans", label: "Fira Sans (Geométrico Versátil)" },
  { value: "Lato", label: "Lato (Sans Clássico)" },
  { value: "Work Sans", label: "Work Sans (Sans Punchy)" },
  { value: "Manrope", label: "Manrope (Limpo & Moderno)" },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminErrorBoundary>
      <Admin />
    </AdminErrorBoundary>
  ),
});

type TabType = string;

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<TabType>("promo");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ home: true });
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<MercadoPagoSettings>(DEFAULT_MERCADO_PAGO_SETTINGS);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [displayWebhookUrl, setDisplayWebhookUrl] = useState("");
  const [isPaymentSettingsLoaded, setIsPaymentSettingsLoaded] = useState(false);

  useEffect(() => {
    if (paymentSettings?.webhookUrl) {
      if (paymentSettings.webhookUrl.startsWith("http")) {
        setDisplayWebhookUrl(paymentSettings.webhookUrl);
      } else if (typeof window !== "undefined") {
        setDisplayWebhookUrl(`${window.location.origin}${paymentSettings.webhookUrl}`);
      }
    }
  }, [paymentSettings]);
  
  // Shipping settings states
  const [shippingSettings, setShippingSettings] = useState<MelhorEnvioSettings>(DEFAULT_MELHOR_ENVIO_SETTINGS);
  const [isShippingSettingsLoaded, setIsShippingSettingsLoaded] = useState(false);

  // Admin form states
  const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);
  const [categoryData, setCategoryData] = useState<CategoryPageData | null>(null);
  const [newBrandName, setNewBrandName] = useState("");

  // Orders management states
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersFilter, setOrdersFilter] = useState("");
  const [collapsedOrderIds, setCollapsedOrderIds] = useState<Record<string, boolean>>({});

  // Product CRUD states for catalogue sections (2-7)
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodDiscount, setProdDiscount] = useState("");
  const [prodCategory, setProdCategory] = useState("Armação de Grau");
  const [prodFormat, setProdFormat] = useState("Quadrado");
  const [prodMaterial, setProdMaterial] = useState("Acetato");
  const [prodColor, setProdColor] = useState("preto");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodInstallments, setProdInstallments] = useState(12);
  const [prodDescription, setProdDescription] = useState("");
  const [prodGender, setProdGender] = useState("Feminino");
  const [prodSpecsHaste, setProdSpecsHaste] = useState("");
  const [prodSpecsPonte, setProdSpecsPonte] = useState("");
  const [prodSpecsLente, setProdSpecsLente] = useState("");
  const [prodSpecsAltura, setProdSpecsAltura] = useState("");
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [prodStock, setProdStock] = useState("");
  const [adminProductSearch, setAdminProductSearch] = useState("");
  const [adminProductPage, setAdminProductPage] = useState(1);

  const moveSectionUp = (secKey: string) => {
    if (!data.sectionOrder) return;
    const idx = data.sectionOrder.indexOf(secKey);
    if (idx <= 0) return;
    const newOrder = [...data.sectionOrder];
    const temp = newOrder[idx - 1];
    newOrder[idx - 1] = newOrder[idx];
    newOrder[idx] = temp;
    setData((prev) => ({ ...prev, sectionOrder: newOrder }));
    toast.success("Seção movida para cima! Salve as alterações para aplicar no site.");
  };

  const moveSectionDown = (secKey: string) => {
    if (!data.sectionOrder) return;
    const idx = data.sectionOrder.indexOf(secKey);
    if (idx === -1 || idx >= data.sectionOrder.length - 1) return;
    const newOrder = [...data.sectionOrder];
    const temp = newOrder[idx + 1];
    newOrder[idx + 1] = newOrder[idx];
    newOrder[idx] = temp;
    setData((prev) => ({ ...prev, sectionOrder: newOrder }));
    toast.success("Seção movida para baixo! Salve as alterações para aplicar no site.");
  };

  const moveCategorySectionUp = (secKey: string) => {
    if (!categoryData || !categoryData.sectionOrder) return;
    const idx = categoryData.sectionOrder.indexOf(secKey);
    if (idx <= 0) return;
    const newOrder = [...categoryData.sectionOrder];
    const temp = newOrder[idx - 1];
    newOrder[idx - 1] = newOrder[idx];
    newOrder[idx] = temp;
    setCategoryData((prev: any) => ({ ...prev, sectionOrder: newOrder }));
    toast.success("Seção movida para cima! Salve as alterações para aplicar no site.");
  };

  const moveCategorySectionDown = (secKey: string) => {
    if (!categoryData || !categoryData.sectionOrder) return;
    const idx = categoryData.sectionOrder.indexOf(secKey);
    if (idx === -1 || idx >= categoryData.sectionOrder.length - 1) return;
    const newOrder = [...categoryData.sectionOrder];
    const temp = newOrder[idx + 1];
    newOrder[idx + 1] = newOrder[idx];
    newOrder[idx] = temp;
    setCategoryData((prev: any) => ({ ...prev, sectionOrder: newOrder }));
    toast.success("Seção movida para baixo! Salve as alterações para aplicar no site.");
  };


  useEffect(() => {
    async function checkAuth() {
      const bypass = localStorage.getItem("admin_auth_bypass");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && bypass !== "true") {
        toast.error("Acesso não autorizado. Faça login primeiro.");
        navigate({ to: "/login" });
        return;
      }
    }
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    async function loadPayments() {
      try {
        const settings = await fetchPaymentSettings();
        setPaymentSettings(settings);
        setIsPaymentSettingsLoaded(true);
      } catch (err) {
        console.error("Error pre-loading payment settings:", err);
      }
      try {
        const shipSettings = await fetchShippingSettings();
        setShippingSettings(shipSettings);
        setIsShippingSettingsLoaded(true);
      } catch (err) {
        console.error("Error pre-loading shipping settings:", err);
      }
    }
    loadPayments();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (activeSection === "home") {
        setCategoryData(null);
        const content = await fetchHomePageContent();
        setData(content);
      } else if (activeSection === "orders") {
        setCategoryData(null);
        const list = await fetchOrders();
        setOrders(list);
      } else if (activeSection === "payments") {
        setCategoryData(null);
        const settings = await fetchPaymentSettings();
        setPaymentSettings(settings);
        setIsPaymentSettingsLoaded(true);
      } else if (activeSection === "shipping") {
        setCategoryData(null);
        const shipSettings = await fetchShippingSettings();
        setShippingSettings(shipSettings);
        setIsShippingSettingsLoaded(true);
      } else {
        const content = await fetchPageContent(activeSection);
        setCategoryData(content);
      }
      setLoading(false);
    }
    loadData();
  }, [activeSection]);

  // Reset search and pagination when changing tab
  useEffect(() => {
    setAdminProductSearch("");
    setAdminProductPage(1);
  }, [activeTab]);

  // Autosave categoryData to localStorage whenever it changes in admin panel
  useEffect(() => {
    if (categoryData && activeSection !== "home") {
      try {
        localStorage.setItem(`glasses_page_content_${activeSection}`, JSON.stringify(categoryData));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Failed to autosave categoryData to localStorage:", e);
      }
    }
  }, [categoryData, activeSection]);

  // Autosave data (home page data) to localStorage whenever it changes in admin panel
  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem("glasses_home_page_content", JSON.stringify(data));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Failed to autosave home page data to localStorage:", e);
      }
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sempre salva as configurações gerais/estruturais da Página Inicial (incluindo customMenus)
      const homeResult = await saveHomePageContent(data);
      
      let pageResult: { success: boolean; isLocalOnly: boolean; error: string | null } = { success: true, isLocalOnly: false, error: null };
      if (activeSection !== "home" && activeSection !== "orders" && activeSection !== "payments" && categoryData) {
        pageResult = await savePageContent(activeSection, categoryData) as { success: boolean; isLocalOnly: boolean; error: string | null };
      }
      
      // Sempre salva as configurações do Mercado Pago se estiverem carregadas do DB
      let finalPageResult = pageResult;
      if (isPaymentSettingsLoaded) {
        const paymentRes = await savePaymentSettings(paymentSettings);
        if (!paymentRes.success) {
          finalPageResult = {
            success: false,
            isLocalOnly: !!paymentRes.isLocalOnly,
            error: paymentRes.error || "Erro ao salvar Mercado Pago"
          };
        } else if (activeSection === "payments") {
          finalPageResult = {
            success: true,
            isLocalOnly: !!paymentRes.isLocalOnly,
            error: null
          };
        }
      }

      // Sempre salva as configurações do Melhor Envio se estiverem carregadas do DB
      if (isShippingSettingsLoaded) {
        const shippingRes = await saveShippingSettings(shippingSettings);
        if (!shippingRes.success) {
          finalPageResult = {
            success: false,
            isLocalOnly: !!shippingRes.isLocalOnly,
            error: shippingRes.error || "Erro ao salvar Melhor Envio"
          };
        } else if (activeSection === "shipping") {
          finalPageResult = {
            success: true,
            isLocalOnly: !!shippingRes.isLocalOnly,
            error: null
          };
        }
      }
      
      setSaving(false);

      if (homeResult.success && finalPageResult.success) {
        if (homeResult.isLocalOnly || finalPageResult.isLocalOnly) {
          toast.warning("Salvo temporariamente no navegador! Sincronização falhou.");
        } else {
          toast.success("Alterações salvas com sucesso!");
        }
      } else {
        const err = homeResult.error || finalPageResult.error || "Erro desconhecido";
        toast.error(`Erro ao salvar: ${err}`);
      }
    } catch (err: any) {
      setSaving(false);
      toast.error(`Erro ao salvar: ${err.message || err}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_auth_bypass");
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/login" });
  };

  const resetToDefault = () => {
    if (window.confirm("Deseja realmente restaurar todos os campos desta página para o padrão inicial?")) {
      if (activeSection === "home") {
        setData(DEFAULT_HOME_PAGE_DATA);
      } else {
        const defaultData = DEFAULT_PAGES_DATA[activeSection];
        if (defaultData) {
          setCategoryData(defaultData);
        }
      }
      toast.success("Campos restaurados para o padrão. Clique em 'Salvar' para gravar no banco.");
    }
  };

  // Helper component to show Google Drive instructions
  const DriveInstructionBox = () => (
    <div className="bg-[#15181D] border border-brand/20 rounded p-4 flex gap-3 text-xs leading-relaxed text-white/90 mb-6">
      <AlertCircle className="h-5 w-5 text-brand shrink-0 mt-0.5" />
      <div>
        <h5 className="font-bold text-brand mb-1">Como hospedar e carregar imagens do seu Google Drive:</h5>
        <ol className="list-decimal pl-4 space-y-1 text-white/70">
          <li>Faça o upload da imagem na sua pasta do Google Drive.</li>
          <li>No Drive, clique com o botão direito no arquivo &gt; <strong>Compartilhar</strong>.</li>
          <li>Em Acesso Geral, mude para <strong>"Qualquer pessoa com o link"</strong> (Leitor).</li>
          <li>Clique em <strong>Copiar Link</strong> e cole-o no campo correspondente abaixo. O sistema converterá automaticamente para exibição no site.</li>
        </ol>
      </div>
    </div>
  );

  // Helper component for image input and preview
  const ImageInputWithPreview = ({
    label,
    value,
    onChange,
    recommendedSize,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    recommendedSize: string;
  }) => {
    const directUrl = getDirectDriveUrl(value);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [value]);

    return (
      <div className="border border-[#282C32]/45 rounded p-4 bg-[#15181D]/30 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/80">{label}</label>
            <span className="text-[10px] text-brand font-bold uppercase">Tam: {recommendedSize}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Link className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Cole o link de compartilhamento do Google Drive"
              className="w-full h-10 pl-10 pr-4 bg-[#15181D] border border-[#282C32]/55 rounded text-xs text-white placeholder-white/30 outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>
        </div>
        {value && (
          <div className="flex items-center gap-3 bg-[#15181D]/80 p-2.5 rounded border border-white/5">
            <div className="h-14 w-14 bg-white/5 border border-white/10 rounded flex items-center justify-center overflow-hidden shrink-0">
              {imageError ? (
                <div className="h-full w-full flex items-center justify-center bg-red-500/10 text-red-500 p-1 text-[8px] text-center font-bold">
                  Erro Link
                </div>
              ) : (
                <img
                  src={directUrl}
                  alt="Preview"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-white/70">Pré-visualização da Imagem</span>
              {imageError ? (
                <span className="text-[9px] text-red-400 font-bold leading-tight">
                  Atenção: Mude a permissão do arquivo no Drive para "Qualquer pessoa com o link"!
                </span>
              ) : (
                <span className="text-[9px] text-emerald-400 font-medium">
                  Link convertido e pronto para o site.
                </span>
              )}
              <span className="text-[9px] text-[#666A72] truncate max-w-[250px] md:max-w-[400px] mt-0.5">
                {directUrl}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper component for toggle switch
  const ToggleSwitch = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => {
    return (
      <div className="flex items-center justify-between p-3 rounded bg-[#15181D]/85 border border-[#282C32]/45">
        <span className="text-[11px] font-semibold text-white/85">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
            checked ? "bg-[#FF8A00]" : "bg-white/10"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0D] flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#FF8A00]" />
          <span className="text-sm font-semibold tracking-wider">Carregando painel administrativo...</span>
        </div>
      </div>
    );
  }

  // Admin catalogue products calculations
  const filteredAdminProducts = categoryData?.products
    ? categoryData.products.filter((prod) => {
        const search = adminProductSearch.trim().toLowerCase();
        if (!search) return true;
        return (
          prod.name.toLowerCase().includes(search) ||
          prod.category.toLowerCase().includes(search) ||
          (prod.format || "").toLowerCase().includes(search) ||
          (prod.material || "").toLowerCase().includes(search) ||
          (prod.color || "").toLowerCase().includes(search)
        );
      })
    : [];

  const ADMIN_ITEMS_PER_PAGE = 15;
  const totalAdminPages = Math.ceil(filteredAdminProducts.length / ADMIN_ITEMS_PER_PAGE);
  const activeAdminPage = Math.min(adminProductPage, Math.max(1, totalAdminPages));
  const paginatedAdminProducts = filteredAdminProducts.slice(
    (activeAdminPage - 1) * ADMIN_ITEMS_PER_PAGE,
    activeAdminPage * ADMIN_ITEMS_PER_PAGE
  );
  // Listas padrão de opções
  const defaultCategories = ["Armação de Grau", "Óculos de Sol", "Lentes Azuis"];
  const defaultFormats = ["Quadrado", "Redondo", "Retangular", "Aviador", "Wayfarer", "Esportivo", "Gatinho", "Hexagonal"];
  const defaultMaterials = ["Acetato", "Metal", "TR90", "Titânio"];
  const defaultColors = ["preto", "marrom", "azul", "cinza", "verde", "vermelho", "dourado", "transparente"];

  // Opções resolvidas a partir do estado do banco ou fallbacks padrão
  const categoryOptions = Array.from(new Set(categoryData?.customCategories || defaultCategories));
  const formatOptions = Array.from(new Set(categoryData?.customFormats || defaultFormats));
  const materialOptions = Array.from(new Set(categoryData?.customMaterials || defaultMaterials));
  const colorOptions = Array.from(new Set(categoryData?.customColors || defaultColors));

  return (
    <div className="min-h-screen bg-[#080A0D] text-white font-sans antialiased pb-12 select-none">
      {/* Admin Header */}
      <header className="bg-[#101217] border-b border-[#282C32]/40 h-16 flex items-center px-4 md:px-8">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </a>
            <span className="font-display text-xl font-extrabold tracking-tight">
              <span className="text-[#FF8A00]">Gl</span>asses Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefault}
              className="text-xs text-white/50 hover:text-white/80 border border-white/10 px-2.5 py-1.5 rounded cursor-pointer transition-colors"
              title="Restaurar padrão estático"
            >
              Restaurar Padrão
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF8A00] hover:bg-[#E97800] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Salvar Alterações
            </button>
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-red-500 hover:bg-red-500/10 p-2 rounded cursor-pointer transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin UI */}
      <main className="max-w-[1200px] w-full mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar / Tabs list */}
        <div className="flex flex-col gap-3 bg-[#101217] border border-[#282C32]/45 rounded-lg p-3 h-fit text-left">
          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase px-3 py-1 mb-1">
            Páginas do Site
          </h4>
          {(() => {
            const baseSections = [
              { id: "home", label: "Seção 1: Página Inicial" },
              { id: "colecoes", label: "Seção 2: Coleções" },
              { id: "masculino", label: "Seção 3: Masculino" },
              { id: "feminino", label: "Seção 4: Feminino" },
              { id: "solar", label: "Seção 5: Solar" },
              { id: "premium", label: "Seção 6: Premium" },
              { id: "promocoes", label: "Seção 7: Promoções" },
            ];
            const allSections = [...baseSections];
            (data?.customMenus || []).forEach((menu: any) => {
              allSections.push({
                id: menu.id,
                label: `Seção ${allSections.length + 1}: ${menu.title}`
              });
            });
            return allSections.map((sec) => {
              const isExpanded = !!expandedSections[sec.id];
              const isCustomPage = sec.id.startsWith("custom-page-");
              return (
                <div key={sec.id} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedSections((prev) => ({
                          ...prev,
                          [sec.id]: !prev[sec.id],
                        }));
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        activeSection === sec.id ? "bg-[#FF8A00]/10 text-[#FF8A00] border-l-2 border-[#FF8A00]" : "hover:bg-white/5 text-white/80"
                      }`}
                    >
                      <span>{sec.label}</span>
                      <span className="text-[9px] opacity-70">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>
                    {isCustomPage && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja excluir permanentemente a seção "${sec.label.split(": ")[1]}" e todo o seu conteúdo?`)) {
                            const newCustomMenus = (data.customMenus || []).filter((m: any) => m.id !== sec.id);
                            setData((prev: any) => ({
                              ...prev,
                              customMenus: newCustomMenus
                            }));
                            setActiveSection("home");
                            setActiveTab("promo");
                            toast.success("Seção removida! Lembre-se de salvar as alterações.");
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-400 text-xs font-bold cursor-pointer transition-colors"
                        title="Excluir Seção Completa"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                
                {isExpanded && (
                  <div className="flex flex-col gap-1 pl-2.5 mt-1.5 border-l border-[#FF8A00]/40 ml-2.5">
                    {sec.id === "home" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const title = prompt("Digite o nome da nova seção (ex: Kids, Modelos):");
                            if (!title) return;
                            const newId = "custom_" + Date.now();
                            const newSection = {
                              id: newId,
                              title: title,
                              subtitle: "Subtítulo da sua nova seção",
                              products: Array.from({ length: 4 }).map((_, idx) => ({
                                id: idx + 1,
                                name: `Produto ${idx + 1}`,
                                discount: "-10%",
                                reviews: "(50)",
                                oldPrice: "R$ 199,90",
                                price: "R$ 179,90",
                                installment: "12x de R$ 14,99",
                                imageUrl: ""
                              }))
                            };
                            setData((prev: any) => ({
                              ...prev,
                              customSections: [...(prev.customSections || []), newSection]
                            }));
                            setActiveTab(`custom-sec-${newId}`);
                            toast.success(`Seção "${title}" adicionada com sucesso! Lembre-se de Salvar as alterações.`);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          ➕ Adicionar Seção
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt("Digite o nome identificador do novo banner (ex: Banner Promo, Banner Marcas):");
                            if (!name) return;
                            const newId = "banner_" + Date.now();
                            const newBanner = {
                              id: newId,
                              name: name,
                              imageUrl: "",
                              linkUrl: "",
                              imagePositionY: 50
                            };
                            setData((prev: any) => ({
                              ...prev,
                              customBanners: [...(prev.customBanners || []), newBanner],
                              sectionOrder: [...(prev.sectionOrder || []), `custom-banner-${newId}`]
                            }));
                            setActiveTab(`custom-banner-${newId}`);
                            toast.success(`Banner "${name}" adicionado com sucesso! Adicione uma imagem e salve.`);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          ➕ Adicionar Banner
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const title = prompt("Digite o nome da nova seção completa/página (ex: Infantil, Esportivo, Outlet):");
                            if (!title) return;
                            const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
                            const newId = `custom-page-${slug || Date.now()}`;
                            
                            // Add to customMenus
                            setData((prev: any) => ({
                              ...prev,
                              customMenus: [...(prev.customMenus || []), { id: newId, title: title }]
                            }));
                            
                            // Set the newly created section as active
                            setActiveSection(newId);
                            setActiveTab("cat-banner");
                            toast.success(`Seção "${title}" criada com sucesso! Configure-a e salve as alterações.`);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          ➕ Adicionar Seção Completa
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection("home");
                            setActiveTab("promo");
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            activeSection === "home" && activeTab === "promo" ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                          }`}
                        >
                          • Banner Promocional
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection("home");
                            setActiveTab("product-page");
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            activeSection === "home" && activeTab === "product-page" ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                          }`}
                        >
                          • Página do Produto
                        </button>
                        {data.sectionOrder?.map((secKey, index) => {
                          let label = "";
                          let tabKey: TabType = "hero";

                          if (secKey === "hero") {
                            label = "• Banner Principal (Hero)";
                            tabKey = "hero";
                          } else if (secKey === "hero2") {
                            label = "• Banner Principal 2";
                            tabKey = "hero2";
                          } else if (secKey === "categories") {
                            label = "• Categorias";
                            tabKey = "categories";
                          } else if (secKey === "bestSellers") {
                            label = "• Mais Vendidos";
                            tabKey = "products";
                          } else if (secKey === "flash") {
                            label = "• Oferta Relâmpago";
                            tabKey = "flash";
                          } else if (secKey === "testimonials") {
                            label = "• Depoimentos";
                            tabKey = "testimonials";
                          } else if (secKey === "brands") {
                            label = "• Marcas Parceiras";
                            tabKey = "brands";
                          } else if (secKey === "newsletter") {
                            label = "• Newsletter";
                            tabKey = "newsletter";
                          } else if (secKey.startsWith("custom-sec-")) {
                            const cId = secKey.replace("custom-sec-", "");
                            const customSec = data.customSections?.find((s) => s.id === cId);
                            if (!customSec) return null;
                            label = `• Seção ${customSec.title || "Sem Título"}`;
                            tabKey = secKey as TabType;
                          } else if (secKey.startsWith("custom-banner-")) {
                            const cId = secKey.replace("custom-banner-", "");
                            const customBanner = data.customBanners?.find((b) => b.id === cId);
                            if (!customBanner) return null;
                            label = `• Banner: ${customBanner.name || "Sem Nome"}`;
                            tabKey = secKey as TabType;
                          }

                          return (
                            <div key={secKey} className="group flex items-center justify-between w-full rounded hover:bg-white/5 pr-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSection("home");
                                  setActiveTab(tabKey);
                                }}
                                className={`flex-1 text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                                  activeSection === "home" && activeTab === tabKey ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                                }`}
                              >
                                {label}
                              </button>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSectionUp(secKey);
                                  }}
                                  disabled={index === 0}
                                  className="p-0.5 text-[9px] text-white/40 hover:text-[#FF8A00] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                  title="Mover para cima"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSectionDown(secKey);
                                  }}
                                  disabled={index === data.sectionOrder!.length - 1}
                                  className="p-0.5 text-[9px] text-white/40 hover:text-[#FF8A00] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                  title="Mover para baixo"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection("home");
                            setActiveTab("footer");
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            activeSection === "home" && activeTab === "footer" ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                          }`}
                        >
                          • Rodapé (Footer)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection("home");
                            setActiveTab("colors");
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            activeSection === "home" && activeTab === "colors" ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                          }`}
                        >
                          • Paleta de Cores
                        </button>
                      </>
                     ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const title = prompt("Digite o nome da nova seção (ex: Kids, Modelos):");
                            if (!title) return;
                            const newId = "custom_" + Date.now();
                            const newSection = {
                              id: newId,
                              title: title,
                              subtitle: "Subtítulo da sua nova seção",
                              products: Array.from({ length: 4 }).map((_, idx) => ({
                                id: idx + 1,
                                name: `Produto ${idx + 1}`,
                                discount: "-10%",
                                reviews: "(50)",
                                oldPrice: "R$ 199,90",
                                price: "R$ 179,90",
                                installment: "12x de R$ 14,99",
                                imageUrl: ""
                              }))
                            };
                            setCategoryData((prev: any) => ({
                              ...prev,
                              customSections: [...(prev?.customSections || []), newSection],
                              sectionOrder: [...(prev?.sectionOrder || ["header", "benefits", "products"]), `custom-sec-${newId}`]
                            }));
                            setActiveTab(`custom-sec-${newId}`);
                            toast.success(`Seção "${title}" adicionada com sucesso! Lembre-se de Salvar as alterações.`);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          ➕ Adicionar Seção
                        </button>

                        {(() => {
                          const order = (activeSection === sec.id && categoryData?.sectionOrder)
                            ? categoryData.sectionOrder
                            : ["header", "benefits", "products"];

                          return order.map((secKey, index) => {
                            let label = "";
                            let tabKey: TabType = "cat-banner";

                            if (secKey === "header") {
                              label = "• Banner Superior";
                              tabKey = "cat-banner";
                            } else if (secKey === "benefits") {
                              label = "• Barra de Benefícios";
                              tabKey = "cat-benefits";
                            } else if (secKey === "products") {
                              label = "• Produtos (CRUD)";
                              tabKey = "cat-products";
                            } else if (secKey.startsWith("custom-sec-")) {
                              const cId = secKey.replace("custom-sec-", "");
                              const customSec = categoryData?.customSections?.find((s) => s.id === cId);
                              if (!customSec) return null;
                              label = `• Seção ${customSec.title || "Sem Título"}`;
                              tabKey = secKey as TabType;
                            }

                            return (
                              <div key={secKey} className="group flex items-center justify-between w-full rounded hover:bg-white/5 pr-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSection(sec.id);
                                    setActiveTab(tabKey);
                                  }}
                                  className={`flex-1 text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                                    activeSection === sec.id && activeTab === tabKey ? "text-[#FF8A00] font-bold" : "text-white/60 hover:text-white"
                                  }`}
                                >
                                  {label}
                                </button>
                                {activeSection === sec.id && (
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveCategorySectionUp(secKey);
                                      }}
                                      disabled={index === 0}
                                      className="p-0.5 text-[9px] text-white/40 hover:text-[#FF8A00] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                      title="Mover para cima"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveCategorySectionDown(secKey);
                                      }}
                                      disabled={index === (categoryData?.sectionOrder?.length || 3) - 1}
                                      className="p-0.5 text-[9px] text-white/40 hover:text-[#FF8A00] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                      title="Mover para baixo"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })})()}

          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase px-3 py-1 mt-4 mb-1">
            Gestão da Loja
          </h4>
          <button
            type="button"
            onClick={() => {
              setActiveSection("orders");
              setActiveTab("orders-list");
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSection === "orders" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <span>📦 Pedidos Recebidos</span>
          </button>

          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase px-3 py-1 mt-4 mb-1">
            Configurar Pagamentos
          </h4>
          <button
            type="button"
            onClick={() => {
              setActiveSection("payments");
              setActiveTab("mercado-pago");
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSection === "payments" && activeTab === "mercado-pago" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <span>💳 Mercado Pago</span>
          </button>

          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase px-3 py-1 mt-4 mb-1">
            Configurar Envio
          </h4>
          <button
            type="button"
            onClick={() => {
              setActiveSection("shipping");
              setActiveTab("melhor-envio");
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSection === "shipping" && activeTab === "melhor-envio" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <span>🚚 Melhor Envio</span>
          </button>
        </div>

        {/* Content Form Editor */}
        <div className="md:col-span-3 bg-[#101217] border border-[#282C32]/45 rounded-lg p-6 flex flex-col gap-6">
          <DriveInstructionBox />

          {/* TAB 1: Banner Promocional */}
          {activeTab === "promo" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Promocional Superior
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleSwitch
                  label="Exibir Barra Promocional (Laranja)"
                  checked={data.promoBar.show !== false}
                  onChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      promoBar: { ...prev.promoBar, show: val },
                    }))
                  }
                />
                <ToggleSwitch
                  label="Exibir Relógio Regressivo (Contador)"
                  checked={data.promoBar.showTimer !== false}
                  onChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      promoBar: { ...prev.promoBar, showTimer: val },
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-white/70">Texto da Promoção</label>
                <input
                  type="text"
                  value={data.promoBar.text}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      promoBar: { ...prev.promoBar, text: e.target.value },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              {data.promoBar.showTimer !== false && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-semibold text-white/70">Tempo Inicial do Relógio</label>
                  <div className="grid grid-cols-3 gap-4 border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Horas</label>
                      <input
                        type="number"
                        min="0"
                        value={Math.floor((data.promoBar.timerDuration || 8130) / 3600)}
                        onChange={(e) => {
                          const h = Math.max(0, parseInt(e.target.value) || 0);
                          const duration = data.promoBar.timerDuration || 8130;
                          const m = Math.floor((duration % 3600) / 60);
                          const s = duration % 60;
                          setData((prev) => ({
                            ...prev,
                            promoBar: { ...prev.promoBar, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={Math.floor(((data.promoBar.timerDuration || 8130) % 3600) / 60)}
                        onChange={(e) => {
                          const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          const duration = data.promoBar.timerDuration || 8130;
                          const h = Math.floor(duration / 3600);
                          const s = duration % 60;
                          setData((prev) => ({
                            ...prev,
                            promoBar: { ...prev.promoBar, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Segundos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={(data.promoBar.timerDuration || 8130) % 60}
                        onChange={(e) => {
                          const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          const duration = data.promoBar.timerDuration || 8130;
                          const h = Math.floor(duration / 3600);
                          const m = Math.floor((duration % 3600) / 60);
                          setData((prev) => ({
                            ...prev,
                            promoBar: { ...prev.promoBar, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Configurações da Página do Produto */}
          {activeTab === "product-page" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Configurações da Página do Produto
              </h3>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-white/70">Texto do Botão de Compra</label>
                <input
                  type="text"
                  value={data.productPageSettings?.buttonText || "COMPRAR AGORA"}
                  onChange={(e) =>
                    setData((prev: any) => ({
                      ...prev,
                      productPageSettings: {
                        ...(prev.productPageSettings || {}),
                        buttonText: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-2">
                <ToggleSwitch
                  label="Exibir Segundo Botão (Ex: Adicionar à Sacola)"
                  checked={data.productPageSettings?.showButton2 !== false}
                  onChange={(val) =>
                    setData((prev: any) => ({
                      ...prev,
                      productPageSettings: {
                        ...(prev.productPageSettings || {}),
                        showButton2: val,
                      },
                    }))
                  }
                />
              </div>

              {data.productPageSettings?.showButton2 !== false && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-white/70">Texto do Segundo Botão</label>
                  <input
                    type="text"
                    value={data.productPageSettings?.button2Text || "ADICIONAR À SACOLA"}
                    onChange={(e) =>
                      setData((prev: any) => ({
                        ...prev,
                        productPageSettings: {
                          ...(prev.productPageSettings || {}),
                          button2Text: e.target.value,
                        },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mt-2">
                <ToggleSwitch
                  label="Exibir Simulador de Frete na Página do Produto"
                  checked={data.productPageSettings?.showShippingCalculator !== false}
                  onChange={(val) =>
                    setData((prev: any) => ({
                      ...prev,
                      productPageSettings: {
                        ...(prev.productPageSettings || {}),
                        showShippingCalculator: val,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-white/70">Custo do Frete Padrão (Exibido no simulador)</label>
                <input
                  type="text"
                  value={data.productPageSettings?.defaultShippingCost || "Grátis"}
                  onChange={(e) =>
                    setData((prev: any) => ({
                      ...prev,
                      productPageSettings: {
                        ...(prev.productPageSettings || {}),
                        defaultShippingCost: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ex: Grátis, R$ 15,90"
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-white/70">Prazo de Entrega Padrão (Exibido no simulador)</label>
                <input
                  type="text"
                  value={data.productPageSettings?.defaultShippingTime || "5 a 8 dias úteis"}
                  onChange={(e) =>
                    setData((prev: any) => ({
                      ...prev,
                      productPageSettings: {
                        ...(prev.productPageSettings || {}),
                        defaultShippingTime: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ex: 5 a 8 dias úteis, 2 dias úteis"
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Banner Principal (Hero) */}
          {activeTab === "hero" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Principal (Hero)
              </h3>
              
              <ToggleSwitch
                label="Exibir Banner Principal (Hero)"
                checked={data.hero.show !== false}
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, show: val },
                  }))
                }
              />
              
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título Principal (Use \n para pular linha)</label>
                  <textarea
                    value={data.hero.title}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full p-3 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors resize-y"
                  />
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] font-bold text-[#FF8A00] uppercase">Fonte do Título</label>
                  <select
                    value={data.hero.titleFont || "default"}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleFont: e.target.value },
                      }))
                    }
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {GOOGLE_FONTS_LIST.map((f) => (
                      <option key={f.value} value={f.value} className="bg-[#15181D] text-white">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Subtítulo</label>
                  <textarea
                    value={data.hero.subtitle}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }))
                    }
                    rows={2}
                    className="w-full p-3 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors resize-y"
                  />
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] font-bold text-[#FF8A00] uppercase">Fonte do Subtítulo</label>
                  <select
                    value={data.hero.subtitleFont || "default"}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitleFont: e.target.value },
                      }))
                    }
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {GOOGLE_FONTS_LIST.map((f) => (
                      <option key={f.value} value={f.value} className="bg-[#15181D] text-white">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-[#282C32]/35 rounded-lg p-4 bg-[#15181D]/20 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Botão Principal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Texto do Botão</label>
                    <input
                      type="text"
                      value={data.hero.buttonText}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, buttonText: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Link do Botão</label>
                    <input
                      type="text"
                      value={data.hero.buttonLink}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, buttonLink: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#FF8A00] uppercase">Fonte do Botão Principal</label>
                  <select
                    value={data.hero.buttonFont || "default"}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, buttonFont: e.target.value },
                      }))
                    }
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {GOOGLE_FONTS_LIST.map((f) => (
                      <option key={f.value} value={f.value} className="bg-[#15181D] text-white">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-[#282C32]/35 rounded-lg p-4 bg-[#15181D]/20 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Botão Secundário</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Texto do Botão</label>
                    <input
                      type="text"
                      value={data.hero.secondaryButtonText}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryButtonText: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Link do Botão</label>
                    <input
                      type="text"
                      value={data.hero.secondaryButtonLink}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryButtonLink: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#FF8A00] uppercase">Fonte do Botão Secundário</label>
                  <select
                    value={data.hero.secondaryButtonFont || "default"}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, secondaryButtonFont: e.target.value },
                      }))
                    }
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {GOOGLE_FONTS_LIST.map((f) => (
                      <option key={f.value} value={f.value} className="bg-[#15181D] text-white">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Background Image Control */}
              <ImageInputWithPreview
                label="Imagem de Fundo do Hero (Homem com Óculos)"
                value={data.hero.imageUrl || ""}
                recommendedSize="1200 x 800 px"
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, imageUrl: val },
                  }))
                }
              />

              <div className="flex flex-col gap-1.5 bg-[#15181D]/30 border border-[#282C32]/45 rounded-lg p-4 -mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/70">Ajuste Vertical da Imagem do Hero (Subir / Descer)</label>
                  <span className="text-[10px] text-[#FF8A00] font-bold">
                    {data.hero.imagePositionY !== undefined ? data.hero.imagePositionY : 50}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={data.hero.imagePositionY !== undefined ? data.hero.imagePositionY : 50}
                  onChange={(e) =>
                    setData((prev: any) => ({
                      ...prev,
                      hero: { ...prev.hero, imagePositionY: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full accent-[#FF8A00] h-1 bg-[#1C1F26] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-white/40">
                  <span>Subir (Topo - 0%)</span>
                  <span>Centro (50%)</span>
                  <span>Descer (Base - 100%)</span>
                </div>
              </div>

              {/* Selos de Vantagens (Benefits Bar) */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Selos de Vantagens (Abaixo do Hero)</h4>
                  <ToggleSwitch
                    label="Exibir Banner de Vantagens"
                    checked={data.hero.showBenefits !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, showBenefits: val },
                      }))
                    }
                  />
                </div>

                {data.hero.showBenefits !== false && (
                  <div className="flex flex-col gap-4">
                    {(data.hero.benefits || []).map((benefit, idx) => (
                      <div key={idx} className="border-l-2 border-brand/25 pl-4 py-1.5 flex flex-col gap-2.5">
                        <span className="text-[10px] font-bold text-[#FF8A00] uppercase font-mono">Selo {idx + 1}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-white/60">Título</label>
                            <input
                              type="text"
                              value={benefit.title}
                              onChange={(e) => {
                                const newBenefits = [...(data.hero.benefits || [])];
                                newBenefits[idx] = { ...benefit, title: e.target.value };
                                setData((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, benefits: newBenefits },
                                }));
                              }}
                              className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-white/60">Subtítulo</label>
                            <input
                              type="text"
                              value={benefit.subtitle}
                              onChange={(e) => {
                                const newBenefits = [...(data.hero.benefits || [])];
                                newBenefits[idx] = { ...benefit, subtitle: e.target.value };
                                setData((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, benefits: newBenefits },
                                }));
                              }}
                              className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Banner Principal 2 */}
          {activeTab === "hero2" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Principal 2
              </h3>
              
              <div className="flex flex-col gap-4">
                <ToggleSwitch
                  label="Exibir Banner Principal 2"
                  checked={data.hero2?.show !== false}
                  onChange={(val) =>
                    setData((prev: any) => ({
                      ...prev,
                      hero2: { ...(prev.hero2 || {}), show: val },
                    }))
                  }
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Nome do Banner (Para Controle)</label>
                  <input
                    type="text"
                    value={data.hero2?.name || "Banner Principal 2"}
                    onChange={(e) =>
                      setData((prev: any) => ({
                        ...prev,
                        hero2: { ...(prev.hero2 || {}), name: e.target.value },
                      }))
                    }
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Link de Destino ao Clicar (Ex: /colecoes?pageId=...) </label>
                  <input
                    type="text"
                    value={data.hero2?.linkUrl || ""}
                    onChange={(e) =>
                      setData((prev: any) => ({
                        ...prev,
                        hero2: { ...(prev.hero2 || {}), linkUrl: e.target.value },
                      }))
                    }
                    placeholder="Deixe em branco se não quiser link"
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Link da Imagem no Google Drive</label>
                  <input
                    type="text"
                    value={data.hero2?.imageUrl || ""}
                    onChange={(e) =>
                      setData((prev: any) => ({
                        ...prev,
                        hero2: { ...(prev.hero2 || {}), imageUrl: e.target.value },
                      }))
                    }
                    placeholder="https://drive.google.com/file/d/..."
                    className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/80">Posição Vertical da Imagem</label>
                    <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                      {data.hero2?.imagePositionY !== undefined ? data.hero2.imagePositionY : 50}%
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Ajuste o foco vertical da imagem caso ela fique cortada.
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30 font-bold">0% (Topo)</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={data.hero2?.imagePositionY !== undefined ? data.hero2.imagePositionY : 50}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setData((prev: any) => ({
                          ...prev,
                          hero2: { ...(prev.hero2 || {}), imagePositionY: val },
                        }));
                      }}
                      className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/30 font-bold">100% (Fundo)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/80">Altura (Computador)</label>
                      <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                        {data.hero2?.desktopHeight !== undefined ? data.hero2.desktopHeight : 380}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/30 font-bold">150px</span>
                      <input
                        type="range"
                        min="150"
                        max="800"
                        step="10"
                        value={data.hero2?.desktopHeight !== undefined ? data.hero2.desktopHeight : 380}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setData((prev: any) => ({
                            ...prev,
                            hero2: { ...(prev.hero2 || {}), desktopHeight: val },
                          }));
                        }}
                        className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 font-bold">800px</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/80">Altura (Celular)</label>
                      <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                        {data.hero2?.mobileHeight !== undefined ? data.hero2.mobileHeight : 180}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/30 font-bold">80px</span>
                      <input
                        type="range"
                        min="80"
                        max="500"
                        step="10"
                        value={data.hero2?.mobileHeight !== undefined ? data.hero2.mobileHeight : 180}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setData((prev: any) => ({
                            ...prev,
                            hero2: { ...(prev.hero2 || {}), mobileHeight: val },
                          }));
                        }}
                        className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 font-bold">500px</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/80">Largura Máxima</label>
                      <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                        {data.hero2?.desktopWidth !== undefined ? data.hero2.desktopWidth : 1500}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/30 font-bold">200px</span>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="5"
                        value={data.hero2?.desktopWidth !== undefined ? data.hero2.desktopWidth : 1500}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setData((prev: any) => ({
                            ...prev,
                            hero2: { ...(prev.hero2 || {}), desktopWidth: val },
                          }));
                        }}
                        className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 font-bold">1500px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Categorias */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-base font-bold text-[#FF8A00]">
                  Seção de Categorias
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const title = prompt("Digite o nome da nova categoria (ex: Infantil, Esportivo):");
                    if (!title) return;
                    const newCategory = {
                      title: title,
                      description: `Explore os modelos de óculos da linha ${title}`,
                      imageUrl: "",
                      imageKey: `cat_${Date.now()}`
                    };
                    setData((prev: any) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        list: [...(prev.categories?.list || []), newCategory]
                      }
                    }));
                    toast.success(`Categoria "${title}" adicionada com sucesso! Lembre-se de salvar.`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  + Adicionar Nova Categoria
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {data.categories.list.map((cat, idx) => (
                  <div key={cat.imageKey || cat.title} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand uppercase tracking-wider">
                        Categoria {idx + 1}: {cat.title}
                      </span>
                      {data.categories.list.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Tem certeza de que deseja remover a categoria "${cat.title}"?`)) {
                              const newList = data.categories.list.filter((_, i) => i !== idx);
                              setData((prev) => ({
                                ...prev,
                                categories: { ...prev.categories, list: newList }
                              }));
                              toast.success("Categoria removida! Lembre-se de salvar.");
                            }
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-bold cursor-pointer"
                        >
                          Remover Categoria
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/75">Título da Categoria</label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => {
                            const newList = [...data.categories.list];
                            newList[idx] = { ...cat, title: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              categories: { ...prev.categories, list: newList },
                            }));
                          }}
                          className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/75">Descrição</label>
                        <input
                          type="text"
                          value={cat.description}
                          onChange={(e) => {
                            const newList = [...data.categories.list];
                            newList[idx] = { ...cat, description: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              categories: { ...prev.categories, list: newList },
                            }));
                          }}
                          className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    <ImageInputWithPreview
                      label={`Imagem de Fundo - Categoria ${cat.title}`}
                      value={cat.imageUrl || ""}
                      recommendedSize="600 x 700 px"
                      onChange={(val) => {
                        const newList = [...data.categories.list];
                        newList[idx] = { ...cat, imageUrl: val };
                        setData((prev) => ({
                          ...prev,
                          categories: { ...prev.categories, list: newList },
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Mais Vendidos */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção Mais Vendidos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                  <input
                    type="text"
                    value={data.bestSellers.title}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        bestSellers: { ...prev.bestSellers, title: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Subtítulo da Seção</label>
                  <input
                    type="text"
                    value={data.bestSellers.subtitle}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        bestSellers: { ...prev.bestSellers, subtitle: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {data.bestSellers.products.map((product, idx) => (
                  <div key={product.id} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">
                      Produto {product.id}
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Nome do Produto</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, name: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Porcentagem de Desconto</label>
                        <input
                          type="text"
                          value={product.discount}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, discount: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Preço Original</label>
                        <input
                          type="text"
                          value={product.oldPrice}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, oldPrice: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Preço com Desconto</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, price: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Parcelas</label>
                        <input
                          type="text"
                          value={product.installment}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, installment: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Gênero</label>
                        <select
                          value={product.gender || "Feminino"}
                          onChange={(e) => {
                            const newProds = [...data.bestSellers.products];
                            newProds[idx] = { ...product, gender: e.target.value };
                            setData((prev) => ({
                              ...prev,
                              bestSellers: { ...prev.bestSellers, products: newProds },
                            }));
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        >
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Unissex">Unissex</option>
                          <option value="Infantil">Infantil</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Medidas em mm (Haste / Ponte / Lente / Altura)</label>
                        <div className="grid grid-cols-4 gap-1">
                          <input
                            type="text"
                            placeholder="Haste"
                            value={product.specsHaste || ""}
                            onChange={(e) => {
                              const newProds = [...data.bestSellers.products];
                              newProds[idx] = { ...product, specsHaste: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                bestSellers: { ...prev.bestSellers, products: newProds },
                              }));
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Ponte"
                            value={product.specsPonte || ""}
                            onChange={(e) => {
                              const newProds = [...data.bestSellers.products];
                              newProds[idx] = { ...product, specsPonte: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                bestSellers: { ...prev.bestSellers, products: newProds },
                              }));
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Lente"
                            value={product.specsLente || ""}
                            onChange={(e) => {
                              const newProds = [...data.bestSellers.products];
                              newProds[idx] = { ...product, specsLente: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                bestSellers: { ...prev.bestSellers, products: newProds },
                              }));
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Altura"
                            value={product.specsAltura || ""}
                            onChange={(e) => {
                              const newProds = [...data.bestSellers.products];
                              newProds[idx] = { ...product, specsAltura: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                bestSellers: { ...prev.bestSellers, products: newProds },
                              }));
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                      <label className="text-[10px] font-bold text-white/60">Descrição Detalhada do Produto</label>
                      <textarea
                        value={product.description || ""}
                        onChange={(e) => {
                          const newProds = [...data.bestSellers.products];
                          newProds[idx] = { ...product, description: e.target.value };
                          setData((prev) => ({
                            ...prev,
                            bestSellers: { ...prev.bestSellers, products: newProds },
                          }));
                        }}
                        rows={3}
                        placeholder="Escreva a descrição do produto que aparecerá abaixo da imagem..."
                        className="w-full p-2.5 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] resize-y mb-3"
                      />
                    </div>

                    <div className="bg-[#1C1F26]/30 border border-[#282C32]/45 rounded-lg p-3 flex flex-col gap-2 mt-2 mb-3">
                      <label className="text-[10px] font-bold text-white/70">Galeria de Imagens Adicionais (Até 9 fotos extras)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, gIdx) => {
                          const galleryList = Array.isArray(product.gallery) ? product.gallery : [];
                          const val = galleryList[gIdx] || "";
                          return (
                            <div key={gIdx} className="flex flex-col gap-1 border border-white/5 p-1.5 rounded bg-[#15181D]/40">
                              <label className="text-[9px] font-semibold text-white/50">Foto Extra #{gIdx + 2}</label>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => {
                                  const newProds = [...data.bestSellers.products];
                                  const updatedGallery = [...galleryList];
                                  updatedGallery[gIdx] = e.target.value;
                                  newProds[idx] = { ...product, gallery: updatedGallery };
                                  setData((prev) => ({
                                    ...prev,
                                    bestSellers: { ...prev.bestSellers, products: newProds },
                                  }));
                                }}
                                placeholder="Link no Google Drive"
                                className="h-7 px-2 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <ImageInputWithPreview
                      label={`Imagem do Produto - ${product.name}`}
                      value={product.imageUrl || ""}
                      recommendedSize="700 x 600 px"
                      onChange={(val) => {
                        const newProds = [...data.bestSellers.products];
                        newProds[idx] = { ...product, imageUrl: val };
                        setData((prev) => ({
                          ...prev,
                          bestSellers: { ...prev.bestSellers, products: newProds },
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Custom Sections */}
          {activeTab.startsWith("custom-sec-") && (() => {
            const customSecId = activeTab.replace("custom-sec-", "");
            const isHome = activeSection === "home";
            const currentData = isHome ? data : categoryData;
            if (!currentData) return null;
            const currentSections = currentData.customSections || [];
            const customSecIdx = currentSections.findIndex((sec: any) => sec.id === customSecId);
            if (customSecIdx === -1 || customSecIdx === undefined) return null;
            const customSec = currentSections[customSecIdx];

            const updateSections = (newSections: any[]) => {
              if (isHome) {
                setData((prev: any) => ({
                  ...prev,
                  customSections: newSections
                }));
              } else {
                setCategoryData((prev: any) => ({
                  ...prev,
                  customSections: newSections
                }));
              }
            };

            return (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-base font-bold text-[#FF8A00]">
                    Editar Seção Personalizada: {customSec.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Tem certeza de que deseja excluir a seção "${customSec.title}"?`)) {
                        const newSections = currentSections.filter((sec: any) => sec.id !== customSecId);
                        if (isHome) {
                          setData((prev: any) => ({
                            ...prev,
                            customSections: newSections
                          }));
                          setActiveTab("products");
                        } else {
                          const newOrder = (categoryData?.sectionOrder || []).filter(k => k !== `custom-sec-${customSecId}`);
                          setCategoryData((prev: any) => ({
                            ...prev,
                            customSections: newSections,
                            sectionOrder: newOrder
                          }));
                          setActiveTab("cat-products");
                        }
                        toast.success("Seção excluída com sucesso! Lembre-se de Salvar as alterações.");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer shadow-sm"
                  >
                    Excluir Esta Seção
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                    <input
                      type="text"
                      value={customSec.title}
                      onChange={(e) => {
                        const newSections = [...currentSections];
                        newSections[customSecIdx] = { ...customSec, title: e.target.value };
                        updateSections(newSections);
                      }}
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Subtítulo da Seção</label>
                    <input
                      type="text"
                      value={customSec.subtitle}
                      onChange={(e) => {
                        const newSections = [...currentSections];
                        newSections[customSecIdx] = { ...customSec, subtitle: e.target.value };
                        updateSections(newSections);
                      }}
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <h4 className="text-sm font-bold text-white/80">Produtos da Seção ({customSec.products?.length || 0})</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newProducts = [...(customSec.products || [])];
                      const newId = newProducts.length + 1;
                      newProducts.push({
                        id: newId,
                        name: `Novo Produto ${newId}`,
                        discount: "-10%",
                        reviews: "(50)",
                        oldPrice: "R$ 199,90",
                        price: "R$ 179,90",
                        installment: "12x de R$ 14,99",
                        imageUrl: ""
                      });
                      const newSections = [...currentSections];
                      newSections[customSecIdx] = { ...customSec, products: newProducts };
                      updateSections(newSections);
                      toast.success("Produto adicionado! Lembre-se de salvar.");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    + Adicionar Produto
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {customSec.products?.map((product: any, prodIdx: number) => (
                    <div key={product.id} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand uppercase tracking-wider">
                          Produto {product.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Tem certeza de que deseja remover este produto da seção?")) {
                              const newProducts = customSec.products.filter((p: any) => p.id !== product.id)
                                .map((p: any, i: number) => ({ ...p, id: i + 1 })); // reindex
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProducts };
                              updateSections(newSections);
                              toast.success("Produto removido! Lembre-se de salvar.");
                            }
                          }}
                          className="text-red-500 hover:text-red-400 text-[10px] font-bold cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Nome do Produto</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, name: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Porcentagem de Desconto</label>
                          <input
                            type="text"
                            value={product.discount}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, discount: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Preço Original (Riscado)</label>
                          <input
                            type="text"
                            value={product.oldPrice}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, oldPrice: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Preço com Desconto (Preço de Venda)</label>
                          <input
                            type="text"
                            value={product.price}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, price: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Parcelas</label>
                          <input
                            type="text"
                            value={product.installment}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, installment: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Gênero</label>
                        <select
                          value={product.gender || "Feminino"}
                          onChange={(e) => {
                            const newProds = [...customSec.products];
                            newProds[prodIdx] = { ...product, gender: e.target.value };
                            const newSections = [...currentSections];
                            newSections[customSecIdx] = { ...customSec, products: newProds };
                            updateSections(newSections);
                          }}
                          className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        >
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Unissex">Unissex</option>
                          <option value="Infantil">Infantil</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/60">Medidas em mm (Haste / Ponte / Lente / Altura)</label>
                        <div className="grid grid-cols-4 gap-1">
                          <input
                            type="text"
                            placeholder="Haste"
                            value={product.specsHaste || ""}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, specsHaste: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Ponte"
                            value={product.specsPonte || ""}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, specsPonte: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Lente"
                            value={product.specsLente || ""}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, specsLente: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Altura"
                            value={product.specsAltura || ""}
                            onChange={(e) => {
                              const newProds = [...customSec.products];
                              newProds[prodIdx] = { ...product, specsAltura: e.target.value };
                              const newSections = [...currentSections];
                              newSections[customSecIdx] = { ...customSec, products: newProds };
                              updateSections(newSections);
                            }}
                            className="h-9 px-1 text-center bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                      <label className="text-[10px] font-bold text-white/60">Descrição Detalhada do Produto</label>
                      <textarea
                        value={product.description || ""}
                        onChange={(e) => {
                          const newProds = [...customSec.products];
                          newProds[prodIdx] = { ...product, description: e.target.value };
                          const newSections = [...currentSections];
                          newSections[customSecIdx] = { ...customSec, products: newProds };
                          updateSections(newSections);
                        }}
                        rows={3}
                        placeholder="Escreva a descrição do produto que aparecerá abaixo da imagem..."
                        className="w-full p-2.5 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] resize-y mb-3"
                      />
                    </div>

                    <div className="bg-[#1C1F26]/30 border border-[#282C32]/45 rounded-lg p-3 flex flex-col gap-2 mt-2 mb-3">
                      <label className="text-[10px] font-bold text-white/70">Galeria de Imagens Adicionais (Até 9 fotos extras)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, gIdx) => {
                          const galleryList = Array.isArray(product.gallery) ? product.gallery : [];
                          const val = galleryList[gIdx] || "";
                          return (
                            <div key={gIdx} className="flex flex-col gap-1 border border-white/5 p-1.5 rounded bg-[#15181D]/40">
                              <label className="text-[9px] font-semibold text-white/50">Foto Extra #{gIdx + 2}</label>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => {
                                  const newProds = [...customSec.products];
                                  const updatedGallery = [...galleryList];
                                  updatedGallery[gIdx] = e.target.value;
                                  newProds[prodIdx] = { ...product, gallery: updatedGallery };
                                  const newSections = [...currentSections];
                                  newSections[customSecIdx] = { ...customSec, products: newProds };
                                  updateSections(newSections);
                                }}
                                placeholder="Link no Google Drive"
                                className="h-7 px-2 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                      <ImageInputWithPreview
                        label={`Imagem do Produto - ${product.name}`}
                        value={product.imageUrl || ""}
                        recommendedSize="700 X 600 PX"
                        onChange={(val) => {
                          const newProds = [...customSec.products];
                          newProds[prodIdx] = { ...product, imageUrl: val };
                          const newSections = [...currentSections];
                          newSections[customSecIdx] = { ...customSec, products: newProds };
                          updateSections(newSections);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* TAB: Custom Banners */}
          {activeTab.startsWith("custom-banner-") && (() => {
            const bannerId = activeTab.replace("custom-banner-", "");
            const banners = data.customBanners || [];
            const bannerIdx = banners.findIndex((b: any) => b.id === bannerId);
            if (bannerIdx === -1 || bannerIdx === undefined) return null;
            const banner = banners[bannerIdx];

            return (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-base font-bold text-[#FF8A00]">
                    Editar Banner: {banner.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Tem certeza de que deseja excluir o banner "${banner.name}"?`)) {
                        const newBanners = banners.filter((b: any) => b.id !== bannerId);
                        const newOrder = (data.sectionOrder || []).filter(k => k !== `custom-banner-${bannerId}`);
                        setData((prev: any) => ({
                          ...prev,
                          customBanners: newBanners,
                          sectionOrder: newOrder
                        }));
                        setActiveTab("promo");
                        toast.success("Banner excluído com sucesso! Lembre-se de Salvar as alterações.");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer shadow-sm"
                  >
                    Excluir Este Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Nome Identificador (Admin)</label>
                    <input
                      type="text"
                      value={banner.name}
                      onChange={(e) => {
                        const newBanners = [...banners];
                        newBanners[bannerIdx] = { ...banner, name: e.target.value };
                        setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                      }}
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/70">Link de Redirecionamento (URL)</label>
                    <input
                      type="text"
                      placeholder="Ex: /masculino, /solar ou https://..."
                      value={banner.linkUrl}
                      onChange={(e) => {
                        const newBanners = [...banners];
                        newBanners[bannerIdx] = { ...banner, linkUrl: e.target.value };
                        setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                      }}
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                  <ImageInputWithPreview
                    label="Imagem do Banner (Recomendado: 1240 X 260 PX)"
                    value={banner.imageUrl || ""}
                    recommendedSize="1240 X 260 PX"
                    onChange={(val) => {
                      const newBanners = [...banners];
                      newBanners[bannerIdx] = { ...banner, imageUrl: val };
                      setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                    }}
                  />

                  <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/80">Ajuste Vertical da Imagem (Posição Y)</label>
                      <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">{banner.imagePositionY !== undefined ? banner.imagePositionY : 50}%</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Se o banner for cortado, use esta barra para subir ou descer a imagem de fundo para o melhor enquadramento.
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-white/30 font-bold">Topo</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={banner.imagePositionY !== undefined ? banner.imagePositionY : 50}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const newBanners = [...banners];
                          newBanners[bannerIdx] = { ...banner, imagePositionY: val };
                          setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                        }}
                        className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 font-bold">Base</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-white/80">Altura do Banner (Desktop / Tablet)</label>
                        <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                          {banner.desktopHeight !== undefined ? banner.desktopHeight : 200}px
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Defina a altura do banner em pixels em telas de computador (ex: 200px para banner 1392x200).
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/30 font-bold">60px</span>
                        <input
                          type="range"
                          min="60"
                          max="600"
                          step="10"
                          value={banner.desktopHeight !== undefined ? banner.desktopHeight : 200}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const newBanners = [...banners];
                            newBanners[bannerIdx] = { ...banner, desktopHeight: val };
                            setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                          }}
                          className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] text-white/30 font-bold">600px</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-white/80">Altura do Banner (Celular)</label>
                        <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                          {banner.mobileHeight !== undefined ? banner.mobileHeight : 120}px
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Defina a altura do banner em pixels em telas de celulares (ex: 80px a 150px).
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/30 font-bold">40px</span>
                        <input
                          type="range"
                          min="40"
                          max="350"
                          step="5"
                          value={banner.mobileHeight !== undefined ? banner.mobileHeight : 120}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const newBanners = [...banners];
                            newBanners[bannerIdx] = { ...banner, mobileHeight: val };
                            setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                          }}
                          className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] text-white/30 font-bold">350px</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-[#15181D]/30 p-4 border border-[#282C32]/45 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/80">Largura Máxima do Banner (Desktop)</label>
                      <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">
                        {banner.desktopWidth !== undefined ? banner.desktopWidth : 1500}px
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Defina a largura máxima do banner. Se for menor que 1500px, o banner será centralizado na tela (ex: use 1500px para preencher o grid ampliado, ou menor se quiser um banner mais compacto).
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-white/30 font-bold">200px</span>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="5"
                        value={banner.desktopWidth !== undefined ? banner.desktopWidth : 1500}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const newBanners = [...banners];
                          newBanners[bannerIdx] = { ...banner, desktopWidth: val };
                          setData((prev: any) => ({ ...prev, customBanners: newBanners }));
                        }}
                        className="flex-1 accent-brand h-1 bg-[#282C32]/80 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 font-bold">1500px (Máx)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: Oferta Relâmpago */}
          {activeTab === "flash" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção da Oferta Relâmpago
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleSwitch
                  label="Exibir Seção Oferta Relâmpago"
                  checked={data.flashBanner?.show !== false}
                  onChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      flashBanner: { ...prev.flashBanner, show: val },
                    }))
                  }
                />
                <ToggleSwitch
                  label="Exibir Relógio Regressivo"
                  checked={data.flashBanner?.showTimer !== false}
                  onChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      flashBanner: { ...prev.flashBanner, showTimer: val },
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-white/70">Título Principal</label>
                <input
                  type="text"
                  value={data.flashBanner?.title || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      flashBanner: { ...prev.flashBanner, title: e.target.value },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70">Subtítulo</label>
                <input
                  type="text"
                  value={data.flashBanner?.subtitle || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      flashBanner: { ...prev.flashBanner, subtitle: e.target.value },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Texto do Botão</label>
                  <input
                    type="text"
                    value={data.flashBanner?.buttonText || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        flashBanner: { ...prev.flashBanner, buttonText: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Link do Botão</label>
                  <input
                    type="text"
                    value={data.flashBanner?.buttonLink || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        flashBanner: { ...prev.flashBanner, buttonLink: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              {data.flashBanner?.showTimer !== false && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-semibold text-white/70">Tempo Inicial do Relógio</label>
                  <div className="grid grid-cols-3 gap-4 border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Horas</label>
                      <input
                        type="number"
                        min="0"
                        value={Math.floor((data.flashBanner?.timerDuration || 8123) / 3600)}
                        onChange={(e) => {
                          const h = Math.max(0, parseInt(e.target.value) || 0);
                          const duration = data.flashBanner?.timerDuration || 8123;
                          const m = Math.floor((duration % 3600) / 60);
                          const s = duration % 60;
                          setData((prev) => ({
                            ...prev,
                            flashBanner: { ...prev.flashBanner, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={Math.floor(((data.flashBanner?.timerDuration || 8123) % 3600) / 60)}
                        onChange={(e) => {
                          const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          const duration = data.flashBanner?.timerDuration || 8123;
                          const h = Math.floor(duration / 3600);
                          const s = duration % 60;
                          setData((prev) => ({
                            ...prev,
                            flashBanner: { ...prev.flashBanner, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/60">Segundos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={(data.flashBanner?.timerDuration || 8123) % 60}
                        onChange={(e) => {
                          const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          const duration = data.flashBanner?.timerDuration || 8123;
                          const h = Math.floor(duration / 3600);
                          const m = Math.floor((duration % 3600) / 60);
                          setData((prev) => ({
                            ...prev,
                            flashBanner: { ...prev.flashBanner, timerDuration: h * 3600 + m * 60 + s }
                          }));
                        }}
                        className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Depoimentos */}
          {activeTab === "testimonials" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00] flex items-center justify-between">
                <span>Seção de Depoimentos</span>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [...(data.testimonials.list || [])];
                    newList.push({
                      name: "Novo Cliente",
                      text: "Escreva o depoimento aqui...",
                      imageKey: `client_custom_${Date.now()}`,
                      imageUrl: "",
                    });
                    setData(prev => ({
                      ...prev,
                      testimonials: { ...prev.testimonials, list: newList }
                    }));
                  }}
                  className="bg-[#FF8A00] hover:bg-[#E97800] text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Depoimento
                </button>
              </h3>

              <ToggleSwitch
                label="Exibir Seção de Depoimentos no Site"
                checked={data.testimonials.show !== false}
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, show: val },
                  }))
                }
              />

              {data.testimonials.show !== false && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                      <input
                        type="text"
                        value={data.testimonials.title}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            testimonials: { ...prev.testimonials, title: e.target.value },
                          }))
                        }
                        className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70">Subtítulo da Seção</label>
                      <input
                        type="text"
                        value={data.testimonials.subtitle}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            testimonials: { ...prev.testimonials, subtitle: e.target.value },
                          }))
                        }
                        className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {(data.testimonials.list || []).map((t, idx) => (
                      <div key={idx} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4 relative">
                        <div className="absolute right-4 top-4">
                          <button
                            type="button"
                            onClick={() => {
                              const newList = data.testimonials.list.filter((_, i) => i !== idx);
                              setData(prev => ({
                                ...prev,
                                testimonials: { ...prev.testimonials, list: newList }
                              }));
                            }}
                            className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir Depoimento
                          </button>
                        </div>

                        <div className="flex flex-col gap-1 max-w-[calc(100%-150px)]">
                          <label className="text-[10px] font-bold text-white/60">Nome do Cliente</label>
                          <input
                            type="text"
                            value={t.name}
                            onChange={(e) => {
                              const newList = [...data.testimonials.list];
                              newList[idx] = { ...t, name: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                testimonials: { ...prev.testimonials, list: newList },
                              }));
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Depoimento</label>
                          <textarea
                            value={t.text}
                            onChange={(e) => {
                              const newList = [...data.testimonials.list];
                              newList[idx] = { ...t, text: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                testimonials: { ...prev.testimonials, list: newList },
                              }));
                            }}
                            rows={2}
                            className="p-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors resize-y"
                          />
                        </div>

                        <ImageInputWithPreview
                          label={`Foto do Cliente - ${t.name}`}
                          value={t.imageUrl || ""}
                          recommendedSize="512 w 512 px"
                          onChange={(val) => {
                            const newList = [...data.testimonials.list];
                            newList[idx] = { ...t, imageUrl: val };
                            setData((prev) => ({
                              ...prev,
                              testimonials: { ...prev.testimonials, list: newList },
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: Marcas Parceiras */}
          {activeTab === "brands" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção de Marcas Parceiras (Carrossel Infinito)
              </h3>

              <ToggleSwitch
                label="Exibir Marcas Parceiras no Site"
                checked={data.brands?.show !== false}
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    brands: { ...prev.brands, show: val },
                  }))
                }
              />

              {data.brands?.show !== false && (
                <div className="flex flex-col gap-4">
                  <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-3">
                    <label className="text-xs font-semibold text-white/70">Adicionar Nova Marca</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: RAY-BAN, OAKLEY, etc."
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="flex-1 h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newBrandName.trim()) return;
                          const newList = [...(data.brands?.list || [])];
                          newList.push(newBrandName.trim());
                          setData(prev => ({
                            ...prev,
                            brands: { ...prev.brands, list: newList }
                          }));
                          setNewBrandName("");
                        }}
                        className="bg-[#FF8A00] hover:bg-[#E97800] text-white font-bold px-4 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white/70">Lista de Marcas Ativas ({data.brands?.list?.length || 0})</label>
                    {(!data.brands?.list || data.brands.list.length === 0) ? (
                      <p className="text-xs text-white/40 italic">Nenhuma marca cadastrada. O carrossel não será exibido.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {data.brands.list.map((brand, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#15181D] border border-[#282C32]/45 rounded p-2 text-xs">
                            <span className="font-semibold text-white/80 font-display truncate mr-2">{brand}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newList = data.brands.list.filter((_, i) => i !== idx);
                                setData(prev => ({
                                  ...prev,
                                  brands: { ...prev.brands, list: newList }
                                }));
                              }}
                              className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 cursor-pointer transition-colors"
                              title="Remover marca"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Newsletter */}
          {activeTab === "newsletter" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção Newsletter
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70">Título</label>
                <input
                  type="text"
                  value={data.newsletter.title}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, title: e.target.value },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70">Subtítulo</label>
                <input
                  type="text"
                  value={data.newsletter.subtitle}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, subtitle: e.target.value },
                    }))
                  }
                  className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Placeholder do E-mail</label>
                  <input
                    type="text"
                    value={data.newsletter.placeholder}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        newsletter: { ...prev.newsletter, placeholder: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Texto do Botão</label>
                  <input
                    type="text"
                    value={data.newsletter.buttonText}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        newsletter: { ...prev.newsletter, buttonText: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              <ImageInputWithPreview
                label="Imagem Lateral da Newsletter (Casal usando Óculos)"
                value={data.newsletter.imageUrl || ""}
                recommendedSize="700 x 700 px"
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, imageUrl: val },
                  }))
                }
              />
            </div>
          )}

          {/* TAB 7: Rodapé (Footer) */}
          {activeTab === "footer" && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Configurações do Rodapé (Footer)
              </h3>

              {/* Visibilidade das Colunas */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Visibilidade das Colunas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <ToggleSwitch
                    label="Coluna 1: Sobre a Loja"
                    checked={data.footer?.showSobre !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showSobre: val },
                      }))
                    }
                  />
                  <ToggleSwitch
                    label="Ícones de Redes Sociais"
                    checked={data.footer?.showSocials !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showSocials: val },
                      }))
                    }
                  />
                  <ToggleSwitch
                    label="Coluna 2: Institucional"
                    checked={data.footer?.showInstitucional !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showInstitucional: val },
                      }))
                    }
                  />
                  <ToggleSwitch
                    label="Coluna 3: Ajuda"
                    checked={data.footer?.showAjuda !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showAjuda: val },
                      }))
                    }
                  />
                  <ToggleSwitch
                    label="Coluna 4: Atendimento"
                    checked={data.footer?.showAtendimento !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showAtendimento: val },
                      }))
                    }
                  />
                  <ToggleSwitch
                    label="Coluna 5: Pagamentos"
                    checked={data.footer?.showPayments !== false}
                    onChange={(val) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, showPayments: val },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Coluna 1: Sobre */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Coluna 1: Sobre a Loja</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Descrição da Loja</label>
                  <textarea
                    value={data.footer?.description || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, description: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full p-3 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">Link do Instagram</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/60">Ativo</span>
                        <button
                          type="button"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, showInstagram: prev.footer?.showInstagram !== false ? false : true },
                            }))
                          }
                          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            data.footer?.showInstagram !== false ? "bg-[#FF8A00]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              data.footer?.showInstagram !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={data.footer?.instagramUrl || ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, instagramUrl: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">Link do Facebook</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/60">Ativo</span>
                        <button
                          type="button"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, showFacebook: prev.footer?.showFacebook !== false ? false : true },
                            }))
                          }
                          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            data.footer?.showFacebook !== false ? "bg-[#FF8A00]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              data.footer?.showFacebook !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={data.footer?.facebookUrl || ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, facebookUrl: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">Link do WhatsApp</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/60">Ativo</span>
                        <button
                          type="button"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, showWhatsapp: prev.footer?.showWhatsapp !== false ? false : true },
                            }))
                          }
                          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            data.footer?.showWhatsapp !== false ? "bg-[#FF8A00]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              data.footer?.showWhatsapp !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={data.footer?.whatsappUrl || ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, whatsappUrl: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">Link do YouTube</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/60">Ativo</span>
                        <button
                          type="button"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, showYoutube: prev.footer?.showYoutube !== false ? false : true },
                            }))
                          }
                          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            data.footer?.showYoutube !== false ? "bg-[#FF8A00]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              data.footer?.showYoutube !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={data.footer?.youtubeUrl || ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, youtubeUrl: e.target.value },
                        }))
                      }
                      className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Coluna 2: Institucional */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Coluna 2: Institucional</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                  <input
                    type="text"
                    value={data.footer?.institucionalTitle || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, institucionalTitle: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  {data.footer?.institucionalLinks.map((link, idx) => (
                    <div key={idx} className="border-l-2 border-brand/25 pl-4 py-1.5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FF8A00] uppercase">Link {idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/60 font-medium">Exibir Opção</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [...data.footer.institucionalLinks];
                              newLinks[idx] = { ...link, show: link.show !== false ? false : true };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, institucionalLinks: newLinks },
                              }));
                            }}
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              link.show !== false ? "bg-[#FF8A00]" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                link.show !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Texto do Link</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...data.footer.institucionalLinks];
                              newLinks[idx] = { ...link, label: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, institucionalLinks: newLinks },
                              }));
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Destino (URL / Href)</label>
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => {
                              const newLinks = [...data.footer.institucionalLinks];
                              newLinks[idx] = { ...link, href: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, institucionalLinks: newLinks },
                              }));
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 3: Ajuda */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Coluna 3: Ajuda</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                  <input
                    type="text"
                    value={data.footer?.ajudaTitle || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, ajudaTitle: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  {data.footer?.ajudaLinks.map((link, idx) => (
                    <div key={idx} className="border-l-2 border-brand/25 pl-4 py-1.5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FF8A00] uppercase">Link {idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/60 font-medium">Exibir Opção</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [...data.footer.ajudaLinks];
                              newLinks[idx] = { ...link, show: link.show !== false ? false : true };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, ajudaLinks: newLinks },
                              }));
                            }}
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              link.show !== false ? "bg-[#FF8A00]" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                link.show !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Texto do Link</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...data.footer.ajudaLinks];
                              newLinks[idx] = { ...link, label: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, ajudaLinks: newLinks },
                              }));
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Destino (URL / Href)</label>
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => {
                              const newLinks = [...data.footer.ajudaLinks];
                              newLinks[idx] = { ...link, href: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, ajudaLinks: newLinks },
                              }));
                            }}
                            className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 4: Atendimento */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Coluna 4: Atendimento</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                  <input
                    type="text"
                    value={data.footer?.atendimentoTitle || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, atendimentoTitle: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  {data.footer?.atendimentoLines.map((line, idx) => (
                    <div key={idx} className="border-l-2 border-brand/25 pl-4 py-1.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FF8A00] uppercase font-mono">Linha {idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/60 font-medium">Exibir Opção</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLines = [...data.footer.atendimentoLines];
                              newLines[idx] = { ...line, show: line.show !== false ? false : true };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, atendimentoLines: newLines },
                              }));
                            }}
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              line.show !== false ? "bg-[#FF8A00]" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                line.show !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => {
                          const newLines = [...data.footer.atendimentoLines];
                          newLines[idx] = { ...line, text: e.target.value };
                          setData((prev) => ({
                            ...prev,
                            footer: { ...prev.footer, atendimentoLines: newLines },
                          }));
                        }}
                        className="w-full h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 5: Formas de Pagamento */}
              <div className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wide">Coluna 5: Formas de Pagamento</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Seção</label>
                  <input
                    type="text"
                    value={data.footer?.paymentsTitle || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, paymentsTitle: e.target.value },
                      }))
                    }
                    className="w-full h-11 px-4 bg-[#15181D] border border-[#282C32]/55 rounded text-sm text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  {data.footer?.payments.map((p, idx) => (
                    <div key={idx} className="border-l-2 border-brand/25 pl-4 py-2.5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FF8A00] uppercase font-mono">Bandeira / Método {idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/60 font-medium">Exibir Opção</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newPayments = [...data.footer.payments];
                              newPayments[idx] = { ...p, show: p.show !== false ? false : true };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, payments: newPayments },
                              }));
                            }}
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              p.show !== false ? "bg-[#FF8A00]" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                p.show !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Nome (Ex: Visa, Pix)</label>
                          <input
                            type="text"
                            value={p.label}
                            onChange={(e) => {
                              const newPayments = [...data.footer.payments];
                              newPayments[idx] = { ...p, label: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, payments: newPayments },
                              }));
                            }}
                            className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-white/60">Imagem (Link Google Drive - Opcional)</label>
                          <input
                            type="text"
                            value={p.imageUrl || ""}
                            onChange={(e) => {
                              const newPayments = [...data.footer.payments];
                              newPayments[idx] = { ...p, imageUrl: e.target.value };
                              setData((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, payments: newPayments },
                              }));
                            }}
                            placeholder="Cole o link do Drive para exibir imagem da bandeira"
                            className="h-10 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>
                      {p.imageUrl && (
                        <div className="flex items-center gap-2 bg-[#15181D]/50 p-2 rounded border border-white/5 w-fit">
                          <span className="text-[9px] text-white/60">Pré-visualização:</span>
                          <img
                            src={getDirectDriveUrl(p.imageUrl)}
                            alt={p.label}
                            className="h-6 max-w-[50px] object-contain rounded bg-white p-0.5 border border-white/10"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Paleta de Cores */}
          {activeTab === "colors" && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Gerenciador da Paleta de Cores do Site
              </h3>
              
              <div className="bg-[#15181D]/30 border border-[#282C32]/45 rounded-lg p-4 text-xs text-white/70 leading-relaxed">
                <p>
                  Personalize a identidade visual do seu e-commerce alterando as cores abaixo. As mudanças serão aplicadas instantaneamente em todos os botões, menus, rodapé, fundos de seção e textos do site.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        colors: {
                          brand: "#FF8A00",
                          brandHover: "#FF9900",
                          ink: "#08090A",
                          ink2: "#111214",
                          ink3: "#2A2A2A",
                          banner: "#FAFAFA",
                          hairline: "#2E3033",
                          background: "#FFFFFF",
                          foreground: "#08090A",
                          logoAccent: "#FF8A00",
                          logoText: "#FFFFFF",
                        }
                      }));
                      toast.success("Cores restauradas para o padrão com sucesso!");
                    }}
                    className="bg-white/10 hover:bg-white/15 text-white px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    Restaurar Padrão do Site
                  </button>
                </div>
              </div>

              {/* Categoria 1: Logotipo Glasses */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">1. Logotipo do Site ("Glasses")</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* URL da Imagem do Logotipo */}
                  <div className="md:col-span-2">
                    <ImageInputWithPreview
                      label="URL da Imagem do Logotipo Personalizado (Drive/PNG/JPG/SVG) - Deixe vazio para usar texto"
                      value={data.colors?.logoUrl || ""}
                      onChange={(val) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, logoUrl: val }
                        }));
                      }}
                      recommendedSize="ALTURA MÁXIMA SUGERIDA: 50PX"
                    />
                  </div>

                  {/* Dimensões do Logotipo */}
                  <div className="flex gap-4 md:col-span-2 bg-[#15181D]/30 border border-[#282C32]/45 p-3 rounded-lg">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-white/80 block mb-1">Largura da Logo no Site (px)</label>
                      <input
                        type="text"
                        value={data.colors?.logoWidth || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, logoWidth: e.target.value }
                          }));
                        }}
                        placeholder="Ex: 120"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/35 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-white/80 block mb-1">Altura da Logo no Site (px)</label>
                      <input
                        type="text"
                        value={data.colors?.logoHeight || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, logoHeight: e.target.value }
                          }));
                        }}
                        placeholder="Ex: 40"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/35 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* Cor Dourada/Destaque ('Gl') */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.logoAccent || "#FF8A00"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, logoAccent: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Cor Destaque do Logotipo ("Gl")</label>
                      <input
                        type="text"
                        value={data.colors?.logoAccent || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, logoAccent: e.target.value }
                          }));
                        }}
                        placeholder="#FF8A00"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* Cor Branca/Texto ('asses') */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.logoText || "#FFFFFF"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, logoText: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Cor do Texto do Logotipo ("asses")</label>
                      <input
                        type="text"
                        value={data.colors?.logoText || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, logoText: e.target.value }
                          }));
                        }}
                        placeholder="#FFFFFF"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Subcategoria 1.1: Cores de Identidade da Marca */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">1.1 Cores de Identidade da Marca</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Cor Laranja Principal */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.brand || "#FF8A00"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, brand: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Cor Principal (Marca)</label>
                      <input
                        type="text"
                        value={data.colors?.brand || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, brand: e.target.value }
                          }));
                        }}
                        placeholder="#FF8A00"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* Cor Laranja Hover */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.brandHover || "#FF9900"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, brandHover: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Cor Principal (Hover/Foco)</label>
                      <input
                        type="text"
                        value={data.colors?.brandHover || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, brandHover: e.target.value }
                          }));
                        }}
                        placeholder="#FF9900"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Categoria 2: Fundo e Banners */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">2. Cores de Fundo (Tema Escuro/Claro)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* ink - Fundo Geral */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.ink || "#08090A"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, ink: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Fundo Geral Escuro</label>
                      <input
                        type="text"
                        value={data.colors?.ink || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, ink: e.target.value }
                          }));
                        }}
                        placeholder="#08090A"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* ink2 - Cards e Menus */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.ink2 || "#111214"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, ink2: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Fundo de Cards/Caixas</label>
                      <input
                        type="text"
                        value={data.colors?.ink2 || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, ink2: e.target.value }
                          }));
                        }}
                        placeholder="#111214"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* ink3 - Cinza Escuro Auxiliar */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.ink3 || "#2A2A2A"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, ink3: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Fundo Auxiliar (Cinza)</label>
                      <input
                        type="text"
                        value={data.colors?.ink3 || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, ink3: e.target.value }
                          }));
                        }}
                        placeholder="#2A2A2A"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* banner - Banners Promocionais */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.banner || "#0D0E10"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, banner: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Fundo de Seções/Banners</label>
                      <input
                        type="text"
                        value={data.colors?.banner || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, banner: e.target.value }
                          }));
                        }}
                        placeholder="#0D0E10"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* background - Fundo Claro (Seções Brancas) */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.background || "#FFFFFF"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, background: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Fundo Claro do Site</label>
                      <input
                        type="text"
                        value={data.colors?.background || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, background: e.target.value }
                          }));
                        }}
                        placeholder="#FFFFFF"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Categoria 3: Texto e Divisores */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">3. Textos e Linhas Divisórias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* foreground - Texto Principal */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.foreground || "#08090A"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, foreground: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Cor do Texto Principal</label>
                      <input
                        type="text"
                        value={data.colors?.foreground || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, foreground: e.target.value }
                          }));
                        }}
                        placeholder="#08090A"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* hairline - Bordas e Contornos */}
                  <div className="flex items-center gap-3 bg-[#15181D] border border-[#282C32]/45 p-3 rounded-lg">
                    <input
                      type="color"
                      value={data.colors?.hairline || "#2E3033"}
                      onChange={(e) => {
                        setData((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, hairline: e.target.value }
                        }));
                      }}
                      className="h-10 w-12 rounded cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-white/80 block mb-0.5">Bordas e Linhas (Hairline)</label>
                      <input
                        type="text"
                        value={data.colors?.hairline || ""}
                        onChange={(e) => {
                          setData((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, hairline: e.target.value }
                          }));
                        }}
                        placeholder="#2E3033"
                        className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB: Gestão de Pedidos */}
          {activeSection === "orders" && activeTab === "orders-list" && (
            <div className="flex flex-col gap-5 text-white text-left select-none animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-[#FF8A00] flex items-center gap-2">
                  📦 Gestão de Pedidos Recebidos ({orders.length})
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed = orders.length > 0 && orders.every((o) => collapsedOrderIds[o.id]);
                      const newMap: Record<string, boolean> = {};
                      orders.forEach((o) => { newMap[o.id] = !allCollapsed; });
                      setCollapsedOrderIds(newMap);
                    }}
                    className="h-9 px-3 bg-[#1C1F26] hover:bg-[#282C32] border border-[#282C32]/45 text-white/80 hover:text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-[#FF8A00]" />
                    Recolher / Expandir Todos
                  </button>

                  {/* Search orders */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Filtrar por nome, CPF ou pedido..."
                      value={ordersFilter}
                      onChange={(e) => setOrdersFilter(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>
                </div>
              </div>

              {/* Orders List */}
              {(() => {
                const filtered = orders.filter((ord) => {
                  const filter = ordersFilter.toLowerCase().trim();
                  if (!filter) return true;
                  return (
                    ord.id.toLowerCase().includes(filter) ||
                    ord.customerName.toLowerCase().includes(filter) ||
                    ord.customerCpf.replace(/\D/g, "").includes(filter.replace(/\D/g, "")) ||
                    ord.customerEmail.toLowerCase().includes(filter)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 bg-[#15181D] border border-[#282C32]/35 rounded-lg text-white/50 text-xs font-semibold">
                      Nenhum pedido localizado.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-4">
                    {filtered.map((ord) => {
                      const isCollapsed = !!collapsedOrderIds[ord.id];

                      const handleStatusChange = async (
                        field: "payment" | "shipping",
                        value: any
                      ) => {
                        const newPayment = field === "payment" ? value : ord.tags.paymentStatus;
                        const newShipping = field === "shipping" ? value : ord.tags.shippingStatus;
                        
                        try {
                          const updated = await updateOrderTags(ord.id, newPayment, newShipping);
                          setOrders(updated);
                          toast.success(`Pedido ${ord.id} atualizado com sucesso!`);
                        } catch (e) {
                          toast.error("Erro ao atualizar o status do pedido.");
                        }
                      };

                      return (
                        <div
                          key={ord.id}
                          className="bg-[#15181D] border border-[#282C32]/35 rounded-lg p-4 sm:p-5 flex flex-col gap-4 hover:border-[#282C32]/55 transition-colors"
                        >
                          {/* Card Header Info */}
                          <div className={`flex flex-wrap justify-between items-center gap-3 ${!isCollapsed ? "border-b border-white/10 pb-3" : ""}`}>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setCollapsedOrderIds((prev) => ({ ...prev, [ord.id]: !isCollapsed }))}
                                className="p-1.5 bg-[#1C1F26] hover:bg-[#282C32] border border-white/10 rounded transition-colors cursor-pointer text-white/80 hover:text-white"
                                title={isCollapsed ? "Expandir Pedido" : "Recolher Pedido"}
                              >
                                {isCollapsed ? <ChevronDown className="h-4 w-4 text-[#FF8A00]" /> : <ChevronUp className="h-4 w-4 text-[#FF8A00]" />}
                              </button>

                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white/90">
                                    PEDIDO: <span className="text-[#FF8A00]">{ord.id}</span>
                                  </span>
                                  {isCollapsed && (
                                    <span className="text-xs font-bold text-white/80">
                                      — {ord.customerName} (R$ {ord.total.toFixed(2).replace(".", ",")})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-white/40">
                                  Realizado em: {new Date(ord.createdAt).toLocaleString("pt-BR")}
                                </span>
                              </div>
                            </div>

                            {/* Tags Configuration Dropdowns */}
                            <div className="flex items-center gap-3">
                              {/* Payment Status Dropdown */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-white/40 uppercase">Status Pagamento</label>
                                <select
                                  value={ord.tags.paymentStatus}
                                  onChange={(e) => handleStatusChange("payment", e.target.value)}
                                  className={`h-7 px-2 text-[10px] font-black uppercase rounded outline-none border cursor-pointer ${
                                    ord.tags.paymentStatus === "pago"
                                      ? "bg-green-950/70 border-green-500 text-green-400"
                                      : ord.tags.paymentStatus === "reembolsado"
                                      ? "bg-red-950/70 border-red-500 text-red-400"
                                      : "bg-yellow-950/70 border-yellow-500 text-yellow-400"
                                  }`}
                                >
                                  <option value="pendente">⌛ Pendente</option>
                                  <option value="pago">✓ Pago</option>
                                  <option value="reembolsado">✕ Reembolsado</option>
                                </select>
                              </div>

                              {/* Shipping Status Dropdown */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-white/40 uppercase">Tipo Envio</label>
                                <select
                                  value={ord.tags.shippingStatus}
                                  onChange={(e) => handleStatusChange("shipping", e.target.value)}
                                  className={`h-7 px-2 text-[10px] font-black uppercase rounded outline-none border cursor-pointer ${
                                    ord.tags.shippingStatus === "com_frete"
                                      ? "bg-blue-950/70 border-blue-500 text-blue-400"
                                      : "bg-gray-950/70 border-gray-600 text-gray-400"
                                  }`}
                                >
                                  <option value="sem_frete">Grátis</option>
                                  <option value="com_frete">Com Frete</option>
                                </select>
                              </div>

                              {/* Código de Rastreio Input */}
                              <div className="flex flex-col gap-1 sm:w-44">
                                <label className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1">
                                  <Truck className="h-2.5 w-2.5 text-[#FF8A00]" /> Cód. Rastreio
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder="Ex: AB123456789BR"
                                    defaultValue={ord.trackingCode || ""}
                                    id={`tracking_input_${ord.id}`}
                                    className="w-full h-7 px-2 bg-[#1C1F26] border border-[#282C32]/45 rounded text-[10px] text-white uppercase outline-none focus:border-[#FF8A00]"
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const val = (document.getElementById(`tracking_input_${ord.id}`) as HTMLInputElement)?.value?.trim();
                                      try {
                                        const allOrders = await fetchOrders();
                                        const updated = allOrders.map((o) => (o.id === ord.id ? { ...o, trackingCode: val } : o));
                                        await supabase.from("home_page_content").upsert({
                                          id: "orders_list",
                                          content: { orders: updated } as any,
                                          updated_at: new Date().toISOString(),
                                        });
                                        setOrders(updated);
                                        toast.success(`Código de rastreio ${val ? `"${val}" ` : ""}salvo no pedido ${ord.id}!`);
                                      } catch (err) {
                                        toast.error("Erro ao salvar código de rastreio.");
                                      }
                                    }}
                                    className="px-2 h-7 bg-[#FF8A00] hover:bg-[#e07900] text-white text-[9px] font-bold rounded transition-colors cursor-pointer shrink-0"
                                  >
                                    Salvar
                                  </button>
                                </div>
                              </div>

                              {/* Excluir Pedido e Cliente */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-white/40 uppercase block opacity-0 select-none">Excluir</label>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Tem certeza de que deseja excluir permanentemente o pedido ${ord.id} e a conta do cliente (${ord.customerEmail})? Isso apagará todo o histórico de compras e cadastro do usuário.`)) {
                                      try {
                                        const res = await deleteOrderAndCustomer(ord.id);
                                        if (res.success) {
                                          const updated = orders.filter((o) => o.id !== ord.id);
                                          setOrders(updated);
                                          toast.success("Pedido e dados de usuário excluídos com sucesso!");
                                        } else {
                                          toast.error(res.error || "Erro ao excluir.");
                                        }
                                      } catch (err) {
                                        toast.error("Erro ao processar exclusão.");
                                      }
                                    }
                                  }}
                                  className="h-7 px-2.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/80 text-red-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 rounded cursor-pointer text-[10px] font-bold shrink-0 animate-fadeIn"
                                  title="Excluir pedido e dados do usuário completamente"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Order Details Body (Hidden when collapsed) */}
                          {!isCollapsed && (
                            <div className="flex flex-col gap-4 animate-fadeIn">
                              {/* Customer Details Box */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                
                                {/* Customer Profile Info */}
                                <div className="md:col-span-4 bg-[#1C1F26] p-3.5 rounded border border-[#282C32]/25 text-xs flex flex-col gap-1.5">
                                  <span className="font-extrabold text-white border-b border-white/5 pb-1 mb-1 block uppercase tracking-wider text-[10px] text-white/60">
                                    Dados do Cliente
                                  </span>
                                  <p className="font-bold text-white/90">{ord.customerName}</p>
                                  <p className="text-white/60">Email: {ord.customerEmail}</p>
                                  <p className="text-white/60">CPF: {ord.customerCpf}</p>
                                  <p className="text-white/60">
                                    WhatsApp:{" "}
                                    <a
                                      href={`https://wa.me/55${ord.customerPhone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#FF8A00] font-bold hover:underline"
                                    >
                                      {ord.customerPhone}
                                    </a>
                                  </p>
                                </div>

                                {/* Shipping Address Box */}
                                <div className="md:col-span-4 bg-[#1C1F26] p-3.5 rounded border border-[#282C32]/25 text-xs flex flex-col gap-1">
                                  <span className="font-extrabold text-white border-b border-white/5 pb-1 mb-1 block uppercase tracking-wider text-[10px] text-white/60">
                                    Endereço de Entrega
                                  </span>
                                  <p className="text-white/80">{ord.address.street}, {ord.address.number}</p>
                                  {ord.address.complement && <p className="text-white/60">Compl: {ord.address.complement}</p>}
                                  <p className="text-white/60">Bairro: {ord.address.neighborhood}</p>
                                  <p className="text-white/60">{ord.address.city} - {ord.address.state}</p>
                                  <p className="font-semibold text-white/80 mt-1">CEP: {ord.address.cep}</p>
                                </div>

                                {/* Summary / Values Box */}
                                <div className="md:col-span-4 bg-[#1C1F26] p-3.5 rounded border border-[#282C32]/25 text-xs flex flex-col justify-between gap-2">
                                  <div>
                                    <span className="font-extrabold text-white border-b border-white/5 pb-1 mb-1 block uppercase tracking-wider text-[10px] text-white/60">
                                      Resumo Financeiro
                                    </span>
                                    <div className="flex justify-between py-0.5 text-white/60">
                                      <span>Subtotal:</span>
                                      <span>R$ {ord.subtotal.toFixed(2).replace(".", ",")}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-green-400">
                                      <span>Desconto:</span>
                                      <span>- R$ {ord.discount.toFixed(2).replace(".", ",")}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-white/60">
                                      <span>Custo Envio:</span>
                                      <span>{ord.shippingCost === 0 ? "Grátis" : `R$ ${ord.shippingCost.toFixed(2).replace(".", ",")}`}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-baseline border-t border-white/10 pt-2 font-black">
                                    <span className="text-white/80 text-[10px] uppercase">Total:</span>
                                    <span className="text-sm text-[#FF8A00]">
                                      R$ {ord.total.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                </div>

                              </div>

                              {/* Purchased Items List */}
                              <div className="bg-[#1C1F26] p-3.5 rounded border border-[#282C32]/25 text-xs flex flex-col gap-2">
                                <span className="font-extrabold text-white border-b border-white/5 pb-1 block uppercase tracking-wider text-[10px] text-white/60">
                                  Itens do Pedido
                                </span>
                                {ord.items.map((item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center py-1 border-b border-white/5 last:border-0 last:pb-0"
                                  >
                                    <span className="text-white/80 font-bold">
                                      {item.name} <span className="text-white/40 font-normal ml-1">x{item.quantity}</span>
                                    </span>
                                    <span className="text-white/95 font-semibold">{item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: Configurar Mercado Pago */}
          {activeSection === "payments" && activeTab === "mercado-pago" && (
            <div className="flex flex-col gap-6 text-white text-left select-none animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-[#FF8A00] flex items-center gap-2">
                  💳 Configurar Mercado Pago
                </h3>
              </div>

              {/* Status Integration */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2">Status da Integração</h4>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white/90">Ativar Gateway de Pagamento</span>
                    <span className="text-[10px] text-white/40">Se ativado, o checkout processará os pagamentos através do Mercado Pago.</span>
                  </div>
                  <ToggleSwitch
                    label=""
                    checked={paymentSettings?.enabled || false}
                    onChange={(val) =>
                      setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), enabled: val }))
                    }
                  />
                </div>
              </div>

              {/* Sandbox / Production Mode Toggle */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2">Ambiente de Execução</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-white/90">Modo de Operação</span>
                      <span className="text-[10px] text-white/40">Escolha "Sandbox (Testes)" para simular vendas sem cobranças reais ou "Produção (Real)" para receber de clientes.</span>
                    </div>
                    <div className="flex gap-2 bg-[#101217] p-1 rounded border border-[#282C32]/35">
                      <button
                        type="button"
                        onClick={() => setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), mode: "sandbox" }))}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          paymentSettings?.mode === "sandbox"
                            ? "bg-[#FF8A00] text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Sandbox (Testes)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), mode: "production" }))}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          paymentSettings?.mode === "production"
                            ? "bg-[#FF8A00] text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Produção (Real)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Fields */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#FF8A00]" />
                  <span>Credenciais de API</span>
                </h4>
                
                {paymentSettings?.mode === "production" ? (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="p-3 bg-[#FF8A00]/5 border border-[#FF8A00]/20 rounded text-xs text-white/80 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-[#FF8A00] shrink-0 mt-0.5" />
                      <span>Você está configurando o modo <strong>Produção (Ambiente Real)</strong>. Tenha extremo cuidado ao expor essas credenciais.</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70">Public Key (Produção)</label>
                      <input
                        type="text"
                        placeholder="Ex: APP_USR-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={paymentSettings?.publicKeyProduction || ""}
                        onChange={(e) =>
                          setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), publicKeyProduction: e.target.value }))
                        }
                        className="w-full h-10 px-3 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-xs font-semibold text-white/70">Access Token (Produção)</label>
                      <div className="relative">
                        <input
                          type={showAccessToken ? "text" : "password"}
                          placeholder="Ex: APP_USR-xxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                          value={paymentSettings?.accessTokenProduction || ""}
                          onChange={(e) =>
                            setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), accessTokenProduction: e.target.value }))
                          }
                          className="w-full h-10 pl-3 pr-10 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccessToken(!showAccessToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer"
                        >
                          {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="p-3 bg-[#FF8A00]/5 border border-[#FF8A00]/20 rounded text-xs text-white/80 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-[#FF8A00] shrink-0 mt-0.5" />
                      <span>Você está configurando o modo <strong>Sandbox (Ambiente de Testes)</strong>. Insira as credenciais de teste fornecidas pelo Mercado Pago.</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70">Public Key (Sandbox)</label>
                      <input
                        type="text"
                        placeholder="Ex: APP_USR-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={paymentSettings?.publicKeySandbox || ""}
                        onChange={(e) =>
                          setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), publicKeySandbox: e.target.value }))
                        }
                        className="w-full h-10 px-3 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-xs font-semibold text-white/70">Access Token (Sandbox)</label>
                      <div className="relative">
                        <input
                          type={showAccessToken ? "text" : "password"}
                          placeholder="Ex: APP_USR-xxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                          value={paymentSettings?.accessTokenSandbox || ""}
                          onChange={(e) =>
                            setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), accessTokenSandbox: e.target.value }))
                          }
                          className="w-full h-10 pl-3 pr-10 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccessToken(!showAccessToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer"
                        >
                          {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Webhook Configuration */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2">Notificações de Webhook</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Para atualizar automaticamente o status dos pedidos (Aprovado, Recusado, Pendente) quando o pagamento for processado, configure a URL abaixo no painel de desenvolvedores do Mercado Pago.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">URL do Webhook de Retorno</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={displayWebhookUrl}
                      className="w-full h-10 px-3 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white/60 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(displayWebhookUrl);
                        setCopiedWebhook(true);
                        toast.success("URL copiada com sucesso!");
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="h-10 px-4 bg-[#FF8A00] hover:bg-[#E97800] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedWebhook ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedWebhook ? "Copiado!" : "Copiar URL"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70 font-mono">Chave de Assinatura Webhook / Secret (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Chave para validar integridade das requisições (se aplicável)"
                    value={paymentSettings?.webhookSecret || ""}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({ ...(prev || DEFAULT_MERCADO_PAGO_SETTINGS), webhookSecret: e.target.value }))
                    }
                    className="w-full h-10 px-3 bg-[#101217] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                  />
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase text-white/60 tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#FF8A00]" />
                  <span>Passo a Passo para Integrar</span>
                </h4>
                <ol className="text-[11px] text-white/70 leading-relaxed list-decimal list-inside flex flex-col gap-2">
                  <li>
                    Acesse o painel do <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="text-[#FF8A00] hover:underline font-bold">Mercado Pago Developers</a> e faça login.
                  </li>
                  <li>
                    Crie uma nova aplicação (ex: "Site de Óculos") se ainda não tiver feito.
                  </li>
                  <li>
                    Acesse o menu <strong>Credenciais de Produção</strong> ou <strong>Credenciais de Teste</strong> na lateral esquerda da aplicação.
                  </li>
                  <li>
                    Copie a <strong>Chave Pública (Public Key)</strong> e o <strong>Token de Acesso (Access Token)</strong> e cole nos campos correspondentes acima.
                  </li>
                  <li>
                    Na barra lateral do painel de desenvolvedores, acesse <strong>Webhooks</strong> ou <strong>Notificações de IPN</strong>, cole a URL de Webhook de Retorno exibida acima e selecione os eventos: <strong>payment</strong> e <strong>mp-order</strong> para receber as notificações em tempo real.
                  </li>
                  <li>
                    Clique no botão superior direito <strong>Salvar Alterações</strong> aqui no Glasses Admin para persistir suas chaves com segurança.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: Configurar Melhor Envio */}
          {activeSection === "shipping" && activeTab === "melhor-envio" && (
            <div className="flex flex-col gap-6 text-white text-left select-none animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-[#FF8A00] flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#FF8A00]" /> Configurar Rastreamento (Melhor Envio)
                </h3>
              </div>

              {/* Status Integration */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2">Status da Integração</h4>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white/90">Ativar Rastreamento Automático</span>
                    <span className="text-[10px] text-white/40">Se ativado, o sistema consultará o status do pacote no Melhor Envio/Correios para atualizar o cliente.</span>
                  </div>
                  <ToggleSwitch
                    label=""
                    checked={shippingSettings?.enabled || false}
                    onChange={(val) =>
                      setShippingSettings((prev) => ({ ...(prev || DEFAULT_MELHOR_ENVIO_SETTINGS), enabled: val }))
                    }
                  />
                </div>
              </div>

              {/* Sandbox / Production Mode Toggle */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2">Ambiente da API</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-white/90">Modo de Operação</span>
                      <span className="text-[10px] text-white/40">Escolha "Produção (Real)" para consultar encomendas reais ou "Sandbox (Testes)" para testes de desenvolvedor.</span>
                    </div>
                    <div className="flex gap-2 bg-[#101217] p-1 rounded border border-[#282C32]/35">
                      <button
                        type="button"
                        onClick={() => setShippingSettings((prev) => ({ ...(prev || DEFAULT_MELHOR_ENVIO_SETTINGS), mode: "sandbox" }))}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          shippingSettings?.mode === "sandbox"
                            ? "bg-[#FF8A00] text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Sandbox (Testes)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShippingSettings((prev) => ({ ...(prev || DEFAULT_MELHOR_ENVIO_SETTINGS), mode: "production" }))}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          shippingSettings?.mode === "production"
                            ? "bg-[#FF8A00] text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Produção (Real)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Origin CEP Field */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FF8A00]" />
                  <span>CEP de Origem do Estoque (Postagem)</span>
                </h4>

                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-semibold text-white/80">CEP de Origem (Somente Números)</label>
                  <input
                    type="text"
                    maxLength={9}
                    value={shippingSettings?.originCep || "21941395"}
                    onChange={(e) =>
                      setShippingSettings((prev) => ({ ...(prev || DEFAULT_MELHOR_ENVIO_SETTINGS), originCep: e.target.value }))
                    }
                    placeholder="Ex: 21941395"
                    className="w-full h-10 px-3 bg-[#101217] border border-[#282C32]/45 rounded text-sm font-mono text-white outline-none focus:border-[#FF8A00] transition-colors"
                  />
                  <span className="text-[10px] text-white/40">
                    CEP do local de onde os produtos são postados para cálculo do frete real dos Correios.
                  </span>
                </div>
              </div>

              {/* Token Field */}
              <div className="bg-[#1C1F26] border border-[#282C32]/45 rounded-lg p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white/80 border-b border-white/5 pb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#FF8A00]" />
                  <span>Token de Acesso Pessoal (Melhor Envio)</span>
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/80">Token de Produção (Real)</label>
                  <textarea
                    rows={3}
                    value={shippingSettings?.tokenProduction || ""}
                    onChange={(e) =>
                      setShippingSettings((prev) => ({ ...(prev || DEFAULT_MELHOR_ENVIO_SETTINGS), tokenProduction: e.target.value }))
                    }
                    placeholder="Cole seu Token gerado no Melhor Envio (começa com eyJ...)"
                    className="w-full p-2.5 bg-[#101217] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00] transition-colors font-mono"
                  />
                  <span className="text-[10px] text-white/40">
                    Token gerado no painel do Melhor Envio (Integrações {'>'} Permissões de Acesso / Tokens).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Catalogue Banner */}
          {activeSection !== "home" && activeSection !== "orders" && activeSection !== "payments" && activeTab === "cat-banner" && categoryData && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Superior - {categoryData.header.title}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <ToggleSwitch
                  label="Exibir Banner Superior nesta Página"
                  checked={categoryData.header.show !== false}
                  onChange={(val) =>
                    setCategoryData((prev: any) => ({
                      ...prev,
                      header: { ...prev.header, show: val },
                    }))
                  }
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Título da Página</label>
                  <input
                    type="text"
                    value={categoryData.header.title}
                    onChange={(e) =>
                      setCategoryData((prev: any) => ({
                        ...prev,
                        header: { ...prev.header, title: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Subtítulo / Descrição</label>
                  <textarea
                    value={categoryData.header.subtitle}
                    onChange={(e) =>
                      setCategoryData((prev: any) => ({
                        ...prev,
                        header: { ...prev.header, subtitle: e.target.value },
                      }))
                    }
                    className="w-full h-20 p-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Altura do Banner no Site</label>
                  <select
                    value={categoryData.header.bannerHeight || "giant"}
                    onChange={(e) =>
                      setCategoryData((prev: any) => ({
                        ...prev,
                        header: { ...prev.header, bannerHeight: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                  >
                    <option value="small">Pequena (180px - Padrão antigo)</option>
                    <option value="medium">Média (300px)</option>
                    <option value="large">Grande (400px)</option>
                    <option value="giant">Gigante (600px - Nova altura)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/70">Ajuste Vertical da Imagem (Subir / Descer)</label>
                    <span className="text-[10px] text-[#FF8A00] font-bold">
                      {categoryData.header.imagePositionY !== undefined ? categoryData.header.imagePositionY : 50}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={categoryData.header.imagePositionY !== undefined ? categoryData.header.imagePositionY : 50}
                    onChange={(e) =>
                      setCategoryData((prev: any) => ({
                        ...prev,
                        header: { ...prev.header, imagePositionY: parseInt(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#FF8A00] h-1 bg-[#1C1F26] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/40">
                    <span>Subir (Topo - 0%)</span>
                    <span>Centro (50%)</span>
                    <span>Descer (Base - 100%)</span>
                  </div>
                </div>

                <ImageInputWithPreview
                  label="URL da Imagem do Banner (Drive)"
                  value={categoryData.header.imageUrl || ""}
                  onChange={(val) =>
                    setCategoryData((prev: any) => ({
                      ...prev,
                      header: { ...prev.header, imageUrl: val },
                    }))
                  }
                  recommendedSize="1920 X 600 PX"
                />
              </div>
            </div>
          )}

          {/* TAB: Catalogue Benefits */}
          {activeSection !== "home" && activeTab === "cat-benefits" && categoryData && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Barra de Benefícios - {categoryData.header.title}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <ToggleSwitch
                  label="Exibir Barra de Benefícios"
                  checked={categoryData.benefits.show !== false}
                  onChange={(val) =>
                    setCategoryData((prev: any) => ({
                      ...prev,
                      benefits: { ...prev.benefits, show: val },
                    }))
                  }
                />

                <div className="flex flex-col gap-4 mt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">Edição dos Itens de Benefícios</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {categoryData.benefits.list.map((b, idx) => (
                      <div key={idx} className="bg-[#15181D]/80 border border-[#282C32]/45 p-4 rounded-lg flex flex-col gap-3">
                        <span className="text-[10px] font-black text-[#FF8A00] tracking-wider uppercase">Item {idx + 1} - Ícone: {b.iconKey}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/50 font-bold">Título</label>
                            <input
                              type="text"
                              value={b.title}
                              onChange={(e) => {
                                const newList = [...categoryData.benefits.list];
                                newList[idx] = { ...b, title: e.target.value };
                                setCategoryData((prev: any) => ({ ...prev, benefits: { ...prev.benefits, list: newList } }));
                              }}
                              className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/50 font-bold">Subtítulo</label>
                            <input
                              type="text"
                              value={b.subtitle}
                              onChange={(e) => {
                                const newList = [...categoryData.benefits.list];
                                newList[idx] = { ...b, subtitle: e.target.value };
                                setCategoryData((prev: any) => ({ ...prev, benefits: { ...prev.benefits, list: newList } }));
                              }}
                              className="w-full h-8 px-2 bg-[#1C1F26] border border-[#282C32]/35 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Catalogue Products CRUD */}
          {activeSection !== "home" && activeTab === "cat-products" && categoryData && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-base font-bold text-[#FF8A00]">
                  Gerenciador de Produtos - {categoryData.header.title}
                </h3>
                {!isEditingProduct && !isAddingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(true);
                      setProdName("");
                      setProdPrice("199.90");
                      setProdOldPrice("R$ 249,90");
                      setProdDiscount("-20%");
                      setProdCategory("Armação de Grau");
                      setProdFormat("Quadrado");
                      setProdMaterial("Acetato");
                      setProdColor("preto");
                      setProdImageUrl("");
                      setProdInstallments(12);
                      setProdDescription("");
                      setProdGender("Feminino");
                      setProdSpecsHaste("");
                      setProdSpecsPonte("");
                      setProdSpecsLente("");
                      setProdSpecsAltura("");
                      setProdGallery([]);
                      setProdStock("");
                    }}
                    className="bg-[#FF8A00] hover:bg-[#E97800] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Novo Produto
                  </button>
                )}
              </div>

              {!isEditingProduct && !isAddingProduct && (
                <ToggleSwitch
                  label="Exibir Grade de Produtos nesta Página"
                  checked={categoryData.productsShow !== false}
                  onChange={(val) =>
                    setCategoryData((prev: any) => ({
                      ...prev,
                      productsShow: val,
                    }))
                  }
                />
              )}

              {!isEditingProduct && !isAddingProduct && (
                <div className="bg-[#15181D]/45 border border-[#282C32]/45 rounded-lg p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-[#FF8A00]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Cupom de Desconto Lateral
                      </h4>
                    </div>
                    <ToggleSwitch
                      label="Exibir Cupom"
                      checked={categoryData.couponCard?.show !== false}
                      onChange={(val) => {
                        setCategoryData((prev: any) => ({
                          ...prev,
                          couponCard: {
                            ...(prev.couponCard || {
                              discountText: "10% OFF",
                              subtitle: "NA SUA PRIMEIRA COMPRA",
                              couponCode: "PRIMEIRACOMPRA",
                              buttonText: "COPIAR CUPOM"
                            }),
                            show: val
                          }
                        }));
                      }}
                    />
                  </div>

                  {categoryData.couponCard?.show !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Texto Desconto</label>
                        <input
                          type="text"
                          value={categoryData.couponCard?.discountText ?? "10% OFF"}
                          onChange={(e) => {
                            setCategoryData((prev: any) => ({
                              ...prev,
                              couponCard: {
                                ...(prev.couponCard || {
                                  show: true,
                                  subtitle: "NA SUA PRIMEIRA COMPRA",
                                  couponCode: "PRIMEIRACOMPRA",
                                  buttonText: "COPIAR CUPOM"
                                }),
                                discountText: e.target.value
                              }
                            }));
                          }}
                          placeholder="Ex: 10% OFF"
                          className="h-9 px-3 bg-[#13151A] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Subtítulo</label>
                        <input
                          type="text"
                          value={categoryData.couponCard?.subtitle ?? "NA SUA PRIMEIRA COMPRA"}
                          onChange={(e) => {
                            setCategoryData((prev: any) => ({
                              ...prev,
                              couponCard: {
                                ...(prev.couponCard || {
                                  show: true,
                                  discountText: "10% OFF",
                                  couponCode: "PRIMEIRACOMPRA",
                                  buttonText: "COPIAR CUPOM"
                                }),
                                subtitle: e.target.value
                              }
                            }));
                          }}
                          placeholder="Ex: NA SUA PRIMEIRA COMPRA"
                          className="h-9 px-3 bg-[#13151A] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Código do Cupom</label>
                        <input
                          type="text"
                          value={categoryData.couponCard?.couponCode ?? "PRIMEIRACOMPRA"}
                          onChange={(e) => {
                            setCategoryData((prev: any) => ({
                              ...prev,
                              couponCard: {
                                ...(prev.couponCard || {
                                  show: true,
                                  discountText: "10% OFF",
                                  subtitle: "NA SUA PRIMEIRA COMPRA",
                                  buttonText: "COPIAR CUPOM"
                                }),
                                couponCode: e.target.value
                              }
                            }));
                          }}
                          placeholder="Ex: PRIMEIRACOMPRA"
                          className="h-9 px-3 bg-[#13151A] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Texto do Botão</label>
                        <input
                          type="text"
                          value={categoryData.couponCard?.buttonText ?? "COPIAR CUPOM"}
                          onChange={(e) => {
                            setCategoryData((prev: any) => ({
                              ...prev,
                              couponCard: {
                                ...(prev.couponCard || {
                                  show: true,
                                  discountText: "10% OFF",
                                  subtitle: "NA SUA PRIMEIRA COMPRA",
                                  couponCode: "PRIMEIRACOMPRA"
                                }),
                                buttonText: e.target.value
                              }
                            }));
                          }}
                          placeholder="Ex: COPIAR CUPOM"
                          className="h-9 px-3 bg-[#13151A] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isEditingProduct && !isAddingProduct && (
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#15181D]/30 border border-[#282C32]/45 rounded-lg p-3">
                  <div className="relative w-full md:max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-white/40" />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar por modelo ou categoria..."
                      value={adminProductSearch}
                      onChange={(e) => {
                        setAdminProductSearch(e.target.value);
                        setAdminProductPage(1);
                      }}
                      className="w-full h-10 pl-9 pr-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00] placeholder:text-white/30"
                    />
                  </div>
                  <div className="text-xs text-white/50 font-medium">
                    Exibindo {filteredAdminProducts.length} de {categoryData.products.length} produtos cadastrados
                  </div>
                </div>
              )}

              {/* Inline CRUD Add / Edit Form */}
              {(isAddingProduct || isEditingProduct) ? (
                <div className="bg-[#15181D] border border-[#282C32]/60 rounded-lg p-5 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-[#FF8A00]">
                    {isAddingProduct ? "Adicionar Novo Óculos" : "Editar Produto"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Nome do Modelo</label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Ex: Óculos Aviador Retro Gold"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/70">Categoria</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const val = prompt("Digite o nome da nova Categoria:");
                              if (val && val.trim()) {
                                const clean = val.trim();
                                const current = categoryData?.customCategories || defaultCategories;
                                if (current.includes(clean)) {
                                  setProdCategory(clean);
                                  return;
                                }
                                const updated = [...current, clean];
                                const updatedData = { ...categoryData, customCategories: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                setProdCategory(clean);
                                await savePageContent(activeSection, updatedData);
                                toast.success("Categoria adicionada e salva com sucesso!");
                              }
                            }}
                            className="text-[10px] text-[#FF8A00] font-bold hover:underline cursor-pointer"
                          >
                            + Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Deseja realmente remover a categoria "${prodCategory}" das opções?`)) {
                                const current = categoryData?.customCategories || defaultCategories;
                                const updated = current.filter((c: string) => c !== prodCategory);
                                const updatedData = { ...categoryData, customCategories: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                const remaining = updated.filter((c: string) => c !== prodCategory);
                                setProdCategory(remaining[0] || "");
                                await savePageContent(activeSection, updatedData);
                                toast.success("Categoria removida e salva com sucesso!");
                              }
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            - Remover
                          </button>
                        </div>
                      </div>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      >
                        {categoryOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Preço de Venda (Apenas números, ex: 189.90)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="189.90"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Preço Original Riscado (Ex: R$ 249,90)</label>
                      <input
                        type="text"
                        value={prodOldPrice}
                        onChange={(e) => setProdOldPrice(e.target.value)}
                        placeholder="R$ 249,90"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Selo de Desconto (Ex: -15% ou em branco)</label>
                      <input
                        type="text"
                        value={prodDiscount}
                        onChange={(e) => setProdDiscount(e.target.value)}
                        placeholder="-15%"
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Parcelas Sem Juros</label>
                      <select
                        value={prodInstallments}
                        onChange={(e) => setProdInstallments(parseInt(e.target.value) || 12)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((num) => (
                          <option key={num} value={num}>{num}x sem juros</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Estoque (Deixe em branco para ilimitado)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 50"
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/70">Formato da Armação</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const val = prompt("Digite o nome do novo Formato:");
                              if (val && val.trim()) {
                                const clean = val.trim();
                                const current = categoryData?.customFormats || defaultFormats;
                                if (current.includes(clean)) {
                                  setProdFormat(clean);
                                  return;
                                }
                                const updated = [...current, clean];
                                const updatedData = { ...categoryData, customFormats: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                setProdFormat(clean);
                                await savePageContent(activeSection, updatedData);
                                toast.success("Formato adicionado e salvo com sucesso!");
                              }
                            }}
                            className="text-[10px] text-[#FF8A00] font-bold hover:underline cursor-pointer"
                          >
                            + Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Deseja realmente remover o formato "${prodFormat}" das opções?`)) {
                                const current = categoryData?.customFormats || defaultFormats;
                                const updated = current.filter((c: string) => c !== prodFormat);
                                const updatedData = { ...categoryData, customFormats: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                const remaining = updated.filter((c: string) => c !== prodFormat);
                                setProdFormat(remaining[0] || "");
                                await savePageContent(activeSection, updatedData);
                                toast.success("Formato removido e salvo com sucesso!");
                              }
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            - Remover
                          </button>
                        </div>
                      </div>
                      <select
                        value={prodFormat}
                        onChange={(e) => setProdFormat(e.target.value)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      >
                        {formatOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/70">Material</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const val = prompt("Digite o nome do novo Material:");
                              if (val && val.trim()) {
                                const clean = val.trim();
                                const current = categoryData?.customMaterials || defaultMaterials;
                                if (current.includes(clean)) {
                                  setProdMaterial(clean);
                                  return;
                                }
                                const updated = [...current, clean];
                                const updatedData = { ...categoryData, customMaterials: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                setProdMaterial(clean);
                                await savePageContent(activeSection, updatedData);
                                toast.success("Material adicionado e salvo com sucesso!");
                              }
                            }}
                            className="text-[10px] text-[#FF8A00] font-bold hover:underline cursor-pointer"
                          >
                            + Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Deseja realmente remover o material "${prodMaterial}" das opções?`)) {
                                const current = categoryData?.customMaterials || defaultMaterials;
                                const updated = current.filter((c: string) => c !== prodMaterial);
                                const updatedData = { ...categoryData, customMaterials: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                const remaining = updated.filter((c: string) => c !== prodMaterial);
                                setProdMaterial(remaining[0] || "");
                                await savePageContent(activeSection, updatedData);
                                toast.success("Material removido e salvo com sucesso!");
                              }
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            - Remover
                          </button>
                        </div>
                      </div>
                      <select
                        value={prodMaterial}
                        onChange={(e) => setProdMaterial(e.target.value)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      >
                        {materialOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/70">Cor</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const val = prompt("Digite o nome da nova Cor:");
                              if (val && val.trim()) {
                                const clean = val.trim();
                                const current = categoryData?.customColors || defaultColors;
                                if (current.includes(clean)) {
                                  setProdColor(clean);
                                  return;
                                }
                                const updated = [...current, clean];
                                const updatedData = { ...categoryData, customColors: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                setProdColor(clean);
                                await savePageContent(activeSection, updatedData);
                                toast.success("Cor adicionada e salva com sucesso!");
                              }
                            }}
                            className="text-[10px] text-[#FF8A00] font-bold hover:underline cursor-pointer"
                          >
                            + Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Deseja realmente remover a cor "${prodColor}" das opções?`)) {
                                const current = categoryData?.customColors || defaultColors;
                                const updated = current.filter((c: string) => c !== prodColor);
                                const updatedData = { ...categoryData, customColors: updated } as CategoryPageData;
                                setCategoryData(updatedData);
                                const remaining = updated.filter((c: string) => c !== prodColor);
                                setProdColor(remaining[0] || "");
                                await savePageContent(activeSection, updatedData);
                                toast.success("Cor removida e salva com sucesso!");
                              }
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            - Remover
                          </button>
                        </div>
                      </div>
                      <select
                        value={prodColor}
                        onChange={(e) => setProdColor(e.target.value)}
                        className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                      >
                        {colorOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <ImageInputWithPreview
                        label="URL da Imagem do Produto (Drive)"
                        value={prodImageUrl}
                        onChange={setProdImageUrl}
                        recommendedSize="600 X 600 PX"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-white/70">Gênero</label>
                        <select
                          value={prodGender}
                          onChange={(e) => setProdGender(e.target.value)}
                          className="w-full h-10 px-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                        >
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Unissex">Unissex</option>
                          <option value="Infantil">Infantil</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-white/70">Medidas em mm (Haste / Ponte / Lente / Altura)</label>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Haste"
                            value={prodSpecsHaste}
                            onChange={(e) => setProdSpecsHaste(e.target.value)}
                            className="w-full h-10 px-2 text-center bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                          />
                          <input
                            type="text"
                            placeholder="Ponte"
                            value={prodSpecsPonte}
                            onChange={(e) => setProdSpecsPonte(e.target.value)}
                            className="w-full h-10 px-2 text-center bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                          />
                          <input
                            type="text"
                            placeholder="Lente"
                            value={prodSpecsLente}
                            onChange={(e) => setProdSpecsLente(e.target.value)}
                            className="w-full h-10 px-2 text-center bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                          />
                          <input
                            type="text"
                            placeholder="Altura"
                            value={prodSpecsAltura}
                            onChange={(e) => setProdSpecsAltura(e.target.value)}
                            className="w-full h-10 px-2 text-center bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-white/70">Descrição Detalhada do Produto</label>
                      <textarea
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        placeholder="Descreva o produto..."
                        rows={3}
                        className="w-full p-3 bg-[#1C1F26] border border-[#282C32]/45 rounded text-sm text-white outline-none focus:border-[#FF8A00] resize-y"
                      />
                    </div>

                    <div className="md:col-span-2 bg-[#1C1F26]/50 border border-[#282C32]/45 rounded-lg p-4 flex flex-col gap-3">
                      <label className="text-xs font-bold text-white/80">Galeria de Imagens Adicionais (Até 9 fotos extras)</label>
                      <p className="text-[10px] text-white/40 leading-relaxed -mt-1">
                        Adicione fotos do produto sob ângulos diferentes para exibir na galeria da página de detalhes.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => {
                          const imgIdx = i;
                          const currentVal = prodGallery[imgIdx] || "";
                          return (
                            <div key={i} className="flex flex-col gap-1 border border-white/5 p-2 rounded bg-[#15181D]/40">
                              <label className="text-[9px] font-semibold text-white/50">Foto Extra #{i + 2}</label>
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) => {
                                  const newGallery = [...prodGallery];
                                  newGallery[imgIdx] = e.target.value;
                                  setProdGallery(newGallery);
                                }}
                                placeholder="Link no Google Drive"
                                className="h-8 px-2 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white outline-none focus:border-[#FF8A00]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setIsEditingProduct(false);
                        setEditingProductId(null);
                      }}
                      className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!prodName) {
                          toast.error("Por favor, preencha o nome do modelo!");
                          return;
                        }
                        const numPrice = parseFloat(prodPrice);
                        if (isNaN(numPrice)) {
                          toast.error("Por favor, preencha um preço válido!");
                          return;
                        }

                        const installmentVal = (numPrice / prodInstallments).toFixed(2).replace(".", ",");
                        const autoInstallment = `${prodInstallments}x de R$ ${installmentVal}`;

                        const productPayload: PageProduct = {
                          id: isEditingProduct && editingProductId !== null ? editingProductId : Date.now(),
                          name: prodName,
                          discount: prodDiscount || "",
                          reviews: isEditingProduct && editingProductId !== null ? (categoryData.products.find(p => p.id === editingProductId)?.reviews || "(0)") : `(${Math.floor(Math.random() * 150) + 15})`,
                          oldPrice: prodOldPrice || "",
                          price: `R$ ${numPrice.toFixed(2).replace(".", ",")}`,
                          priceVal: numPrice,
                          installment: autoInstallment,
                          imageUrl: prodImageUrl,
                          category: prodCategory,
                          format: prodFormat,
                          material: prodMaterial,
                          color: prodColor,
                          rating: 5,
                          sales: isEditingProduct && editingProductId !== null ? (categoryData.products.find(p => p.id === editingProductId)?.sales || 10) : Math.floor(Math.random() * 200) + 10,
                          description: prodDescription,
                          gender: prodGender,
                          specsHaste: prodSpecsHaste,
                          specsPonte: prodSpecsPonte,
                          specsLente: prodSpecsLente,
                          specsAltura: prodSpecsAltura,
                          gallery: prodGallery.filter(Boolean),
                          stock: prodStock.trim() ? parseInt(prodStock) : undefined,
                        };

                        if (isAddingProduct) {
                          setCategoryData((prev: any) => ({
                            ...prev,
                            products: [...prev.products, productPayload],
                          }));
                          toast.success("Produto adicionado. Salve para confirmar!");
                        } else {
                          setCategoryData((prev: any) => ({
                            ...prev,
                            products: prev.products.map((p: any) => p.id === editingProductId ? productPayload : p),
                          }));
                          toast.success("Produto atualizado. Salve para confirmar!");
                        }

                        setIsAddingProduct(false);
                        setIsEditingProduct(false);
                        setEditingProductId(null);
                      }}
                      className="bg-[#FF8A00] hover:bg-[#E97800] text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                    >
                      {isAddingProduct ? "Adicionar Produto" : "Salvar Edição"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto bg-[#15181D]/30 border border-[#282C32]/45 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#282C32]/45 text-white/50 font-bold uppercase tracking-wider">
                        <th className="p-3">Modelo</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Format/Mat/Cor</th>
                        <th className="p-3">Preço</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/40 italic">
                            Nenhum óculos encontrado com os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        paginatedAdminProducts.map((prod) => (
                          <tr key={prod.id} className="border-b border-[#282C32]/20 last:border-0 hover:bg-white/5 transition-colors">
                            <td className="p-3 font-semibold text-white">{prod.name}</td>
                            <td className="p-3 text-white/70">{prod.category}</td>
                            <td className="p-3 text-white/60">
                              {prod.format} | {prod.material} | {prod.color}
                            </td>
                            <td className="p-3 font-bold text-[#FF8A00]">{prod.price}</td>
                            <td className="p-3 text-right flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingProduct(true);
                                  setEditingProductId(prod.id);
                                  setProdName(prod.name);
                                  setProdPrice(prod.priceVal.toString());
                                  setProdOldPrice(prod.oldPrice);
                                  setProdDiscount(prod.discount);
                                  setProdCategory(prod.category);
                                  setProdFormat(prod.format);
                                  setProdMaterial(prod.material);
                                  setProdColor(prod.color);
                                  setProdImageUrl(prod.imageUrl || "");
                                  setProdDescription(prod.description || "");
                                  setProdGender(prod.gender || "Feminino");
                                  setProdSpecsHaste(prod.specsHaste || "");
                                  setProdSpecsPonte(prod.specsPonte || "");
                                  setProdSpecsLente(prod.specsLente || "");
                                  setProdSpecsAltura(prod.specsAltura || "");
                                  setProdGallery(prod.gallery || []);
                                  setProdStock(prod.stock !== undefined ? prod.stock.toString() : "");
                                  
                                  const instMatch = prod.installment ? prod.installment.match(/^(\d+)x/) : null;
                                  const currentInst = instMatch ? parseInt(instMatch[1]) : 12;
                                  setProdInstallments(currentInst);
                                }}
                                className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Deseja realmente remover o óculos "${prod.name}" desta página?`)) {
                                    setCategoryData((prev: any) => ({
                                      ...prev,
                                      products: prev.products.filter((p: any) => p.id !== prod.id),
                                    }));
                                    toast.success("Produto removido. Salve para confirmar!");
                                  }
                                }}
                                className="text-red-400 hover:text-red-500 bg-red-500/10 hover:bg-red-500/15 p-1.5 rounded cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Admin Products Pagination */}
                {totalAdminPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 bg-[#15181D]/30 border border-[#282C32]/45 rounded-lg p-3">
                    <button
                      type="button"
                      onClick={() => setAdminProductPage((prev) => Math.max(prev - 1, 1))}
                      disabled={activeAdminPage === 1}
                      className="h-8 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand text-xs font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalAdminPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setAdminProductPage(pageNum)}
                          className={`h-8 w-8 text-xs font-bold rounded transition-all cursor-pointer ${
                            activeAdminPage === pageNum
                              ? "bg-[#FF8A00] text-white"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setAdminProductPage((prev) => Math.min(prev + 1, totalAdminPages))}
                      disabled={activeAdminPage === totalAdminPages}
                      className="h-8 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand text-xs font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Próxima
                    </button>
                  </div>
                )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
