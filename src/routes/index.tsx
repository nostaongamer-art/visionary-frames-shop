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

import { fetchHomePageContent } from "@/lib/home-service";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async () => {
    return await fetchHomePageContent();
  },
});

function Index() {
  const homeData = Route.useLoaderData();

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <PromoBar text={homeData.promoBar.text} />
        <Header />
        <main>
          <Hero data={homeData.hero} />
          <Categories data={homeData.categories} />
          <BestSellers data={homeData.bestSellers} />
          <FlashBanner />
          <Testimonials data={homeData.testimonials} />
          <Newsletter data={homeData.newsletter} />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
