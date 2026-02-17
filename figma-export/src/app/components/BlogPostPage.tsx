import { motion } from "motion/react";
import { Clock, User, Tag, ArrowRight, Download, Lightbulb, CheckCircle, MessageCircle, Share2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

// Reusable Inline CTA Component
function InlineCTA({ type = "default" }: { type?: "default" | "demo" | "guide" }) {
  const navigate = useNavigate();
  
  const ctaContent: any = {
    default: {
      icon: Lightbulb,
      title: "Planning to start or run a school?",
      description: "See how Bodhi Board simplifies curriculum, training, and operations.",
      cta: "See How Bodhi Board Helps",
      action: () => navigate("/product")
    },
    demo: {
      icon: MessageCircle,
      title: "Want to see this in action?",
      description: "Book a personalized demo with our education team.",
      cta: "Book a Free Demo",
      action: () => navigate("/contact")
    },
    guide: {
      icon: Download,
      title: "Get the complete checklist",
      description: "Download our free guide with step-by-step implementation tips.",
      cta: "Download Free Guide",
      action: () => {} // Opens lead capture
    }
  };

  const content = ctaContent[type];
  const Icon = content.icon;

  return (
    <motion.div
      className="my-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {content.title}
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed">
            {content.description}
          </p>
          <button
            onClick={content.action}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            {content.cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Blog Sidebar Component
function BlogSidebar() {
  const navigate = useNavigate();
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  return (
    <div className="space-y-6 sticky top-24">
      {/* Starting a Preschool Card */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-bold text-slate-900 mb-2">
          Starting a Preschool?
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          See how Bodhi Board provides everything you need from day one.
        </p>
        <button
          onClick={() => navigate("/product")}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all"
        >
          Explore Features
        </button>
      </motion.div>

      {/* See in Action Card */}
      <motion.div
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-bold mb-2">
          See Bodhi Board in Action
        </h3>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          Book a personalized demo with our education team.
        </p>
        <button
          onClick={() => navigate("/contact")}
          className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold rounded-xl transition-all border border-white/30"
        >
          Book a Demo
        </button>
      </motion.div>

      {/* Download Checklist Card */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4">
          <Download className="h-6 w-6 text-slate-900" />
        </div>
        <h3 className="font-bold text-slate-900 mb-2">
          Download Free Checklist
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Get our complete preschool setup guide.
        </p>
        <button
          onClick={() => setShowLeadCapture(true)}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-all"
        >
          Get Free Guide
        </button>
      </motion.div>

      {/* Lead Capture Modal */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Get Your Free Guide
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              We'll share this on WhatsApp. No spam.
            </p>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="w-20 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center font-semibold text-slate-700">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-md"
              >
                Get the Free Guide
              </button>

              <button
                type="button"
                onClick={() => setShowLeadCapture(false)}
                className="w-full py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const post = {
    id: 1,
    title: "Building a Play-Based Curriculum: A Complete Guide for Preschools",
    category: "Curriculum",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
    author: "Dr. Priya Sharma",
    date: "Feb 12, 2026",
    readTime: "8 min read"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Header */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category & Meta */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                {post.category}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <span>{post.date}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Content with Sidebar */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main Content */}
            <motion.article
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Introduction */}
              <div className="text-slate-700 leading-relaxed space-y-6">
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  Play-based learning is not just a teaching method — it's a philosophy that recognizes how young children naturally learn and develop. In this comprehensive guide, we'll explore how to build a curriculum that puts play at the center of early education.
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">
                  Why Play-Based Learning Matters
                </h2>

                <p>
                  Research consistently shows that children learn best through active, hands-on experiences. Play-based learning creates an environment where children can explore, experiment, and discover at their own pace while developing critical cognitive, social, and emotional skills.
                </p>

                <p>
                  Unlike traditional worksheet-based approaches, play-based curricula recognize that children aged 2-6 years are in a unique developmental stage where their primary mode of learning is through sensory exploration and social interaction.
                </p>

                <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-r-xl my-8">
                  <p className="font-semibold text-slate-900 mb-2">
                    💡 Key Insight
                  </p>
                  <p className="text-slate-700 mb-0">
                    "Children don't play to learn — they learn because they play." This fundamental understanding should guide every curriculum decision.
                  </p>
                </div>
              </div>

              {/* Inline CTA 1 - After Introduction */}
              <InlineCTA type="default" />

              {/* Main Content Continues */}
              <div className="text-slate-700 leading-relaxed space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">
                  Core Principles of Play-Based Curriculum
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  1. Child-Led Learning
                </h3>

                <p>
                  The best play-based curricula follow the child's interests and developmental readiness. Teachers act as facilitators, providing materials and guidance while allowing children to direct their own learning journey.
                </p>

                <ul className="space-y-3 my-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                    <span>Observe children's interests and build activities around them</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                    <span>Allow children to choose activities and explore at their own pace</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                    <span>Provide open-ended materials that encourage creativity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                    <span>Support children's natural curiosity with thoughtful questions</span>
                  </li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  2. Integrated Development
                </h3>

                <p>
                  Effective play-based curricula don't separate subjects into silos. Instead, they create rich, integrated experiences where children develop multiple skills simultaneously through meaningful activities.
                </p>

                <p>
                  For example, building with blocks isn't just "free play" — it develops spatial reasoning, mathematical thinking, problem-solving, language skills, and social collaboration all at once.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  3. Learning Through Real Experiences
                </h3>

                <p>
                  Young children need concrete, hands-on experiences to build understanding. Abstract concepts should be introduced through tangible materials and real-world contexts that children can see, touch, and manipulate.
                </p>
              </div>

              {/* Inline CTA 2 - Mid Article */}
              <InlineCTA type="guide" />

              {/* More Content */}
              <div className="text-slate-700 leading-relaxed space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">
                  Building Your Play-Based Curriculum
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  Step 1: Define Your Educational Framework
                </h3>

                <p>
                  Start by identifying the developmental milestones and learning outcomes appropriate for each age group. Your curriculum should align with early childhood education standards while maintaining flexibility for individual children's needs.
                </p>

                <div className="bg-slate-50 rounded-xl p-6 my-8">
                  <h4 className="font-bold text-slate-900 mb-4">
                    Age-Appropriate Learning Goals:
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">Ages 2-3:</span>
                      <span className="text-slate-700"> Sensory exploration, basic motor skills, simple social interactions</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Ages 3-4:</span>
                      <span className="text-slate-700"> Creative expression, cooperative play, early literacy and numeracy</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Ages 4-5:</span>
                      <span className="text-slate-700"> Complex problem-solving, extended projects, emerging independence</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Ages 5-6:</span>
                      <span className="text-slate-700"> Advanced reasoning, collaborative work, school readiness skills</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  Step 2: Create Learning Centers
                </h3>

                <p>
                  Organize your classroom into distinct learning centers that encourage different types of play and development. Each center should be thoughtfully designed with appropriate materials and clear learning objectives.
                </p>

                <p>
                  Essential learning centers include: dramatic play, blocks and construction, art and creativity, sensory exploration, literacy corner, math and manipulatives, science and discovery, and outdoor play.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  Step 3: Plan Thematic Units
                </h3>

                <p>
                  Develop 2-4 week thematic units that integrate learning across all centers. Themes should be relevant to children's lives and interests, providing multiple entry points for exploration and discovery.
                </p>

                <p>
                  Strong themes emerge from children's questions and experiences: "How do things grow?", "Who lives in our neighborhood?", "What happens when we mix colors?"
                </p>
              </div>

              {/* Inline CTA 3 - Before Conclusion */}
              <InlineCTA type="demo" />

              {/* Conclusion */}
              <div className="text-slate-700 leading-relaxed space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">
                  Conclusion
                </h2>

                <p>
                  Building a play-based curriculum requires careful planning, ongoing observation, and deep understanding of child development. But the results — engaged, confident, enthusiastic learners — make every effort worthwhile.
                </p>

                <p>
                  Remember that implementing a play-based approach is a journey. Start with one area, observe how children respond, and gradually expand. Trust in children's natural capacity to learn through play, and create an environment that supports their curiosity and growth.
                </p>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 my-8 border-2 border-teal-100">
                  <h4 className="text-xl font-bold text-slate-900 mb-3">
                    Ready to transform your curriculum?
                  </h4>
                  <p className="text-slate-700 mb-4">
                    Bodhi Board provides complete, ready-to-use play-based curriculum resources, lesson plans, and teacher training to help your school implement these principles successfully.
                  </p>
                  <button
                    onClick={() => navigate("/curriculum-training")}
                    className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all"
                  >
                    Explore Our Curriculum
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Share Section */}
              <div className="border-t border-slate-200 pt-8 mt-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                      P
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{post.author}</p>
                      <p className="text-sm text-slate-600">Early Childhood Education Expert</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold transition-all">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </motion.article>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>

      {/* Blog-End Conversion Strip */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Running or Starting a School?
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Bodhi Board helps schools turn ideas, curriculum, and effort into structured systems — without chaos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Start 30-Day Free Trial
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all border-2 border-slate-200 hover:border-teal-400"
              >
                Book a Free Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sidebar CTAs - Bottom Sticky */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-4 shadow-2xl z-40">
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/product")}
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all text-sm"
          >
            Explore Features
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-all text-sm"
          >
            Book Demo
          </button>
        </div>
      </div>
    </div>
  );
}