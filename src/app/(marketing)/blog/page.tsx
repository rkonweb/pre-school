"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";

const articles = [
    {
        id: 1,
        title: "The Future of EYFS: A Digital Approach",
        excerpt: "How modern tools can support the Early Years Foundation Stage framework without losing the human touch.",
        author: "Dr. Sarah Mitchell",
        role: "Head of Pedagogy (Oxford PhD)",
        date: "Oct 24, 2023",
        readTime: "5 min read",
        category: "Pedagogy",
        color: "#B6E9F0"
    },
    {
        id: 2,
        title: "Montessori in the Cloud",
        excerpt: "Respecting the prepared environment while managing administrative chaos.",
        author: "James Wilson",
        role: "Curriculum Lead (Cambridge)",
        date: "Oct 20, 2023",
        readTime: "8 min read",
        category: "Methodology",
        color: "#FFD2CF"
    },
    {
        id: 3,
        title: "Safeguarding Data in 2024",
        excerpt: "What every UK nursery owner needs to know about the latest GDPR updates.",
        author: "Elena Rossi",
        role: "Compliance Officer (LSE)",
        date: "Oct 15, 2023",
        readTime: "4 min read",
        category: "Compliance",
        color: "#EDF7CB"
    }
];

export default function BlogPage() {
    return (
        <div className="bg-[#FBF6E2] font-sans text-slate-800 min-h-screen">
            <section className="pt-32 pb-20 container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-500 mb-6">
                    <BookOpen className="h-4 w-4" />
                    <span>The Chalkboard</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
                    Insights from the <br /> <span className="text-[#FF9F99]">academic edge.</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                    Research-backed articles on early childhood education, school management, and pedagogy.
                </p>
            </section>

            <section className="container mx-auto px-4 pb-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((post) => (
                        <div key={post.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full cursor-pointer">
                            {/* Category Badge */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" style={{ backgroundColor: post.color, color: 'rgba(0,0,0,0.6)' }}>
                                    {post.category}
                                </span>
                                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {post.readTime}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-slate-500 font-medium mb-8 line-clamp-3 flex-1">
                                {post.excerpt}
                            </p>

                            <div className="border-t border-slate-100 pt-6 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                    {post.author[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{post.author}</div>
                                    <div className="text-xs font-bold text-slate-400">{post.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF9F99] rounded-full blur-[120px] opacity-20 pointer-events-none" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Pedagogy in your inbox.</h2>
                        <p className="text-slate-400 font-medium mb-8">Join 10,000+ educators receiving our weekly digest.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input className="w-full h-16 rounded-full px-8 bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-bold outline-none focus:bg-white/20 transition-all" placeholder="Enter your email" />
                            </div>
                            <button className="h-16 px-10 bg-[#EDF7CB] hover:bg-[#dce6b9] text-center text-slate-900 rounded-full font-black text-lg transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
