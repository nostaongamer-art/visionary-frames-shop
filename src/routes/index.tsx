import { createFileRoute } from "@tanstack/react-router";
import { PromoBar } from "@/components/site/PromoBar";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { BestSellers, CustomProductSection } from "@/components/site/BestSellers";
import { FlashBanner } from "@/components/site/FlashBanner";
import { Testimonials } from "@/components/site/Testimonials";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";
import { CustomBanner } from "@/components/site/CustomBanner";
import { Hero2 } from "@/components/site/Hero2";

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
    <div className="min-h-screen bg-background text-foreground">
      <PromoBar text={homeData.promoBar.text} />
      <Header />
      <main>
        {homeData.sectionOrder?.map((secKey) => {
          if (secKey === "hero") {
            return <Hero key="hero" data={homeData.hero} />;
          }
          if (secKey === "hero2") {
            return <Hero2 key="hero2" data={homeData.hero2 || { show: false }} />;
          }
          if (secKey === "categories") {
            return <Categories key="categories" data={homeData.categories} />;
          }
          if (secKey === "bestSellers") {
            return <BestSellers key="bestSellers" data={homeData.bestSellers} />;
          }
          if (secKey === "flash") {
            return <FlashBanner key="flash" />;
          }
          if (secKey === "testimonials") {
            return <Testimonials key="testimonials" data={homeData.testimonials} />;
          }
          if (secKey === "newsletter") {
            return <Newsletter key="newsletter" data={homeData.newsletter} />;
          }
          if (secKey.startsWith("custom-sec-")) {
            const customId = secKey.replace("custom-sec-", "");
            const customSec = homeData.customSections?.find((s) => s.id === customId);
            if (customSec) {
              return <CustomProductSection key={customSec.id} data={customSec as any} />;
            }
          }
          if (secKey.startsWith("custom-banner-")) {
            const customId = secKey.replace("custom-banner-", "");
            const customBanner = homeData.customBanners?.find((b) => b.id === customId);
            if (customBanner) {
              return <CustomBanner key={customBanner.id} data={customBanner} />;
            }
          }
          return null;
        })}
      </main>
      <Footer />
    </div>
  );
}
