import { useState } from "react";
import { motion } from "motion/react";
import { 
  Phone, Clock, Users, BookOpen, MessageSquare, Wrench,
  Target, Zap, GraduationCap, Book, User, PieChart,
  ArrowRight, X, Check, Sparkles, ChevronRight
} from "lucide-react";

export function ProblemSolutionSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const transformations = [
    {
      id: 1,
      problem: {
        title: "Admissions scattered across calls, WhatsApp, and paper",
        icon: Phone,
        stat: "40%",
        statLabel: "Lost Leads"
      },
      solution: {
        title: "Smart lead management with automated follow-ups",
        icon: Target,
        stat: "2x",
        statLabel: "Conversion"
      }
    },
    {
      id: 2,
      problem: {
        title: "Manual follow-ups eating staff hours every day",
        icon: Clock,
        stat: "15hr",
        statLabel: "Wasted Weekly"
      },
      solution: {
        title: "AI-powered automation handles repetitive tasks",
        icon: Zap,
        stat: "95%",
        statLabel: "Time Saved"
      }
    },
    {
      id: 3,
      problem: {
        title: "Untrained staff creating inconsistent experiences",
        icon: Users,
        stat: "60%",
        statLabel: "Quality Issues"
      },
      solution: {
        title: "Built-in training with performance tracking",
        icon: GraduationCap,
        stat: "4.8★",
        statLabel: "Parent Rating"
      }
    },
    {
      id: 4,
      problem: {
        title: "Curriculum chaos with scattered documents",
        icon: BookOpen,
        stat: "3hr",
        statLabel: "Daily Search"
      },
      solution: {
        title: "Ready-to-use curriculum with lesson plans",
        icon: Book,
        stat: "1 week",
        statLabel: "To Launch"
      }
    },
    {
      id: 5,
      problem: {
        title: "Parents calling constantly for updates",
        icon: MessageSquare,
        stat: "50+",
        statLabel: "Daily Calls"
      },
      solution: {
        title: "Real-time updates keep parents informed",
        icon: User,
        stat: "90%",
        statLabel: "Fewer Calls"
      }
    },
    {
      id: 6,
      problem: {
        title: "Multiple tools that don't talk to each other",
        icon: Wrench,
        stat: "5+",
        statLabel: "Separate Apps"
      },
      solution: {
        title: "One unified platform for everything",
        icon: PieChart,
        stat: "100%",
        statLabel: "Connected"
      }
    }
  ];

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm font-semibold mb-4"
          >
            <Sparkles className="h-4 w-4" />
            The Transformation
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 leading-tight">
            Stop Struggling. <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Start Growing.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            See how every challenge transforms into an opportunity
          </p>
        </motion.div>

        {/* Split View Header */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-w-3xl mx-auto">
          <div className="text-center py-2 px-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="text-slate-700 font-semibold text-sm">Current Challenges</span>
          </div>
          <div className="text-center py-2 px-3 rounded-lg bg-teal-50 border border-teal-200">
            <span className="text-teal-700 font-semibold text-sm">With Bodhi Board</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="space-y-4 max-w-5xl mx-auto">
          {transformations.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const ProblemIcon = item.problem.icon;
            const SolutionIcon = item.solution.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                <div className="grid md:grid-cols-2 gap-3 relative">
                  {/* Problem Side */}
                  <motion.div
                    className="relative rounded-xl p-4 bg-white border border-slate-200 overflow-hidden"
                    animate={{
                      borderColor: isHovered ? "rgb(148 163 184)" : "rgb(226 232 240)",
                      x: isHovered ? -4 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <ProblemIcon className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md">
                            <X className="h-3 w-3 text-slate-500" />
                            <span className="text-slate-600 text-xs font-medium">Problem</span>
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm font-medium mb-3 leading-relaxed">
                          {item.problem.title}
                        </p>
                        <div className="inline-flex flex-col items-start gap-0.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-slate-900 text-xl font-bold">{item.problem.stat}</span>
                          <span className="text-slate-600 text-xs">{item.problem.statLabel}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Arrow Connector */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
                    <motion.div
                      className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg border-2 border-white"
                      animate={{
                        scale: isHovered ? 1.15 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>

                  {/* Solution Side */}
                  <motion.div
                    className="relative rounded-xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 overflow-hidden"
                    animate={{
                      borderColor: isHovered ? "rgb(45 212 191)" : "rgb(153 246 228)",
                      x: isHovered ? 4 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <SolutionIcon className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-100 rounded-md">
                            <Check className="h-3 w-3 text-teal-600" />
                            <span className="text-teal-700 text-xs font-medium">Solution</span>
                          </div>
                        </div>
                        <p className="text-slate-800 text-sm font-medium mb-3 leading-relaxed">
                          {item.solution.title}
                        </p>
                        <div className="inline-flex flex-col items-start gap-0.5 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-teal-200">
                          <span className="text-teal-700 text-xl font-bold">{item.solution.stat}</span>
                          <span className="text-teal-600 text-xs">{item.solution.statLabel}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Mobile Arrow */}
                <div className="flex justify-center my-2 md:hidden">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <ArrowRight className="h-4 w-4 text-white rotate-90" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 p-8 md:p-10">
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                Transform Your School Today
              </h3>
              <p className="text-teal-50 text-base md:text-lg mb-6 max-w-2xl mx-auto">
                Join 500+ schools that replaced chaos with clarity. Start your 30-day free trial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <motion.button
                  className="px-6 py-3 bg-white text-teal-600 rounded-full font-semibold text-base shadow-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Free Trial
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold text-base hover:bg-white/20 transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 text-teal-50 text-xs md:text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
