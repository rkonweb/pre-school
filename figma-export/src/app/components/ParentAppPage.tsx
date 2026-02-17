import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  CreditCard, 
  Menu,
  Bell,
  Calendar,
  Clock,
  Bus,
  CheckCircle,
  Download,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Phone,
  MapPin,
  Camera,
  DollarSign,
  Award,
  BarChart3,
  Eye,
  Languages,
  BellRing,
  Shield,
  Heart,
  Smile,
  Sparkles,
  ArrowLeft,
  Share2,
  MessageCircle,
  Palette,
  Activity
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { HomeScreen } from "./ParentAppHomeScreen";

export function ParentAppPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [activeScreen, setActiveScreen] = useState("home");

  // Sample child data
  const childData = {
    name: "Aarav Sharma",
    class: "Playgroup A",
    photo: "👦",
    attendance: "Present",
    busStatus: "On Time",
    attendancePercentage: 94
  };

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "diary", label: "Diary", icon: BookOpen },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "fees", label: "Fees", icon: CreditCard },
    { id: "more", label: "More", icon: Menu }
  ];

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <HomeScreen childData={childData} setActiveScreen={setActiveScreen} setActiveTab={setActiveTab} />;
      case "attendance":
        return <AttendanceScreen childData={childData} setActiveScreen={setActiveScreen} />;
      case "diary":
        return <DiaryScreen setActiveScreen={setActiveScreen} />;
      case "progress":
        return <ProgressScreen setActiveScreen={setActiveScreen} />;
      case "curriculum":
        return <CurriculumScreen setActiveScreen={setActiveScreen} />;
      case "fees":
        return <FeesScreen setActiveScreen={setActiveScreen} />;
      case "transport":
        return <TransportScreen setActiveScreen={setActiveScreen} />;
      case "announcements":
        return <AnnouncementsScreen setActiveScreen={setActiveScreen} />;
      case "more":
        return <MoreScreen setActiveScreen={setActiveScreen} />;
      case "profile":
        return <ProfileScreen setActiveScreen={setActiveScreen} />;
      default:
        return <HomeScreen childData={childData} setActiveScreen={setActiveScreen} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Info */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Parent Mobile App
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            A warm, reliable companion that keeps parents connected to their child's school life.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full">
            <Heart className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-bold text-teal-800">Parent-First Design • Stress-Free Experience</span>
          </div>
        </motion.div>

        {/* Mobile Phone Mockup - iPhone 17 Pro Max */}
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* iPhone 17 Pro Max Frame */}
          <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[3.5rem] p-2.5 shadow-2xl">
            {/* Screen Container */}
            <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-2xl" style={{ height: "740px", width: "360px" }}>
              {/* Dynamic Island Area */}
              <div className="absolute top-0 left-0 right-0 h-14 bg-white z-20">
                {/* Status Bar Content */}
                <div className="px-8 pt-5 flex items-start justify-between">
                  <span className="text-sm font-semibold text-slate-900">9:41</span>
                  <div className="flex items-center gap-1.5">
                    {/* Cellular Signal */}
                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="text-slate-900">
                      <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor"/>
                      <rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/>
                      <rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
                      <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor"/>
                    </svg>
                    {/* WiFi */}
                    <svg width="18" height="13" viewBox="0 0 18 13" fill="none" className="text-slate-900">
                      <path d="M9 13C9.82843 13 10.5 12.3284 10.5 11.5C10.5 10.6716 9.82843 10 9 10C8.17157 10 7.5 10.6716 7.5 11.5C7.5 12.3284 8.17157 13 9 13Z" fill="currentColor"/>
                      <path d="M13.5 8C11.5 6 10 6 9 6C8 6 6.5 6 4.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 5C13 2 11 1.5 9 1.5C7 1.5 5 2 2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {/* Battery */}
                    <div className="flex items-center gap-0.5">
                      <div className="w-6 h-3 border-2 border-slate-900 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-slate-900 rounded-[1px]"></div>
                      </div>
                      <div className="w-0.5 h-1.5 bg-slate-900 rounded-r-sm"></div>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full shadow-lg flex items-center justify-center px-3">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-purple-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs">
                      👦
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen Content - Scrollable Area */}
              <div className="h-[calc(100%-80px)] overflow-y-auto mt-14 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .h-[calc(100%-80px)]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <AnimatePresence mode="wait">
                  {renderScreen()}
                </AnimatePresence>
              </div>

              {/* Bottom Navigation Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-850 to-slate-900 border-t border-slate-700/50 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-around px-4 pt-2 pb-7">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setActiveScreen(tab.id);
                        }}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative ${
                          isActive 
                            ? "text-white" 
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Active Background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg"
                            layoutId="activeTab"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30
                            }}
                          />
                        )}
                        
                        {/* Icon */}
                        <motion.div
                          className="relative z-10"
                          animate={isActive ? {
                            filter: [
                              "drop-shadow(0 0 2px rgba(251, 146, 60, 0.5))",
                              "drop-shadow(0 0 6px rgba(251, 146, 60, 0.8))",
                              "drop-shadow(0 0 2px rgba(251, 146, 60, 0.5))"
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.5} />
                        </motion.div>
                        
                        {/* Label */}
                        <span className="text-[10px] font-semibold relative z-10">
                          {tab.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Home Indicator Bar */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>

            {/* Physical Side Buttons */}
            {/* Left Side - Volume & Mute */}
            <div className="absolute -left-0.5 top-32 w-0.5 h-14 bg-slate-700 rounded-l"></div>
            <div className="absolute -left-0.5 top-48 w-0.5 h-10 bg-slate-700 rounded-l"></div>
            <div className="absolute -left-0.5 top-60 w-0.5 h-10 bg-slate-700 rounded-l"></div>
            
            {/* Right Side - Power Button */}
            <div className="absolute -right-0.5 top-36 w-0.5 h-16 bg-slate-700 rounded-r"></div>
          </div>
        </motion.div>

        {/* Features Grid Below Phone */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            {
              icon: Heart,
              title: "Parent-First Design",
              description: "Built for busy parents who need clarity, not complexity"
            },
            {
              icon: Shield,
              title: "Trustworthy & Safe",
              description: "Know your child is safe with real-time updates"
            },
            {
              icon: Smile,
              title: "Stress-Free Experience",
              description: "Simple, warm, and easy to use for all parents"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// Screen Components

function AttendanceScreen({ childData, setActiveScreen }: any) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
  
  return (
    <motion.div
      key="attendance"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveScreen("home")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="text-center">
          <p className="text-teal-100 mb-2">This Month</p>
          <p className="text-5xl font-bold text-white mb-2">{childData.attendancePercentage}%</p>
          <p className="text-sm text-teal-100">23 Present • 1 Absent</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">December 2024</h3>
          <Calendar className="h-5 w-5 text-teal-600" />
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const isPresent = day % 7 !== 0; // Mock: every 7th day is absent
            const isToday = day === 15;
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold ${
                  isToday
                    ? "bg-slate-900 text-white"
                    : isPresent
                    ? "bg-teal-100 text-teal-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-100 rounded"></div>
            <span className="text-xs text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-xs text-slate-600">Absent</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DiaryScreen({ setActiveScreen }: any) {
  const diaryEntries = [
    {
      date: "Today, Dec 15",
      activities: [
        { title: "Morning Circle Time", desc: "Discussed weather and days of the week", time: "9:00 AM" },
        { title: "Story Time", desc: "Read 'The Very Hungry Caterpillar'", time: "10:30 AM" },
        { title: "Outdoor Play", desc: "Sand play and swings", time: "11:30 AM" }
      ],
      note: "Aarav participated actively in all activities today. Great energy!",
      images: 2
    },
    {
      date: "Yesterday, Dec 14",
      activities: [
        { title: "Art Activity", desc: "Finger painting with primary colors", time: "9:30 AM" },
        { title: "Music & Movement", desc: "Dance to nursery rhymes", time: "11:00 AM" }
      ],
      note: "Enjoyed art activity and made a beautiful painting.",
      images: 1
    }
  ];

  return (
    <motion.div
      key="diary"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Daily Diary</h2>
        <BookOpen className="h-6 w-6 text-teal-600" />
      </div>

      {/* Diary Entries */}
      <div className="space-y-4">
        {diaryEntries.map((entry, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">{entry.date}</h3>
              {entry.images > 0 && (
                <div className="flex items-center gap-1 text-teal-600">
                  <Camera className="h-4 w-4" />
                  <span className="text-xs font-semibold">{entry.images} photos</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {entry.activities.map((activity, aIndex) => (
                <div key={aIndex} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-teal-600" />
                    </div>
                    {aIndex < entry.activities.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{activity.title}</p>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Teacher's Note: </span>
                {entry.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProgressScreen({ setActiveScreen }: any) {
  const skills = [
    { name: "Language & Communication", progress: 85, color: "bg-teal-500" },
    { name: "Social & Emotional", progress: 90, color: "bg-cyan-500" },
    { name: "Physical Development", progress: 80, color: "bg-teal-600" },
    { name: "Cognitive Skills", progress: 75, color: "bg-cyan-600" },
    { name: "Creative Expression", progress: 88, color: "bg-teal-500" }
  ];

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Progress Report</h2>
        <TrendingUp className="h-6 w-6 text-teal-600" />
      </div>

      {/* Term Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["Term 1", "Term 2", "Term 3"].map((term, index) => (
          <button
            key={term}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ${
              index === 0
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg text-center">
        <p className="text-teal-100 mb-2">Overall Development</p>
        <p className="text-5xl font-bold text-white mb-2">84%</p>
        <p className="text-sm text-teal-100">Excellent Progress!</p>
      </div>

      {/* Skill Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 mb-4">
        <h3 className="font-bold text-slate-900 mb-4">Skill Development</h3>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                <p className="text-sm font-bold text-teal-600">{skill.progress}%</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                  style={{ width: `${skill.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Report */}
      <button 
        className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex items-center justify-between hover:shadow-lg transition-all active:scale-95"
        onClick={() => setActiveScreen("curriculum")}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Download className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900 text-sm">Download Full Report</p>
            <p className="text-xs text-slate-500">PDF • Term 1 2024</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </button>

      {/* Curriculum Link */}
      <button 
        className="w-full bg-teal-50 rounded-2xl p-4 mt-3 border-2 border-teal-200 flex items-center justify-between hover:bg-teal-100 transition-all active:scale-95"
        onClick={() => setActiveScreen("curriculum")}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-500 flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900 text-sm">View Curriculum</p>
            <p className="text-xs text-teal-600">What your child is learning</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-teal-600" />
      </button>
    </motion.div>
  );
}

function CurriculumScreen({ setActiveScreen }: any) {
  const learningAreas = [
    {
      title: "Language & Communication",
      items: ["Listening to stories", "Expressing needs", "Following simple instructions"]
    },
    {
      title: "Early Numeracy",
      items: ["Counting 1-10", "Recognizing shapes", "Sorting by color"]
    },
    {
      title: "Social Skills",
      items: ["Sharing with friends", "Taking turns", "Following classroom rules"]
    }
  ];

  return (
    <motion.div
      key="curriculum"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveScreen("progress")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Curriculum</h2>
      </div>

      {/* Current Month */}
      <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
        <p className="text-teal-100 mb-2">This Month's Theme</p>
        <h3 className="text-2xl font-bold text-white mb-2">Animals & Nature</h3>
        <p className="text-sm text-teal-100">Exploring the world around us through stories, activities, and play.</p>
      </div>

      {/* Learning Areas */}
      <div className="space-y-4">
        {learningAreas.map((area, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">{area.title}</h3>
            <ul className="space-y-2">
              {area.items.map((item, iIndex) => (
                <li key={iIndex} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FeesScreen({ setActiveScreen }: any) {
  const feeDetails = [
    { label: "Tuition Fee", amount: "₹12,000", status: "paid", date: "Dec 1, 2024" },
    { label: "Transport Fee", amount: "₹3,000", status: "paid", date: "Dec 1, 2024" },
    { label: "Activity Fee", amount: "₹1,500", status: "due", date: "Due: Dec 20, 2024" }
  ];

  return (
    <motion.div
      key="fees"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Fees & Payments</h2>
        <CreditCard className="h-6 w-6 text-teal-600" />
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-6 mb-6 shadow-lg">
        <p className="text-amber-900 mb-2">Amount Due</p>
        <p className="text-5xl font-bold text-slate-900 mb-4">₹1,500</p>
        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors active:scale-95">
          Pay Now
        </button>
      </div>

      {/* Fee Details */}
      <div className="space-y-3 mb-6">
        {feeDetails.map((fee, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-900">{fee.label}</p>
              <p className="font-bold text-slate-900">{fee.amount}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{fee.date}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                fee.status === "paid" 
                  ? "bg-teal-100 text-teal-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {fee.status === "paid" ? "Paid" : "Due"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Receipts */}
      <button className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex items-center justify-between hover:shadow-lg transition-all active:scale-95">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900 text-sm">Payment History</p>
            <p className="text-xs text-slate-500">View all receipts</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </button>
    </motion.div>
  );
}

function TransportScreen({ setActiveScreen }: any) {
  return (
    <motion.div
      key="transport"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveScreen("home")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Transport</h2>
      </div>

      {/* Status Card */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg text-center">
        <Bus className="h-12 w-12 text-white mx-auto mb-3" />
        <p className="text-teal-100 mb-2">Bus Status</p>
        <p className="text-3xl font-bold text-white mb-2">On Time</p>
        <p className="text-sm text-teal-100">Expected arrival: 8:45 AM</p>
      </div>

      {/* Bus Details */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 mb-4">
        <h3 className="font-bold text-slate-900 mb-4">Bus Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <Bus className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Bus Number</p>
              <p className="font-semibold text-slate-900">Route 5A</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pickup Point</p>
              <p className="font-semibold text-slate-900">Sector 17, Near Park</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Driver Information</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-2xl">
            👨‍✈️
          </div>
          <div>
            <p className="font-semibold text-slate-900">Rajesh Kumar</p>
            <p className="text-sm text-slate-500">DL: DL0420240001234</p>
          </div>
        </div>
        <button className="w-full bg-teal-50 border-2 border-teal-200 text-teal-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors active:scale-95">
          <Phone className="h-5 w-5" />
          Contact Driver
        </button>
      </div>
    </motion.div>
  );
}

function AnnouncementsScreen({ setActiveScreen }: any) {
  const announcements = [
    {
      title: "Winter Break Schedule",
      date: "Dec 14, 2024",
      type: "important",
      content: "School will be closed from Dec 24 to Jan 2 for winter break."
    },
    {
      title: "Annual Day Celebration",
      date: "Dec 10, 2024",
      type: "event",
      content: "Join us for our Annual Day on December 20th at 10 AM."
    },
    {
      title: "Fee Payment Reminder",
      date: "Dec 5, 2024",
      type: "reminder",
      content: "Please clear pending dues before December 20th."
    }
  ];

  return (
    <motion.div
      key="announcements"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveScreen("more")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{announcement.title}</h3>
                <p className="text-xs text-slate-500">{announcement.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                announcement.type === "important" 
                  ? "bg-red-100 text-red-700"
                  : announcement.type === "event"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {announcement.type}
              </span>
            </div>
            <p className="text-slate-700 text-sm mb-3">{announcement.content}</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MoreScreen({ setActiveScreen }: any) {
  const menuItems = [
    { icon: Bell, label: "Announcements", screen: "announcements", color: "from-teal-500 to-cyan-600" },
    { icon: FileText, label: "Documents", screen: "announcements", color: "from-cyan-500 to-teal-600" },
    { icon: User, label: "Profile & Settings", screen: "profile", color: "from-teal-600 to-cyan-500" },
    { icon: MessageCircle, label: "Contact School", screen: "more", color: "from-cyan-600 to-teal-500" }
  ];

  return (
    <motion.div
      key="more"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">More</h2>
        <Menu className="h-6 w-6 text-teal-600" />
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-lg">
            👨
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Priya Sharma</h3>
            <p className="text-teal-100">Parent • Aarav's Mother</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setActiveScreen(item.screen)}
              className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex items-center justify-between hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-900">{item.label}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ProfileScreen({ setActiveScreen }: any) {
  const settings = [
    { icon: Languages, label: "Language", value: "English" },
    { icon: BellRing, label: "Notifications", value: "Enabled" },
    { icon: Shield, label: "Privacy", value: "Manage" }
  ];

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveScreen("more")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Profile & Settings</h2>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">Parent Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Full Name</p>
            <p className="font-semibold text-slate-900">Priya Sharma</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="font-semibold text-slate-900">priya.sharma@email.com</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Phone</p>
            <p className="font-semibold text-slate-900">+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3 mb-6">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <button
              key={setting.label}
              className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex items-center justify-between hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">{setting.label}</p>
                  <p className="text-xs text-slate-500">{setting.value}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button className="w-full bg-red-50 border-2 border-red-200 text-red-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-95">
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </motion.div>
  );
}