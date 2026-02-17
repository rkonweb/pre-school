'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RealtimeLedgerWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // Poll for updates every 10 seconds
        const interval = setInterval(() => {
            router.refresh();
        }, 10000);

        return () => clearInterval(interval);
    }, [router]);

    return <>{children}</>;
}
