import { Sparkles, Building2, Network, Heart, Rocket, TrendingUp, Users, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function WhoIsItForSection() {
  const audiences = [
    {
      icon: Sparkles,
      title: "New Preschool Founders",
      description: "Starting a Preschool? Bodhi Board guides you step-by-step — from admissions setup to curriculum delivery and parent communication.",
      benefits: [
        { icon: Rocket, text: "Quick setup" },
        { icon: Award, text: "Proven curriculum" }
      ]
    },
    {
      icon: Building2,
      title: "Existing Schools",
      description: "Already Running a School? Replace manual work with intelligent systems and gain complete operational visibility.",
      benefits: [
        { icon: TrendingUp, text: "Automation" },
        { icon: Users, text: "Visibility" }
      ]
    },
    {
      icon: Network,
      title: "School Chains & Franchises",
      description: "Managing Multiple Branches? Central control, standardized curriculum, and consistent processes across locations.",
      benefits: [
        { icon: Network, text: "Multi-branch" },
        { icon: Award, text: "Standardized" }
      ]
    },
    {
      icon: Heart,
      title: "Educator-Led Institutions",
      description: "Education Comes First? Built by educators, not just developers — pedagogy-driven and human-centric.",
      benefits: [
        { icon: Heart, text: "Pedagogy-first" },
        { icon: Users, text: "Human-centric" }
      ]
    }
  ];

  return (
    <section id="solutions" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Designed for{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Every School Builder
            </span>
          </h2>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <Card
                key={index}
                className="border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/20 group overflow-hidden relative bg-white"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-5 transition-opacity"></div>

                <CardHeader className="space-y-4 relative z-10">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-slate-900" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{audience.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-slate-600">
                    {audience.description}
                  </CardDescription>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {audience.benefits.map((benefit, idx) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
                          <BenefitIcon className="h-3 w-3 text-slate-600" />
                          <span>{benefit.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
