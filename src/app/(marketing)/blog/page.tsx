"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogPostsAction, getBlogPageContentAction } from "@/app/actions/cms-actions";
import { format } from "date-fns";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    isPublished: boolean;
    createdAt: string;
    author: {
        firstName: string;
        lastName: string;
    };
}

interface BlogSection {
    sectionKey: string;
    content: string;
    isEnabled: boolean;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [sections, setSections] = useState<BlogSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [postsData, sectionsData] = await Promise.all([
            getBlogPostsAction(),
            getBlogPageContentAction()
        ]);
        setPosts(postsData as BlogPost[]);
        setSections(sectionsData as BlogSection[]);
        setLoading(false);
    };

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: BlogSection | undefined) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        badge: "The Journal",
        headline: "Insights from the academic edge.",
        description: "Research-backed articles on early childhood education, school management, and pedagogy."
    };

    const newsletterSection = getSection("newsletter");
    const newsletterContent = parseContent(newsletterSection) || {
        title: "Join the circle.",
        subtitle: "Get the latest articles and resources delivered to your inbox weekly.",
        placeholder: "jane@school.com",
        buttonText: "Subscribe"
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-slate-400 font-bold animate-pulse">Loading blog...</div>
            </div>
        );
    }

    return (
        <div className="bg-white font-sans text-navy">
            {/* Header */}
            {(!heroSection || heroSection.isEnabled) && (
                <section className="pt-32 pb-20 container mx-auto px-4 text-center max-w-4xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal/10 rounded-full blur-3xl -z-10" />
                    <div className="inline-block px-5 py-2 bg-navy text-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 shadow-xl">
                        {heroContent.badge}
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-navy uppercase">
                        {heroContent.headline?.replace(/<[^>]*>/g, ' ')}
                    </h1>
                    <p className="text-xl md:text-2xl text-navy/40 max-w-2xl mx-auto font-bold uppercase tracking-widest">
                        {heroContent.description}
                    </p>
                </section>
            )}

            {/* Blog Grid */}
            <section className="container mx-auto px-4 pb-32">
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-bold text-lg">No blog posts yet.</p>
                        <p className="text-slate-300 text-sm mt-2">Check back soon for new content!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group cursor-pointer">
                                <div className="aspect-[4/3] rounded-[2rem] mb-8 overflow-hidden bg-slate-50 border border-teal/5 relative shadow-2xl shadow-navy/5">
                                    <div className="absolute inset-0 bg-navy/5 group-hover:bg-transparent transition-colors duration-500" />
                                    {/* Placeholder Image Effect */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-5 font-black text-9xl text-navy select-none">
                                        {post.title[0]}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-navy/30 mb-4 uppercase tracking-[0.2em]">
                                    <span className="text-teal">{post.category || "General"}</span>
                                    <span className="h-1 w-1 bg-navy/10 rounded-full" />
                                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-4 group-hover:text-teal transition-colors leading-tight tracking-tight">
                                    {post.title}
                                </h3>
                                <p className="text-navy/50 font-bold leading-relaxed text-sm line-clamp-2 mb-6">
                                    {post.excerpt || "Read more about this topic..."}
                                </p>
                                <div className="flex items-center gap-3 text-xs font-black text-navy uppercase tracking-widest border-b-2 border-transparent group-hover:border-teal w-fit transition-all pb-1">
                                    <span>Read Article</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Newsletter */}
                {(!newsletterSection || newsletterSection.isEnabled) && (
                    <div className="max-w-4xl mx-auto mt-32 bg-navy rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-navy/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-teal/20 rounded-full blur-[100px] pointer-events-none" />
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10">
                            {newsletterContent.title}
                        </h3>
                        <p className="text-teal/60 font-bold uppercase tracking-widest text-sm mb-12 max-w-lg mx-auto relative z-10">
                            {newsletterContent.subtitle}
                        </p>
                        <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-4 relative z-10">
                            <input
                                type="email"
                                placeholder={newsletterContent.placeholder}
                                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-teal/20 focus:bg-white/10 transition-all font-bold"
                            />
                            <button className="h-16 px-8 bg-teal text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-teal/90 hover:scale-105 transition-all shadow-xl shadow-teal/20">
                                {newsletterContent.buttonText}
                            </button>
                        </form>
                    </div>
                )}
            </section>
        </div>
    );
}
