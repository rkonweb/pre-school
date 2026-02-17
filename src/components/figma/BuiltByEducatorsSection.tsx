import { Quote, Users, BookOpen, Heart, Award, CheckCircle2, Target, Trophy } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function BuiltByEducatorsSection() {
  const trustStats = [
    { icon: Users, value: "50+", label: "Schools" },
    { icon: BookOpen, value: "10+", label: "Years Experience" },
    { icon: Heart, value: "100%", label: "Educator-Led" }
  ];

  const credentials = [
    { icon: Award, text: "Founded by educators" },
    { icon: Target, text: "Proven curriculum" },
    { icon: Trophy, text: "Industry recognized" },
    { icon: CheckCircle2, text: "Parent-approved" }
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Built by People{" "}
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Who Run Schools
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Column */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-teal-400/20 ring-2 ring-teal-400/30">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1761604478724-13fe879468cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzY2hvb2wlMjB0ZWFjaGVyJTIwY2hpbGRyZW4lMjBlZHVjYXRpb258ZW58MXx8fHwxNzcxMDQzODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Preschool teacher with children"
                  className="w-full h-full object-cover"
                />
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-cyan-400/20"></div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -bottom-4 -right-4 bg-slate-800 border border-teal-400/30 rounded-lg shadow-xl shadow-teal-400/20 p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Heart className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-teal-300">1000+</p>
                    <p className="text-xs text-slate-400">Happy Families</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="space-y-6">
              <div className="relative">
                <Quote className="h-12 w-12 text-teal-400 opacity-20 absolute -top-4 -left-4" />
                <div className="relative z-10 space-y-4">
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                    Bodhi Board is powered by the real-world experience of{" "}
                    <span className="font-bold text-teal-300">Little Chanakyas</span>, 
                    a successful preschool brand with proven curriculum, trained staff, and happy parents.
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-white">
                    This platform is shaped by classrooms, not boardrooms.
                  </p>
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-3 py-4">
                {credentials.map((credential, index) => {
                  const Icon = credential.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-teal-400/20">
                      <Icon className="h-4 w-4 text-teal-300" />
                      <span className="text-sm text-slate-300">{credential.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {trustStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center p-4 bg-slate-800/50 rounded-lg shadow-sm border border-teal-400/20">
                      <Icon className="h-8 w-8 text-teal-300 mx-auto mb-2" />
                      <p className="font-bold text-xl text-white">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
