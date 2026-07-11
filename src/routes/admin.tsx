import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchHomePageContent, saveHomePageContent, HomePageData, DEFAULT_HOME_PAGE_DATA, getDirectDriveUrl } from "@/lib/home-service";
import { toast } from "sonner";
import { LogOut, Save, LayoutGrid, Info, Star, Edit, ArrowLeft, RefreshCw, Mail, Image, Link, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

type TabType = "promo" | "hero" | "categories" | "products" | "testimonials" | "newsletter";

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("promo");
  
  // Admin form state
  const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);

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
              <img
                src={directUrl}
                alt="Preview"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-white/70">Pré-visualização da Imagem</span>
              <span className="text-[9px] text-[#666A72] truncate max-w-[250px] md:max-w-[400px]">
                {directUrl}
              </span>
            </div>
          </div>
        )}
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
            onClick={() => setActiveTab("testimonials")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "testimonials" ? "bg-[#FF8A00] text-white" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <Star className="h-4 w-4 shrink-0" />
            Depoimentos
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
              <div className="flex flex-col gap-1.5">
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
            </div>
          )}

          {/* TAB 2: Banner Principal (Hero) */}
          {activeTab === "hero" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Banner Principal (Hero)
              </h3>
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Texto do Botão Principal</label>
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
                  <label className="text-xs font-semibold text-white/70">Link do Botão Principal</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/70">Texto do Botão Secundário</label>
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
                  <label className="text-xs font-semibold text-white/70">Link do Botão Secundário</label>
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

          {/* TAB 5: Depoimentos */}
          {activeTab === "testimonials" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold border-b border-white/10 pb-2 text-[#FF8A00]">
                Seção de Depoimentos
              </h3>

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
                {data.testimonials.list.map((t, idx) => (
                  <div key={idx} className="border border-[#282C32]/45 rounded-lg p-4 bg-[#15181D]/30 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
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
                        className="h-9 px-3 bg-[#15181D] border border-[#282C32]/45 rounded text-xs text-white"
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
                      recommendedSize="512 x 512 px"
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
        </div>
      </main>
    </div>
  );
}
