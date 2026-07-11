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

import { useState, useEffect } from "react";
import { fetchHomePageContent, HomePageData, DEFAULT_HOME_PAGE_DATA } from "@/lib/home-service";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [homeData, setHomeData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);

  useEffect(() => {
    async function loadContent() {
      const data = await fetchHomePageContent();
      setHomeData(data);
    }
    loadContent();
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
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
