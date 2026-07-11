import { supabase } from "@/integrations/supabase/client";

export interface HomePageData {
  promoBar: {
    text: string;
  };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    imageUrl?: string;
  };
  categories: {
    list: Array<{
      title: string;
      description: string;
      imageKey: string;
      imageUrl?: string;
    }>;
  };
  bestSellers: {
    title: string;
    subtitle: string;
    products: Array<{
      id: number;
      name: string;
      discount: string;
      reviews: string;
      oldPrice: string;
      price: string;
      installment: string;
      imageKey: string; // fallback matching key in local images
      imageUrl?: string;
    }>;
  };
  testimonials: {
    title: string;
    subtitle: string;
    list: Array<{
      name: string;
      text: string;
      imageKey: string;
      imageUrl?: string;
    }>;
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
    imageUrl?: string;
  };
}

export const DEFAULT_HOME_PAGE_DATA: HomePageData = {
  promoBar: {
    text: "PROMOÇÃO POR TEMPO LIMITADO! 15% OFF EM TODO O SITE + FRETE GRÁTIS",
  },
  hero: {
    title: "Encontre o\nÓculos Perfeito\nPara Seu Estilo",
    subtitle: "Mais de 200 modelos exclusivos para transformar sua aparência e sua confiança.",
    buttonText: "COMPRAR AGORA",
    buttonLink: "#mais-vendidos",
    secondaryButtonText: "VER COLEÇÃO",
    secondaryButtonLink: "#categorias",
    imageUrl: "",
  },
  categories: {
    list: [
      { title: "MASCULINO", description: "Estilo e atitude em cada detalhe", imageKey: "catMasc", imageUrl: "" },
      { title: "FEMININO", description: "Sofisticação que realça sua beleza", imageKey: "catFem", imageUrl: "" },
      { title: "SOLAR", description: "Proteção e estilo para todos os dias", imageKey: "catSolar", imageUrl: "" },
      { title: "PREMIUM", description: "Exclusividade e design premium", imageKey: "catPrem", imageUrl: "" },
    ],
  },
  bestSellers: {
    title: "Mais Vendidos",
    subtitle: "Os modelos favoritos de nossos clientes com descontos especiais",
    products: [
      {
        id: 1,
        name: "Armação Classic Black",
        discount: "-20%",
        reviews: "(128)",
        oldPrice: "R$ 249,90",
        price: "R$ 199,90",
        installment: "12x de R$ 19,90",
        imageKey: "prod1",
        imageUrl: "",
      },
      {
        id: 2,
        name: "Óculos Solar Premium",
        discount: "-15%",
        reviews: "(96)",
        oldPrice: "R$ 299,90",
        price: "R$ 254,90",
        installment: "12x de R$ 25,49",
        imageKey: "prod2",
        imageUrl: "",
      },
      {
        id: 3,
        name: "Armação Classic Tortoise",
        discount: "-25%",
        reviews: "(78)",
        oldPrice: "R$ 199,90",
        price: "R$ 149,90",
        installment: "12x de R$ 14,90",
        imageKey: "prod3",
        imageUrl: "",
      },
      {
        id: 4,
        name: "Óculos Solar Polarizado",
        discount: "-18%",
        reviews: "(156)",
        oldPrice: "R$ 329,90",
        price: "R$ 269,90",
        installment: "12x de R$ 26,99",
        imageKey: "prod4",
        imageUrl: "",
      },
    ],
  },
  testimonials: {
    title: "O Que Dizem Nossos Clientes",
    subtitle: "A opinião de quem já usa e aprova a qualidade da Glasses",
    list: [
      {
        name: "Juliana M.",
        text: "Amei meu óculos! Chegou super rápido e a qualidade é incrível. Já virei cliente fiel da Glasses!",
        imageKey: "client1",
        imageUrl: "",
      },
      {
        name: "Ricardo S.",
        text: "A qualidade dos óculos é excelente. O modelo solar polarizado protege muito bem nos dias quentes.",
        imageKey: "client2",
        imageUrl: "",
      },
      {
        name: "Thiago L.",
        text: "Muito satisfeito! Entrega pontual, óculos bem embalado e design super moderno. Recomendo a todos.",
        imageKey: "client3",
        imageUrl: "",
      },
    ],
  },
  newsletter: {
    title: "Fique por dentro das novidades",
    subtitle: "Cadastre-se para receber ofertas exclusivas e descontos em primeira mão",
    placeholder: "Digite seu melhor e-mail",
    buttonText: "CADASTRAR",
    imageUrl: "",
  },
};

/**
 * Converts a Google Drive shareable link into a direct download/image render link
 */
export function getDirectDriveUrl(url: string): string {
  if (!url) return "";
  
  // Trim spaces
  const trimmed = url.trim();
  
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    // Standard format: /file/d/FILE_ID/view
    const regD = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const matchD = trimmed.match(regD);
    if (matchD && matchD[1]) {
      return `https://docs.google.com/uc?export=download&id=${matchD[1]}`;
    }
    
    // Query format: ?id=FILE_ID
    const regId = /[?&]id=([a-zA-Z0-9_-]+)/;
    const matchId = trimmed.match(regId);
    if (matchId && matchId[1]) {
      return `https://docs.google.com/uc?export=download&id=${matchId[1]}`;
    }
    
    // Folders path should not be loaded directly as an image, return original
    if (trimmed.includes("/folders/")) {
      return trimmed;
    }
  }
  
  return trimmed;
}

function mergeWithDefaults(saved: any): HomePageData {
  return {
    promoBar: saved.promoBar || DEFAULT_HOME_PAGE_DATA.promoBar,
    hero: { ...DEFAULT_HOME_PAGE_DATA.hero, ...saved.hero },
    categories: saved.categories || DEFAULT_HOME_PAGE_DATA.categories,
    bestSellers: {
      title: saved.bestSellers?.title || DEFAULT_HOME_PAGE_DATA.bestSellers.title,
      subtitle: saved.bestSellers?.subtitle || DEFAULT_HOME_PAGE_DATA.bestSellers.subtitle,
      products: (saved.bestSellers?.products || DEFAULT_HOME_PAGE_DATA.bestSellers.products).map((prod: any, idx: number) => ({
        ...DEFAULT_HOME_PAGE_DATA.bestSellers.products[idx],
        ...prod
      }))
    },
    testimonials: {
      title: saved.testimonials?.title || DEFAULT_HOME_PAGE_DATA.testimonials.title,
      subtitle: saved.testimonials?.subtitle || DEFAULT_HOME_PAGE_DATA.testimonials.subtitle,
      list: (saved.testimonials?.list || DEFAULT_HOME_PAGE_DATA.testimonials.list).map((t: any, idx: number) => ({
        ...DEFAULT_HOME_PAGE_DATA.testimonials.list[idx],
        ...t
      }))
    },
    newsletter: { ...DEFAULT_HOME_PAGE_DATA.newsletter, ...saved.newsletter },
  };
}

export async function fetchHomePageContent(): Promise<HomePageData> {
  // 1. Tentar ler do localStorage primeiro para carregamento instantâneo no cliente
  let localFallback: HomePageData | null = null;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("glasses_home_page_content");
      if (cached) {
        localFallback = JSON.parse(cached);
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
  }

  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "home")
      .single();

    if (error || !data) {
      console.log("No home page content found in Supabase. Using fallback.", error);
      return localFallback || DEFAULT_HOME_PAGE_DATA;
    }

    const saved = data.content as any;
    const merged = mergeWithDefaults(saved);

    // Salvar no localStorage local
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("glasses_home_page_content", JSON.stringify(merged));
      } catch (e) {
        console.error("Failed to write to localStorage:", e);
      }
    }

    return merged;
  } catch (err) {
    console.error("Failed to fetch home page content:", err);
    return localFallback || DEFAULT_HOME_PAGE_DATA;
  }
}

export interface SaveResult {
  success: boolean;
  error?: string;
  isLocalOnly?: boolean;
}

export async function saveHomePageContent(content: HomePageData): Promise<SaveResult> {
  // Salvar no localStorage local imediatamente para atualização rápida do cliente
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("glasses_home_page_content", JSON.stringify(content));
      
      // Emit a storage event or dispatch custom event to notify components in current page
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to write to localStorage during save:", e);
    }
  }

  try {
    const { error } = await supabase.from("home_page_content").upsert({
      id: "home",
      content: content as any,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error upserting home page content to Supabase:", error);
      return { success: true, isLocalOnly: true, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save home page content to Supabase:", err);
    return { success: true, isLocalOnly: true, error: err.message || "Erro desconhecido" };
  }
}
