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
import { Plus, Pencil, Trash2, Building2, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { createBranchAction, updateBranchAction, deleteBranchAction } from "@/app/actions/branch-actions";

type Branch = {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    _count?: {
        students: number;
        users: number;
    }
};

export function BranchList({ branches, slug }: { branches: Branch[], slug: string }) {
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brand" />
                    Branches ({branches.length})
                </h2>
                <Button onClick={() => handleOpen()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
            </div>

            <div className="rounded-md border bg-card">
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{editingBranch ? "Save Changes" : "Create Branch"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
