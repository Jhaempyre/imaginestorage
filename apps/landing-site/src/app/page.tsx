import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DeveloperSection from "@/components/landing/DeveloperSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DeveloperSection />
      <CTASection />
      <Footer />
      <Toaster />
    </div>
  );
}
