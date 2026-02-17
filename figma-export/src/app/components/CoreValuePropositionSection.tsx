import { UserCheck, BookOpen, GraduationCap, MessageCircle, DollarSign, TrendingUp, Zap, Target, Users, FileText, BarChart3, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";

export function CoreValuePropositionSection() {
  const features = [
    {
      icon: UserCheck,
      title: "Admissions & Lead Intelligence",
      description: "Track inquiries, automate follow-ups, manage school tours, and convert leads faster with AI-powered pipelines.",
      highlights: [
        { icon: Target, text: "Lead tracking" },
        { icon: Zap, text: "Auto follow-ups" }
      ]
    },
    {
      icon: BookOpen,
      title: "Integrated Preschool Curriculum",
      description: "Ready-to-use curriculum, lesson plans, learning outcomes, and progress tracking — designed by educators.",
      highlights: [
        { icon: FileText, text: "Lesson plans" },
        { icon: BarChart3, text: "Progress tracking" }
      ]
    },
    {
      icon: GraduationCap,
      title: "Staff & Induction Training Modules",
      description: "Structured onboarding for teachers, nannies, drivers, and staff — ensuring consistent quality from day one.",
      highlights: [
        { icon: Users, text: "Team onboarding" },
        { icon: Target, text: "Quality standards" }
      ]
    },
    {
      icon: MessageCircle,
      title: "Parent Communication That Builds Trust",
      description: "Attendance, diary updates, announcements, progress reports, and instant communication through a beautiful parent app.",
      highlights: [
        { icon: Zap, text: "Instant updates" },
        { icon: FileText, text: "Digital diary" }
      ]
    },
    {
      icon: DollarSign,
      title: "Billing, Attendance & Operations",
      description: "Fees, attendance, classes, timetable, inventory, transport, and documents — fully connected and automated.",
      highlights: [
        { icon: BarChart3, text: "Fee management" },
        { icon: Target, text: "Automation" }
      ]
    },
    {
      icon: TrendingUp,
      title: "Marketing & Growth Tools",
      description: "WhatsApp automation, templates, reports, and analytics to help schools grow without guesswork.",
      highlights: [
        { icon: Megaphone, text: "WhatsApp tools" },
        { icon: BarChart3, text: "Analytics" }
      ]
    }
  ];

  return (
    <section id="product" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Not Just an ERP.{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              A Complete School Operating System.
            </span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/20 group bg-white"
              >
                <CardHeader className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-slate-900" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-slate-600">
                    {feature.description}
                  </CardDescription>
                  
                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {feature.highlights.map((highlight, idx) => {
                      const HighlightIcon = highlight.icon;
                      return (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700">
                          <HighlightIcon className="h-3 w-3 text-slate-600" />
                          <span>{highlight.text}</span>
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
