"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { issueTCAction } from "@/app/actions/student-tc-actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

interface IssueTCDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
    schoolSlug: string;
    onSuccess?: () => void;
}

export function IssueTCDialog({
    open,
    onOpenChange,
    studentId,
    studentName,
    schoolSlug,
    onSuccess
}: IssueTCDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            if (!file) {
                toast.error("Please upload the TC document (PDF)");
                setIsLoading(false);
                return;
            }

            // Append file manually if not picked up by form? 
            // Usually file input inside form works, but let's be sure.
            formData.append("studentId", studentId);

            // Validate file size (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit");
                setIsLoading(false);
                return;
            }

            const res = await issueTCAction(schoolSlug, formData);

            if (res.success) {
                toast.success(`TC Issued for ${studentName}`);
                onOpenChange(false);
                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                toast.error(res.error || "Failed to issue TC");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Issue Transfer Certificate</DialogTitle>
                    <DialogDescription>
                        Issue TC for <strong>{studentName}</strong>. This will change their status to <strong>Alumni</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tcNumber">TC Number <span className="text-red-500">*</span></Label>
                            <Input
                                id="tcNumber"
                                name="tcNumber"
                                placeholder="e.g. TC-2024-001"
                                required
                                className="font-mono uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issueDate">Date of Issue <span className="text-red-500">*</span></Label>
                            <Input
                                id="issueDate"
                                name="issueDate"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Leaving</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="e.g. Parent Transfer, Completed Education..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Softcopy (PDF) <span className="text-red-500">*</span></Label>
                            <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 hover:bg-zinc-50 transition-colors text-center cursor-pointer relative group">
                                <input
                                    type="file"
                                    name="file"
                                    accept="application/pdf"
                                    required
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    {file ? (
                                        <>
                                            <FileText className="h-8 w-8 text-emerald-500" />
                                            <p className="text-sm font-medium text-zinc-900">{file.name}</p>
                                            <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                            <p className="text-sm font-medium text-zinc-600">Click to upload or drag and drop</p>
                                            <p className="text-xs text-zinc-400">PDF only (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Issuing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Issue TC & Mark Alumni
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
