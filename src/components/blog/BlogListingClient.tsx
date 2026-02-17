"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, Calendar, User, Clock, ChevronRight, Tag, Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface BlogListingClientProps {
    initialPosts: any[];
}

export function BlogListingClient({ initialPosts }: BlogListingClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isTagsExpanded, setIsTagsExpanded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter posts for public view (only published)
    const publishedPosts = initialPosts.filter(p => p.isPublished);

    // Categories derived from tags
    const categoriesSet = new Set<string>(["All"]);
    publishedPosts.forEach(post => {
        try {
            const tags = JSON.parse(post.tags);
            if (Array.isArray(tags)) tags.forEach(t => categoriesSet.add(t));
        } catch (e) {
            // Not JSON
        }
    });

    const categories = Array.from(categoriesSet)
        .filter(c => typeof c === 'string' && c.trim() !== "")
        .sort((a, b) => {
            if (a === "All") return -1;
            if (b === "All") return 1;
            return a.localeCompare(b);
        });

    const displayedCategories = isTagsExpanded ? categories : categories.slice(0, 11); // Show "All" + 10 others

    const filteredPosts = publishedPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

        let tags: string[] = [];
        try {
            tags = JSON.parse(post.tags);
        } catch (e) { }

        const matchesCategory = selectedCategory === "All" || tags.includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    // Featured post is the most recent one
    const featuredPost = filteredPosts[0];
    const regularPosts = filteredPosts.slice(1);

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-sky/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] -z-10 -mr-40 -mt-40" />
                <div className="container max-w-[1440px] mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center gap-4 mb-6"
                        >
                            <span className="h-1 w-12 bg-teal-500 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">Our Journal</span>
                            <span className="h-1 w-12 bg-teal-500 rounded-full" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8"
                        >
                            Insights for <br /><span className="text-teal-500 italic">Tomorrow's</span> Leaders.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            Explore the latest in preschool management, pedagogical innovations, and school growth strategies from our team of experts.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container max-w-[1440px] mx-auto px-4 -mt-12 relative z-10 pb-32">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 mb-20 flex flex-col items-center gap-10 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-sky-400 opacity-20" />

                    <div className="max-w-xl w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                        {isMounted && (
                            <input
                                type="text"
                                placeholder="Search articles, wisdom, news..."
                                value={searchQuery}
                                data-lpignore="true"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-full bg-slate-50 border-2 border-transparent focus:border-teal-100 focus:bg-white focus:ring-4 focus:ring-teal-50/50 outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all text-lg shadow-inner"
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl">
                        {displayedCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${selectedCategory === category
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105"
                                    : "bg-white text-slate-600 border-slate-100 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}

                        {categories.length > 11 && (
                            <button
                                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                                className="px-5 py-2.5 rounded-full font-bold text-sm text-teal-600 hover:bg-teal-50 transition-all flex items-center gap-1 underline underline-offset-4 decoration-2"
                            >
                                {isTagsExpanded ? "Show less" : `+${categories.length - 11} more topics`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Featured Post */}
                {featuredPost && !searchQuery && selectedCategory === "All" && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group cursor-pointer mb-20"
                        onClick={() => router.push(`/blog/${featuredPost.slug}`)}
                    >
                        <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-[4rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <div className="relative h-[400px] lg:h-auto overflow-hidden">
                                {featuredPost.coverImage ? (
                                    <img
                                        src={featuredPost.coverImage}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-sky/30 flex items-center justify-center">
                                        <Newspaper className="h-20 w-20 text-white/50" />
                                    </div>
                                )}
                                <div className="absolute top-8 left-8">
                                    <span className="bg-orange text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Featured
                                    </span>
                                </div>
                            </div>
                            <div className="p-10 lg:p-20 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-8 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">
                                    <span className="flex items-center gap-2 italic">
                                        <Calendar className="h-4 w-4 text-orange-500" />
                                        {format(new Date(featuredPost.publishedAt || featuredPost.createdAt), 'MMM d, yyyy')}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-teal-500" />
                                        8 min read
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed line-clamp-3">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-sky/20 flex items-center justify-center text-navy/40 font-black tracking-tighter text-xs">
                                        {featuredPost.author.firstName[0]}{featuredPost.author.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-black text-navy text-sm uppercase tracking-widest">
                                            {featuredPost.author.firstName} {featuredPost.author.lastName}
                                        </div>
                                        <div className="text-[10px] text-navy/30 font-bold uppercase tracking-widest">Super Admin</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Grid Posts */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all group cursor-pointer"
                            onClick={() => router.push(`/blog/${post.slug}`)}
                        >
                            <div className="relative h-64 overflow-hidden">
                                {post.coverImage ? (
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-sky/20 flex items-center justify-center">
                                        <Newspaper className="h-10 w-10 text-white/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    {(() => {
                                        try {
                                            const tags = JSON.parse(post.tags);
                                            return Array.isArray(tags) && tags.slice(0, 1).map((tag: string) => (
                                                <span key={tag} className="px-4 py-1.5 rounded-full bg-sky/10 text-navy/40 text-[9px] font-black uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ));
                                        } catch (e) { return null; }
                                    })()}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight group-hover:text-teal-500 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300">
                                            {post.author.firstName[0]}{post.author.lastName[0]}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {post.author.firstName}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                        Read <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-40 bg-sky/5 rounded-[4rem] border-2 border-dashed border-sky/20">
                        <Search className="h-12 w-12 text-navy/10 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-navy mb-2">No wisdom found</h3>
                        <p className="text-navy/40 font-medium">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                            className="mt-8 text-teal font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Reset everything
                        </button>
                    </div>
                )}
            </div>

            {/* Newsletter Section */}
            <section className="container max-w-[1440px] mx-auto px-4 pb-32">
                <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 max-w-2xl text-left">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="h-1 w-12 bg-teal-500 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-teal-400">Stay Inspired</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
                            Get fresh <span className="text-teal-400">wisdom</span> delivered.
                        </h2>
                        <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex-1 relative">
                                {isMounted && (
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        data-lpignore="true"
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-bold"
                                    />
                                )}
                            </div>
                            <button className="bg-teal-500 text-slate-900 px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
