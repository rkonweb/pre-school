"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About" },
        { href: "/careers", label: "Careers" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-navy/95 backdrop-blur-md transition-all">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-teal flex items-center justify-center text-white font-bold shadow-lg shadow-teal/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white font-heading">Bodhi Board</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-bold transition-colors hover:text-teal",
                                pathname === link.href ? "text-teal" : "text-white/80"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        className="text-sm font-bold text-white/80 hover:text-white transition-colors"
                        href="/school-login"
                    >
                        Log in
                    </Link>
                    <Link
                        className="group flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 active:scale-95"
                        href="/signup"
                    >
                        Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-navy border-b border-white/10 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-lg font-bold text-white/80 py-2 px-4 rounded-lg hover:bg-white/5 hover:text-teal"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2" />
                    <Link
                        className="text-lg font-bold text-white/80 py-2 px-4 rounded-lg hover:bg-white/5"
                        href="/school-login"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Log in
                    </Link>
                    <Link
                        className="w-full text-center rounded-xl bg-teal py-3 text-lg font-bold text-white shadow-lg shadow-teal/20 active:scale-95"
                        href="/signup"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </header>
    );
}

export function MarketingFooter() {
    return (
        <footer className="bg-navy text-white pt-20 pb-10 border-t border-navy-light/10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-teal flex items-center justify-center text-white font-bold">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">Bodhi Board</span>
                        </div>
                        <p className="text-sky/60 text-lg leading-relaxed max-w-sm font-medium">
                            The operating system for modern preschools. Built with love in Oxford.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal transition-colors cursor-pointer border border-white/10">
                                <span className="sr-only">Twitter</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal transition-colors cursor-pointer border border-white/10">
                                <span className="sr-only">LinkedIn</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6">Product</h4>
                        <ul className="space-y-4 text-sky/60 font-medium">
                            <li><Link href="/features" className="hover:text-teal transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-teal transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-teal transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-teal transition-colors">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6">Company</h4>
                        <ul className="space-y-4 text-sky/60 font-medium">
                            <li><Link href="/about" className="hover:text-teal transition-colors">About</Link></li>
                            <li><Link href="/careers" className="hover:text-teal transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-teal transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-teal transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6">Resources</h4>
                        <ul className="space-y-4 text-sky/60 font-medium">
                            <li><Link href="#" className="hover:text-teal transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-teal transition-colors">Waitlist</Link></li>
                            <li><Link href="#" className="hover:text-teal transition-colors">Community</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-slate-500 font-medium text-sm gap-4">
                    <p>&copy; {new Date().getFullYear()} Bodhi Board. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
