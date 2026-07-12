import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchHomePageContent, saveHomePageContent, HomePageData, DEFAULT_HOME_PAGE_DATA, getDirectDriveUrl } from "@/lib/home-service";
import { toast } from "sonner";
import { LogOut, Save, LayoutGrid, Info, Star, Edit, ArrowLeft, RefreshCw, Mail, Image, Link, AlertCircle, Layout, Zap, Plus, Trash2, Palette } from "lucide-react";

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
  component: Admin,
});

type TabType = "promo" | "hero" | "categories" | "products" | "flash" | "testimonials" | "brands" | "newsletter" | "footer" | "colors";

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("promo");
  
  // Admin form state
  const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);
  const [newBrandName, setNewBrandName] = useState("");

  useEffect(() => {
    async function checkAuthAndLoad() {
      // Check auth status (Supabase real session OR local storage mock bypass)
      const bypass = localStorage.getItem("admin_auth_bypass");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && bypass !== "true") {
        toast.error("Acesso não autorizado. Faça login primeiro.");
        navigate({ to: "/login" });
        return;
      }

      // Load home page content
      const content = await fetchHomePageContent();
      setData(content);
      setLoading(false);
    }

    checkAuthAndLoad();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveHomePageContent(data);
    setSaving(false);

    if (result.success) {
      if (result.isLocalOnly) {
        toast.warning(
          `Salvo temporariamente no navegador! Sincronização falhou: ${result.error || "Sem permissão"}. Certifique-se de que a tabela home_page_content e as permissões RLS foram criadas no Supabase.`
        );
      } else {
        toast.success("Alterações salvas com sucesso no Supabase e na nuvem!");
      }
    } else {
      toast.error(`Erro ao salvar: ${result.error || "Erro desconhecido"}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_auth_bypass");
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/login" });
  };

  const resetToDefault = () => {
    if (window.confirm("Deseja realmente restaurar todos os textos e imagens para o padrão inicial?")) {
      setData(DEFAULT_HOME_PAGE_DATA);
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
        <div className="flex flex-col gap-2 bg-[#101217] border border-[#282C32]/45 rounded-lg p-3 h-fit">
          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase px-3 py-1 mb-2">
            Seções da Página Inicial
          </h4>
          <button
            onClick={() => setActiveTab("promo")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "promo" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Info className="h-4 w-4 shrink-0" />
            Banner Promocional
          </button>
          <button
            onClick={() => setActiveTab("hero")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "hero" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            Banner Principal (Hero)
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "categories" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Image className="h-4 w-4 shrink-0" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "products" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Edit className="h-4 w-4 shrink-0" />
            Mais Vendidos
          </button>
          <button
            onClick={() => setActiveTab("flash")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "flash" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Zap className="h-4 w-4 shrink-0" />
            Oferta Relâmpago
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "testimonials" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Star className="h-4 w-4 shrink-0" />
            Depoimentos
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "brands" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Link className="h-4 w-4 shrink-0" />
            Marcas Parceiras
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "newsletter" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Mail className="h-4 w-4 shrink-0" />
            Newsletter
          </button>
          <button
            onClick={() => setActiveTab("footer")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "footer" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Layout className="h-4 w-4 shrink-0" />
            Rodapé (Footer)
          </button>
          <button
            onClick={() => setActiveTab("colors")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "colors" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Palette className="h-4 w-4 shrink-0" />
            Paleta de Cores
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

          {/* TAB 2: Banner Principal (Hero) */}
          {activeTab === "hero" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Principal (Hero)
              </h3>
              
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

          {/* TAB 3: Categorias */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção de Categorias
              </h3>

              <div className="flex flex-col gap-6">
                {data.categories.list.map((cat, idx) => (
                  <div key={cat.title} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">
                      Categoria: {cat.title}
                    </span>

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
                          banner: "#0D0E10",
                          hairline: "#2E3033",
                          background: "#FFFFFF",
                          foreground: "#08090A",
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

              {/* Categoria 1: Marca */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]/80">1. Cores de Identidade da Marca</h4>
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
        </div>
      </main>
    </div>
  );
}
