import HeroSection from "./components/HeroSection";
import LandingSections from "./components/LandingSections";
import LeadPopup from "./components/LeadPopup";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      <HeroSection />
      <LandingSections />
      <LeadPopup />
    </main>
  );
}