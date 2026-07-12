import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { PromoBar } from "@/components/site/PromoBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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
import catMasc from "@/assets/cat-masculino.jpg";
import prod1 from "@/assets/prod-1.jpg";
import prod2 from "@/assets/prod-2.jpg";
import prod3 from "@/assets/prod-3.jpg";
import prod4 from "@/assets/prod-4.jpg";

export const Route = createFileRoute("/masculino")({
  component: MasculinoRoute,
});

function MasculinoRoute() {
  return (
    <CartProvider>
      <MasculinoPage />
    </CartProvider>
  );
}

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Armação Classic Black",
    discount: "-20%",
    reviews: "(128)",
    oldPrice: "R$ 249,90",
    price: "R$ 199,90",
    priceVal: 199.90,
    installment: "12x de R$ 19,90",
    image: prod1,
    category: "Armação de Grau",
    format: "Quadrado",
    material: "Acetato",
    color: "preto",
    rating: 5,
    sales: 150
  },
  {
    id: 2,
    name: "Óculos Solar Premium",
    discount: "-15%",
    reviews: "(96)",
    oldPrice: "R$ 299,90",
    price: "R$ 254,90",
    priceVal: 254.90,
    installment: "12x de R$ 25,49",
    image: prod2,
    category: "Óculos de Sol",
    format: "Wayfarer",
    material: "Acetato",
    color: "preto",
    rating: 5,
    sales: 120
  },
  {
    id: 3,
    name: "Armação Classic Tortoise",
    discount: "-25%",
    reviews: "(78)",
    oldPrice: "R$ 199,90",
    price: "R$ 149,90",
    priceVal: 149.90,
    installment: "12x de R$ 14,90",
    image: prod3,
    category: "Armação de Grau",
    format: "Retangular",
    material: "Acetato",
    color: "marrom",
    rating: 5,
    sales: 90
  },
  {
    id: 4,
    name: "Óculos Solar Polarizado",
    discount: "-18%",
    reviews: "(156)",
    oldPrice: "R$ 329,90",
    price: "R$ 269,90",
    priceVal: 269.90,
    installment: "12x de R$ 26,99",
    image: prod4,
    category: "Óculos de Sol",
    format: "Retangular",
    material: "TR90",
    color: "preto",
    rating: 5,
    sales: 200
  },
  {
    id: 5,
    name: "Armação Titanium Flex",
    discount: "-10%",
    reviews: "(64)",
    oldPrice: "R$ 279,90",
    price: "R$ 251,90",
    priceVal: 251.90,
    installment: "12x de R$ 25,19",
    image: prod1,
    category: "Armação de Grau",
    format: "Aviador",
    material: "Titânio",
    color: "cinza",
    rating: 5,
    sales: 80
  },
  {
    id: 6,
    name: "Óculos Solar Aviador",
    discount: "-22%",
    reviews: "(112)",
    oldPrice: "R$ 229,90",
    price: "R$ 179,90",
    priceVal: 179.90,
    installment: "12x de R$ 17,90",
    image: prod2,
    category: "Óculos de Sol",
    format: "Aviador",
    material: "Metal",
    color: "preto",
    rating: 5,
    sales: 140
  },
  {
    id: 7,
    name: "Armação Square Style",
    discount: "-15%",
    reviews: "(87)",
    oldPrice: "R$ 260,90",
    price: "R$ 220,90",
    priceVal: 220.90,
    installment: "12x de R$ 22,09",
    image: prod3,
    category: "Armação de Grau",
    format: "Quadrado",
    material: "Acetato",
    color: "marrom",
    rating: 5,
    sales: 95
  },
  {
    id: 8,
    name: "Óculos Esportivo Pro",
    discount: "-20%",
    reviews: "(71)",
    oldPrice: "R$ 299,90",
    price: "R$ 239,90",
    priceVal: 239.90,
    installment: "12x de R$ 23,99",
    image: prod4,
    category: "Óculos de Sol",
    format: "Esportivo",
    material: "TR90",
    color: "preto",
    rating: 5,
    sales: 110
  },
  {
    id: 9,
    name: "Óculos Solar Redondo",
    discount: "-17%",
    reviews: "(93)",
    oldPrice: "R$ 239,90",
    price: "R$ 199,90",
    priceVal: 199.90,
    installment: "12x de R$ 19,90",
    image: prod2,
    category: "Lentes Azuis",
    format: "Redondo",
    material: "Metal",
    color: "azul",
    rating: 5,
    sales: 105
  }
];

function MasculinoPage() {
  const { addItem } = useCart();
  
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
  
  // Mobile states
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Copy Coupon logic
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("PRIMEIRACOMPRA");
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  // Toggle Favorite
  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedCategory("Todos");
    setSelectedFormats([]);
    setSelectedMaterials([]);
    setSelectedColor(null);
    setPriceMax(699.90);
  };

  // Filter and sort logic
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    // Category filter
    if (selectedCategory !== "Todos" && product.category !== selectedCategory) {
      return false;
    }
    // Format filter
    if (selectedFormats.length > 0 && !selectedFormats.includes(product.format)) {
      return false;
    }
    // Material filter
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) {
      return false;
    }
    // Color filter
    if (selectedColor && product.color !== selectedColor) {
      return false;
    }
    // Price filter
    if (product.priceVal > priceMax) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === "Menor Preço") {
      return a.priceVal - b.priceVal;
    }
    if (sortOption === "Maior Preço") {
      return b.priceVal - a.priceVal;
    }
    if (sortOption === "Mais Vendidos") {
      return b.sales - a.sales;
    }
    // Default sales/relevance
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

  const colorsList = [
    { name: "preto", value: "#000000" },
    { name: "marrom", value: "#8B4513" },
    { name: "azul", value: "#0000FF" },
    { name: "cinza", value: "#808080" },
    { name: "verde", value: "#008000" }
  ];

  return (
    <div className="min-h-screen bg-background text-[#111111] font-sans selection:bg-[#FF8500] selection:text-white">
      {/* 1. Promotional Bar */}
      <PromoBar />

      {/* 2. Header */}
      <Header />

      {/* 3. Category Banner */}
      <section className="relative h-[180px] bg-[#090B0E] overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 h-full flex items-center relative z-10">
          <div className="max-w-md md:max-w-xl text-left py-6 flex flex-col justify-center h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 mb-2">
              <a href="/" className="hover:text-[#FF8500] transition-colors">Início</a>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-white">Masculino</span>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5 font-display">
              Óculos <span className="text-[#FF8500]">Masculinos</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xs text-white/70 max-w-sm">
              Estilo, atitude e proteção para todos os momentos.
            </p>
          </div>
        </div>

        {/* Banner image on the right */}
        <div className="absolute inset-y-0 right-0 w-[55%] md:w-[45%] h-full z-0 bg-[#090B0E]">
          <img
            src={catMasc}
            alt="Categoria Masculino"
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Smooth black gradient fade on the left */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#090B0E] to-transparent" />
        </div>
      </section>

      {/* 4. Benefits Strip */}
      <section className="bg-background border-b border-[#E0E0E0]">
        <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-2 text-left md:divide-x md:divide-[#E0E0E0]/60">
            <div className="flex items-center gap-2.5 px-1">
              <Truck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold tracking-wider text-black">FRETE GRÁTIS</p>
                <p className="text-[9px] text-[#606060] font-medium">Para todo Brasil</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2">
              <ShieldCheck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold tracking-wider text-black">TROCA GARANTIDA</p>
                <p className="text-[9px] text-[#606060] font-medium">Até 7 dias pós recebimento</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2">
              <CreditCard className="h-7 w-7 text-black stroke-[1.25] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold tracking-wider text-black">ATÉ 12X SEM JUROS</p>
                <p className="text-[9px] text-[#606060] font-medium">No cartão de crédito</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2">
              <Users className="h-7 w-7 text-black stroke-[1.25] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold tracking-wider text-black">10.000+ CLIENTES</p>
                <p className="text-[9px] text-[#606060] font-medium">Satisfeitos</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2 col-span-2 md:col-span-1 justify-center md:justify-start">
              <ShieldCheck className="h-7 w-7 text-black stroke-[1.25] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold tracking-wider text-black">COMPRA 100% SEGURA</p>
                <p className="text-[9px] text-[#606060] font-medium">Seus dados protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Area (Filters and Products Grid) */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        {/* Mobile Filter Trigger Button */}
        <div className="md:hidden flex justify-between items-center gap-3 mb-6 bg-background p-3 rounded border border-[#E0E0E0]">
          <span className="text-[11px] font-bold text-[#606060]">{filteredProducts.length} produtos encontrados</span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FF8500] hover:bg-[#E97700] text-white text-[11px] font-bold rounded transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTRAR
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 5.1. Sidebar Filters (Desktop only, drawer on mobile) */}
          <aside className="hidden md:block w-[220px] shrink-0">
            <div className="bg-background border border-[#E0E0E0] rounded p-4 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Filtros</h3>
                <button 
                  onClick={handleClearFilters}
                  className="text-[10px] text-[#606060] hover:text-[#FF8500] font-bold underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
              <hr className="border-[#E0E0E0]/80" />

              {/* Category Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Categoria</h4>
                <div className="flex flex-col gap-2">
                  {["Todos", "Armação de Grau", "Óculos de Sol", "Lentes Azuis"].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer hover:text-black">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <hr className="border-[#E0E0E0]/60" />

              {/* Format Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Formato</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Aviador (32)", value: "Aviador" },
                    { label: "Quadrado (45)", value: "Quadrado" },
                    { label: "Redondo (21)", value: "Redondo" },
                    { label: "Retangular (38)", value: "Retangular" },
                    { label: "Wayfarer (26)", value: "Wayfarer" },
                    { label: "Esportivo (19)", value: "Esportivo" }
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer hover:text-black">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(item.value)}
                        onChange={() => handleFormatChange(item.value)}
                        className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-[#E0E0E0]/60" />

              {/* Material Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Material</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Acetato (68)", value: "Acetato" },
                    { label: "Metal (54)", value: "Metal" },
                    { label: "Titânio (23)", value: "Titânio" },
                    { label: "TR90 (31)", value: "TR90" }
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer hover:text-black">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes(item.value)}
                        onChange={() => handleMaterialChange(item.value)}
                        className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-[#E0E0E0]/60" />

              {/* Color Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Cor</h4>
                <div className="flex flex-wrap gap-2.5">
                  {colorsList.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(isSelected ? null : color.name)}
                        style={{ backgroundColor: color.value }}
                        className={`h-5 w-5 rounded-full border cursor-pointer transition-all ${
                          isSelected 
                            ? "border-[#FF8500] ring-1 ring-[#FF8500] scale-110" 
                            : "border-[#E0E0E0] hover:scale-105"
                        }`}
                        title={color.name}
                      />
                    );
                  })}
                  <button 
                    onClick={() => setSelectedColor(null)}
                    className="h-5 w-5 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] text-[10px] font-bold flex items-center justify-center text-[#606060]"
                  >
                    +
                  </button>
                </div>
              </div>

              <hr className="border-[#E0E0E0]/60" />

              {/* Price Filter */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2">Faixa de Preço</h4>
                <div className="flex justify-between text-[9px] text-[#606060] font-bold mb-2">
                  <span>R$ 69,90</span>
                  <span>R$ {priceMax.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="69.90"
                  max="699.90"
                  step="10"
                  value={priceMax}
                  onChange={(e) => setPriceMax(parseFloat(e.target.value))}
                  className="w-full accent-[#FF8500] h-1 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* 5.2. Coupon Card */}
            <div className="mt-6 bg-[#080A0D] text-white border border-white/5 rounded p-5 flex flex-col items-center text-center relative overflow-hidden">
              {/* Leve visual pattern details */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF8500]/5 rounded-full filter blur-xl" />
              
              <span className="text-3xl font-extrabold tracking-tight text-[#FF8500] font-display">10% OFF</span>
              <span className="text-[9px] font-black tracking-widest text-white/95 mt-1">NA SUA PRIMEIRA COMPRA</span>
              
              <p className="text-[9px] text-white/50 mt-3 mb-4 leading-relaxed">
                Use o cupom: <strong className="text-white">PRIMEIRACOMPRA</strong>
              </p>
              
              <button
                onClick={handleCopyCoupon}
                className="w-full h-8 bg-[#FF8500] hover:bg-[#E97700] text-white text-[10px] font-extrabold tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
              <div className="w-[280px] bg-white h-full p-5 overflow-y-auto flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Filtros</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="h-5 w-5 text-black" />
                  </button>
                </div>
                <hr className="border-[#E0E0E0]/80" />

                {/* Category Filter */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Categoria</h4>
                  <div className="flex flex-col gap-2">
                    {["Todos", "Armação de Grau", "Óculos de Sol", "Lentes Azuis"].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat}
                          onChange={() => {
                            setSelectedCategory(cat);
                            setMobileFiltersOpen(false);
                          }}
                          className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <hr className="border-[#E0E0E0]/60" />

                {/* Format Filter */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Formato</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Aviador (32)", value: "Aviador" },
                      { label: "Quadrado (45)", value: "Quadrado" },
                      { label: "Redondo (21)", value: "Redondo" },
                      { label: "Retangular (38)", value: "Retangular" },
                      { label: "Wayfarer (26)", value: "Wayfarer" },
                      { label: "Esportivo (19)", value: "Esportivo" }
                    ].map((item) => (
                      <label key={item.value} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFormats.includes(item.value)}
                          onChange={() => handleFormatChange(item.value)}
                          className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-[#E0E0E0]/60" />

                {/* Material Filter */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Material</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Acetato (68)", value: "Acetato" },
                      { label: "Metal (54)", value: "Metal" },
                      { label: "Titânio (23)", value: "Titânio" },
                      { label: "TR90 (31)", value: "TR90" }
                    ].map((item) => (
                      <label key={item.value} className="flex items-center gap-2 text-[11px] text-[#606060] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(item.value)}
                          onChange={() => handleMaterialChange(item.value)}
                          className="rounded border-[#E0E0E0] text-[#FF8500] focus:ring-[#FF8500] h-3.5 w-3.5"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-[#E0E0E0]/60" />

                {/* Color Filter */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2.5">Cor</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {colorsList.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(isSelected ? null : color.name)}
                          style={{ backgroundColor: color.value }}
                          className={`h-5 w-5 rounded-full border cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#FF8500] ring-1 ring-[#FF8500] scale-110" 
                              : "border-[#E0E0E0]"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <hr className="border-[#E0E0E0]/60" />

                {/* Price Filter */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-[#111111] mb-2">Faixa de Preço</h4>
                  <div className="flex justify-between text-[9px] text-[#606060] font-bold mb-2">
                    <span>R$ 69,90</span>
                    <span>R$ {priceMax.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="69.90"
                    max="699.90"
                    step="10"
                    value={priceMax}
                    onChange={(e) => setPriceMax(parseFloat(e.target.value))}
                    className="w-full accent-[#FF8500] h-1 bg-[#E0E0E0]"
                  />
                </div>
                
                <button
                  onClick={() => {
                    handleClearFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-2 border border-[#E0E0E0] rounded text-[10px] font-bold mt-4"
                >
                  Limpar tudo
                </button>
              </div>
            </div>
          )}

          {/* 5.3. Products Content Area */}
          <div className="flex-1">
            {/* 6. List toolbar controls */}
            <div className="bg-background border border-[#E0E0E0] rounded p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[#606060] text-[11px] font-medium">Ordenar por:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="h-8 bg-background border border-[#E0E0E0] rounded text-[11px] px-2 outline-none font-medium text-black focus:border-[#FF8500]"
                  >
                    <option value="Mais Vendidos">Mais Vendidos</option>
                    <option value="Menor Preço">Menor Preço</option>
                    <option value="Maior Preço">Maior Preço</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[#606060] text-[11px] font-medium">Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(e.target.value)}
                    className="h-8 bg-background border border-[#E0E0E0] rounded text-[11px] px-2 outline-none font-medium text-black focus:border-[#FF8500]"
                  >
                    <option value="24 por página">24 por página</option>
                    <option value="12 por página">12 por página</option>
                    <option value="36 por página">36 por página</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto md:ml-0">
                <span className="text-[11px] text-[#606060] font-medium">
                  {filteredProducts.length} produtos encontrados
                </span>
                
                <div className="flex border border-[#E0E0E0] rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 cursor-pointer ${
                      viewMode === "grid" 
                        ? "bg-[#FF8500] text-white" 
                        : "bg-white text-[#606060] hover:text-[#FF8500]"
                    }`}
                    title="Visualização em Grade"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 cursor-pointer ${
                      viewMode === "list" 
                        ? "bg-[#FF8500] text-white" 
                        : "bg-white text-[#606060] hover:text-[#FF8500]"
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 7. Grid of Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-background border border-[#E0E0E0] rounded p-12 text-center">
                <p className="text-sm font-semibold text-[#606060] mb-2">Nenhum produto atende aos filtros aplicados.</p>
                <button 
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-[#FF8500] text-white text-xs font-bold rounded hover:bg-[#E97700] transition-colors"
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
                {filteredProducts.map((product) => {
                  const isFavorite = favorites.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`bg-background border border-[#E0E0E0]/80 rounded p-3 flex relative transition-all group ${
                        viewMode === "grid"
                          ? "flex-col hover:shadow-md"
                          : "flex-row gap-4 items-center hover:shadow-md"
                      }`}
                    >
                      {/* Discount Seal */}
                      <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded z-10">
                        {product.discount}
                      </span>
                      
                      {/* Favorite Heart Button (Top Right) */}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-background/80 hover:bg-background shadow-sm flex items-center justify-center text-[#A0A0A0] hover:text-red-500 z-10 transition-colors cursor-pointer"
                      >
                        <Heart className={`h-4.5 w-4.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      {/* Product Image */}
                      <div className={`flex items-center justify-center bg-background overflow-hidden shrink-0 ${
                        viewMode === "grid" ? "h-40 w-full mb-3" : "h-28 w-28"
                      }`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Name */}
                          <h3 className="text-xs font-semibold text-[#111111] leading-tight mb-1 group-hover:text-[#FF8500] transition-colors">
                            {product.name}
                          </h3>

                          {/* Reviews / Stars */}
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(product.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-[#FF8500] text-[#FF8500]" />
                            ))}
                            <span className="text-[9px] text-[#A0A0A0] ml-1">{product.reviews}</span>
                          </div>

                          {/* Prices */}
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-[10px] text-[#A0A0A0] line-through font-medium">{product.oldPrice}</span>
                            <span className="text-sm font-black text-[#FF8500]">{product.price}</span>
                          </div>

                          {/* Installments */}
                          <p className="text-[10px] text-[#606060] font-medium mb-3">
                            {product.installment}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={addItem}
                            className="flex-1 h-8 bg-[#FF8500] hover:bg-[#E97700] text-white text-[10px] font-extrabold tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

            {/* 8. Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button 
                  disabled
                  className="h-7 w-7 rounded border border-[#E0E0E0] bg-white flex items-center justify-center text-[#A0A0A0] cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-7 w-7 rounded bg-[#FF8500] text-white text-xs font-bold flex items-center justify-center">
                  1
                </button>
                {[2, 3, 4, 5].map((page) => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="h-7 w-7 rounded border border-[#E0E0E0] bg-white hover:border-[#FF8500] hover:text-[#FF8500] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {page}
                  </button>
                ))}
                <span className="text-xs text-[#A0A0A0] px-0.5">...</span>
                <button 
                  onClick={() => setCurrentPage(8)}
                  className="h-7 w-7 rounded border border-[#E0E0E0] bg-white hover:border-[#FF8500] hover:text-[#FF8500] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                >
                  8
                </button>
                <button className="h-7 w-7 rounded border border-[#E0E0E0] bg-white hover:border-[#FF8500] hover:text-[#FF8500] flex items-center justify-center transition-colors cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </button>
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
              <Users className="h-5 w-5 text-[#FF8500] shrink-0" />
              <span className="text-[11px] font-medium text-white">Mais de 500 modelos exclusivos</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <CreditCard className="h-5 w-5 text-[#FF8500] shrink-0" />
              <span className="text-[11px] font-medium text-white">Até 12x sem juros no cartão</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <Truck className="h-5 w-5 text-[#FF8500] shrink-0" />
              <span className="text-[11px] font-medium text-white">Frete grátis para todo Brasil</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 px-2">
              <ShieldCheck className="h-5 w-5 text-[#FF8500] shrink-0" />
              <span className="text-[11px] font-medium text-white">Satisfação ou seu dinheiro de volta</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
