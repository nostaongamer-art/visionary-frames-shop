import { supabase } from "@/integrations/supabase/client";

export interface PageProduct {
  id: number;
  name: string;
  discount: string;
  reviews: string;
  oldPrice: string;
  price: string;
  priceVal: number;
  installment: string;
  imageUrl?: string;
  category: string;
  format: string;
  material: string;
  color: string;
  rating: number;
  sales: number;
}

export interface CategoryPageData {
  header: {
    show?: boolean;
    title: string;
    subtitle: string;
    imageUrl?: string;
  };
  benefits: {
    show?: boolean;
    list: Array<{
      title: string;
      subtitle: string;
      iconKey: string;
    }>;
  };
  products: PageProduct[];
  colors?: {
    brand?: string;
    brandHover?: string;
    ink?: string;
    ink2?: string;
    ink3?: string;
    banner?: string;
    hairline?: string;
    background?: string;
    foreground?: string;
    logoAccent?: string;
    logoText?: string;
  };
}

export const DEFAULT_BENEFITS = [
  { title: "FRETE GRÁTIS", subtitle: "Para todo Brasil", iconKey: "Truck" },
  { title: "TROCA GARANTIDA", subtitle: "Até 7 dias pós recebimento", iconKey: "ShieldCheck" },
  { title: "ATÉ 12X SEM JUROS", subtitle: "No cartão de crédito", iconKey: "CreditCard" },
  { title: "10.000+ CLIENTES", subtitle: "Satisfeitos", iconKey: "Users" },
  { title: "COMPRA 100% SEGURA", subtitle: "Seus dados protegidos", iconKey: "ShieldCheck" },
];

export const MOCK_BASE_PRODUCTS: PageProduct[] = [
  {
    id: 1,
    name: "Armação Classic Black",
    discount: "-20%",
    reviews: "(128)",
    oldPrice: "R$ 249,90",
    price: "R$ 199,90",
    priceVal: 199.9,
    installment: "12x de R$ 19,90",
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
    priceVal: 254.9,
    installment: "12x de R$ 25,49",
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
    priceVal: 149.9,
    installment: "12x de R$ 14,90",
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
    priceVal: 269.9,
    installment: "12x de R$ 26,99",
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
    priceVal: 251.9,
    installment: "12x de R$ 25,19",
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
    priceVal: 179.9,
    installment: "12x de R$ 17,90",
    category: "Óculos de Sol",
    format: "Aviador",
    material: "Metal",
    color: "preto",
    rating: 5,
    sales: 140
  },
];

export const DEFAULT_PAGES_DATA: Record<string, CategoryPageData> = {
  colecoes: {
    header: {
      show: true,
      title: "Nossas Coleções",
      subtitle: "Explore as linhas exclusivas e encontre a armação ideal.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[0], id: 1, name: "Coleção Armação Classic Black" },
      { ...MOCK_BASE_PRODUCTS[1], id: 2, name: "Coleção Óculos Solar Premium" },
      { ...MOCK_BASE_PRODUCTS[2], id: 3, name: "Coleção Classic Tortoise" },
      { ...MOCK_BASE_PRODUCTS[3], id: 4, name: "Coleção Solar Polarizado" },
      { ...MOCK_BASE_PRODUCTS[4], id: 5, name: "Coleção Titanium Flex" },
      { ...MOCK_BASE_PRODUCTS[5], id: 6, name: "Coleção Solar Aviador" },
    ],
  },
  masculino: {
    header: {
      show: true,
      title: "Óculos Masculinos",
      subtitle: "Estilo, atitude e proteção para todos os momentos.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[0], id: 1 },
      { ...MOCK_BASE_PRODUCTS[1], id: 2 },
      { ...MOCK_BASE_PRODUCTS[2], id: 3 },
      { ...MOCK_BASE_PRODUCTS[3], id: 4 },
      { ...MOCK_BASE_PRODUCTS[4], id: 5 },
      { ...MOCK_BASE_PRODUCTS[5], id: 6 },
    ],
  },
  feminino: {
    header: {
      show: true,
      title: "Óculos Femininos",
      subtitle: "Elegância, sofisticação e leveza em designs únicos.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[0], id: 1, name: "Armação Feminina Cateye", format: "Gatinho", color: "marrom" },
      { ...MOCK_BASE_PRODUCTS[1], id: 2, name: "Óculos Solar Feminino Chic", color: "vermelho" },
      { ...MOCK_BASE_PRODUCTS[2], id: 3, name: "Armação Acetato Elegance", color: "transparente" },
      { ...MOCK_BASE_PRODUCTS[3], id: 4, name: "Óculos Solar Diva Gold", material: "Metal", color: "dourado" },
      { ...MOCK_BASE_PRODUCTS[4], id: 5, name: "Armação Round Slim", format: "Redondo", color: "cinza" },
      { ...MOCK_BASE_PRODUCTS[5], id: 6, name: "Óculos Solar Oversized", format: "Quadrado", color: "preto" },
    ],
  },
  solar: {
    header: {
      show: true,
      title: "Óculos de Sol",
      subtitle: "Proteção UV premium com o máximo de estilo sob o sol.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[1], id: 1 },
      { ...MOCK_BASE_PRODUCTS[3], id: 2 },
      { ...MOCK_BASE_PRODUCTS[5], id: 3 },
      { ...MOCK_BASE_PRODUCTS[1], id: 4, name: "Solar Wayfarer Gold", color: "dourado" },
      { ...MOCK_BASE_PRODUCTS[3], id: 5, name: "Solar Polarizado Sport", material: "TR90" },
      { ...MOCK_BASE_PRODUCTS[5], id: 6, name: "Solar Aviador Retro", material: "Metal" },
    ],
  },
  premium: {
    header: {
      show: true,
      title: "Linha Premium",
      subtitle: "Modelos exclusivos em Titânio e Acetato Italiano de altíssima qualidade.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[4], id: 1, name: "Titanium Premium Round" },
      { ...MOCK_BASE_PRODUCTS[0], id: 2, name: "Acetato Italiano Classic", material: "Acetato" },
      { ...MOCK_BASE_PRODUCTS[1], id: 3, name: "Solar Premium Hexagonal", format: "Hexagonal" },
      { ...MOCK_BASE_PRODUCTS[4], id: 4, name: "Titanium Flex Square", format: "Quadrado" },
    ],
  },
  promocoes: {
    header: {
      show: true,
      title: "Promoções Especiais",
      subtitle: "As melhores ofertas e descontos imperdíveis por tempo limitado.",
      imageUrl: "",
    },
    benefits: {
      show: true,
      list: [...DEFAULT_BENEFITS],
    },
    products: [
      { ...MOCK_BASE_PRODUCTS[0], id: 1, discount: "-40%", price: "R$ 149,90", priceVal: 149.9 },
      { ...MOCK_BASE_PRODUCTS[2], id: 2, discount: "-50%", price: "R$ 99,90", priceVal: 99.9 },
      { ...MOCK_BASE_PRODUCTS[5], id: 3, discount: "-30%", price: "R$ 159,90", priceVal: 159.9 },
    ],
  },
};

export async function fetchPageContent(pageId: string): Promise<CategoryPageData> {
  const defaultData = DEFAULT_PAGES_DATA[pageId] || DEFAULT_PAGES_DATA.colecoes;
  let localFallback = defaultData;

  // 1. Tentar carregar do localStorage primeiro
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`glasses_page_content_${pageId}`);
      if (cached) {
        localFallback = JSON.parse(cached);
      }
    } catch (e) {
      console.error(`Failed to read page ${pageId} from localStorage:`, e);
    }
  }

  // 2. Tentar buscar do Supabase
  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", pageId)
      .single();

    if (error || !data) {
      return localFallback;
    }

    const saved = data.content as any;
    const merged = {
      header: {
        ...defaultData.header,
        ...saved.header,
      },
      benefits: {
        show: saved.benefits?.show !== undefined ? saved.benefits.show : defaultData.benefits.show,
        list: Array.isArray(saved.benefits?.list) ? saved.benefits.list.map((b: any, idx: number) => {
          const defaultB = defaultData.benefits.list[idx] || {};
          return {
            title: b?.title !== undefined ? b.title : defaultB.title,
            subtitle: b?.subtitle !== undefined ? b.subtitle : defaultB.subtitle,
            iconKey: b?.iconKey !== undefined ? b.iconKey : defaultB.iconKey,
          };
        }) : defaultData.benefits.list,
      },
      products: Array.isArray(saved.products) ? saved.products.map((p: any) => ({
        id: typeof p.id === "number" ? p.id : Math.random(),
        name: p.name || "",
        discount: p.discount || "",
        reviews: p.reviews || "(0)",
        oldPrice: p.oldPrice || "",
        price: p.price || "",
        priceVal: typeof p.priceVal === "number" ? p.priceVal : 0,
        installment: p.installment || "",
        imageUrl: p.imageUrl || "",
        category: p.category || "Armação de Grau",
        format: p.format || "Quadrado",
        material: p.material || "Acetato",
        color: p.color || "preto",
        rating: typeof p.rating === "number" ? p.rating : 5,
        sales: typeof p.sales === "number" ? p.sales : 100,
      })) : defaultData.products,
      colors: saved.colors || defaultData.colors,
    };

    // Salvar localmente
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`glasses_page_content_${pageId}`, JSON.stringify(merged));
      } catch (e) {
        console.error(`Failed to write page ${pageId} to localStorage:`, e);
      }
    }

    return merged;
  } catch (err) {
    console.error(`Failed to fetch page content for ${pageId}:`, err);
    return localFallback;
  }
}

export interface SaveResult {
  success: boolean;
  error?: string;
  isLocalOnly?: boolean;
}

export async function savePageContent(pageId: string, content: CategoryPageData): Promise<SaveResult> {
  // Salvar localmente
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`glasses_page_content_${pageId}`, JSON.stringify(content));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(`Failed to write page ${pageId} to localStorage during save:`, e);
    }
  }

  try {
    const { error } = await supabase.from("home_page_content").upsert({
      id: pageId,
      content: content as any,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error upserting page content for ${pageId} to Supabase:`, error);
      return { success: true, isLocalOnly: true, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`Failed to save page content for ${pageId} to Supabase:`, err);
    return { success: true, isLocalOnly: true, error: err.message || "Erro desconhecido" };
  }
}
