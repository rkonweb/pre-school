"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserCheck, GraduationCap, MessageCircle, LayoutDashboard, AlertCircle, CheckCircle2, Sparkles, Rocket } from "lucide-react";
import { registerSchoolAction } from "@/app/actions/auth-actions";
import { motion, AnimatePresence } from "motion/react";

type Phase = "loading" | "success" | "error";

export function SetupLoading() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const registrationStarted = useRef(false);
  const registrationResult = useRef<{ success: boolean; slug?: string; error?: string } | null>(null);

  const steps = [
    { icon: UserCheck, label: "Setting up Admissions" },
    { icon: GraduationCap, label: "Loading Curriculum" },
    { icon: MessageCircle, label: "Activating Communication" },
    { icon: LayoutDashboard, label: "Preparing Dashboard" }
  ];

  // Step 1: Start registration in the background (fire-and-forget)
  useEffect(() => {
    if (registrationStarted.current) return;
    registrationStarted.current = true;

    const performRegistration = async () => {
      try {
        const mobile = sessionStorage.getItem("phoneNumber") || "";
        const planId = sessionStorage.getItem("selectedPlan") || "growth";
        const schoolInfoStr = sessionStorage.getItem("schoolInfo");

        if (!mobile || !schoolInfoStr) {
          registrationResult.current = { success: false, error: "Missing registration information. Please restart the signup process." };
          return;
        }

        const schoolInfo = JSON.parse(schoolInfoStr);

        const result = await registerSchoolAction({
          firstName: schoolInfo.firstName,
          lastName: schoolInfo.lastName,
          schoolName: schoolInfo.name,
          mobile,
          planId,
          city: schoolInfo.city
        });

        if (result.success) {
          registrationResult.current = { success: true, slug: result.slug };
        } else {
          registrationResult.current = { success: false, error: result.error || "Failed to create school workspace." };
        }
      } catch (err) {
        console.error("Registration error:", err);
        registrationResult.current = { success: false, error: "An unexpected error occurred during setup." };
      }
    };

    void performRegistration();
  }, []);

  // Step 2: Animate through ALL steps at a consistent pace (always plays fully)
  useEffect(() => {
    // Start from step 0, advance every 1.2 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(stepInterval);
          return prev; // Stay on last step
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(stepInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 3: When animation completes (reaches last step), wait a beat, then transition
  useEffect(() => {
    if (currentStep < steps.length - 1) return; // Not at end yet

    // Give the last step a moment to visually settle, then check result
    const timer = setTimeout(() => {
      const result = registrationResult.current;

      if (result && result.success && result.slug) {
        setSlug(result.slug);
        setPhase("success");
      } else if (result && !result.success) {
        setErrorMsg(result.error || "Something went wrong.");
        setPhase("error");
      } else {
        // Registration still in flight — poll
        const poll = setInterval(() => {
          const r = registrationResult.current;
          if (!r) return; // Still waiting
          clearInterval(poll);
          if (r.success && r.slug) {
            setSlug(r.slug);
            setPhase("success");
          } else {
            setErrorMsg(r.error || "Something went wrong.");
            setPhase("error");
          }
        }, 300);

        // Safety: stop polling after 15 seconds
        setTimeout(() => {
          clearInterval(poll);
          if (phase === "loading") {
            setErrorMsg("Setup is taking longer than expected. Please try again.");
            setPhase("error");
          }
        }, 15000);
      }
    }, 1200); // 1.2s after last step completes

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Step 4: After success celebration, redirect to dashboard
  useEffect(() => {
    if (phase === "success" && slug) {
      const timer = setTimeout(() => {
        router.push(`/s/${slug}/dashboard`);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase, slug, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ─── PHASE: LOADING ─── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md space-y-10"
          >
            {/* Brain icon */}
            <div className="text-center">
              <motion.div
                className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/40 mx-auto"
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-5xl select-none">🧠</span>
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white leading-tight"
              >
                Setting up your school workspace...
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-sm"
              >
                This will only take a moment
              </motion.p>
            </div>

            {/* Step cards */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border-2
                      ${isActive
                        ? "bg-teal-400/10 border-teal-400 shadow-lg shadow-teal-400/10"
                        : isCompleted
                          ? "bg-slate-800/80 border-teal-400/30"
                          : "bg-slate-800/30 border-slate-800"
                      }`}
                  >
                    {/* Icon */}
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-500
                        ${isActive || isCompleted
                          ? "bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30"
                          : "bg-slate-700/80"
                        }`}
                    >
                      <Icon
                        className={`h-5 w-5 transition-colors duration-500
                          ${isActive || isCompleted ? "text-slate-900" : "text-slate-500"}`}
                      />
                    </div>

                    {/* Label */}
                    <p
                      className={`flex-1 font-semibold transition-colors duration-500
                        ${isActive || isCompleted ? "text-white" : "text-slate-600"}`}
                    >
                      {step.label}
                    </p>

                    {/* Completed check */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        className="h-6 w-6 rounded-full bg-teal-400 flex items-center justify-center shadow-lg shadow-teal-400/40"
                      >
                        <CheckCircle2 className="h-4 w-4 text-slate-900" />
                      </motion.div>
                    )}

                    {/* Active dots */}
                    {isActive && (
                      <div className="flex gap-1.5">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1, delay }}
                            className="h-1.5 w-1.5 bg-teal-400 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
              <motion.div
                className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 h-full rounded-full shadow-[0_0_12px_rgba(45,212,191,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: SUCCESS ─── */}
        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            {/* Big animated icon */}
            <div className="relative inline-block">
              {/* Glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.6 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-teal-400/20 blur-[80px] rounded-full pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 14 }}
                className="relative h-32 w-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-teal-400/50"
              >
                <CheckCircle2 className="h-16 w-16 text-slate-900" />
              </motion.div>

              {/* Sparkles */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="absolute -top-3 -right-3"
              >
                <Sparkles className="h-8 w-8 text-amber-400 drop-shadow-lg" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, type: "spring", stiffness: 300 }}
                className="absolute -bottom-2 -left-5"
              >
                <Sparkles className="h-6 w-6 text-teal-300 drop-shadow-lg" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65, type: "spring", stiffness: 300 }}
                className="absolute top-0 -left-4"
              >
                <Sparkles className="h-5 w-5 text-cyan-300 drop-shadow-lg" />
              </motion.div>
            </div>

            {/* Text */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-4xl font-black text-white tracking-tight leading-tight"
              >
                Workspace Ready! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-teal-400 font-medium text-lg"
              >
                Welcome to Bodhi Board
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-slate-500 max-w-[280px] mx-auto text-sm"
              >
                Launching your dashboard...
              </motion.p>
            </div>

            {/* Animated launch indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-4"
            >
              <div className="flex justify-center items-center gap-3 text-teal-400">
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Rocket className="h-5 w-5" />
                </motion.div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2
                      }}
                      className="h-2 w-2 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── PHASE: ERROR ─── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border-2 border-red-500/30 mx-auto"
            >
              <AlertCircle className="h-10 w-10 text-red-400" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Setup Encountered an Issue
              </h2>
              <p className="text-red-400 max-w-xs mx-auto text-sm leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="flex flex-col gap-3 items-center pt-2">
              <Button
                onClick={() => router.push("/signup/setup")}
                className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold px-8 h-11 shadow-lg shadow-teal-400/20"
              >
                Go Back & Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/signup")}
                className="text-slate-400 hover:text-white text-sm"
              >
                Start Over
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
