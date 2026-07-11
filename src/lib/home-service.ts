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
    }>;
  };
  testimonials: {
    title: string;
    subtitle: string;
    list: Array<{
      name: string;
      text: string;
      imageKey: string;
    }>;
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
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
      },
      {
        name: "Ricardo S.",
        text: "A qualidade dos óculos é excelente. O modelo solar polarizado protege muito bem nos dias quentes.",
        imageKey: "client2",
      },
      {
        name: "Thiago L.",
        text: "Muito satisfeito! Entrega pontual, óculos bem embalado e design super moderno. Recomendo a todos.",
        imageKey: "client3",
      },
    ],
  },
  newsletter: {
    title: "Fique por dentro das novidades",
    subtitle: "Cadastre-se para receber ofertas exclusivas e descontos em primeira mão",
    placeholder: "Digite seu melhor e-mail",
    buttonText: "CADASTRAR",
  },
};

export async function fetchHomePageContent(): Promise<HomePageData> {
  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "home")
      .single();

    if (error || !data) {
      console.log("No home page content found in Supabase. Using fallback local data.");
      return DEFAULT_HOME_PAGE_DATA;
    }

    return (data.content as unknown) as HomePageData;
  } catch (err) {
    console.error("Failed to fetch home page content:", err);
    return DEFAULT_HOME_PAGE_DATA;
  }
}

export async function saveHomePageContent(content: HomePageData): Promise<boolean> {
  try {
    const { error } = await supabase.from("home_page_content").upsert({
      id: "home",
      content: content as any,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error upserting home page content:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Failed to save home page content:", err);
    return false;
  }
}
