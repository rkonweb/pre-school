"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Clock, User, ArrowRight, Download, Lightbulb, CheckCircle, MessageCircle, Share2, Calendar, Newspaper, List, Twitter, Linkedin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface BlogPostClientProps {
    post: any;
    relatedPosts?: any[];
}

// Reusable Inline CTA Component
function InlineCTA({ type = "default" }: { type?: "default" | "demo" | "guide" }) {
    const router = useRouter();

    const ctaContent: any = {
        default: {
            icon: Lightbulb,
            title: "Planning to start or run a school?",
            description: "See how Bodhi Board simplifies curriculum, training, and operations.",
            cta: "See How Bodhi Board Helps",
            action: () => router.push("/product")
        },
        demo: {
            icon: MessageCircle,
            title: "Want to see this in action?",
            description: "Book a personalized demo with our education team.",
            cta: "Book a Free Demo",
            action: () => router.push("/contact")
        },
        guide: {
            icon: Download,
            title: "Get the complete checklist",
            description: "Download our free guide with step-by-step implementation tips.",
            cta: "Download Free Guide",
            action: () => { } // Opens lead capture
        }
    };

    const content = ctaContent[type];
    const Icon = content.icon;

    return (
        <motion.div
            className="my-12 bg-sky-50 rounded-3xl p-8 border-2 border-sky-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        {content.title}
                    </h3>
                    <p className="text-slate-600 mb-4 font-medium leading-relaxed">
                        {content.description}
                    </p>
                    <button
                        onClick={content.action}
                        className="px-6 py-3 bg-slate-900 text-white hover:bg-teal-600 font-black text-[10px] uppercase tracking-widest rounded-full transition-all inline-flex items-center gap-2"
                    >
                        {content.cta}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Blog Sidebar Component with ToC
function BlogSidebar({ tableOfContents }: { tableOfContents: { id: string, text: string }[] }) {
    const router = useRouter();
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        tableOfContents.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [tableOfContents]);

    return (
        <div className="space-y-6 sticky top-32">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
                <motion.div
                    className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 border border-slate-100 mb-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <List className="h-5 w-5 text-teal-600" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                            Table of Contents
                        </h3>
                    </div>
                    <nav className="space-y-3">
                        {tableOfContents.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`block text-sm font-bold transition-colors ${activeId === item.id ? "text-teal-600 translate-x-1" : "text-slate-400 hover:text-slate-900"
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                {item.text}
                            </a>
                        ))}
                    </nav>
                </motion.div>
            )}

            {/* Starting a Preschool Card */}
            <motion.div
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center mb-6 mx-auto">
                    <Lightbulb className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-black text-slate-900 mb-3 text-center text-lg uppercase tracking-tight">
                    Starting a Preschool?
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed text-center font-medium">
                    See how Bodhi Board provides everything you need from day one.
                </p>
                <button
                    onClick={() => router.push("/product")}
                    className="w-full py-4 px-4 bg-teal-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all"
                >
                    Explore Features
                </button>
            </motion.div>

            {/* See in Action Card */}
            <motion.div
                className="bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-950/20 text-white relative overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto relative z-10">
                    <MessageCircle className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="font-black mb-3 text-center text-lg uppercase tracking-tight relative z-10">
                    See us in Action
                </h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed text-center font-medium relative z-10">
                    Book a personalized demo with our education team.
                </p>
                <button
                    onClick={() => router.push("/contact")}
                    className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-white/10 relative z-10"
                >
                    Book a Demo
                </button>
            </motion.div>
        </div>
    );
}

export function BlogPostClient({ post, relatedPosts = [] }: BlogPostClientProps) {
    const router = useRouter();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [tableOfContents, setTableOfContents] = useState<{ id: string, text: string }[]>([]);
    const [processedContent, setProcessedContent] = useState(post?.content || "");

    useEffect(() => {
        if (post?.content) {
            // Robust parsing and ID injection
            const parser = new DOMParser();
            const doc = parser.parseFromString(post.content, 'text/html');
            const headings = doc.querySelectorAll('h2');

            const toc: { id: string, text: string }[] = [];
            headings.forEach((h, i) => {
                const id = `section-${i}`;
                h.id = id;
                h.classList.add('scroll-mt-32'); // Tailored scroll margin
                toc.push({ id, text: h.textContent || `Section ${i + 1}` });
            });

            setTableOfContents(toc);
            setProcessedContent(doc.body.innerHTML);
        }
    }, [post?.content]);

    if (!post) return null;

    // Parse tags
    let tags = [];
    try {
        tags = JSON.parse(post.tags);
    } catch (e) {
        tags = [];
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this article: ${post.title}`;

    const handleShare = (platform: 'twitter' | 'linkedin') => {
        let url = '';
        if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        } else if (platform === 'linkedin') {
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal/20">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-teal origin-left z-50"
                style={{ scaleX }}
            />

            {/* Blog Header */}
            <section className="pt-16 pb-6 px-4 bg-slate-50 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-teal/5 rounded-full blur-[150px] -z-10 -mr-40 -mt-40" />
                <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-indigo-50 rounded-full blur-[100px] -z-10 -ml-20 -mt-20" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                            {tags.map((tag: string, i: number) => (
                                <span key={i} className="px-4 py-1.5 rounded-full bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm border border-slate-200">
                                    {tag}
                                </span>
                            ))}
                            <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300 mx-1" />
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-teal" />
                                    8 min read
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                    {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-[1.1] tracking-tight line-clamp-1">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg border-2 border-white shadow-md">
                                {post.author.firstName[0]}{post.author.lastName[0]}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-slate-900 text-sm">
                                    {post.author.firstName} {post.author.lastName}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">Super Admin, Bodhi Board</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {post.coverImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="container mx-auto max-w-6xl px-4"
                    >
                        <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 aspect-[2/1] md:aspect-[21/9]">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2s]"
                            />
                        </div>
                    </motion.div>
                )}
            </section>

            {/* Main Content Areas */}
            <section className="py-2 px-4 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-[1fr_300px] gap-16">
                        {/* Article Content */}
                        <div className="relative">
                            {/* Floating Share (Desktop) */}
                            <div className="hidden lg:block absolute -left-24 top-0 h-full w-12">
                                <div className="sticky top-32 flex flex-col gap-3 z-20">
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-500 hover:shadow-md transition-all"
                                        title="Share on Twitter"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-700 hover:border-blue-700 hover:shadow-md transition-all"
                                        title="Share on LinkedIn"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="prose prose-lg md:prose-xl prose-slate max-w-none 
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
                                    prose-h2:text-3xl prose-h2:mt-4 prose-h2:mb-4
                                    prose-p:text-slate-600 prose-p:leading-8
                                    prose-a:text-teal prose-a:no-underline hover:prose-a:underline
                                    prose-blockquote:border-l-4 prose-blockquote:border-teal prose-blockquote:bg-slate-50 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                                    prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-10"
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: processedContent }}
                                    className="blog-rich-content"
                                />

                                <hr className="my-16 border-slate-100" />

                                {/* Author Bio Box */}
                                <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                                    <div className="h-20 w-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-2xl">
                                            {post.author.firstName[0]}{post.author.lastName[0]}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-center sm:justify-between mb-2">
                                            <h4 className="font-bold text-slate-900 text-lg">About {post.author.firstName}</h4>
                                            <div className="hidden sm:flex gap-2">
                                                {/* Social icons could go here */}
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                            Passionate about early childhood education and school management technology.
                                            Helping preschool owners scale their operations with Bodhi Board's innovative tools.
                                        </p>
                                        <button className="text-xs font-bold uppercase tracking-widest text-teal hover:text-teal-700 transition-colors">
                                            View all posts by {post.author.firstName} →
                                        </button>
                                    </div>
                                </div>

                                <InlineCTA type="demo" />
                            </motion.article>
                        </div>

                        {/* Sidebar */}
                        <aside className="hidden lg:block relative col-span-1">
                            <BlogSidebar tableOfContents={tableOfContents} />
                        </aside>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
                <section className="py-20 px-4 bg-slate-50 relative overflow-hidden">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-center gap-4 mb-12">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Read Next</h2>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedPosts.map((post: any) => (
                                <div key={post.id}
                                    onClick={() => router.push(`/blog/${post.slug}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md bg-white">
                                        {post.coverImage ? (
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Newspaper className="h-10 w-10 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        <span className="text-teal">{JSON.parse(post.tags || '[]')[0] || 'Blog'}</span>
                                        <span>•</span>
                                        <span>{format(new Date(post.publishedAt || post.createdAt), 'MMM d')}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-teal transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Newsletter Integration */}
            <section className="container mx-auto px-4 pb-32">
                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-24 relative overflow-hidden group text-center md:text-left">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 max-w-4xl mx-auto md:mx-0">
                        <div className="inline-flex items-center gap-3 mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <span className="h-2 w-2 bg-teal rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Subscribe to Wisdom</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[0.95] tracking-tight">
                            School growth, <br /><span className="text-teal">delivered weekly.</span>
                        </h2>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto md:mx-0" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your best email"
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal/50 font-medium transition-all"
                            />
                            <button className="bg-teal text-slate-900 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-lg hover:shadow-teal/20">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
