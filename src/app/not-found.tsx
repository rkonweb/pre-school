import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-black text-zinc-200">404</h1>
                <div className="relative -mt-12 space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-900">Page not found</h2>
                    <p className="text-zinc-500">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
                        >
                            <MoveLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
