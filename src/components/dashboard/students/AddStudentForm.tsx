"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { createStudentAction } from "@/app/actions/student-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";

export function AddStudentForm({ onCancel, slug }: { onCancel: () => void, slug: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [classrooms, setClassrooms] = useState<any[]>([]);

    useEffect(() => {
        getClassroomsAction(slug).then((res) => {
            if (res.success && res.data) {
                setClassrooms(res.data);
            } else {
                setClassrooms([]);
            }
        }).catch(console.error);
    }, [slug]);

    const [form, setForm] = useState({
        fullName: "",
        age: "",
        gender: "",
        classroomId: "",
        parentName: "",
        parentMobile: "",
        parentEmail: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const nameParts = form.fullName.split(" ");
            const firstName = nameParts[0] || "Student";
            const lastName = nameParts.slice(1).join(" ") || "";

            await createStudentAction(slug, {
                firstName,
                lastName,
                age: parseInt(form.age) || 0,
                gender: form.gender,
                classroomId: form.classroomId,
                parentName: form.parentName,
                parentMobile: form.parentMobile,
                parentEmail: form.parentEmail
            });
            onCancel();
        } catch (error) {
            console.error("Failed to add student", error);
            alert("Failed to add student.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6">
            <div className="space-y-6">
                {/* Child Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Child Information</h3>

                    <div className="flex justify-center">
                        <div className="relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                            <Upload className="h-6 w-6 text-zinc-400" />
                            <span className="mt-1 text-[10px] text-zinc-400">Upload Photo</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="fullName" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="e.g. John Doe"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="age" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                    Age
                                </label>
                                <input
                                    id="age"
                                    type="number"
                                    value={form.age}
                                    onChange={e => setForm({ ...form, age: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="gender" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    value={form.gender || ""}
                                    onChange={e => setForm({ ...form, gender: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                >
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="class" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                Assigned Class
                            </label>
                            <select
                                id="class"
                                value={form.classroomId}
                                onChange={e => setForm({ ...form, classroomId: e.target.value })}
                                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                            >
                                <option value="">Select Class</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                {/* Parent Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Parent / Guardian</h3>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="parentName" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                Full Name
                            </label>
                            <input
                                id="parentName"
                                type="text"
                                placeholder="Guardian's Name"
                                value={form.parentName}
                                onChange={e => setForm({ ...form, parentName: e.target.value })}
                                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="phone" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="98765 43210"
                                    value={form.parentMobile}
                                    maxLength={10}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setForm({ ...form, parentMobile: val });
                                    }}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="parent@example.com"
                                    value={form.parentEmail}
                                    onChange={e => setForm({ ...form, parentEmail: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-zinc-900"
                >
                    {isLoading ? "Creating..." : "Create Student"}
                </button>
            </div>
        </form>
    );
}
