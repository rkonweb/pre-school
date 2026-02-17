import { Monitor, Users, Smartphone, Truck, Zap, Cloud, RefreshCw, Shield } from "lucide-react";

export function ProductEcosystemSection() {
  const platforms = [
    {
      icon: Monitor,
      title: "School Web Dashboard",
      description: "Admin, admissions, reports, billing, staff, and operations",
      bgColor: "bg-teal-50",
      features: ["📊 Analytics", "⚙️ Settings"]
    },
    {
      icon: Users,
      title: "Teacher & Staff App",
      description: "Attendance, diary, class updates, tasks, and communication",
      bgColor: "bg-slate-50",
      features: ["✅ Attendance", "📝 Daily diary"]
    },
    {
      icon: Smartphone,
      title: "Parent App",
      description: "Daily updates, attendance, progress, announcements, and trust",
      bgColor: "bg-teal-50",
      features: ["📱 Mobile-first", "🔔 Real-time"]
    },
    {
      icon: Truck,
      title: "Driver App",
      description: "Routes, attendance, communication, and accountability",
      bgColor: "bg-slate-50",
      features: ["🗺️ GPS tracking", "✓ Check-ins"]
    }
  ];

  const connectionFeatures = [
    { icon: Zap, text: "Real-Time Sync" },
    { icon: Cloud, text: "Cloud-Based" },
    { icon: RefreshCw, text: "Auto Updates" },
    { icon: Shield, text: "Secure" }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            One Platform.{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Multiple Experiences.
            </span>
          </h2>
        </div>

        {/* Platforms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div 
                key={index} 
                className={`${platform.bgColor} rounded-2xl p-6 space-y-4 hover:shadow-2xl hover:shadow-teal-400/20 transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-teal-400`}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30 group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-slate-900" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {platform.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {platform.description}
                  </p>
                </div>
                
                {/* Platform Features */}
                <div className="space-y-1 pt-2">
                  {platform.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-slate-700 font-medium">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Connection */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl font-semibold shadow-2xl shadow-teal-400/20 border border-teal-400/30">
            <span className="text-teal-300 text-lg">All Connected</span>
            {connectionFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-teal-300 text-xl">•</span>
                  <div className="flex items-center gap-1">
                    <Icon className="h-4 w-4 text-teal-300" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
