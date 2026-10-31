import Header from "@/components/Header";
import SocialJourneySection from "@/components/SocialJourneySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import VerifiedConfidenceSection from "@/components/VerifiedConfidenceSection";
import {
  GoogleReviews,
  HowItWorks,
  LifeAtParadise,
  PromiseGrid,
  SupportCta,
  WhyFaq,
  WhyHero,
} from "@/components/why-choose-us/WhyChooseUsSections";
import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/why-choose-us");

export default function WhyChooseUs() {
  return (
    <>
      <Header />
      <main className="w-full flex-grow bg-background font-plus-jakarta-sans text-slate-900">
        <WhyHero />
        <PromiseGrid />
        <HowItWorks />
        <TestimonialsSection />
        <GoogleReviews />
        <VerifiedConfidenceSection />
        <LifeAtParadise />
        <SocialJourneySection />
        <WhyFaq />
        <SupportCta />
      </main>
    </>
  );
}