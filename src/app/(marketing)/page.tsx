"use client";

import { HeroSection } from "@/components/figma/HeroSection";
import { SocialProofStrip } from "@/components/figma/SocialProofStrip";
import { ProblemSolutionSection } from "@/components/figma/ProblemSolutionSection";
import { CoreValuePropositionSection } from "@/components/figma/CoreValuePropositionSection";
import { WhoIsItForSection } from "@/components/figma/WhoIsItForSection";
import { ProductEcosystemSection } from "@/components/figma/ProductEcosystemSection";
import { PricingSection } from "@/components/figma/PricingSection";
import { BuiltByEducatorsSection } from "@/components/figma/BuiltByEducatorsSection";
import { FinalCTASection } from "@/components/figma/FinalCTASection";

export default function Home() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <SocialProofStrip />
            <ProblemSolutionSection />
            <CoreValuePropositionSection />
            <WhoIsItForSection />
            <ProductEcosystemSection />
            <PricingSection />
            <BuiltByEducatorsSection />
            <FinalCTASection />
        </main>
    );
}
