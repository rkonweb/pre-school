import { ArrowRight, Calendar, Shield, Award, Zap, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function FinalCTASection() {
  const navigate = useNavigate();
  
  const guarantees = [
    { icon: Shield, text: "Secure & Reliable" },
    { icon: Award, text: "Award-Winning Platform" },
    { icon: Zap, text: "Lightning Fast Setup" },
    { icon: CheckCircle2, text: "No Lock-in Contract" }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Sparkle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-teal-400/30 shadow-lg shadow-teal-400/10">
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-50">
              Join 50+ Schools Already Growing with Bodhi Board
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Build a Better School?
            </h2>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              Whether you're opening your first preschool or scaling an institution, 
              Bodhi Board is your long-term education partner.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 px-8 py-6 text-lg font-semibold group shadow-xl shadow-teal-400/30"
            >
              Start Free 30-Day Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-teal-400 text-teal-300 hover:bg-teal-400/10 px-8 py-6 text-lg font-semibold group"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book a Free Consultation
            </Button>
          </div>

          {/* Guarantees Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
            {guarantees.map((guarantee, index) => {
              const Icon = guarantee.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-lg border border-teal-400/20">
                  <Icon className="h-6 w-6 text-teal-300" />
                  <span className="text-xs text-center text-teal-100 font-medium">{guarantee.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
