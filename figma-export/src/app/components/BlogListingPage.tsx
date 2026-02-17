import { motion } from "motion/react";
import { Clock, User, ArrowRight, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BlogListingPage() {
  const navigate = useNavigate();

  const categories = [
    "Curriculum",
    "Teacher Training",
    "School Operations",
    "Admissions",
    "Growth"
  ];

  const featuredPost = {
    id: 1,
    title: "Building a Play-Based Curriculum: A Complete Guide for Preschools",
    excerpt: "Discover how play-based learning transforms early education and creates lifelong learners. From theory to practical implementation strategies.",
    category: "Curriculum",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    author: "Dr. Priya Sharma",
    date: "Feb 12, 2026",
    readTime: "8 min read"
  };

  const blogPosts = [
    {
      id: 2,
      title: "How to Train Teachers for Modern Preschool Classrooms",
      excerpt: "A structured approach to teacher training that creates confident, capable educators ready for today's classroom challenges.",
      category: "Teacher Training",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
      author: "Ananya Reddy",
      date: "Feb 10, 2026",
      readTime: "6 min read"
    },
    {
      id: 3,
      title: "15 Best Practices for Smooth School Operations",
      excerpt: "From attendance tracking to parent communication, learn the systems that make schools run efficiently.",
      category: "School Operations",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
      author: "Rajesh Kumar",
      date: "Feb 8, 2026",
      readTime: "10 min read"
    },
    {
      id: 4,
      title: "Admission Season Strategy: Fill Your School Without Stress",
      excerpt: "A proven framework to attract the right families and streamline your admission process from inquiry to enrollment.",
      category: "Admissions",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
      author: "Meera Nair",
      date: "Feb 5, 2026",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Scaling Your Preschool: From 1 Center to Multiple Locations",
      excerpt: "Real stories and practical steps from school founders who successfully expanded their preschool business.",
      category: "Growth",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
      author: "Vikram Patel",
      date: "Feb 3, 2026",
      readTime: "12 min read"
    },
    {
      id: 6,
      title: "The Ultimate Parent Communication Checklist",
      excerpt: "Build trust and transparency with families through consistent, clear communication strategies.",
      category: "School Operations",
      image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=600&q=80",
      author: "Sneha Gupta",
      date: "Feb 1, 2026",
      readTime: "5 min read"
    },
    {
      id: 7,
      title: "Creating Age-Appropriate Learning Activities (2-6 Years)",
      excerpt: "Detailed activity plans and developmental milestones to create engaging, effective learning experiences.",
      category: "Curriculum",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      author: "Dr. Kavita Singh",
      date: "Jan 28, 2026",
      readTime: "9 min read"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: any = {
      "Curriculum": "bg-teal-100 text-teal-700",
      "Teacher Training": "bg-purple-100 text-purple-700",
      "School Operations": "bg-blue-100 text-blue-700",
      "Admissions": "bg-orange-100 text-orange-700",
      "Growth": "bg-green-100 text-green-700"
    };
    return colors[category] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Bodhi Board Blog
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
              Insights, ideas, and best practices to build and run better schools.
            </p>

            {/* Category Tags */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  className="px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-full border-2 border-slate-200 hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
                <Tag className="h-4 w-4" />
                Featured Article
              </span>
            </div>

            <div 
              onClick={() => navigate(`/blog/${featuredPost.id}`)}
              className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 md:h-auto overflow-hidden bg-slate-100">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 ${getCategoryColor(featuredPost.category)} rounded-full text-xs font-semibold`}>
                    {featuredPost.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-teal-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="inline-flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                    Read Article
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-10">
              Latest Articles
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-xl hover:border-teal-200 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 ${getCategoryColor(post.category)} rounded-full text-xs font-semibold`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed">
              Written by educators.<br />
              Backed by real schools.<br />
              Built inside <span className="text-teal-600">Little Chanakyas</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-12 text-center shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Build a Better School — With Clarity
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Experience how Bodhi Board brings curriculum, people, and systems together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-all border-2 border-white/30 hover:border-white/50"
              >
                Talk to Our Education Team
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}