import { Check, Star, Sparkles, Rocket, Crown, Zap, Users, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const plans = [
    {
      name: "Starter School",
      icon: Sparkles,
      tagline: "For new & small schools",
      subtitle: "Perfect for launching right",
      price: "₹2,499",
      period: "/ month",
      features: [
        "Admissions & student management",
        "Parent communication app",
        "Attendance & diary",
        "Preschool curriculum access",
        "Basic staff management",
        "Email & WhatsApp alerts"
      ],
      cta: "Get Started",
      popular: false,
      limits: { icon: Users, text: "Up to 50 students" }
    },
    {
      name: "Growth School",
      icon: Rocket,
      tagline: "For growing institutions",
      subtitle: "Built for automation & scale",
      price: "₹4,999",
      period: "/ month",
      features: [
        "Everything in Starter",
        "AI admissions dashboard",
        "Lead & follow-up automation",
        "Staff induction modules",
        "Billing & fee management",
        "Marketing tools & templates",
        "Advanced reports & analytics"
      ],
      cta: "Start Growing",
      popular: true,
      limits: { icon: TrendingUp, text: "Up to 200 students" }
    },
    {
      name: "Institution Pro",
      icon: Crown,
      tagline: "For large schools & chains",
      subtitle: "Complete control & customization",
      price: "Custom",
      period: "Pricing",
      features: [
        "Everything in Growth",
        "Multi-branch management",
        "Central curriculum control",
        "Franchise-ready SOPs",
        "Custom roles & permissions",
        "Priority onboarding & support"
      ],
      cta: "Talk to Our Team",
      popular: false,
      limits: { icon: Zap, text: "Unlimited students" }
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, Honest Pricing{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              That Grows With Your School
            </span>
          </h2>
          <p className="text-lg text-slate-600 mt-4">
            No hidden fees. No long-term lock-ins. Just value.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            const LimitIcon = plan.limits.icon;
            return (
              <Card
                key={index}
                className={`relative border-2 ${plan.popular ? 'border-teal-400 shadow-2xl shadow-teal-400/30 scale-105' : 'border-slate-200 hover:border-teal-300'} transition-all duration-300 bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-teal-400/30">
                      <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="space-y-4 text-center">
                  <div className="inline-flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg">
                    <PlanIcon className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">{plan.name}</CardTitle>
                    <p className="text-sm font-semibold text-teal-600 mt-1">
                      {plan.tagline}
                    </p>
                    <CardDescription className="text-sm mt-2 text-slate-600">
                      {plan.subtitle}
                    </CardDescription>
                  </div>
                  <div className="pt-4">
                    <div className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                      {plan.price}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{plan.period}</div>
                  </div>

                  {/* Student Limits Badge */}
                  <div className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium mx-auto">
                    <LimitIcon className="h-3 w-3 text-slate-600" />
                    <span>{plan.limits.text}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:opacity-90 shadow-lg shadow-teal-400/30' : 'border-2 border-slate-300 hover:border-teal-400 hover:bg-teal-50'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
