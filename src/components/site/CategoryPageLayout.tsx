import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { PromoBar } from "@/components/site/PromoBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getDirectDriveUrl } from "@/lib/home-service";
import { fetchPageContent, CategoryPageData, PageProduct } from "@/lib/page-service";
import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Grid, 
  List, 
  Star, 
  Heart, 
  Copy, 
  Check, 
  SlidersHorizontal,
  X,
  ShoppingCart
} from "lucide-react";

// Import local assets for defaults
import catMasc from "@/assets/cat-masculino.jpg";
import catFem from "@/assets/cat-feminino.jpg";
import catPrem from "@/assets/cat-premium.jpg";
import catSolar from "@/assets/cat-solar.jpg";

import prod1 from "@/assets/prod-1.jpg";
import prod2 from "@/assets/prod-2.jpg";
import prod3 from "@/assets/prod-3.jpg";
import prod4 from "@/assets/prod-4.jpg";

const DEFAULT_BANNER_MAP: Record<string, string> = {
  masculino: catMasc,
  feminino: catFem,
  premium: catPrem,
  solar: catSolar,
  colecoes: catPrem,
  promocoes: catSolar,
};

const MOCK_IMAGES = [prod1, prod2, prod3, prod4];

const BREADCRUMB_MAP: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  premium: "Premium",
  solar: "Solar",
  colecoes: "Coleções",
  promocoes: "Promoções",
};

interface CategoryPageLayoutProps {
  pageId: string;
}

export function CategoryPageLayout({ pageId }: CategoryPageLayoutProps) {
  const { addItem } = useCart();
  const [pageData, setPageData] = useState<CategoryPageData | null>(null);
  const BREADCRUMB_LABEL = BREADCRUMB_MAP[pageId] || "Coleções";
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState(699.90);
  
  // Controls
  const [sortOption, setSortOption] = useState("Mais Vendidos");
  const [itemsPerPage, setItemsPerPage] = useState("24 por página");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponCopied, setCouponCopied] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchPageContent(pageId);
      setPageData(data);
      
      // Ajustar preço máximo padrão com base no maior preço da lista
      if (data.products && data.products.length > 0) {
        const maxVal = Math.max(...data.products.map(p => p.priceVal));
        setPriceMax(maxVal + 10);
      }
      setLoading(false);
    }
    loadData();

    // Listen to localstorage updates for live previews in admin
    const handleStorage = () => {
      loadData();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pageId]);

  if (loading || !pageData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand"></div>
        <p className="text-xs text-muted-foreground mt-3">Carregando catálogo...</p>
      </div>
    );
  }

  // Fallbacks
  const headerData = pageData.header || { show: true, title: "Catálogo", subtitle: "" };
  const showBanner = headerData.show !== false;
  const bannerImage = headerData.imageUrl ? getDirectDriveUrl(headerData.imageUrl) : DEFAULT_BANNER_MAP[pageId];

  const benefitsData = pageData.benefits || { show: true, list: [] };
  const showBenefits = benefitsData.show !== false;
  const benefitsList = benefitsData.list || [];

  const productsList = pageData.products || [];

  // Icon Resolver helper
  const getIcon = (key: string) => {
    switch (key) {
      case "Truck": return <Truck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />;
      case "ShieldCheck": return <ShieldCheck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />;
      case "CreditCard": return <CreditCard className="h-7 w-7 text-black stroke-[1.25] shrink-0" />;
      case "Users": return <Users className="h-7 w-7 text-black stroke-[1.25] shrink-0" />;
      default: return <ShieldCheck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />;
    }
  };

  // Extract unique filters from the current product list dynamically
  const uniqueCategories = ["Todos", ...Array.from(new Set(productsList.map(p => p.category)))];
  const uniqueFormats = Array.from(new Set(productsList.map(p => p.format)));
  const uniqueMaterials = Array.from(new Set(productsList.map(p => p.material)));
  const uniqueColors = Array.from(new Set(productsList.map(p => p.color)));

  const colorHexMap: Record<string, string> = {
    preto: "#000000",
    marrom: "#8B4513",
    azul: "#0000FF",
    cinza: "#808080",
    verde: "#008000",
    vermelho: "#FF0000",
    dourado: "#FFD700",
    transparente: "#E5E5E5",
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("PRIMEIRACOMPRA");
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("Todos");
    setSelectedFormats([]);
    setSelectedMaterials([]);
    setSelectedColor(null);
    if (productsList.length > 0) {
      const maxVal = Math.max(...productsList.map(p => p.priceVal));
      setPriceMax(maxVal + 10);
    }
  };

  // Filter and sort logic
  const filteredProducts = productsList.filter(product => {
    if (selectedCategory !== "Todos" && product.category !== selectedCategory) {
      return false;
    }
    if (selectedFormats.length > 0 && !selectedFormats.includes(product.format)) {
      return false;
    }
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) {
      return false;
    }
    if (selectedColor && product.color !== selectedColor) {
      return false;
    }
    if (product.priceVal > priceMax) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === "Menor Preço") return a.priceVal - b.priceVal;
    if (sortOption === "Maior Preço") return b.priceVal - a.priceVal;
    return b.sales - a.sales;
  });

  const handleFormatChange = (format: string) => {
    if (selectedFormats.includes(format)) {
      setSelectedFormats(selectedFormats.filter(f => f !== format));
    } else {
      setSelectedFormats([...selectedFormats, format]);
    }
  };

  const handleMaterialChange = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand selection:text-white">
      <PromoBar />
      <Header />

      {/* 3. Category Banner */}
      {showBanner && (
        <section className="relative h-[180px] bg-[#090B0E] overflow-hidden">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 h-full flex items-center relative z-10">
            <div className="max-w-md md:max-w-xl text-left py-6 flex flex-col justify-center h-full">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 mb-2">
                <a href="/" className="hover:text-brand transition-colors">Início</a>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-white">{BREADCRUMB_LABEL}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5 font-display">
                {headerData.title}
              </h1>
              
              <p className="text-xs text-white/70 max-w-sm">
                {headerData.subtitle}
              </p>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 w-[55%] md:w-[45%] h-full z-0 bg-[#090B0E]">
            {bannerImage && (
              <img
                src={bannerImage}
                alt={headerData.title}
                className="h-full w-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#090B0E] to-transparent" />
          </div>
        </section>
      )}

      {/* 4. Benefits Strip */}
      {showBenefits && benefitsList.length > 0 && (
        <section className="bg-background border-b border-border/60">
          <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-2 text-left md:divide-x md:divide-border/40">
              {benefitsList.slice(0, 5).map((b, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-2 col-span-1">
                  {getIcon(b.iconKey)}
                  <div>
                    <p className="text-[10px] font-extrabold tracking-wider text-foreground uppercase">{b.title}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{b.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Main Area (Filters and Products Grid) */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="md:hidden flex justify-between items-center gap-3 mb-6 bg-background p-3 rounded border border-border/60">
          <span className="text-[11px] font-bold text-muted-foreground">{filteredProducts.length} produtos encontrados</span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-2 text-white text-[11px] font-bold rounded transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTRAR
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 5.1. Sidebar Filters */}
          <aside className="hidden md:block w-[220px] shrink-0">
            <div className="bg-background border border-border/60 rounded p-4 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Filtros</h3>
                <button 
                  onClick={handleClearFilters}
                  className="text-[10px] text-muted-foreground hover:text-brand font-bold underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
              <hr className="border-border/40" />

              {/* Category Filter */}
              {uniqueCategories.length > 2 && (
                <>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2.5">Categoria</h4>
                    <div className="flex flex-col gap-2">
                      {uniqueCategories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                            className="rounded border-border text-brand focus:ring-brand h-3.5 w-3.5"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border/40" />
                </>
              )}

              {/* Format Filter */}
              {uniqueFormats.length > 0 && (
                <>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2.5">Formato</h4>
                    <div className="flex flex-col gap-2">
                      {uniqueFormats.map((format) => (
                        <label key={format} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedFormats.includes(format)}
                            onChange={() => handleFormatChange(format)}
                            className="rounded border-border text-brand focus:ring-brand h-3.5 w-3.5"
                          />
                          <span>{format}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border/40" />
                </>
              )}

              {/* Material Filter */}
              {uniqueMaterials.length > 0 && (
                <>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2.5">Material</h4>
                    <div className="flex flex-col gap-2">
                      {uniqueMaterials.map((material) => (
                        <label key={material} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material)}
                            onChange={() => handleMaterialChange(material)}
                            className="rounded border-border text-brand focus:ring-brand h-3.5 w-3.5"
                          />
                          <span>{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border/40" />
                </>
              )}

              {/* Color Filter */}
              {uniqueColors.length > 0 && (
                <>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2.5">Cor</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {uniqueColors.map((colorName) => {
                        const isSelected = selectedColor === colorName;
                        const hex = colorHexMap[colorName] || "#CCCCCC";
                        return (
                          <button
                            key={colorName}
                            onClick={() => setSelectedColor(isSelected ? null : colorName)}
                            style={{ backgroundColor: hex }}
                            className={`h-5 w-5 rounded-full border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-brand ring-1 ring-brand scale-110" 
                                : "border-border hover:scale-105"
                            }`}
                            title={colorName}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <hr className="border-border/40" />
                </>
              )}

              {/* Price Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2">Faixa de Preço</h4>
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold mb-2">
                  <span>R$ 69,90</span>
                  <span>R$ {priceMax.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="69.90"
                  max="999.90"
                  step="10"
                  value={priceMax}
                  onChange={(e) => setPriceMax(parseFloat(e.target.value))}
                  className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Coupon Card */}
            <div className="mt-6 bg-[#080A0D] text-white border border-white/5 rounded p-5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full filter blur-xl" />
              <span className="text-3xl font-extrabold tracking-tight text-brand font-display">10% OFF</span>
              <span className="text-[9px] font-black tracking-widest text-white/95 mt-1">NA SUA PRIMEIRA COMPRA</span>
              <p className="text-[9px] text-white/50 mt-3 mb-4 leading-relaxed">
                Use o cupom: <strong className="text-white">PRIMEIRACOMPRA</strong>
              </p>
              <button
                onClick={handleCopyCoupon}
                className="w-full h-8 bg-brand hover:bg-brand-2 text-white text-[10px] font-extrabold tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {couponCopied ? (
                  <>
                    <Check className="h-3 w-3 shrink-0" />
                    CUPOM COPIADO
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 shrink-0" />
                    COPIAR CUPOM
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex justify-end md:hidden">
              <div className="w-[280px] bg-background h-full p-5 overflow-y-auto flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Filtros</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="h-5 w-5 text-foreground" />
                  </button>
                </div>
                <hr className="border-border/40" />

                {/* Mobile Filter Categories */}
                {uniqueCategories.length > 2 && (
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-2.5">Categoria</h4>
                    <div className="flex flex-col gap-2">
                      {uniqueCategories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategory === cat}
                            onChange={() => {
                              setSelectedCategory(cat);
                              setMobileFiltersOpen(false);
                            }}
                            className="rounded border-border text-brand focus:ring-brand h-3.5 w-3.5"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Content Area */}
          <div className="flex-1">
            <div className="bg-background border border-border/60 rounded p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px] font-medium">Ordenar por:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="h-8 bg-background border border-border text-[11px] px-2 outline-none font-medium text-foreground focus:border-brand"
                  >
                    <option value="Mais Vendidos">Mais Vendidos</option>
                    <option value="Menor Preço">Menor Preço</option>
                    <option value="Maior Preço">Maior Preço</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px] font-medium">Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(e.target.value)}
                    className="h-8 bg-background border border-border text-[11px] px-2 outline-none font-medium text-foreground focus:border-brand"
                  >
                    <option value="24 por página">24 por página</option>
                    <option value="12 por página">12 por página</option>
                    <option value="36 por página">36 por página</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto md:ml-0">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {filteredProducts.length} produtos encontrados
                </span>
                <div className="flex border border-border rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 cursor-pointer ${
                      viewMode === "grid" 
                        ? "bg-brand text-white" 
                        : "bg-background text-muted-foreground hover:text-brand"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 cursor-pointer ${
                      viewMode === "list" 
                        ? "bg-brand text-white" 
                        : "bg-background text-muted-foreground hover:text-brand"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid/List of Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-background border border-border/60 rounded p-12 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Nenhum produto atende aos filtros aplicados.</p>
                <button 
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-2 transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  : "flex flex-col gap-3"
              }>
                {filteredProducts.map((product, idx) => {
                  const isFavorite = favorites.includes(product.id);
                  const img = product.imageUrl ? getDirectDriveUrl(product.imageUrl) : MOCK_IMAGES[idx % 4];
                  return (
                    <div
                      key={product.id}
                      className={`bg-background border border-border/60 rounded p-3 flex relative transition-all group ${
                        viewMode === "grid"
                          ? "flex-col hover:shadow-md"
                          : "flex-row gap-4 items-center hover:shadow-md"
                      }`}
                    >
                      {product.discount && (
                        <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded z-10">
                          {product.discount}
                        </span>
                      )}
                      
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-background/85 hover:bg-background border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground hover:text-red-500 z-10 transition-colors cursor-pointer animate-duration-150"
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      <div className={`flex items-center justify-center bg-background overflow-hidden shrink-0 ${
                        viewMode === "grid" ? "h-40 w-full mb-3" : "h-28 w-28"
                      }`}>
                        <img
                          src={img}
                          alt={product.name}
                          className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-foreground leading-tight mb-1 group-hover:text-brand transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(product.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-brand text-brand" />
                            ))}
                            <span className="text-[9px] text-muted-foreground ml-1">{product.reviews}</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-0.5">
                            {product.oldPrice && (
                              <span className="text-[10px] text-muted-foreground line-through font-medium">{product.oldPrice}</span>
                            )}
                            <span className="text-sm font-black text-brand">{product.price}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-3">
                            {product.installment}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={addItem}
                            className="flex-1 h-8 bg-brand hover:bg-brand-2 text-white text-[10px] font-bold tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                            ADICIONAR AO CARRINHO
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Dark Benefits Strip */}
      <section className="bg-[#080A0D] border-t border-white/5 py-6">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <Users className="h-5 w-5 text-brand shrink-0" />
              <span className="text-[11px] font-medium text-white">Mais de 500 modelos exclusivos</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <CreditCard className="h-5 w-5 text-brand shrink-0" />
              <span className="text-[11px] font-medium text-white">Até 12x sem juros no cartão</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <Truck className="h-5 w-5 text-brand shrink-0" />
              <span className="text-[11px] font-medium text-white">Frete grátis para todo Brasil</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <ShieldCheck className="h-5 w-5 text-brand shrink-0" />
              <span className="text-[11px] font-medium text-white">Satisfação ou seu dinheiro de volta</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
