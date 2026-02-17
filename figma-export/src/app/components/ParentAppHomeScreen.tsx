import { motion } from "motion/react";
import { useState } from "react";
import {
  Bell,
  Calendar,
  Clock,
  Bus,
  CheckCircle,
  Camera,
  Award,
  ChevronRight,
  Heart,
  Sparkles,
  MessageCircle,
  Palette,
  Activity,
  BookOpen,
  TrendingUp,
  CreditCard,
  Download,
  Eye
} from "lucide-react";

export function HomeScreen({ childData, setActiveScreen, setActiveTab }: any) {
  const quickActions = [
    { icon: Calendar, label: "Attendance", color: "from-orange-400 to-amber-500", screen: "attendance" },
    { icon: BookOpen, label: "Diary", color: "from-teal-400 to-cyan-500", screen: "diary", tab: "diary" },
    { icon: TrendingUp, label: "Progress", color: "from-blue-400 to-indigo-500", screen: "progress", tab: "progress" },
    { icon: Bus, label: "Transport", color: "from-purple-400 to-pink-500", screen: "transport" },
    { icon: CreditCard, label: "Fees", color: "from-rose-400 to-red-500", screen: "fees", tab: "fees" },
    { icon: Bell, label: "Notices", color: "from-amber-400 to-yellow-500", screen: "announcements" }
  ];

  const todayActivities = [
    { 
      time: "9:00 AM", 
      title: "Morning Circle", 
      emoji: "☀️",
      status: "completed"
    },
    { 
      time: "10:00 AM", 
      title: "Story Time", 
      emoji: "📚",
      status: "completed"
    },
    { 
      time: "11:00 AM", 
      title: "Art & Craft", 
      emoji: "🎨",
      status: "in-progress"
    },
    { 
      time: "12:00 PM", 
      title: "Outdoor Play", 
      emoji: "⚽",
      status: "upcoming"
    }
  ];

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 min-h-full relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl"></div>

      {/* Clean Header */}
      <motion.div 
        className="relative px-6 pt-8 pb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.p 
              className="text-orange-600 text-sm font-medium mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Good Morning
            </motion.p>
            <motion.h2 
              className="text-2xl font-bold text-slate-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {childData.name.split(' ')[0]}'s Day
            </motion.h2>
          </div>
          <motion.button 
            className="relative p-3 rounded-2xl bg-white hover:bg-orange-50 transition-all shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Bell className="h-5 w-5 text-slate-700" />
            <motion.span 
              className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
            >
              3
            </motion.span>
          </motion.button>
        </div>

        {/* Elegant Child Card */}
        <motion.div 
          className="bg-white rounded-3xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          whileHover={{ y: -2, shadow: "0 10px 30px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-4 mb-5">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-4xl shadow-md">
                {childData.photo}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{childData.name}</h3>
              <p className="text-sm text-slate-500 font-medium mb-2">{childData.class}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Present Today
              </span>
            </div>
          </div>

          {/* Clean Stats */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-600 font-medium mb-1">Attendance</p>
              <p className="text-lg font-bold text-slate-800">{childData.attendancePercentage}%</p>
            </div>
            <div className="flex-1 bg-cyan-50 rounded-xl p-3 text-center">
              <p className="text-xs text-cyan-600 font-medium mb-1">Mood</p>
              <p className="text-2xl">😊</p>
            </div>
            <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-purple-600 font-medium mb-1">Bus</p>
              <p className="text-xs font-bold text-slate-800">On Time</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="px-6 pb-24">
        {/* Today's Activities - Clean Design */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Today's Activities</h3>
            <button className="text-xs font-semibold text-orange-600">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {todayActivities.map((activity, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl p-4 shadow-sm ${
                  activity.status === 'in-progress' ? 'ring-2 ring-orange-400' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {activity.emoji}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm mb-1">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>

                  {activity.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {activity.status === 'in-progress' && (
                    <motion.div
                      className="h-5 w-5 rounded-full bg-orange-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions - Minimal Grid */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  onClick={() => {
                    setActiveScreen(action.screen);
                    if (action.tab) setActiveTab(action.tab);
                  }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, shadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 mx-auto shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="font-semibold text-slate-700 text-xs">{action.label}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Photos - Clean Gallery */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Recent Photos</h3>
            <button 
              onClick={() => {
                setActiveScreen("diary");
                setActiveTab("diary");
              }}
              className="text-xs font-semibold text-orange-600"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                className="aspect-square rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden shadow-sm relative group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-orange-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Teacher's Message - Simple Card */}
        <motion.div 
          className="bg-white rounded-3xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xl shadow-sm">
              👩‍🏫
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Ms. Priya Sharma</p>
              <p className="text-xs text-slate-500">Class Teacher</p>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-2xl p-4 mb-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              "Aarav had a wonderful day today! Great enthusiasm during story time. 🌟"
            </p>
          </div>
          
          <button className="w-full py-2.5 bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Reply
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}