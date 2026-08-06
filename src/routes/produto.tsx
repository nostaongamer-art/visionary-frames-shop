import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PromoBar } from "@/components/site/PromoBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchHomePageContent, getDirectDriveUrl } from "@/lib/home-service";
import { fetchPageContent } from "@/lib/page-service";
import { useCart } from "@/hooks/use-cart";
import { Star, Plus, Minus, Truck, Ruler, Compass, Eye, MoveVertical, ArrowLeft, ShoppingCart, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/lib/shop-data";
import { toast } from "sonner";

export const Route = createFileRoute("/produto")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id ? String(search.id) : "",
      pageId: search.pageId ? String(search.pageId) : "home",
    };
  },
  component: ProductDetailsPage,
});

const IMAGE_MAP: Record<string, string> = {
  prod1: PRODUCTS[0].image,
  prod2: PRODUCTS[1].image,
  prod3: PRODUCTS[2].image,
  prod4: PRODUCTS[3].image,
};

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function ProductDetailsPage() {
  const { id, pageId } = Route.useSearch();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    buttonText: "COMPRAR AGORA",
    showShippingCalculator: true,
    defaultShippingTime: "5 a 8 dias úteis",
    defaultShippingCost: "Grátis",
  });

  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [shippingResult, setShippingResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const homeData = await fetchHomePageContent();
        
        if (homeData.productPageSettings) {
          setSettings(homeData.productPageSettings);
        }

        let foundProduct: any = null;

        if (pageId === "home") {
          // Look in bestSellers
          foundProduct = homeData.bestSellers.products.find(
            (p: any) => String(p.id) === String(id)
          );
          
          // Look in customSections
          if (!foundProduct && homeData.customSections) {
            for (const section of homeData.customSections) {
              foundProduct = section.products.find(
                (p: any) => String(p.id) === String(id)
              );
              if (foundProduct) break;
            }
          }
        } else {
          // Look in specific page
          const pageData = await fetchPageContent(pageId);
          if (pageData && pageData.products) {
            foundProduct = pageData.products.find(
              (p: any) => String(p.id) === String(id)
            );
          }
        }

        // Fallback search in general static PRODUCTS array
        if (!foundProduct) {
          const numericId = parseInt(id);
          if (!isNaN(numericId) && numericId > 0 && numericId <= PRODUCTS.length) {
            const fallbackProd = PRODUCTS[numericId - 1];
            foundProduct = {
              id: numericId,
              name: fallbackProd.name,
              price: fallbackProd.price,
              oldPrice: "R$ 299,90",
              discount: "-15%",
              reviews: "(48)",
              installment: "10x de " + fallbackProd.price + " sem juros",
              imageUrl: "",
              imageKey: `prod${numericId}`,
              category: "Óculos de Sol",
              format: "Quadrado",
              material: "Acetato",
              color: "preto",
              description: "Armação moderna e resistente, perfeita para qualquer ocasião. Oferece proteção UV400 completa nas lentes.",
              specsHaste: "140",
              specsPonte: "18",
              specsLente: "54",
              specsAltura: "44",
            };
          }
        }

        setProduct(foundProduct);
        if (foundProduct) {
          const mainSrc = (foundProduct.imageUrl && getDirectDriveUrl(foundProduct.imageUrl)) || IMAGE_MAP[foundProduct.imageKey] || foundProduct.image || PRODUCTS[foundProduct.id - 1]?.image;
          setActiveImage(mainSrc || "");
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id, pageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PromoBar text="Carregando detalhes do produto..." />
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PromoBar text="Produto não encontrado" />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-ink">Produto não encontrado</h2>
          <p className="text-sm text-muted-foreground">O produto que você tentou acessar não foi localizado ou foi removido.</p>
          <Link to="/" className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-6 text-sm font-bold text-white transition-colors hover:bg-brand-2">
            Voltar para a Página Inicial
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const imageSrc = (product.imageUrl && getDirectDriveUrl(product.imageUrl)) || IMAGE_MAP[product.imageKey] || product.image || PRODUCTS[product.id - 1]?.image;

  const handleBuy = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`, {
      description: "Redirecionando para a finalização...",
    });
    navigate({ to: "/checkout" });
  };

  const handleAddToCartOnly = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} adicionado à sacola!`, {
      description: "Você pode continuar navegando ou finalizar a compra.",
    });
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.replace(/\D/g, "").length !== 8) {
      toast.error("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    setShippingResult({
      cost: settings.defaultShippingCost || "Grátis",
      time: settings.defaultShippingTime || "5 a 8 dias úteis",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PromoBar text="PROMOÇÃO ATIVA! COMPRE SEU ÓCULOS EM ATÉ 10X SEM JUROS" />
      <Header />

      <main className="mx-auto max-w-[var(--content-max-width,1500px)] px-4 sm:px-6 py-6 md:py-10">
        {/* Voltar */}
        <Link 
          to={pageId === "home" ? "/" : `/${pageId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors mb-6 outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a lista de produtos
        </Link>

        {/* Grade do Produto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Lado Esquerdo (Imagem & Medidas) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="w-full aspect-[4/3] bg-background border border-border/40 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img
                src={activeImage || imageSrc}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-[1.03] transition-transform duration-500"
              />
            </div>

            {/* Galeria de Fotos Miniaturas */}
            {(() => {
              const galleryList: string[] = [];
              const mainSrc = (product.imageUrl && getDirectDriveUrl(product.imageUrl)) || IMAGE_MAP[product.imageKey] || product.image || PRODUCTS[product.id - 1]?.image;
              if (mainSrc) galleryList.push(mainSrc);
              
              if (Array.isArray(product.gallery)) {
                product.gallery.forEach((url: string) => {
                  if (url && url.trim()) {
                    galleryList.push(getDirectDriveUrl(url.trim()));
                  }
                });
              }

              if (galleryList.length > 1) {
                return (
                  <div className="flex gap-2 flex-wrap items-center justify-center bg-background border border-border/30 rounded-xl p-3">
                    {galleryList.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(src)}
                        className={`w-14 h-14 rounded border overflow-hidden p-0.5 bg-background hover:border-[#FF8A00] transition-colors cursor-pointer ${
                          activeImage === src ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/25" : "border-border/60"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Ângulo ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {/* Medidas da Armação */}
            <div className="bg-background border border-border/30 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Ruler className="h-4 w-4 text-brand" />
                Medidas da Armação (mm)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center p-2 rounded-lg bg-card border border-border/20">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Haste</span>
                  <span className="text-sm font-black text-ink mt-1">{product.specsHaste || "140"}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-card border border-border/20">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Ponte</span>
                  <span className="text-sm font-black text-ink mt-1">{product.specsPonte || "18"}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-card border border-border/20">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Lente</span>
                  <span className="text-sm font-black text-ink mt-1">{product.specsLente || "53"}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-card border border-border/20">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Altura</span>
                  <span className="text-sm font-black text-ink mt-1">{product.specsAltura || "42"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito (Informações & Botões) */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            
            {/* Categoria / Gênero */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <span>{product.category || "Armação de Grau"}</span>
              <span className="text-brand">•</span>
              <span>{product.gender || "Unissex"}</span>
            </div>

            {/* Nome */}
            <h1 className="text-xl sm:text-2xl font-black leading-tight text-ink mb-3">
              {product.name}
            </h1>

            {/* Avaliações */}
            <div className="flex items-center gap-2 mb-6">
              <Stars />
              <span className="text-xs text-muted-foreground font-semibold">{product.reviews || "(24)"} avaliações</span>
            </div>

            {/* Preços */}
            <div className="bg-background border border-border/30 rounded-xl p-5 mb-6 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                {product.oldPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through font-medium">
                    {product.oldPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="text-[10px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {product.discount} OFF
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-brand leading-none">
                {product.price}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1">
                {product.installment || "ou 10x sem juros no cartão"}
              </p>
            </div>

            {/* Ações de Compra */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Seletor de Quantidade */}
                <div className="flex items-center border border-border rounded-lg bg-background p-1 self-start sm:self-auto h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-ink select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Botão de Compra */}
                <button
                  onClick={handleBuy}
                  className="flex-1 h-12 bg-brand hover:bg-brand-2 text-white font-bold text-sm tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {settings.buttonText || "COMPRAR AGORA"}
                </button>
              </div>

              {settings.showButton2 !== false && (
                <button
                  onClick={handleAddToCartOnly}
                  className="w-full h-12 bg-transparent hover:bg-white/5 border-2 border-brand text-brand hover:text-brand-2 font-bold text-sm tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  {settings.button2Text || "ADICIONAR À SACOLA"}
                </button>
              )}
            </div>

            {/* Simulador de Frete */}
            {settings.showShippingCalculator !== false && (
              <div className="border border-border/30 rounded-xl p-4 bg-background/50">
                <span className="text-xs font-bold text-ink uppercase tracking-wider block mb-2">
                  Calcular Frete e Prazo
                </span>
                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/[^0-9-]/g, ""))}
                    placeholder="Digite seu CEP (Ex: 01310-100)"
                    maxLength={9}
                    className="flex-1 h-10 px-3 bg-background border border-border rounded text-xs outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 bg-ink hover:bg-brand text-white font-bold text-xs rounded transition-colors cursor-pointer"
                  >
                    Calcular
                  </button>
                </form>

                {shippingResult && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-start gap-2.5 text-xs">
                    <Truck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-ink">PAC Correios: {shippingResult.cost}</p>
                      <p className="text-muted-foreground">Prazo estimado de entrega: {shippingResult.time}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Abas Descrição / Especificações */}
        <div className="mt-10 lg:mt-14 flex flex-col gap-6">
          <div className="flex border-b border-border/40">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 px-6 text-sm font-bold border-b-2 tracking-wide uppercase transition-colors cursor-pointer ${
                activeTab === "description"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              Descrição
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 px-6 text-sm font-bold border-b-2 tracking-wide uppercase transition-colors cursor-pointer ${
                activeTab === "specs"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              Especificações Técnicas
            </button>
          </div>

          <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 min-h-[150px]">
            {activeTab === "description" ? (
              <div className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p>
                    Armação moderna e ergonômica, fabricada com materiais nobres de altíssima qualidade que garantem leveza, conforto e grande durabilidade. 
                    Ideal para uso constante no cotidiano, proporcionando excelente encaixe e acabamento impecável para complementar seu visual com elegância e sofisticação.
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-2xl">
                <table className="w-full text-sm text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground w-1/3">Formato</td>
                      <td className="py-2.5 text-ink">{product.format || "Quadrado"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Gênero</td>
                      <td className="py-2.5 text-ink">{product.gender || "Unissex"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Material</td>
                      <td className="py-2.5 text-ink">{product.material || "Acetato"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Cor da Armação</td>
                      <td className="py-2.5 text-ink">{product.color || "preto"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Comprimento da Haste</td>
                      <td className="py-2.5 text-ink">{product.specsHaste ? `${product.specsHaste} mm` : "140 mm"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Tamanho da Ponte</td>
                      <td className="py-2.5 text-ink">{product.specsPonte ? `${product.specsPonte} mm` : "18 mm"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Largura da Lente</td>
                      <td className="py-2.5 text-ink">{product.specsLente ? `${product.specsLente} mm` : "53 mm"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2.5 font-bold text-muted-foreground">Altura da Lente</td>
                      <td className="py-2.5 text-ink">{product.specsAltura ? `${product.specsAltura} mm` : "42 mm"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
