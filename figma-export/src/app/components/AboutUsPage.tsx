import { motion } from "motion/react";
import { 
  GraduationCap, 
  Heart, 
  Users, 
  BookOpen, 
  Shield, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Target,
  Lightbulb,
  Rocket,
  Star,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Footer } from "./Footer";

export function AboutUsPage() {
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(href);
    }
  };

  return (
    <div className="bg-white pt-[100px]">
      {/* FRAME 1 — OPENING STATEMENT (IMMERSIVE HERO) - LIGHT WITH PATTERN */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-24 md:py-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-teal-400 rounded-full shadow-lg"
            >
              <Sparkles className="h-5 w-5 text-teal-600" />
              <span className="font-bold text-teal-900">Built by Educators. Designed for Schools.</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Building the Future of Education{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  with Intelligence and Heart
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M0 6 Q 150 12, 300 6"
                    stroke="#14B8A6"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p 
              className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Bodhi Board is the result of real classrooms, real educators, and real challenges — transformed into one powerful school operating system.
            </motion.p>

            {/* Connection Visual */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { label: "Curriculum", icon: BookOpen, color: "from-teal-500 to-teal-600" },
                { label: "Teachers", icon: Users, color: "from-cyan-500 to-cyan-600" },
                { label: "Parents", icon: Heart, color: "from-teal-600 to-cyan-600" },
                { label: "Technology", icon: Sparkles, color: "from-cyan-600 to-teal-600" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 block">{item.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 2 — THE BELIEF (WHY WE EXIST) - DARK */}
      <section className="py-20 md:py-32 bg-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-full text-sm font-bold text-teal-400">
                  Our Philosophy
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Education First.{" "}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Technology Second.
                </span>
              </h2>
              
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p className="text-xl">
                  We believe schools deserve systems that understand education — not software that forces schools to adapt.
                </p>
                <div className="p-6 bg-slate-800/50 border-l-4 border-teal-400 rounded-lg backdrop-blur-sm">
                  <p className="text-white font-semibold text-xl mb-2">
                    Every decision inside Bodhi Board is guided by one principle:
                  </p>
                  <p className="text-teal-300 text-2xl italic font-medium">
                    When educators lead and technology supports, schools flourish.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-teal-600 to-cyan-600 p-12 flex items-center justify-center">
                  <div className="text-center space-y-8">
                    <motion.div
                      className="relative inline-block"
                      animate={{ 
                        y: [0, -10, 0],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                        <Heart className="h-16 w-16 text-white" fill="white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-white/50"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>
                    <div className="space-y-3">
                      <p className="text-white font-bold text-2xl">Human-Centered Design</p>
                      <p className="text-teal-100 text-lg">Technology that serves educators</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FRAME 3 — THE ORIGIN STORY (LITTLE CHANAKYAS) - LIGHT */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-teal-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmclMjBzY2hvb2x8ZW58MXx8fHwxNzcxMDU2NDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Happy children learning in classroom"
                  className="w-full h-full object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/20 to-transparent"></div>
                
                {/* Floating badge */}
                <motion.div 
                  className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-teal-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Little Chanakyas</p>
                      <p className="text-slate-600 text-sm">Where Bodhi Board Was Born</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-8 order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full text-sm font-bold text-teal-800">
                  Our Origin
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Born Inside{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Little Chanakyas
                </span>
              </h2>
              
              <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                <p className="text-xl">
                  Bodhi Board was not built in isolation. It was born inside Little Chanakyas Global Preschool — shaped by real classrooms, teachers, parents, and children.
                </p>
                <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-teal-500 rounded-xl">
                  <p className="text-teal-900 font-bold text-xl">
                    Every feature you see has been tested in daily school life — refined through experience, not assumptions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Real Classrooms",
                    "Real Teachers",
                    "Real Parents",
                    "Real Results"
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-teal-100">
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      <span className="text-slate-800 font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FRAME 4 — FOUNDERS STORY (HUMAN CORE) - WHITE WITH ACCENT */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full text-sm font-bold text-teal-800">
                Leadership
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Meet the <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Founders</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Educators and entrepreneurs who understand schools from the inside out
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Founder 1 - RK */}
            <motion.div 
              className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-teal-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid md:grid-cols-[240px_1fr] gap-10 items-start">
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlZHVjYXRvciUyMHRlYWNoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzEwNTY0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Radhakrishnan T (RK)"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-xl">
                    <Rocket className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Radhakrishnan T (RK)</h3>
                    <p className="text-teal-700 font-bold text-lg">Founder | Education & Brand Strategist</p>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    With over two decades of experience across education, branding, and digital systems, RK brings a rare ability to translate educational vision into scalable, sustainable systems.
                  </p>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    As the Co-Founder of Little Chanakyas, he understands every layer of running a school — from admissions and operations to parent trust and long-term growth.
                  </p>
                  <div className="mt-8 p-6 bg-white border-l-4 border-teal-500 rounded-xl shadow-lg">
                    <Star className="h-6 w-6 text-teal-600 mb-3" />
                    <p className="text-xl text-slate-800 italic font-semibold">
                      "Schools don't fail because of lack of passion. They fail because of lack of systems."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Founder 2 - Ranjitha */}
            <motion.div 
              className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-cyan-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid md:grid-cols-[240px_1fr] gap-10 items-start">
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxMDU2NDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Ranjitha Krishnan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-xl">
                    <Heart className="h-10 w-10 text-white" fill="white" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Ranjitha Krishnan</h3>
                    <p className="text-cyan-700 font-bold text-lg">Co-Founder | Early Childhood Education Specialist</p>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    An educationist by passion, Ranjitha brings deep expertise in early childhood development, teacher mentoring, and classroom execution.
                  </p>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Her hands-on experience ensures that Bodhi Board remains human-centric — supporting teachers, nurturing children, and respecting the emotional fabric of education.
                  </p>
                  <div className="mt-8 p-6 bg-white border-l-4 border-cyan-500 rounded-xl shadow-lg">
                    <Heart className="h-6 w-6 text-cyan-600 mb-3" />
                    <p className="text-xl text-slate-800 italic font-semibold">
                      "Technology should support teachers — not replace their intuition."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FRAME 5 — GLOBAL ACADEMIC FOUNDATION - DARK */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative mesh gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full mb-8">
                <Globe className="h-5 w-5 text-teal-400" />
                <span className="font-bold text-teal-300">Global Standards, Local Context</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                Curriculum Designed with{" "}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Global Educationists
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto">
                Bodhi Board's integrated preschool curriculum and training modules are created in association with experienced educationists from the United Kingdom, including professionals with Oxford-level pedagogical exposure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {[
                {
                  icon: Award,
                  title: "Oxford-Level Pedagogy",
                  description: "Research-backed teaching methodologies that combine global best practices with proven educational frameworks",
                  gradient: "from-teal-500 to-teal-600"
                },
                {
                  icon: Target,
                  title: "India-First Design",
                  description: "Built specifically for Indian schools, regulations, and cultural context while maintaining international standards",
                  gradient: "from-cyan-500 to-cyan-600"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    className="p-8 bg-slate-800/50 backdrop-blur-sm border border-teal-400/20 rounded-2xl hover:border-teal-400/40 transition-all group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 6 — TRAINING & PEOPLE SYSTEM - LIGHT */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full text-sm font-bold text-teal-800">
                Complete Training System
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              People Make <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Schools Great</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Unlike traditional ERPs, Bodhi Board includes structured induction and training modules — ensuring consistency, quality, and accountability across every role.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { 
                title: "Teacher Training", 
                icon: GraduationCap, 
                description: "Comprehensive onboarding & continuous development programs",
                gradient: "from-teal-500 to-teal-600",
                stats: "50+ Modules"
              },
              { 
                title: "Nanny Induction", 
                icon: Heart, 
                description: "Care standards, safety protocols & child psychology basics",
                gradient: "from-cyan-500 to-cyan-600",
                stats: "30+ Hours"
              },
              { 
                title: "Driver Training", 
                icon: Shield, 
                description: "Safety-first driving standards & emergency preparedness",
                gradient: "from-teal-600 to-cyan-600",
                stats: "20+ Protocols"
              },
              { 
                title: "Admin SOPs", 
                icon: BookOpen, 
                description: "Process excellence, accountability & operational guidelines",
                gradient: "from-cyan-600 to-teal-600",
                stats: "100+ SOPs"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="group p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-teal-100 hover:border-teal-400"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{item.description}</p>
                  <div className="pt-4 border-t border-teal-100">
                    <span className="text-teal-700 font-bold text-sm">{item.stats}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="inline-block p-6 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-xl">
              <p className="text-white text-2xl font-bold">
                Great schools are built by trained people.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 7 — TECHNOLOGY STORY - DARK */}
      <section className="py-20 md:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-full text-sm font-bold text-teal-400">
                  Our Technology
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Technology That{" "}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Understands Education
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Our platform is engineered by experienced architects and product designers who specialize in building secure, scalable SaaS systems — purpose-built for education.
              </p>
              
              <div className="p-6 bg-slate-800/50 border-l-4 border-teal-400 rounded-xl backdrop-blur-sm">
                <p className="text-teal-300 text-2xl font-bold">
                  Clean interfaces on the surface. Powerful intelligence underneath.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Shield, label: "Secure & Scalable" },
                  { icon: Zap, label: "Real-time Sync" },
                  { icon: Users, label: "Mobile-First" },
                  { icon: CheckCircle2, label: "India-Compliant" }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.label}
                      className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-teal-400/20 hover:border-teal-400/40 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Icon className="h-6 w-6 text-teal-400 flex-shrink-0" />
                      <span className="text-slate-300 font-semibold">{feature.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1645363308298-3a949c8bfd86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZWR1Y2F0aW9uJTIwZGlnaXRhbCUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MTA1NjQxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Technology in education"
                  className="w-full h-full object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/40 to-transparent"></div>
                
                {/* Floating tech badge */}
                <motion.div 
                  className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">SaaS Platform</p>
                      <p className="text-slate-600 text-sm">Enterprise-grade</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FRAME 8 — MISSION STATEMENT - LIGHT GRADIENT */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,white_2px,transparent_2px),linear-gradient(to_bottom,white_2px,transparent_2px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block">
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full font-bold text-white">
                Our Mission
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Empowering Educators with{" "}
              <span className="block mt-2">
                Clarity, Confidence, and Control
              </span>
            </h2>

            <p className="text-2xl md:text-3xl text-teal-50 leading-relaxed max-w-4xl mx-auto font-medium">
              Whether you are opening your first preschool or scaling a multi-branch institution, Bodhi Board walks with you — step by step.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              {[
                { icon: Lightbulb, label: "Clarity" },
                { icon: Shield, label: "Confidence" },
                { icon: TrendingUp, label: "Control" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                    <span className="text-white font-bold text-lg">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 9 — CLOSING STATEMENT (BRAND SIGNATURE) - DARK */}
      <section className="relative py-24 md:py-32 bg-slate-950 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/30 via-transparent to-cyan-950/30"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center space-y-12">
              {/* Bold Statement */}
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Built by <span className="text-teal-400">Educators.</span><br />
                  Guided by <span className="text-cyan-400">Global Pedagogy.</span><br />
                  Powered by <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Technology.</span>
                </h2>
                <p className="text-2xl md:text-3xl text-slate-300 font-semibold">
                  Bodhi Board is where great schools begin — and better schools grow.
                </p>
              </div>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => handleNavClick("/signup")}
                  size="lg"
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 px-12 py-8 text-xl md:text-2xl shadow-2xl shadow-teal-500/50 font-bold rounded-full"
                >
                  Start Your School Journey
                  <ArrowRight className="h-7 w-7 ml-3" />
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                {[
                  "30-Day Free Trial",
                  "No Credit Card Required",
                  "Cancel Anytime"
                ].map((item, index) => (
                  <motion.div 
                    key={item}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-teal-400" />
                    <span className="text-slate-400">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}