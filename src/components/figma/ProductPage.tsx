import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Heart,
  MessageSquare,
  Calendar,
  CreditCard,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  Shield,
  Lock,
  Cloud,
  RefreshCw,
  Building2,
  Rocket,
  Network,
  Award,
  Target,
  BarChart3,
  Bell,
  FileText,
  Phone,
  Send,
  ChevronRight,
  Globe,
  School,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";

export function ProductPage() {
  const navigate = useNavigate();

  const coreModules = [
    {
      icon: Users,
      title: "Admissions & Lead Management",
      subtitle: "Convert more inquiries with less effort.",
      description: "Stop losing potential admissions to poor follow-up. Bodhi Board tracks every inquiry, automates reminders, and helps you close enrollments faster.",
      features: [
        "Centralized inquiry management",
        "AI-powered lead scoring",
        "Automated follow-up workflows",
        "School tour scheduling system",
        "Conversion analytics & reports"
      ],
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "Integrated Preschool Curriculum",
      subtitle: "Research-backed learning. Ready to use.",
      description: "No more scrambling for lesson plans. Our curriculum is built with UK educationists with Oxford pedagogy exposure — aligned to developmental milestones.",
      features: [
        "Ready-to-use daily curriculum",
        "Age-appropriate lesson plans",
        "Learning objectives & milestones",
        "Activity sheets & resources",
        "Student progress tracking"
      ],
      credibility: "Designed with UK educationists with Oxford pedagogy exposure.",
      gradient: "from-cyan-500 to-teal-600"
    },
    {
      icon: GraduationCap,
      title: "Teacher, Staff & Induction Training",
      subtitle: "Build a team that operates with excellence.",
      description: "Quality is only consistent when your people are trained. Onboard teachers, nannies, drivers, and admin staff with structured induction programs.",
      features: [
        "Complete teacher induction modules",
        "Nanny & caregiver training protocols",
        "Driver safety & emergency training",
        "Admin SOPs & operational guidelines",
        "Certification & progress tracking"
      ],
      gradient: "from-teal-600 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "Parent Communication System",
      subtitle: "Build trust through transparency.",
      description: "Parents stay informed and connected. Share daily updates, attendance, photos, and reports — all through a dedicated Parent App.",
      features: [
        "Dedicated Parent Mobile App",
        "Daily attendance & activity diary",
        "Real-time announcements & alerts",
        "Progress reports & milestones",
        "Two-way messaging with teachers"
      ],
      gradient: "from-cyan-600 to-teal-500"
    },
    {
      icon: Calendar,
      title: "Attendance, Billing & Operations",
      subtitle: "Run your school with operational clarity.",
      description: "Manage day-to-day operations effortlessly. Track attendance, manage fees, organize academic structures, and maintain records — all in one place.",
      features: [
        "Student & staff attendance tracking",
        "Fee setup, collection & reminders",
        "Academic year & class structure",
        "Inventory & document management",
        "Leave management system"
      ],
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: TrendingUp,
      title: "Marketing & Growth Tools",
      subtitle: "Grow predictably with data-driven marketing.",
      description: "Run campaigns, automate follow-ups, and track what's working. Built-in WhatsApp integration helps you nurture leads without switching platforms.",
      features: [
        "WhatsApp automation & templates",
        "Follow-up campaign management",
        "Lead source tracking",
        "Performance analytics dashboard",
        "ROI & conversion reporting"
      ],
      gradient: "from-cyan-500 to-teal-600"
    }
  ];

  const appEcosystem = [
    {
      icon: Monitor,
      name: "School Web Dashboard",
      description: "Complete admin control center",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: Smartphone,
      name: "Teacher & Staff App",
      description: "Daily operations on the go",
      color: "from-cyan-500 to-teal-600"
    },
    {
      icon: Tablet,
      name: "Parent App",
      description: "Stay connected with your child's journey",
      color: "from-teal-600 to-cyan-500"
    },
    {
      icon: Smartphone,
      name: "Driver App",
      description: "Transport tracking & safety",
      color: "from-cyan-600 to-teal-500"
    }
  ];

  const schoolStages = [
    {
      icon: Rocket,
      title: "Starting a New Preschool",
      description: "Get everything you need to launch with confidence — from admissions to curriculum.",
      features: ["Launch-ready curriculum", "Admission workflows", "Parent onboarding"]
    },
    {
      icon: Building2,
      title: "Running an Existing School",
      description: "Replace scattered tools with one unified system. Save time and reduce chaos.",
      features: ["Centralized operations", "Automated workflows", "Better parent trust"]
    },
    {
      icon: Network,
      title: "Scaling to Multiple Branches",
      description: "Manage multiple locations from one dashboard. Maintain quality at scale.",
      features: ["Multi-branch control", "Standardized processes", "Centralized reporting"]
    },
    {
      icon: Award,
      title: "Franchise-Ready Institutions",
      description: "Built for franchises that need consistency, control, and brand alignment.",
      features: ["Franchise templates", "Brand consistency", "Performance monitoring"]
    }
  ];

  const securityFeatures = [
    { icon: Lock, text: "Role-based access control" },
    { icon: Cloud, text: "Secure cloud infrastructure" },
    { icon: Shield, text: "Data ownership stays with school" },
    { icon: RefreshCw, text: "Regular updates & backups" }
  ];

  return (
    <div className="bg-white pt-[100px]">
      {/* SECTION 1 — PRODUCT HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-20 md:py-32">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <div className="px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-800">Complete School Operating System</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Everything Your School Needs.{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  One Intelligent Platform.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
                A complete school operating system that helps you start, run, and scale your institution — without chaos or disconnected tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/signup")}
                    size="lg"
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 px-10 py-7 text-lg font-bold rounded-full shadow-2xl shadow-amber-500/30"
                  >
                    Start 30-Day Free Trial
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50 px-10 py-7 text-lg font-bold rounded-full"
                  >
                    See How It Works
                    <ChevronRight className="h-6 w-6 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Hero Visual - Module Cards */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Central Dashboard */}
                <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl border-2 border-teal-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                      <Monitor className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Admin Dashboard</h3>
                      <p className="text-sm text-slate-600">Complete Control Center</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-3 bg-slate-100 rounded-full"></div>
                    ))}
                  </div>
                </div>

                {/* Floating Module Cards */}
                {[
                  { icon: Users, label: "Admissions", position: "-top-6 -left-6", delay: 0.3 },
                  { icon: BookOpen, label: "Curriculum", position: "-top-6 -right-6", delay: 0.4 },
                  { icon: Heart, label: "Parents", position: "-bottom-6 -left-6", delay: 0.5 },
                  { icon: CreditCard, label: "Billing", position: "-bottom-6 -right-6", delay: 0.6 }
                ].map((module) => {
                  const Icon = module.icon;
                  return (
                    <motion.div
                      key={module.label}
                      className={`absolute ${module.position} bg-white rounded-2xl p-4 shadow-xl border border-teal-100`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: module.delay }}
                      whileHover={{ scale: 1.1, y: -5 }}
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-2">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">{module.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT MAKES BODHI BOARD DIFFERENT */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Not Just Software.{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                A System That Thinks Like a School.
              </span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Most ERPs are built for enterprises, then adapted for schools. Bodhi Board is different — it's built by educators, for educators.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional ERP */}
            <motion.div
              className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-200"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-300 flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Traditional ERPs</h3>
                <p className="text-slate-600">Feature-heavy. Process-first.</p>
              </div>
              <ul className="space-y-3">
                {[
                  "Complex setup, steep learning curve",
                  "Generic modules, not education-specific",
                  "No curriculum or training included",
                  "Disconnected from daily teaching needs",
                  "Support teams don't understand schools"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <span className="text-slate-400 mt-1">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Bodhi Board */}
            <motion.div
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-8 border-2 border-teal-300 relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full">
                  Outcome-Driven
                </div>
              </div>
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Bodhi Board</h3>
                <p className="text-teal-700 font-semibold">Educator-led. Outcome-focused.</p>
              </div>
              <ul className="space-y-3">
                {[
                  "Ready-to-use in days, not months",
                  "Built specifically for preschools & schools",
                  "Integrated curriculum & teacher training",
                  "Supports classroom workflows naturally",
                  "Team trained by real educators"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-800">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — CORE MODULES */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Complete Features.{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Built for Schools.
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to run your school with clarity and confidence.
            </p>
          </motion.div>

          <div className="space-y-24 max-w-7xl mx-auto">
            {coreModules.map((module, index) => {
              const Icon = module.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={module.title}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`${!isEven ? 'lg:col-start-2' : ''}`}>
                    <div className="space-y-6">
                      <div className={`inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br ${module.gradient} items-center justify-center shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      <div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                          {module.title}
                        </h3>
                        <p className="text-xl font-semibold text-teal-700 mb-4">
                          {module.subtitle}
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                          {module.description}
                        </p>
                      </div>

                      <ul className="space-y-3">
                        {module.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 text-lg">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {module.credibility && (
                        <div className="pt-4">
                          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              {module.credibility}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <div className={`bg-gradient-to-br ${module.gradient} rounded-3xl p-12 shadow-2xl`}>
                      <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 flex items-center justify-center">
                        <Icon className="h-32 w-32 text-white opacity-40" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA after modules */}
          <motion.div
            className="text-center pt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 px-10 py-7 text-lg font-bold rounded-full shadow-2xl shadow-teal-500/30"
              >
                Start Your Free Trial
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 — MULTI-APP ECOSYSTEM */}
      <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              One Brain.{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Multiple Experiences.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every user gets a tailored experience. All data syncs in real-time across all platforms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {appEcosystem.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.div
                  key={app.name}
                  className="bg-slate-800/50 backdrop-blur-sm border border-teal-400/20 rounded-3xl p-8 hover:border-teal-400/40 transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{app.name}</h3>
                  <p className="text-slate-300">{app.description}</p>
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full">
              <Zap className="h-5 w-5 text-teal-400" />
              <span className="text-teal-300 font-semibold">Real-time sync across all apps</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — BUILT FOR EVERY STAGE */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Built for{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Every School Journey
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Whether you're just starting or scaling to multiple branches, Bodhi Board grows with you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {schoolStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.title}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{stage.title}</h3>
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed">{stage.description}</p>
                  <ul className="space-y-2">
                    {stage.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6 — SECURITY & RELIABILITY */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-teal-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Secure. Scalable.{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Reliable.
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Built on enterprise-grade infrastructure. Your data is safe, secure, and always yours.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-slate-200"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{feature.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 — TRUST & CREDIBILITY */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Powered by{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Real Schools
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {[
                {
                  icon: School,
                  title: "Built inside Little Chanakyas",
                  description: "Not a software company building for schools. Real educators building from experience."
                },
                {
                  icon: GraduationCap,
                  title: "Educator-led decisions",
                  description: "Every feature is guided by pedagogical needs, not just technical possibilities."
                },
                {
                  icon: Globe,
                  title: "Globally inspired curriculum",
                  description: "Designed with UK educationists with Oxford pedagogy exposure."
                },
                {
                  icon: Target,
                  title: "India-first workflows",
                  description: "Built specifically for Indian schools, regulations, and cultural context."
                }
              ].map((trust, index) => {
                const Icon = trust.icon;
                return (
                  <motion.div
                    key={trust.title}
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{trust.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{trust.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Ready to Run Your School{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                with Confidence?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-300">
              Experience clarity, control, and calm in your school operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 px-12 py-8 text-xl font-bold rounded-full shadow-2xl shadow-amber-500/30"
                >
                  Start 30-Day Free Trial
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-teal-400 bg-transparent text-teal-300 hover:bg-teal-400/10 px-12 py-8 text-xl font-bold rounded-full"
                >
                  <Phone className="h-6 w-6 mr-2" />
                  Book a Product Walkthrough
                </Button>
              </motion.div>
            </div>

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
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
