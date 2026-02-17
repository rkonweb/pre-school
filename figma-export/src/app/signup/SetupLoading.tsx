import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, GraduationCap, MessageCircle, LayoutDashboard } from "lucide-react";

export function SetupLoading() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: UserCheck, label: "Setting up Admissions" },
    { icon: GraduationCap, label: "Loading Curriculum" },
    { icon: MessageCircle, label: "Activating Communication" },
    { icon: LayoutDashboard, label: "Preparing Dashboard" }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    const navigationTimer = setTimeout(() => {
      navigate("/signup/welcome");
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-12">
        {/* Logo animation */}
        <div className="text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/50 mx-auto animate-pulse">
            <span className="text-5xl">🧠</span>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">
            Setting up your school workspace...
          </h2>
          <p className="text-slate-300">
            This will only take a moment
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive
                    ? "bg-teal-400/10 border-2 border-teal-400"
                    : isCompleted
                    ? "bg-slate-800 border-2 border-teal-400/30"
                    : "bg-slate-800/50 border-2 border-slate-700"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                    isActive || isCompleted
                      ? "bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30"
                      : "bg-slate-700"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isActive || isCompleted ? "text-slate-900" : "text-slate-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isActive || isCompleted ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {isCompleted && (
                  <div className="h-6 w-6 rounded-full bg-teal-400 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-slate-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                {isActive && (
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-lg shadow-teal-400/50"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
