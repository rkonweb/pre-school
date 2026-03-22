import { readFileSync } from 'fs';
import { join } from 'path';
import Script from 'next/script';

export default function HomePage() {
    const html = readFileSync(join(process.cwd(), 'public/home.html'), 'utf-8');

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
                id="home-inline-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: scriptBlocks }}
            />
        </>
    );
}
