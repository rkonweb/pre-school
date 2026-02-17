import { motion } from "motion/react";
import { 
  Check, 
  X, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  Phone,
  CreditCard,
  Calendar,
  ArrowRight,
  Plus,
  Minus,
  Info,
  Award,
  Zap,
  Globe,
  Database
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";

export function PricingPage() {
  const navigate = useNavigate();
  const [additionalUsers, setAdditionalUsers] = useState(0);
  const pricePerUser = 299;

  const incrementUsers = () => setAdditionalUsers(prev => prev + 1);
  const decrementUsers = () => setAdditionalUsers(prev => Math.max(0, prev - 1));

  const plans = [
    {
      name: "Starter School",
      label: "For new & small schools",
      price: "₹2,499",
      period: "/ month",
      users: "Up to 5 users",
      highlighted: false,
      features: [
        "Complete School ERP",
        "Attendance & Leave Management",
        "Parent Communication Portal",
        "Fee Collection & Reports",
        "Academic Calendar",
        "Basic Analytics Dashboard",
        "Email Support",
        "Mobile App Access"
      ],
      cta: "Start Free Trial",
      ctaAction: () => navigate("/signup")
    },
    {
      name: "Growth School",
      label: "Most Popular",
      price: "₹4,999",
      period: "/ month",
      users: "Up to 15 users",
      highlighted: true,
      badge: "Most Popular",
      features: [
        "Everything in Starter, plus:",
        "Integrated Curriculum Management",
        "Staff Training Modules",
        "Advanced Reports & Analytics",
        "Admission & Inquiry Management",
        "Transport Management",
        "Library Management",
        "Priority Support",
        "Multi-role Access Control",
        "Custom Workflows"
      ],
      cta: "Start Free Trial",
      ctaAction: () => navigate("/signup")
    },
    {
      name: "Institution Pro",
      label: "For large schools & chains",
      price: "Custom Pricing",
      period: "",
      users: "Up to 30 users",
      highlighted: false,
      features: [
        "Everything in Growth, plus:",
        "Multi-Branch Management",
        "Advanced Role Permissions",
        "White-label Options",
        "API Access & Integrations",
        "Dedicated Account Manager",
        "Custom Training Sessions",
        "24/7 Phone Support",
        "Data Migration Assistance",
        "SLA Guarantee"
      ],
      cta: "Talk to Our Team",
      ctaAction: () => {} // Would open contact form
    }
  ];

  const trustIndicators = [
    { icon: Shield, text: "No hidden fees" },
    { icon: Calendar, text: "No long-term lock-ins" },
    { icon: Check, text: "Cancel or change anytime" }
  ];

  const howItWorks = [
    {
      icon: Building2,
      title: "Choose a Plan",
      description: "Select the plan that fits your school size"
    },
    {
      icon: Users,
      title: "Users Included by Default",
      description: "Every plan comes with base users included"
    },
    {
      icon: TrendingUp,
      title: "Add Users as You Grow",
      description: "Scale up anytime without plan changes"
    }
  ];

  const trialFeatures = [
    { icon: Sparkles, text: "Full feature access" },
    { icon: CreditCard, text: "No credit card required" },
    { icon: Calendar, text: "Cancel anytime" }
  ];

  const transparencyPoints = [
    { icon: Database, text: "Your data always belongs to you" },
    { icon: Users, text: "Pay only for active users" },
    { icon: Globe, text: "Built and supported in India" }
  ];

  return (
    <div className="bg-white pt-[100px]">
      {/* SECTION 1 — PRICING HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Simple, Transparent Pricing{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                That Grows With Your School
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-slate-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Choose a plan, then add users only if you need them. No surprises.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {trustIndicators.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <span className="text-slate-700 font-semibold">{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — HOW PRICING WORKS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 items-center justify-center shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
            <motion.p 
              className="text-center text-lg text-slate-600 mt-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Every plan comes with a base number of users. Add more users anytime — no forced upgrades.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — PRICING PLANS */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'bg-white border-2 border-teal-500 shadow-2xl shadow-teal-500/20 scale-105 md:scale-110'
                    : 'bg-white border-2 border-slate-200 shadow-lg'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Badge for highlighted plan */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div>
                    <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">
                      {plan.label}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-slate-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-lg text-slate-600">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{plan.users}</p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={plan.ctaAction}
                    className={`w-full py-6 text-base font-bold rounded-xl shadow-lg transition-all ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 shadow-amber-500/30'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  {/* Features List */}
                  <div className="pt-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Check className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className={`text-sm ${
                          feature.includes("Everything in") 
                            ? "font-semibold text-slate-900" 
                            : "text-slate-700"
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — USER-BASED PRICING ADD-ON */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-8 md:p-12 border-2 border-teal-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Need More Users? Add Them Anytime
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Applies to Admin, Teacher, and Office staff
                </p>
                <div className="inline-block px-4 py-2 bg-white rounded-full shadow-sm border border-teal-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-teal-700">Parents and Drivers</span> do NOT count as users
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-slate-600 font-medium mb-2">Price per additional user</p>
                    <p className="text-5xl font-bold text-slate-900">₹{pricePerUser}</p>
                    <p className="text-slate-600 mt-1">per user / month</p>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700">
                        Add Users:
                      </label>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={decrementUsers}
                          variant="outline"
                          size="lg"
                          className="h-14 w-14 rounded-xl border-2 border-slate-300 hover:border-teal-500 hover:bg-teal-50"
                          disabled={additionalUsers === 0}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="h-14 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                            <span className="text-2xl font-bold text-slate-900">{additionalUsers}</span>
                          </div>
                        </div>
                        <Button
                          onClick={incrementUsers}
                          variant="outline"
                          size="lg"
                          className="h-14 w-14 rounded-xl border-2 border-slate-300 hover:border-teal-500 hover:bg-teal-50"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      {additionalUsers > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center p-4 bg-teal-100 rounded-xl border border-teal-200"
                        >
                          <p className="text-sm text-teal-800 font-medium">
                            Additional cost: <span className="text-xl font-bold">₹{additionalUsers * pricePerUser}</span> / month
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — EXAMPLE PRICING CALCULATOR */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200">
              <div className="flex items-start gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Example: Growth Plan</h3>
                  <p className="text-sm text-slate-600">Here's how the pricing works in practice</p>
                </div>
              </div>

              <div className="space-y-4 pl-13">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Growth Plan (15 users included)</span>
                  <span className="font-semibold text-slate-900">₹4,999</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">5 additional users (₹299 × 5)</span>
                  <span className="font-semibold text-slate-900">₹1,495</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-teal-50 -mx-8 px-8 rounded-b-2xl">
                  <span className="text-lg font-bold text-slate-900">Total per month</span>
                  <span className="text-2xl font-bold text-teal-700">₹6,494</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6 — 30-DAY FREE TRIAL REINFORCEMENT */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Try Bodhi Board Free for 30 Days
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {trialFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 px-12 py-8 text-xl font-bold rounded-full shadow-2xl shadow-amber-500/30"
              >
                Start Your 30-Day Free Trial
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 — TRANSPARENCY & TRUST */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Built on Trust & Transparency
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {transparencyPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.text}
                    className="flex flex-col items-center text-center gap-4 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-teal-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-800">{point.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
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
              Choose a Plan That{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Fits Your School Today
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-300">
              Scale seamlessly as your team grows
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 px-10 py-7 text-lg font-bold rounded-full shadow-2xl shadow-teal-500/30"
                >
                  Start Free Trial
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
                  className="border-2 border-teal-400 bg-transparent text-teal-300 hover:bg-teal-400/10 px-10 py-7 text-lg font-bold rounded-full"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Talk to Our Education Team
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}