import { motion } from "motion/react";
import { useState } from "react";
import {
  Phone,
  Video,
  BookOpen,
  Shield,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Users,
  Heart,
  Award,
  MessageCircle,
  Send,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";

export function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    schoolName: "",
    city: "",
    interestedIn: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const contactOptions = [
    {
      icon: Phone,
      title: "Talk to Sales",
      description: "Pricing, plans, onboarding guidance",
      cta: "Talk to Sales",
      color: "from-teal-500 to-cyan-600",
      action: () => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })
    },
    {
      icon: Video,
      title: "Book a Product Demo",
      description: "See how Bodhi Board works for your school",
      cta: "Book a Demo",
      color: "from-cyan-500 to-teal-600",
      action: () => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })
    },
    {
      icon: BookOpen,
      title: "Curriculum & Training",
      description: "Questions about curriculum, induction & SOPs",
      cta: "Talk to Education Team",
      color: "from-teal-600 to-cyan-500",
      action: () => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })
    },
    {
      icon: Shield,
      title: "Support",
      description: "Existing customer support & assistance",
      cta: "Get Support",
      color: "from-cyan-600 to-teal-500",
      action: () => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })
    }
  ];

  const interestOptions = [
    "Starting a New Preschool",
    "School ERP / Software",
    "Curriculum & Training",
    "Franchise / Expansion",
    "Product Demo",
    "Support / Help",
    "Other"
  ];

  const whyChooseUs = [
    {
      icon: Users,
      title: "Built by real educators",
      description: "We understand schools because we've run them"
    },
    {
      icon: Award,
      title: "Powered by proven school operations",
      description: "Tested in real classrooms, refined over years"
    },
    {
      icon: BookOpen,
      title: "Curriculum designed with global educationists",
      description: "International standards, India-first approach"
    },
    {
      icon: Heart,
      title: "Honest guidance, not pushy sales",
      description: "We help you make the right decision for your school"
    },
    {
      icon: MapPin,
      title: "India-first, school-first approach",
      description: "Built for Indian schools, by Indian educators"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.interestedIn) {
      newErrors.interestedIn = "Please select what you're interested in";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission
      console.log("Form submitted:", formData);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: "",
          mobile: "",
          email: "",
          schoolName: "",
          city: "",
          interestedIn: "",
          message: ""
        });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-slate-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Contact Us
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-slate-700 mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Have questions about starting, running, or growing a school?<br />
              <span className="text-teal-600 font-semibold">Our team is here to help.</span>
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center gap-3 flex-wrap text-sm text-slate-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                Sales
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                Product
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                Curriculum
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                Training
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                Support
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.title}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:border-teal-200 transition-all hover:shadow-xl group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {option.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <button
                    onClick={option.action}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-semibold rounded-xl transition-all border border-slate-200 hover:border-teal-300"
                  >
                    {option.cta}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-lg text-slate-600">
                Fill out the form and we'll get back to you within 24 hours
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-8 md:p-10">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 rounded-xl border-2 ${
                        errors.fullName ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                      } focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="font-medium">{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center font-semibold text-slate-700">
                        +91
                      </div>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        maxLength={10}
                        className={`flex-1 px-4 py-3.5 rounded-xl border-2 ${
                          errors.mobile ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                        } focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900`}
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="font-medium">{errors.mobile}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* School Name */}
                  <div>
                    <label htmlFor="schoolName" className="block text-sm font-semibold text-slate-700 mb-2">
                      School Name <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900"
                      placeholder="Your school name"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                      City <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900"
                      placeholder="Your city"
                    />
                  </div>

                  {/* I am interested in */}
                  <div>
                    <label htmlFor="interestedIn" className="block text-sm font-semibold text-slate-700 mb-2">
                      I am interested in <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="interestedIn"
                        name="interestedIn"
                        value={formData.interestedIn}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 rounded-xl border-2 ${
                          errors.interestedIn ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                        } focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900 appearance-none cursor-pointer`}
                      >
                        <option value="">Select an option</option>
                        {interestOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.interestedIn && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="font-medium">{errors.interestedIn}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                      Message <span className="text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-slate-900 resize-none"
                      placeholder="Tell us more about your requirements..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Submit & Connect
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Thank You!
                  </h3>
                  <p className="text-lg text-slate-600">
                    Our team will reach out to you shortly.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Get in Touch Directly
              </h2>
              <p className="text-lg text-slate-600">
                Reach out to us through any of these channels
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Email */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 text-center"
                whileHover={{ y: -4 }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Email Us</h3>
                <p className="text-sm text-slate-600 mb-2">
                  <a href="mailto:support@bodhiboard.com" className="text-teal-600 hover:text-teal-700 font-semibold">
                    support@bodhiboard.com
                  </a>
                </p>
                <p className="text-sm text-slate-600">
                  <a href="mailto:sales@bodhiboard.com" className="text-teal-600 hover:text-teal-700 font-semibold">
                    sales@bodhiboard.com
                  </a>
                </p>
              </motion.div>

              {/* Phone */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 text-center"
                whileHover={{ y: -4 }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Call Us</h3>
                <p className="text-sm text-slate-600 mb-2">
                  <a href="tel:+919876543210" className="text-teal-600 hover:text-teal-700 font-semibold text-lg">
                    +91 98765 43210
                  </a>
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-3">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Mon–Sat | 9:30 AM – 6:30 PM</span>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 text-center"
                whileHover={{ y: -4 }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Visit Us</h3>
                <p className="text-sm text-slate-600 mb-2 font-semibold">
                  Chennai, India
                </p>
                <p className="text-xs text-slate-500">
                  Little Chanakyas HQ
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Why Schools Choose to Speak with Us
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                We're not just a software company — we're educators who understand your challenges
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 shadow-md border border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-teal-600" strokeWidth={2} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-12 text-center shadow-xl border-2 border-slate-200">
              <div className="max-w-2xl mx-auto">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Proudly Based in Chennai
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Our team operates from the heart of India's education hub, serving schools across the country with dedication and care.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-teal-200 text-sm font-semibold text-slate-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Available to serve schools nationwide
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Not Sure Where to Start?
            </h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Let us understand your school and guide you — step by step.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Talk to Sales
              </button>
              
              <button
                onClick={() => window.scrollTo({ top: document.getElementById("contact-form")?.offsetTop! - 100, behavior: "smooth" })}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-all border-2 border-white/30 hover:border-white/50 flex items-center gap-2"
              >
                <Video className="h-5 w-5" />
                Book a Demo
              </button>
            </div>

            {/* Trust Badge */}
            <motion.div
              className="mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-sm text-slate-400 mb-4">
                Trusted by educators • Built for schools • Made in India
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {["Response in 24 hours", "No spam, ever", "Free consultation"].map((item, index) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}