"use client";

import {
    ShieldCheck,
    ChevronRight,
    Plus,
    User,
    Mail,
    Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminListProps {
    users: any[];
}

export function AdminList({ users }: AdminListProps) {
    return (
        <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">System Access Control</h3>
                    <p className="text-sm text-zinc-500 mt-1 font-medium italic">Manage who has administrative authority over the school dashboard.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-brand text-[var(--secondary-color)] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand/20">
                    <Plus className="h-4 w-4" /> Add Admin
                </button>
            </div>

            <div className="bg-brand/5 border border-brand/10 rounded-3xl p-6 flex gap-4 text-brand text-sm">
                <ShieldCheck className="h-6 w-6 shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold">Privileged Access</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                        Administrators listed below can modify institutional settings, manage student records, and assign roles to other staff members. Ensure only truste personnel are granted these permissions.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {users?.map((user) => (
                    <div key={user.id} className="group bg-white rounded-[32px] border border-zinc-100 p-6 flex items-center justify-between transition-all hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-zinc-50 border-2 border-zinc-100 rounded-[22px] flex items-center justify-center text-xl font-black text-zinc-400 group-hover:bg-brand group-hover:text-[var(--secondary-color)] group-hover:border-brand transition-all duration-300 shadow-sm">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-zinc-900 group-hover:text-brand transition-colors uppercase tracking-tight">
                                    {user.firstName} {user.lastName}
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Mail className="h-3 w-3" /> {user.email || user.mobile}
                                    </div>
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">
                                        {user.designation || "SYSTEM ADMIN"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            {(!users || users.length === 0) && (
                <div className="p-20 text-center space-y-4 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <User className="h-8 w-8 text-zinc-200" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400">No additional administrators found.</p>
                </div>
            )}
        </div>
    );
}
