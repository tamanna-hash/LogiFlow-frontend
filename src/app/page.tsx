import type { Metadata } from "next";
import { CtaSection } from "@/components/home/CtaSection";
import { DeliveryTypesSection } from "@/components/home/DeliveryTypesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MarqueeSection } from "@/components/home/MarqueeSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { StatsSection } from "@/components/home/StatsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { PublicNav } from "@/components/shared/nav/PublicNav";
import { APP_NAME } from "@/config";

export const metadata: Metadata = {
  title: `${APP_NAME} — Fast, Reliable Courier & Logistics`,
  description:
    "Bangladesh's trusted courier and logistics management platform. Book, track, and manage shipments end-to-end.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <MarqueeSection />
        <ServicesSection />
        <HowItWorksSection />
        <StatsSection />
        <DeliveryTypesSection />
        <WhyUsSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}
