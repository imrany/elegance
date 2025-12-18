import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewArrivals } from "@/components/home/NewArrivals";
import { LuxuryBanner } from "@/components/home/LuxuryBanner";
import { FeaturesSections } from "@/components/home/FeaturesSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <LuxuryBanner />
      <NewArrivals />
      <FeaturesSections />
    </Layout>
  );
};

export default Index;
