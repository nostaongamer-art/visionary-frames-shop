import { supabase } from "@/integrations/supabase/client";

export interface HomePageData {
  promoBar: {
    show?: boolean;
    text: string;
    showTimer?: boolean;
    timerDuration?: number;
  };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    imageUrl?: string;
    showBenefits?: boolean;
    benefits?: Array<{
      title: string;
      subtitle: string;
    }>;
    titleFont?: string;
    subtitleFont?: string;
    buttonFont?: string;
    secondaryButtonFont?: string;
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
      imageKey: string;
      imageUrl?: string;
    }>;
  };
  flashBanner: {
    show?: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    showTimer?: boolean;
    timerDuration?: number;
  };
  testimonials: {
    show?: boolean;
    title: string;
    subtitle: string;
    list: Array<{
      name: string;
      text: string;
      imageKey: string;
      imageUrl?: string;
    }>;
  };
  brands: {
    show?: boolean;
    list: string[];
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
    imageUrl?: string;
  };
  footer: {
    showSobre?: boolean;
    showSocials?: boolean;
    showInstitucional?: boolean;
    showAjuda?: boolean;
    showAtendimento?: boolean;
    showPayments?: boolean;
    description: string;
    instagramUrl: string;
    showInstagram?: boolean;
    facebookUrl: string;
    showFacebook?: boolean;
    whatsappUrl: string;
    showWhatsapp?: boolean;
    youtubeUrl: string;
    showYoutube?: boolean;
    institucionalTitle: string;
    institucionalLinks: Array<{ label: string; href: string; show?: boolean }>;
    ajudaTitle: string;
    ajudaLinks: Array<{ label: string; href: string; show?: boolean }>;
    atendimentoTitle: string;
    atendimentoLines: Array<{ text: string; show?: boolean }>;
    paymentsTitle: string;
    payments: Array<{ label: string; imageUrl?: string; show?: boolean }>;
  };
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

export const DEFAULT_HOME_PAGE_DATA: HomePageData = {
  promoBar: {
    show: true,
    text: "PROMOÇÃO POR TEMPO LIMITADO! 15% OFF EM TODO O SITE + FRETE GRÁTIS",
    showTimer: true,
    timerDuration: 2 * 3600 + 15 * 60 + 30, // 8130 seconds
  },
  hero: {
    title: "Encontre o\nÓculos Perfeito\nPara Seu Estilo",
    subtitle: "Mais de 200 modelos exclusivos para transformar sua aparência e sua confiança.",
    buttonText: "COMPRAR AGORA",
    buttonLink: "#mais-vendidos",
    secondaryButtonText: "VER COLEÇÃO",
    secondaryButtonLink: "#categorias",
    imageUrl: "",
    showBenefits: true,
    benefits: [
      { title: "FRETE GRÁTIS", subtitle: "Para todo Brasil" },
      { title: "TROCA GARANTIDA", subtitle: "Até 7 dias após o recebimento" },
      { title: "10.000+ CLIENTES", subtitle: "Satisfeitos" },
      { title: "ATÉ 12X SEM JUROS", subtitle: "No cartão de crédito" },
    ],
    titleFont: "default",
    subtitleFont: "default",
    buttonFont: "default",
    secondaryButtonFont: "default",
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
  flashBanner: {
    show: true,
    title: "15% OFF EM TODO O SITE!",
    subtitle: "Aproveite agora e garanta o seu favorito.",
    buttonText: "APROVEITAR AGORA",
    buttonLink: "#mais-vendidos",
    showTimer: true,
    timerDuration: 2 * 3600 + 15 * 60 + 23, // 8123 seconds
  },
  testimonials: {
    show: true,
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
  brands: {
    show: true,
    list: ["Ray-Ban", "OAKLEY", "GUCCI", "PRADA", "Dior", "vogue"],
  },
  newsletter: {
    title: "Fique por dentro das novidades",
    subtitle: "Cadastre-se para receber ofertas exclusivas e descontos em primeira mão",
    placeholder: "Digite seu melhor e-mail",
    buttonText: "CADASTRAR",
    imageUrl: "",
  },
  footer: {
    showSobre: true,
    showSocials: true,
    showInstitucional: true,
    showAjuda: true,
    showAtendimento: true,
    showPayments: true,
    description: "A Glasses nasceu para transformar seu estilo e sua visão. Aqui você encontra os melhores óculos com qualidade e preço justo.",
    instagramUrl: "#",
    showInstagram: true,
    facebookUrl: "#",
    showFacebook: true,
    whatsappUrl: "#",
    showWhatsapp: true,
    youtubeUrl: "#",
    showYoutube: true,
    institucionalTitle: "INSTITUCIONAL",
    institucionalLinks: [
      { label: "Sobre Nós", href: "#", show: true },
      { label: "Nossa Loja", href: "#", show: true },
      { label: "Política de Privacidade", href: "#", show: true },
      { label: "Trocas e Devoluções", href: "#", show: true },
      { label: "Termos de Uso", href: "#", show: true },
    ],
    ajudaTitle: "AJUDA",
    ajudaLinks: [
      { label: "Como Comprar", href: "#", show: true },
      { label: "Formas de Pagamento", href: "#", show: true },
      { label: "Prazos de Entrega", href: "#", show: true },
      { label: "Rastreamento", href: "#", show: true },
      { label: "Perguntas Frequentes", href: "#", show: true },
    ],
    atendimentoTitle: "ATENDIMENTO",
    atendimentoLines: [
      { text: "WhatsApp", show: true },
      { text: "E-mail", show: true },
      { text: "Horário de Atendimento", show: true },
      { text: "Seg a Sex 08h às 18h", show: true },
    ],
    paymentsTitle: "FORMAS DE PAGAMENTO",
    payments: [
      { label: "Visa", imageUrl: "", show: true },
      { label: "Master", imageUrl: "", show: true },
      { label: "Amex", imageUrl: "", show: true },
      { label: "Boleto", imageUrl: "", show: true },
      { label: "Pix", imageUrl: "", show: true },
    ],
  },
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
      return `https://lh3.googleusercontent.com/d/${matchD[1]}`;
    }
    
    // Query format: ?id=FILE_ID
    const regId = /[?&]id=([a-zA-Z0-9_-]+)/;
    const matchId = trimmed.match(regId);
    if (matchId && matchId[1]) {
      return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }
    
    // Folders path should not be loaded directly as an image, return original
    if (trimmed.includes("/folders/")) {
      return trimmed;
    }
  }
  
  return trimmed;
}

function mergeWithDefaults(saved: any): HomePageData {
  // Safe helper to merge arrays of links
  const mergeLinks = (savedLinks: any[], defaultLinks: any[]) => {
    if (!Array.isArray(savedLinks)) return defaultLinks;
    return defaultLinks.map((defaultLink, idx) => {
      const savedLink = savedLinks[idx] || {};
      return {
        label: savedLink.label !== undefined ? savedLink.label : defaultLink.label,
        href: savedLink.href !== undefined ? savedLink.href : defaultLink.href,
        show: savedLink.show !== undefined ? savedLink.show : true,
      };
    });
  };

  // Safe helper for atendimento lines
  const mergeAtendimento = (savedLines: any[], defaultLines: any[]) => {
    if (!Array.isArray(savedLines)) return defaultLinks;
    return defaultLines.map((defaultLine, idx) => {
      const savedLine = savedLines[idx];
      if (typeof savedLine === "string") {
        return { text: savedLine, show: true };
      }
      return {
        text: savedLine?.text !== undefined ? savedLine.text : defaultLine.text,
        show: savedLine?.show !== undefined ? savedLine.show : true,
      };
    });
  };

  // Safe helper for payments
  const mergePayments = (savedPayments: any[], defaultPayments: any[]) => {
    if (!Array.isArray(savedPayments)) return defaultPayments;
    return defaultPayments.map((defaultPayment, idx) => {
      const savedPayment = savedPayments[idx];
      if (typeof savedPayment === "string") {
        return { label: savedPayment, imageUrl: "", show: true };
      }
      return {
        label: savedPayment?.label !== undefined ? savedPayment.label : defaultPayment.label,
        imageUrl: savedPayment?.imageUrl !== undefined ? savedPayment.imageUrl : defaultPayment.imageUrl,
        show: savedPayment?.show !== undefined ? savedPayment.show : true,
      };
    });
  };

  const defaultFooter = DEFAULT_HOME_PAGE_DATA.footer;
  const savedFooter = saved.footer || {};

  return {
    promoBar: {
      show: saved.promoBar?.show !== undefined ? saved.promoBar.show : true,
      text: saved.promoBar?.text !== undefined ? saved.promoBar.text : DEFAULT_HOME_PAGE_DATA.promoBar.text,
      showTimer: saved.promoBar?.showTimer !== undefined ? saved.promoBar.showTimer : true,
      timerDuration: saved.promoBar?.timerDuration !== undefined ? saved.promoBar.timerDuration : DEFAULT_HOME_PAGE_DATA.promoBar.timerDuration,
    },
    hero: {
      ...DEFAULT_HOME_PAGE_DATA.hero,
      ...saved.hero,
      showBenefits: saved.hero?.showBenefits !== undefined ? saved.hero.showBenefits : true,
      benefits: Array.isArray(saved.hero?.benefits) ? DEFAULT_HOME_PAGE_DATA.hero.benefits!.map((defaultBenefit, idx) => {
        const savedBenefit = saved.hero.benefits[idx] || {};
        return {
          title: savedBenefit.title !== undefined ? savedBenefit.title : defaultBenefit.title,
          subtitle: savedBenefit.subtitle !== undefined ? savedBenefit.subtitle : defaultBenefit.subtitle,
        };
      }) : DEFAULT_HOME_PAGE_DATA.hero.benefits,
      titleFont: saved.hero?.titleFont || "default",
      subtitleFont: saved.hero?.subtitleFont || "default",
      buttonFont: saved.hero?.buttonFont || "default",
      secondaryButtonFont: saved.hero?.secondaryButtonFont || "default",
    },
    categories: saved.categories || DEFAULT_HOME_PAGE_DATA.categories,
    bestSellers: {
      title: saved.bestSellers?.title || DEFAULT_HOME_PAGE_DATA.bestSellers.title,
      subtitle: saved.bestSellers?.subtitle || DEFAULT_HOME_PAGE_DATA.bestSellers.subtitle,
      products: (saved.bestSellers?.products || DEFAULT_HOME_PAGE_DATA.bestSellers.products).map((prod: any, idx: number) => ({
        ...DEFAULT_HOME_PAGE_DATA.bestSellers.products[idx],
        ...prod
      }))
    },
    flashBanner: {
      show: saved.flashBanner?.show !== undefined ? saved.flashBanner.show : true,
      title: saved.flashBanner?.title !== undefined ? saved.flashBanner.title : DEFAULT_HOME_PAGE_DATA.flashBanner.title,
      subtitle: saved.flashBanner?.subtitle !== undefined ? saved.flashBanner.subtitle : DEFAULT_HOME_PAGE_DATA.flashBanner.subtitle,
      buttonText: saved.flashBanner?.buttonText !== undefined ? saved.flashBanner.buttonText : DEFAULT_HOME_PAGE_DATA.flashBanner.buttonText,
      buttonLink: saved.flashBanner?.buttonLink !== undefined ? saved.flashBanner.buttonLink : DEFAULT_HOME_PAGE_DATA.flashBanner.buttonLink,
      showTimer: saved.flashBanner?.showTimer !== undefined ? saved.flashBanner.showTimer : true,
      timerDuration: saved.flashBanner?.timerDuration !== undefined ? saved.flashBanner.timerDuration : DEFAULT_HOME_PAGE_DATA.flashBanner.timerDuration,
    },
    testimonials: {
      show: saved.testimonials?.show !== undefined ? saved.testimonials.show : true,
      title: saved.testimonials?.title || DEFAULT_HOME_PAGE_DATA.testimonials.title,
      subtitle: saved.testimonials?.subtitle || DEFAULT_HOME_PAGE_DATA.testimonials.subtitle,
      list: Array.isArray(saved.testimonials?.list) ? saved.testimonials.list.map((t: any, idx: number) => ({
        name: t?.name !== undefined ? t.name : "",
        text: t?.text !== undefined ? t.text : "",
        imageKey: t?.imageKey !== undefined ? t.imageKey : `client${idx + 1}`,
        imageUrl: t?.imageUrl !== undefined ? t.imageUrl : "",
      })) : DEFAULT_HOME_PAGE_DATA.testimonials.list,
    },
    brands: {
      show: saved.brands?.show !== undefined ? saved.brands.show : true,
      list: Array.isArray(saved.brands?.list) ? saved.brands.list : DEFAULT_HOME_PAGE_DATA.brands.list,
    },
    newsletter: { ...DEFAULT_HOME_PAGE_DATA.newsletter, ...saved.newsletter },
    footer: {
      showSobre: savedFooter.showSobre !== undefined ? savedFooter.showSobre : defaultFooter.showSobre,
      showSocials: savedFooter.showSocials !== undefined ? savedFooter.showSocials : defaultFooter.showSocials,
      showInstitucional: savedFooter.showInstitucional !== undefined ? savedFooter.showInstitucional : defaultFooter.showInstitucional,
      showAjuda: savedFooter.showAjuda !== undefined ? savedFooter.showAjuda : defaultFooter.showAjuda,
      showAtendimento: savedFooter.showAtendimento !== undefined ? savedFooter.showAtendimento : defaultFooter.showAtendimento,
      showPayments: savedFooter.showPayments !== undefined ? savedFooter.showPayments : defaultFooter.showPayments,
      description: savedFooter.description !== undefined ? savedFooter.description : defaultFooter.description,
      instagramUrl: savedFooter.instagramUrl !== undefined ? savedFooter.instagramUrl : defaultFooter.instagramUrl,
      showInstagram: savedFooter.showInstagram !== undefined ? savedFooter.showInstagram : defaultFooter.showInstagram,
      facebookUrl: savedFooter.facebookUrl !== undefined ? savedFooter.facebookUrl : defaultFooter.facebookUrl,
      showFacebook: savedFooter.showFacebook !== undefined ? savedFooter.showFacebook : defaultFooter.showFacebook,
      whatsappUrl: savedFooter.whatsappUrl !== undefined ? savedFooter.whatsappUrl : defaultFooter.whatsappUrl,
      showWhatsapp: savedFooter.showWhatsapp !== undefined ? savedFooter.showWhatsapp : defaultFooter.showWhatsapp,
      youtubeUrl: savedFooter.youtubeUrl !== undefined ? savedFooter.youtubeUrl : defaultFooter.youtubeUrl,
      showYoutube: savedFooter.showYoutube !== undefined ? savedFooter.showYoutube : defaultFooter.showYoutube,
      institucionalTitle: savedFooter.institucionalTitle !== undefined ? savedFooter.institucionalTitle : defaultFooter.institucionalTitle,
      institucionalLinks: mergeLinks(savedFooter.institucionalLinks, defaultFooter.institucionalLinks),
      ajudaTitle: savedFooter.ajudaTitle !== undefined ? savedFooter.ajudaTitle : defaultFooter.ajudaTitle,
      ajudaLinks: mergeLinks(savedFooter.ajudaLinks, defaultFooter.ajudaLinks),
      atendimentoTitle: savedFooter.atendimentoTitle !== undefined ? savedFooter.atendimentoTitle : defaultFooter.atendimentoTitle,
      atendimentoLines: mergeAtendimento(savedFooter.atendimentoLines, defaultFooter.atendimentoLines),
      paymentsTitle: savedFooter.paymentsTitle !== undefined ? savedFooter.paymentsTitle : defaultFooter.paymentsTitle,
      payments: mergePayments(savedFooter.payments, defaultFooter.payments),
    },
    colors: {
      brand: saved.colors?.brand !== undefined ? saved.colors.brand : DEFAULT_HOME_PAGE_DATA.colors!.brand,
      brandHover: saved.colors?.brandHover !== undefined ? saved.colors.brandHover : DEFAULT_HOME_PAGE_DATA.colors!.brandHover,
      ink: saved.colors?.ink !== undefined ? saved.colors.ink : DEFAULT_HOME_PAGE_DATA.colors!.ink,
      ink2: saved.colors?.ink2 !== undefined ? saved.colors.ink2 : DEFAULT_HOME_PAGE_DATA.colors!.ink2,
      ink3: saved.colors?.ink3 !== undefined ? saved.colors.ink3 : DEFAULT_HOME_PAGE_DATA.colors!.ink3,
      banner: saved.colors?.banner !== undefined ? saved.colors.banner : DEFAULT_HOME_PAGE_DATA.colors!.banner,
      hairline: saved.colors?.hairline !== undefined ? saved.colors.hairline : DEFAULT_HOME_PAGE_DATA.colors!.hairline,
      background: saved.colors?.background !== undefined ? saved.colors.background : DEFAULT_HOME_PAGE_DATA.colors!.background,
      foreground: saved.colors?.foreground !== undefined ? saved.colors.foreground : DEFAULT_HOME_PAGE_DATA.colors!.foreground,
      logoAccent: saved.colors?.logoAccent !== undefined ? saved.colors.logoAccent : DEFAULT_HOME_PAGE_DATA.colors!.logoAccent,
      logoText: saved.colors?.logoText !== undefined ? saved.colors.logoText : DEFAULT_HOME_PAGE_DATA.colors!.logoText,
    },
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
