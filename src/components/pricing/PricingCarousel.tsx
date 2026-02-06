"use client";

import { useState, useRef, useEffect } from "react";
import { SubscriptionPlan } from "@/types/subscription";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCarouselProps {
    plans: SubscriptionPlan[];
}

export function PricingCarousel({ plans }: PricingCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(() => {
        const popularIndex = plans.findIndex(p => p.isPopular);
        return popularIndex !== -1 ? popularIndex : 1;
    });
    const isInitialMount = useRef(true);
    const isManualScroll = useRef(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            isManualScroll.current = true;
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

            const container = scrollRef.current;
            const child = container.children[index] as HTMLElement;
            if (child) {
                const containerWidth = container.offsetWidth;
                const childWidth = child.offsetWidth;
                const targetScrollLeft = child.offsetLeft - (containerWidth / 2) + (childWidth / 2);

                container.scrollTo({
                    left: targetScrollLeft,
                    behavior: behavior
                });
            }
            setActiveIndex(index);

            // Re-enable scroll tracking after animation finishes
            scrollTimeout.current = setTimeout(() => {
                isManualScroll.current = false;
            }, 600); // Slightly longer than transition duration
        }
    };

    useEffect(() => {
        if (isInitialMount.current && scrollRef.current) {
            // Static scroll to centered position on mount
            const container = scrollRef.current;
            const child = container.children[activeIndex] as HTMLElement;
            if (child) {
                const containerWidth = container.offsetWidth;
                const childWidth = child.offsetWidth;
                const targetScrollLeft = child.offsetLeft - (containerWidth / 2) + (childWidth / 2);
                container.scrollLeft = targetScrollLeft;
            }
            isInitialMount.current = false;
        }
        return () => {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [activeIndex, plans]);

    const handleScroll = () => {
        if (isManualScroll.current) return;

        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;

            // Find which child is closest to the center
            let closestIndex = 0;
            let minDistance = Infinity;

            Array.from(container.children).forEach((child, idx) => {
                const htmlChild = child as HTMLElement;
                const childCenter = htmlChild.offsetLeft + htmlChild.offsetWidth / 2;
                const containerCenter = scrollLeft + containerWidth / 2;
                const distance = Math.abs(childCenter - containerCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = idx;
                }
            });

            if (closestIndex !== activeIndex) {
                setActiveIndex(closestIndex);
            }
        }
    };

    return (
        <div className="relative max-w-7xl mx-auto px-4">
            {/* Arrows */}
            <button
                onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-16 w-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-navy hover:bg-white hover:scale-110 transition-all font-bold shadow-2xl disabled:opacity-0 disabled:pointer-events-none"
            >
                <ChevronLeft className="h-8 w-8 stroke-[3]" />
            </button>

            <button
                onClick={() => scrollToIndex(Math.min(plans.length - 1, activeIndex + 1))}
                disabled={activeIndex === plans.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-16 w-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-navy hover:bg-white hover:scale-110 transition-all font-bold shadow-2xl disabled:opacity-0 disabled:pointer-events-none"
            >
                <ChevronRight className="h-8 w-8 stroke-[3]" />
            </button>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-8 overflow-x-auto py-10 px-4 md:px-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center"
            >
                {plans.map((plan, index) => {
                    const isActive = activeIndex === index;
                    const isPopular = plan.isPopular;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => scrollToIndex(index)}
                            className={cn(
                                "relative flex flex-col p-8 rounded-[3rem] transition-all duration-700 ease-out min-w-[340px] max-w-[340px] md:min-w-[380px] md:max-w-[380px] snap-center cursor-pointer group/card",
                                isActive
                                    ? "scale-105 z-20 shadow-[0_40px_80px_-15px_rgba(45,156,184,0.25)] ring-2 ring-teal/20 opacity-100 bg-navy text-white"
                                    : "scale-95 opacity-80 hover:opacity-100 z-10 bg-white text-navy shadow-2xl border border-teal/5 hover:-translate-y-2 grayscale-[0.3] hover:grayscale-0"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal to-blue-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(45,156,184,0.4)] flex items-center gap-2 z-20 animate-float">
                                    <Zap className="h-3.5 w-3.5 fill-white" /> Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <h3 className={cn("text-4xl font-black mb-3 tracking-tighter", isActive ? "text-white" : "text-navy")}>
                                    {plan.name}
                                </h3>
                                <p className={cn("text-xs font-black uppercase tracking-[0.2em]", isActive ? "text-teal" : "text-navy/30")}>
                                    {plan.description || `${plan.tier} Plan`}
                                </p>
                            </div>

                            <div className="mb-10 flex items-baseline justify-center gap-1 group/price">
                                <span className={cn("text-8xl font-black tracking-tighter transition-transform group-hover/price:scale-105 duration-500", isActive ? "text-white" : "text-navy")}>
                                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                </span>
                                {plan.price > 0 && (
                                    <span className={cn("text-sm font-black uppercase tracking-widest opacity-40", isActive ? "text-teal" : "text-navy")}>
                                        /mo
                                    </span>
                                )}
                            </div>

                            {/* Plan Limits */}
                            <div className={cn("mb-10 p-8 rounded-[2rem] backdrop-blur-md transition-colors duration-500", isActive ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100")}>
                                <div className="grid grid-cols-2 gap-6 text-center divide-x divide-white/10">
                                    <div className="px-2">
                                        <div className={cn("text-4xl font-black mb-1", isActive ? "text-white" : "text-navy")}>
                                            {plan.limits?.maxStudents || 25}
                                        </div>
                                        <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-40", isActive ? "text-white" : "text-navy")}>
                                            Students
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className={cn("text-4xl font-black mb-1", isActive ? "text-white" : "text-navy")}>
                                            {plan.limits?.maxStaff || 5}
                                        </div>
                                        <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-40", isActive ? "text-white" : "text-navy")}>
                                            Staff
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/signup"
                                className={cn(
                                    "w-full rounded-[1.5rem] py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl mb-12 group/btn relative overflow-hidden",
                                    isActive
                                        ? "bg-teal text-white hover:bg-teal/90 shadow-teal/30 hover:shadow-teal/50 hover:scale-[1.02]"
                                        : "bg-navy text-white hover:bg-navy/90 shadow-navy/20"
                                )}
                            >
                                <span className="relative z-10">{plan.price === 0 ? "Start Journey Free" : "Upgrade to " + plan.name}</span>
                                <ArrowRight className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                            </Link>

                            <div className="space-y-5 flex-1">
                                <p className={cn("text-center text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40", isActive ? "text-white" : "text-navy")}>Included Features</p>
                                {(plan.features || []).slice(0, 6).map((feature, i) => (
                                    <div key={i} className="flex items-start gap-5 text-sm font-bold group/feat">
                                        <div className={cn("mt-0 rounded-full p-1.5 transition-all duration-300 group-hover/feat:scale-110", isActive ? "bg-teal text-white shadow-lg shadow-teal/40" : "bg-teal/10 text-teal")}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className={cn("transition-colors duration-300", isActive ? "text-white/70 group-hover/feat:text-white" : "text-navy/50 group-hover/feat:text-navy")}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
                {plans.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollToIndex(idx)}
                        className={cn(
                            "h-3 rounded-full transition-all duration-300 shadow-sm",
                            activeIndex === idx
                                ? "w-12 bg-navy"
                                : "w-3 bg-navy/20 hover:bg-navy/40"
                        )}
                        aria-label={`Go to plan ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
