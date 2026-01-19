import HeroSection from "@/src/components/home/HeroSection";
import LatestProperties from "@/src/components/home/LatestProperties";
import NearbyProperties from "@/src/components/home/NearbyProperties";
import TopRatedProperties from "@/src/components/home/TopRatedProperties";
import HostingBanner from "@/src/components/home/HostingBanner";
import FeaturedProperties from "@/src/components/home/FeaturedProperties";
import BrowsePropertiesBanner from "@/src/components/home/BrowsePropertiesBanner";
import PropertyGuidesSection from "@/src/components/home/PropertyGuidesSection";
import DiscoverMoreSection from "@/src/components/home/DiscoverMoreSection";
export default function Home() {
  return (
    <div className="bg-[#E1EEBC]">
      <HeroSection />
      <LatestProperties />
      <NearbyProperties />
      <TopRatedProperties />
      <HostingBanner />
      <FeaturedProperties />
      <BrowsePropertiesBanner />
      <PropertyGuidesSection />
      <DiscoverMoreSection />
    </div>
  );
}
