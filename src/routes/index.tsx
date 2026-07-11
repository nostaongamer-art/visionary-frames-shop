import { createFileRoute } from "@tanstack/react-router";
import { CartProvider } from "@/hooks/use-cart";
import { PromoBar } from "@/components/site/PromoBar";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { BestSellers } from "@/components/site/BestSellers";
import { FlashBanner } from "@/components/site/FlashBanner";
import { Testimonials } from "@/components/site/Testimonials";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <PromoBar />
        <Header />
        <main>
          <Hero />
          <Categories />
          <BestSellers />
          <FlashBanner />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
