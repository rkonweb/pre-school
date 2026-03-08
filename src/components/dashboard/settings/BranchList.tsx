"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Building2, MapPin, Phone, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createBranchAction, updateBranchAction, deleteBranchAction } from "@/app/actions/branch-actions";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "var(--brand-color, #F59E0B)", amberD: "var(--brand-color, #D97706)", amberL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.12)",
    navy: "#1E1B4B",
    green: "#10B981", greenD: "#059669",
    red: "#EF4444", redD: "#DC2626",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g400: "#9CA3AF", g500: "#6B7280",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, type = "button" }: any) {
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},${C.redD})`, color: "white", sh: `0 4px 14px ${C.red}40` },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 } };
    const v = vs[variant] || vs.primary; const s = ss[size];
    const dis = disabled || loading;
    return (
        <button type={type} disabled={dis} onClick={onClick}
            onMouseEnter={e => { if (!dis) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1 }}>
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTopColor: v.color, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

type Branch = {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    _count?: {
        students: number;
        users: number;
    };
};

export function BranchList({ branches, slug, maxBranches = 1 }: { branches: Branch[], slug: string, maxBranches?: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: ""
    });

    const resetForm = () => {
        setFormData({ name: "", address: "", phone: "", email: "" });
        setEditingBranch(null);
    };

    const handleOpen = (branch?: Branch) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                address: branch.address || "",
                phone: branch.phone || "",
                email: branch.email || ""
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const payload = {
                name: formData.name,
                address: formData.address || undefined,
                phone: formData.phone || undefined,
                email: formData.email || undefined
            };

            let res;
            if (editingBranch) {
                res = await updateBranchAction(slug, editingBranch.id, payload);
            } else {
                res = await createBranchAction(slug, payload);
            }

            if (res.success) {
                toast.success(editingBranch ? "Branch updated" : "Branch created");
                setIsDialogOpen(false);
                resetForm();
                router.refresh();
            } else {
                toast.error(res.error || "Operation failed");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        startTransition(async () => {
            const res = await deleteBranchAction(slug, id);
            if (res.success) {
                toast.success("Branch deleted");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to delete branch");
            }
        });
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="text-sm font-medium text-zinc-500">
                    Showing all managed locations
                </div>
                <div className="flex gap-2">
                    <Btn icon={RefreshCw} variant="secondary" size="md" onClick={() => router.refresh()}>Refresh</Btn>
                    <Btn icon={Plus} variant="primary" size="md" onClick={() => handleOpen()} disabled={branches.length >= maxBranches}>
                        Add Location
                    </Btn>
                </div>
            </div>

            <div className="rounded-[24px] border border-zinc-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Valid Name</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches.map((branch) => (
                            <TableRow key={branch.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{branch.name}</span>
                                        {branch.address && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {branch.address}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        {branch.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-muted-foreground" /> {branch.phone}
                                            </span>
                                        )}
                                        {branch.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" /> {branch.email}
                                            </span>
                                        )}
                                        {!branch.phone && !branch.email && <span className="text-muted-foreground">-</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <div title="Students">
                                            <span className="font-semibold text-foreground">{branch._count?.students || 0}</span> Students
                                        </div>
                                        <div title="Staff">
                                            <span className="font-semibold text-foreground">{branch._count?.users || 0}</span> Staff
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpen(branch)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(branch.id)}
                                            disabled={isPending || (branch._count?.students || 0) > 0 || (branch._count?.users || 0) > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
                        <DialogDescription>
                            {editingBranch ? "Update details for this branch." : "Create a new branch for your school."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Branch Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Downtown Campus"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 234..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="branch@school.com"
                                />
                            </div>
                        </div>
                        <DialogFooter style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <Btn variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Btn>
                            <Btn type="submit" variant="primary" loading={isPending}>{editingBranch ? "Save Changes" : "Create Branch"}</Btn>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
