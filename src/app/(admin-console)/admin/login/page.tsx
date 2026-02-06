"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    ArrowRight,
    Lock,
    KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";

import { loginSuperAdminAction } from "@/app/actions/admin-auth-actions";
import { toast } from "sonner";

export default function SuperAdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await loginSuperAdminAction(formData.password);

        if (res.success) {
            router.push("/admin/dashboard");
        } else {
            // Check if we have toast, otherwise alert/console
            console.error(res.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
                    <div className="px-8 pt-12 pb-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20 mb-6 group transition-all hover:scale-105">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Master Control</h2>
                        <p className="mt-2 text-sm font-medium text-zinc-500">Restricted Access • Level 0 Personnel</p>
                    </div>

                    <div className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Admin ID</label>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all text-sm font-medium placeholder:text-zinc-400"
                                        placeholder="admin@platform.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Security Key</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            className="block w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all text-sm font-medium placeholder:text-zinc-400 pr-10"
                                            placeholder="••••••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isLoading}
                                className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-900/10 hover:bg-black hover:shadow-zinc-900/20 active:scale-[0.99] disabled:opacity-70 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        <span>Verifying Credentials...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                                        <span>Access Console</span>
                                        <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <div className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        <p className="font-bold mb-1">Test Credentials:</p>
                        <p className="font-mono">admin@platform.com / masterkey123</p>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">
                        Protected by 256-bit Encryption • <span className="text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">Security Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
