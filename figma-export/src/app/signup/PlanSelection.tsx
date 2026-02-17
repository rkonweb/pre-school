import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Check, Sparkles, Rocket, Crown } from "lucide-react";

export function PlanSelection() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("growth");

  const plans = [
    {
      id: "starter",
      name: "Starter School",
      icon: Sparkles,
      description: "Perfect for new & small schools",
      price: "₹2,499",
      period: "/month",
      features: [
        "Up to 50 students",
        "Basic admissions",
        "Parent app access",
        "Email support"
      ]
    },
    {
      id: "growth",
      name: "Growth School",
      icon: Rocket,
      description: "Most popular for growing schools",
      price: "₹4,999",
      period: "/month",
      popular: true,
      features: [
        "Up to 200 students",
        "Full admissions suite",
        "Staff training modules",
        "Marketing tools",
        "Priority support"
      ]
    },
    {
      id: "pro",
      name: "Institution Pro",
      icon: Crown,
      description: "For large schools & chains",
      price: "Custom",
      period: "pricing",
      features: [
        "Unlimited students",
        "Multi-branch support",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options"
      ]
    }
  ];

  const handleContinue = () => {
    sessionStorage.setItem("selectedPlan", selectedPlan);
    navigate("/signup/free-trial");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Choose How You Want to Start
          </h1>
          <p className="text-lg text-slate-300">
            No payment required now. Upgrade anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
                  isSelected
                    ? "border-2 border-teal-400 shadow-2xl shadow-teal-400/30 bg-slate-800"
                    : "border-2 border-slate-700 hover:border-teal-400/50 bg-slate-800/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-teal-400/30">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30"
                      : "bg-slate-700"
                  } transition-all`}>
                    <Icon className={`h-6 w-6 ${isSelected ? "text-slate-900" : "text-slate-300"}`} />
                  </div>

                  {/* Plan Name */}
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="py-3">
                    <span className="text-3xl font-bold text-teal-300">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="pt-4">
                      <div className="flex items-center justify-center gap-2 py-2 bg-teal-400/10 border border-teal-400/30 rounded-lg text-teal-300 font-medium text-sm">
                        <Check className="h-4 w-4" />
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button
            onClick={handleContinue}
            className="h-12 px-8 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-lg shadow-teal-400/30"
          >
            Start Your 30-Day Free Trial
          </Button>
          <p className="text-sm text-slate-400 mt-3">
            No payment required • Change plans anytime
          </p>
        </div>
      </div>
    </div>
  );
}
