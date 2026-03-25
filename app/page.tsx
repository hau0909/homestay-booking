import HeroSection from "@/src/components/home/HeroSection";
import LatestProperties from "@/src/components/home/LatestProperties";
import HostingBanner from "@/src/components/home/HostingBanner";
import MostBookedListings from "../src/components/home/MostBookedListings";
import TopRatedListings from "../src/components/home/TopRatedListings";

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      <LatestProperties />
      <MostBookedListings />
      <TopRatedListings />
      <HostingBanner />
    </div>
  );
}
