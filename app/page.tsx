import HeroSection from "@/src/components/home/HeroSection";
import LatestProperties from "@/src/components/home/LatestProperties";
import NearbyProperties from "@/src/components/home/NearbyProperties";
import TopRatedProperties from "@/src/components/home/TopRatedProperties";
import HostingBanner from "@/src/components/home/HostingBanner";

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      <LatestProperties />
      <NearbyProperties />
      <TopRatedProperties />
      <HostingBanner />
    </div>
  );
}
