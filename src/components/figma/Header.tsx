"use client";

import { Menu, X, ChevronDown, Sparkles, Zap, GraduationCap, Users, BookOpen, DollarSign, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      label: "Features",
      href: "/product",
      icon: Sparkles,
      hasDropdown: false
    },
    {
      label: "Curriculum",
      href: "/curriculum",
      icon: BookOpen,
      hasDropdown: false
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: DollarSign,
      hasDropdown: false
    },
    {
      label: "About",
      href: "/about-us",
      icon: Users,
      hasDropdown: false
    },
    {
      label: "Careers",
      href: "#careers",
      icon: Zap,
      hasDropdown: false
    },
    {
      label: "Blog",
      href: "/blog",
      icon: FileText,
      hasDropdown: false
    },
    {
      label: "Contact",
      href: "/contact",
      icon: Mail,
      hasDropdown: false
    }
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-teal-500/10 border-b border-teal-500/20'
        : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      {/* Top Bar - Announcement */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 animate-gradient-x">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-9 text-white text-sm font-medium gap-2">
            <Sparkles className="h-4 w-4" />
            <span>🎉 New: AI-Powered Analytics Dashboard - <span className="underline cursor-pointer hover:text-teal-100 transition-colors">Explore Now</span></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/40"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-2xl">🧠</span>
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Bodhi Board
                </span>
                <span className="text-xs text-teal-300/80 font-medium">by Little Chanakyas</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-800/50 flex items-center gap-2 group"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-y-0.5" />
                    )}
                    {/* Active indicator */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      whileHover={{ width: "70%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/school-login">
              <motion.button
                className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-800/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/signup">
                <Button
                  className="relative px-6 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 shadow-lg shadow-teal-500/40 font-semibold text-sm rounded-full overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Try Free for 30 Days
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="lg:hidden p-2.5 rounded-lg bg-slate-800 text-teal-400 hover:bg-slate-700 hover:text-teal-300 transition-colors border border-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden pb-4 pt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2 mb-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-slate-700 pt-4">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 shadow-lg shadow-teal-500/30 font-semibold rounded-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try Free for 30 Days
                  </Button>
                </Link>
                <Link href="/school-login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}