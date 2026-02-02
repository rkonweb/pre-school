"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export function MarketingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#B6E9F0] flex items-center justify-center text-zinc-900 font-bold shadow-lg shadow-cyan-900/20">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-white">Bodhi Board</span>
                </Link>
                <nav className="hidden gap-8 md:flex">
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/features">
                        Features
                    </Link>
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/pricing">
                        Pricing
                    </Link>
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/about">
                        About
                    </Link>
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/careers">
                        Careers
                    </Link>
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/blog">
                        Blog
                    </Link>
                    <Link className="text-sm font-medium text-zinc-400 hover:text-[#B6E9F0] transition-colors" href="/contact">
                        Contact
                    </Link>
                </nav>
                <div className="flex items-center gap-6">
                    <Link
                        className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                        href="/parent-login"
                    >
                        Parent Portal
                    </Link>
                    <Link
                        className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                        href="/school-login"
                    >
                        School Login
                    </Link>
                    <Link
                        className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-[#B6E9F0] hover:scale-105 hover:shadow-lg"
                        href="/signup"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}

export function MarketingFooter() {
    return (
        <footer className="border-t border-zinc-900 bg-zinc-950 py-12 md:py-16 lg:py-20 text-white">
            <div className="container mx-auto px-4 grid gap-12 md:grid-cols-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#B6E9F0] flex items-center justify-center text-zinc-900 font-bold">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-white">Bodhi Board</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                        Empowering the next generation of educators with tools built for love, care, and efficiency.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-[#B6E9F0] mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Roadmap</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-[#B6E9F0] mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-[#B6E9F0] mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
                <p>&copy; {new Date().getFullYear()} Bodhi Board. All rights reserved.</p>
            </div>
        </footer>
    );
}
