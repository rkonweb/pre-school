import { readFileSync } from 'fs';
import { join } from 'path';
import Script from 'next/script';
import type { Metadata } from 'next';
import { PricingComparePlans } from '@/components/pricing/PricingComparePlans';
import { PricingPlanCards } from '@/components/pricing/PricingPlanCards';

export const metadata: Metadata = {
    title: 'Pricing — Bodhiboard School Management Platform',
    description: 'Honest pricing, no surprises. Choose from Starter, Growth or Institution plans for your school. No hidden fees, no long-term lock-ins.',
};

export const revalidate = 60; // ISR — 60 seconds

const CARDS_MARKER   = '<!-- DYNAMIC_PRICING_CARDS_INJECT -->';
const COMPARE_MARKER = '<!-- DYNAMIC_COMPARE_PLANS_INJECT -->';

export default async function PricingPage() {
    const html = readFileSync(join(process.cwd(), 'public/pricing.html'), 'utf-8');

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const rawBody = bodyMatch ? bodyMatch[1] : '';
    const bodyNoScripts = rawBody.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
        .map(m => m[1])
        .join('\n');

    const scriptBlocks = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map(m => m[1])
        .join('\n');

    // Split at CARDS marker first
    const cardsIdx = bodyNoScripts.indexOf(CARDS_MARKER);
    const [beforeCards, afterCards] = cardsIdx >= 0
        ? [bodyNoScripts.slice(0, cardsIdx), bodyNoScripts.slice(cardsIdx + CARDS_MARKER.length)]
        : [bodyNoScripts, ''];

    // Split the afterCards section at COMPARE marker
    const compareIdx = afterCards.indexOf(COMPARE_MARKER);
    const [betweenSections, afterCompare] = compareIdx >= 0
        ? [afterCards.slice(0, compareIdx), afterCards.slice(compareIdx + COMPARE_MARKER.length)]
        : [afterCards, ''];

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap"
                rel="stylesheet"
            />
            <style dangerouslySetInnerHTML={{ __html: styleBlocks }} />

            {/* Static HTML: hero, billing toggle */}
            <div dangerouslySetInnerHTML={{ __html: beforeCards }} />

            {/* Dynamic Plan Cards from DB */}
            <PricingPlanCards />

            {/* Static HTML: ROI section, etc. */}
            {betweenSections && <div dangerouslySetInnerHTML={{ __html: betweenSections }} />}

            {/* Dynamic Compare Table from DB */}
            <PricingComparePlans />

            {/* Remaining static HTML (testimonials, FAQ, CTA…) */}
            {afterCompare && <div dangerouslySetInnerHTML={{ __html: afterCompare }} />}

            <Script
                id="pricing-inline-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: scriptBlocks }}
            />
        </>
    );
}
