import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { 
  Users, Target, GraduationCap, CheckCircle2, 
  TrendingUp, ArrowUpRight, Calendar, Bell, 
  UserPlus, ClipboardCheck, MessageSquare, BarChart3,
  Sparkles, BookOpen, Clock, Phone, FileText, Settings
} from "lucide-react";

export function WelcomeDashboard() {
  const schoolInfo = JSON.parse(sessionStorage.getItem("schoolInfo") || "{}");
  const schoolName = schoolInfo.name || "Your School";
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const [currentView, setCurrentView] = useState("dashboard");

  // Key Metrics
  const metrics = [
    { 
      label: "Total Students", 
      value: "0", 
      change: "+0%", 
      icon: Users, 
      color: "from-teal-400 to-cyan-500"
    },
    { 
      label: "Active Inquiries", 
      value: "0", 
      change: "+0%", 
      icon: Target, 
      color: "from-blue-400 to-blue-600"
    },
    { 
      label: "Staff Members", 
      value: "0", 
      change: "+0", 
      icon: GraduationCap, 
      color: "from-purple-400 to-purple-600"
    },
    { 
      label: "Attendance Today", 
      value: "0%", 
      change: "0/0", 
      icon: CheckCircle2, 
      color: "from-emerald-400 to-emerald-600"
    }
  ];

  // Quick Actions
  const quickActions = [
    { 
      label: "New Admission", 
      icon: UserPlus, 
      color: "from-teal-400 to-cyan-500",
      description: "Add inquiry or student"
    },
    { 
      label: "Mark Attendance", 
      icon: ClipboardCheck, 
      color: "from-blue-400 to-blue-600",
      description: "Today's attendance"
    },
    { 
      label: "Send Update", 
      icon: MessageSquare, 
      color: "from-purple-400 to-purple-600",
      description: "Notify parents"
    },
    { 
      label: "View Reports", 
      icon: BarChart3, 
      color: "from-pink-400 to-pink-600",
      description: "Analytics & insights"
    }
  ];

  // Recent Activity (mock data)
  const recentActivity = [
    { 
      type: "inquiry", 
      message: "Welcome! Your dashboard is ready to use.", 
      time: "Just now",
      icon: Sparkles,
      color: "text-teal-500"
    },
    { 
      type: "system", 
      message: "System setup completed successfully", 
      time: "5 minutes ago",
      icon: CheckCircle2,
      color: "text-emerald-500"
    }
  ];

  // Upcoming tasks
  const upcomingTasks = [
    { task: "Add first student", priority: "high", icon: UserPlus },
    { task: "Invite staff members", priority: "medium", icon: Users },
    { task: "Configure curriculum", priority: "low", icon: BookOpen }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar onNavigate={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 ml-0 lg:ml-0">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                  Welcome back, {schoolName}! 👋
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">{currentDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-teal-500 rounded-full"></span>
                </button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex border-slate-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Trial Banner */}
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 px-4 lg:px-8 py-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">30-Day Free Trial Active</span>
                <span className="hidden md:inline opacity-80">• Full access to all features</span>
              </div>
              <button className="text-sm font-medium underline hover:no-underline">
                Upgrade Anytime
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <ArrowUpRight className="h-3 w-3" />
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all text-left group"
                  >
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">{action.label}</h3>
                    <p className="text-xs text-slate-600">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Getting Started Progress */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Getting Started</h3>
                      <p className="text-xs text-slate-600">Complete your setup</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-teal-600">1/6 Complete</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full transition-all" style={{ width: "16%" }}></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-200">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-900">Account created</span>
                  </div>
                  {upcomingTasks.map((task, idx) => {
                    const TaskIcon = task.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                        <TaskIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{task.task}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-700" :
                          task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module Shortcuts */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Popular Modules</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: "AI Dashboard", icon: Sparkles, color: "teal" },
                    { name: "Students", icon: Users, color: "blue" },
                    { name: "Attendance", icon: ClipboardCheck, color: "emerald" },
                    { name: "Curriculum", icon: BookOpen, color: "purple" },
                    { name: "WhatsApp", icon: Phone, color: "pink" },
                    { name: "Reports", icon: BarChart3, color: "orange" }
                  ].map((module, idx) => {
                    const ModuleIcon = module.icon;
                    return (
                      <button
                        key={idx}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                      >
                        <div className={`h-10 w-10 rounded-lg bg-${module.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <ModuleIcon className={`h-5 w-5 text-${module.color}-600`} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">
                          {module.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
                  <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <ActivityIcon className={`h-4 w-4 ${activity.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 leading-relaxed">{activity.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Need Help?</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-2 text-xs group">
                    <BookOpen className="h-4 w-4 text-slate-600 group-hover:text-teal-600" />
                    <span className="text-slate-700 group-hover:text-teal-700">Documentation</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-2 text-xs group">
                    <MessageSquare className="h-4 w-4 text-slate-600 group-hover:text-teal-600" />
                    <span className="text-slate-700 group-hover:text-teal-700">Contact Support</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-2 text-xs group">
                    <Phone className="h-4 w-4 text-slate-600 group-hover:text-teal-600" />
                    <span className="text-slate-700 group-hover:text-teal-700">Schedule Demo</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-bold text-sm">This Week</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-50">New Inquiries</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-50">Admissions</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-50">Parent Updates</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
