import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, CheckCircle2, Calendar, CreditCard } from "lucide-react";

export function FreeTrialConfirmation() {
  const navigate = useNavigate();
  const selectedPlan = sessionStorage.getItem("selectedPlan") || "growth";

  const benefits = [
    {
      icon: CheckCircle2,
      text: "Full access to all features"
    },
    {
      icon: CreditCard,
      text: "No credit card required"
    },
    {
      icon: Calendar,
      text: "Cancel anytime, no questions asked"
    },
    {
      icon: Shield,
      text: "Your data is secure & private"
    }
  ];

  const handleStartTrial = () => {
    navigate("/signup/setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/30 mx-auto">
            <Calendar className="h-10 w-10 text-slate-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Start Your 30-Day Free Trial
          </h1>
          <p className="text-lg text-slate-300">
            Explore everything before you commit
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-teal-400/20 p-8 md:p-10 space-y-6">
          <div className="text-center pb-4 border-b border-slate-700">
            <p className="text-sm text-teal-300 font-semibold uppercase tracking-wide">
              Your Free Trial Includes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-slate-700/50 border border-teal-400/10 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-400/30">
                    <Icon className="h-5 w-5 text-slate-900" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-white font-medium">{benefit.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trial details */}
          <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Trial Duration</span>
              <span className="text-white font-bold">30 Days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Selected Plan</span>
              <span className="text-white font-bold capitalize">{selectedPlan} School</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Price After Trial</span>
              <span className="text-white font-bold">
                {selectedPlan === "starter" ? "₹2,499/mo" : selectedPlan === "growth" ? "₹4,999/mo" : "Custom"}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Button
            onClick={handleStartTrial}
            className="h-14 px-12 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-xl shadow-teal-400/30"
          >
            Start 30-Day Free Trial
          </Button>
          <p className="text-sm text-slate-400">
            You won't be charged during the trial period.
          </p>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-teal-200/80 pt-4">
          <Shield className="h-4 w-4" />
          <span>Trusted by 50+ schools across India</span>
        </div>
      </div>
    </div>
  );
}
