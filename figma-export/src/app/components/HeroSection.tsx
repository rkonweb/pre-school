import { CheckCircle2, Play, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 backdrop-blur-sm border border-teal-400/30 shadow-lg shadow-teal-500/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-100">
                Trusted by Educators. Built by School Founders.
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                The Operating System for{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Modern Schools
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                Bodhi Board is a complete education platform that combines ERP, curriculum, 
                staff training, marketing, and parent communication — so schools don't just run, they grow.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate("/signup")}
                  className="relative bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 px-8 py-6 text-base md:text-lg shadow-2xl shadow-teal-500/50 font-bold group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Start Free 30-Day Trial
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-teal-400/60 bg-slate-800/30 backdrop-blur-sm text-teal-300 hover:bg-teal-400/10 hover:border-teal-400 px-8 py-6 text-base md:text-lg group font-bold shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:text-teal-200 fill-teal-400/20" />
                  Watch Product Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Supporting Microcopy */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                Built in India
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-teal-500/30 ring-2 ring-teal-400/40">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1763310225230-6e15b125935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzY2hvb2wlMjBjbGFzc3Jvb20lMjBjaGlsZHJlbiUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MTA0MzgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern school classroom with children learning"
                className="w-full h-full object-cover"
              />
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-cyan-400/20"></div>
            </div>

            {/* Floating cards for visual interest */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-slate-800/90 backdrop-blur-md border border-teal-400/40 rounded-xl shadow-2xl shadow-teal-500/30 p-4 hidden lg:block"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <p className="font-bold text-base text-teal-300">500+ Schools</p>
                  <p className="text-xs text-slate-400">Trust Bodhi Board</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -bottom-4 -left-4 bg-slate-800/90 backdrop-blur-md border border-teal-400/40 rounded-xl shadow-2xl shadow-teal-500/30 p-4 hidden lg:block"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <p className="font-bold text-base text-teal-300">Complete Platform</p>
                  <p className="text-xs text-slate-400">ERP + Curriculum + More</p>
                </div>
              </div>
            </motion.div>

            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 blur-2xl -z-10"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -z-10 transform -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>
      
      {/* Subtle moving particles effect */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </section>
  );
}
