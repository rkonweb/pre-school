import { Building2, GraduationCap, TrendingUp, Award } from "lucide-react";

export function SocialProofStrip() {
  const partners = [
    { name: "Little Chanakyas", icon: GraduationCap },
    { name: "Progressive Preschools", icon: TrendingUp },
    { name: "Independent Schools", icon: Building2 },
    { name: "School Founders", icon: Award }
  ];

  return (
    <section className="py-12 bg-slate-800 border-y border-teal-400/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <p className="text-sm font-medium text-teal-300 uppercase tracking-wide">
            Built for forward-thinking educators and institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-400/30">
                    <Icon className="h-4 w-4 text-slate-900" />
                  </div>
                  <span className="text-base font-semibold text-teal-50">
                    {partner.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
