import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { SocialProofStrip } from "./components/SocialProofStrip";
import { ProblemSolutionSection } from "./components/ProblemSolutionSection";
import { CoreValuePropositionSection } from "./components/CoreValuePropositionSection";
import { WhoIsItForSection } from "./components/WhoIsItForSection";
import { ProductEcosystemSection } from "./components/ProductEcosystemSection";
import { PricingSection } from "./components/PricingSection";
import { BuiltByEducatorsSection } from "./components/BuiltByEducatorsSection";
import { FinalCTASection } from "./components/FinalCTASection";
import { Footer } from "./components/Footer";
import { AboutUsPage } from "./components/AboutUsPage";
import { PricingPage } from "./components/PricingPage";
import { ProductPage } from "./components/ProductPage";
import { CurriculumTrainingPage } from "./components/CurriculumTrainingPage";
import { ParentAppPage } from "./components/ParentAppPage";
import { ContactPage } from "./components/ContactPage";
import { BlogListingPage } from "./components/BlogListingPage";
import { BlogPostPage } from "./components/BlogPostPage";
import { PhoneSignup } from "./signup/PhoneSignup";
import { OTPVerification } from "./signup/OTPVerification";
import { PlanSelection } from "./signup/PlanSelection";
import { FreeTrialConfirmation } from "./signup/FreeTrialConfirmation";
import { SchoolSetup } from "./signup/SchoolSetup";
import { SetupLoading } from "./signup/SetupLoading";
import { WelcomeDashboard } from "./signup/WelcomeDashboard";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
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
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<PhoneSignup />} />
        <Route path="/signup/verify-otp" element={<OTPVerification />} />
        <Route path="/signup/select-plan" element={<PlanSelection />} />
        <Route path="/signup/free-trial" element={<FreeTrialConfirmation />} />
        <Route path="/signup/setup" element={<SchoolSetup />} />
        <Route path="/signup/loading" element={<SetupLoading />} />
        <Route path="/signup/welcome" element={<WelcomeDashboard />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/curriculum-training" element={<CurriculumTrainingPage />} />
        <Route path="/parent-app" element={<ParentAppPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogListingPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  );
}