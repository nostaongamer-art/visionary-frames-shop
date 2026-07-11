import prod1 from "@/assets/prod-1.jpg";
import prod2 from "@/assets/prod-2.jpg";
import prod3 from "@/assets/prod-3.jpg";
import prod4 from "@/assets/prod-4.jpg";
import catMasc from "@/assets/cat-masculino.jpg";
import catFem from "@/assets/cat-feminino.jpg";
import catSolar from "@/assets/cat-solar.jpg";
import catPrem from "@/assets/cat-premium.jpg";
import client1 from "@/assets/client-1.jpg";
import client2 from "@/assets/client-2.jpg";
import client3 from "@/assets/client-3.jpg";

export const NAV_ITEMS = [
  { label: "INÍCIO", href: "#top", active: true },
  { label: "COLEÇÕES", href: "#categorias" },
  { label: "MASCULINO", href: "#categorias" },
  { label: "FEMININO", href: "#categorias" },
  { label: "SOLAR", href: "#categorias" },
  { label: "PREMIUM", href: "#categorias" },
  { label: "PROMOÇÕES", href: "#oferta" },
];

export type Category = {
  title: string;
  description: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  { title: "MASCULINO", description: "Estilo e atitude em cada detalhe", image: catMasc },
  { title: "FEMININO", description: "Sofisticação que realça sua beleza", image: catFem },
  { title: "SOLAR", description: "Proteção e estilo para todos os dias", image: catSolar },
  { title: "PREMIUM", description: "Exclusividade e design premium", image: catPrem },
];

export type Product = {
  id: number;
  name: string;
  discount: string;
  reviews: string;
  oldPrice: string;
  price: string;
  installment: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Armação Classic Black",
    discount: "-20%",
    reviews: "(128)",
    oldPrice: "R$ 249,90",
    price: "R$ 199,90",
    installment: "12x de R$ 19,90",
    image: prod1,
  },
  {
    id: 2,
    name: "Óculos Solar Premium",
    discount: "-15%",
    reviews: "(96)",
    oldPrice: "R$ 299,90",
    price: "R$ 254,90",
    installment: "12x de R$ 25,49",
    image: prod2,
  },
  {
    id: 3,
    name: "Armação Classic Tortoise",
    discount: "-25%",
    reviews: "(78)",
    oldPrice: "R$ 199,90",
    price: "R$ 149,90",
    installment: "12x de R$ 14,90",
    image: prod3,
  },
  {
    id: 4,
    name: "Óculos Solar Polarizado",
    discount: "-18%",
    reviews: "(156)",
    oldPrice: "R$ 329,90",
    price: "R$ 269,90",
    installment: "12x de R$ 26,99",
    image: prod4,
  },
];

export type Testimonial = {
  name: string;
  text: string;
  image: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Juliana M.",
    text: "Amei meu óculos! Chegou super rápido e a qualidade é incrível. Já virei cliente fiel da Glasses!",
    image: client1,
  },
  {
    name: "Ricardo S.",
    text: "Ótimo atendimento e produtos de alta qualidade. O óculos ficou perfeito em mim!",
    image: client2,
  },
  {
    name: "Fernanda L.",
    text: "Já comprei 2 vezes e sempre me surpreendo. Estilo, qualidade e preço justo!",
    image: client3,
  },
];

export const BRANDS = ["Ray-Ban", "OAKLEY", "GUCCI", "PRADA", "Dior", "vogue"];
