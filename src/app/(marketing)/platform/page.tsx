import { readFileSync } from 'fs';
import { join } from 'path';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Platform — Bodhiboard School Management Software',
    description: 'One platform to manage admissions, fees, curriculum, staff, parents and more. Built for modern preschools and schools across India.',
};

export default function PlatformPage() {
    const html = readFileSync(join(process.cwd(), 'public/platform.html'), 'utf-8');

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const rawBody = bodyMatch ? bodyMatch[1] : '';
    const bodyContent = rawBody.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
        .map(m => m[1])
        .join('\n');

    const scriptBlocks = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map(m => m[1])
        .join('\n');

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <style dangerouslySetInnerHTML={{ __html: styleBlocks }} />
            <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
            <Script
                id="platform-inline-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: scriptBlocks }}
            />
        </>
    );
}
