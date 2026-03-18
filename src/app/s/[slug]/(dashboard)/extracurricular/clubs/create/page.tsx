"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClubAction } from "@/app/actions/extracurricular-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import {
    ArrowLeft, Shield, Users, Calendar, Clock,
    MapPin, Target, BookOpen, Sparkles, Eye,
    User, Hash
} from "lucide-react";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CLUB_CATEGORIES = [
    { value: "ACADEMIC", label: "📚 Academic", color: "bg-blue-100 text-blue-700" },
    { value: "SPORTS", label: "⚽ Sports", color: "bg-green-100 text-green-700" },
    { value: "ARTS", label: "🎨 Arts & Culture", color: "bg-purple-100 text-purple-700" },
    { value: "TECHNOLOGY", label: "💻 Technology", color: "bg-cyan-100 text-cyan-700" },
    { value: "COMMUNITY", label: "🤝 Community Service", color: "bg-amber-100 text-amber-700" },
    { value: "LANGUAGE", label: "🗣️ Language", color: "bg-rose-100 text-rose-700" },
    { value: "MUSIC", label: "🎵 Music & Performing Arts", color: "bg-indigo-100 text-indigo-700" },
    { value: "OTHER", label: "🌟 Other", color: "bg-zinc-100 text-zinc-700" },
];

const MEETING_DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "Weekdays", "Weekends", "Flexible"
];

export default function CreateClubPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);

    // Form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("ACADEMIC");
    const [logo, setLogo] = useState("");
    const [coachId, setCoachId] = useState("");
    const [coMentorId, setCoMentorId] = useState("");
    const [capacity, setCapacity] = useState("");
    const [meetingDay, setMeetingDay] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [venue, setVenue] = useState("");
    const [description, setDescription] = useState("");
    const [goals, setGoals] = useState("");
    const [rules, setRules] = useState("");
    const [eligibility, setEligibility] = useState("");
    const [targetClasses, setTargetClasses] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [staffRes, classRes] = await Promise.all([
            getStaffAction(slug),
            getClassroomsAction(slug),
        ]);
        if (staffRes.success) setStaff(staffRes.data || []);
        if (classRes.success) setClassrooms(classRes.data || []);
    };

    // Build the meeting schedule string
    const buildMeetingSchedule = () => {
        const parts = [];
        if (meetingDay) parts.push(meetingDay);
        if (meetingTime) parts.push(meetingTime);
        if (venue) parts.push(`at ${venue}`);
        return parts.join(" ") || "";
    };

    // Build full description with structured data
    const buildDescription = () => {
        const parts = [];
        if (description) parts.push(description);
        if (goals) parts.push(`\n\n🎯 Goals:\n${goals}`);
        if (rules) parts.push(`\n\n📋 Rules:\n${rules}`);
        if (eligibility) parts.push(`\n\n✅ Eligibility:\n${eligibility}`);
        if (targetClasses.length > 0) {
            const classNames = targetClasses.map(id => classrooms.find(c => c.id === id)?.name).filter(Boolean);
            parts.push(`\n\n🏫 Open to: ${classNames.join(", ")}`);
        }
        return parts.join("") || "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Club name is required");
            return;
        }

        setLoading(true);
        const res = await createClubAction(slug, {
            name: name.trim(),
            description: buildDescription(),
            coachId: coachId || null,
            capacity: capacity ? parseInt(capacity) : null,
            meetingSchedule: buildMeetingSchedule(),
            logo: logo || null,
        });

        if (res.success) {
            toast.success("🎉 Club created successfully!");
            router.push(`/s/${slug}/extracurricular/clubs`);
        } else {
            toast.error(res.error || "Failed to create club");
        }
        setLoading(false);
    };

    const selectedMentor = staff.find(s => s.id === coachId);
    const selectedCoMentor = staff.find(s => s.id === coMentorId);
    const categoryObj = CLUB_CATEGORIES.find(c => c.value === category);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <StandardActionButton
                    asChild
                    variant="ghost"
                    icon={ArrowLeft}
                    iconOnly
                    tooltip="Back to Clubs"
                >
                    <Link href={`/s/${slug}/extracurricular/clubs`} />
                </StandardActionButton>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Club</h1>
                    <p className="text-muted-foreground text-sm">Set up a new specialized student organization with all the details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">

                {/* ═══════════════ LEFT COLUMN (2/3) ═══════════════ */}
                <div className="md:col-span-2 space-y-6">

                    {/* Club Identity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-brand" /> Club Identity
                            </CardTitle>
                            <CardDescription>Basic information about the club</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Club Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="e.g. Science Explorers Club, Chess Academy, Young Coders"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="text-base font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category">
                                                {categoryObj?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLUB_CATEGORIES.map(c => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo / Icon URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                    <Input
                                        placeholder="https://example.com/logo.png"
                                        value={logo}
                                        onChange={e => setLogo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule & Capacity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-brand" /> Schedule & Logistics
                            </CardTitle>
                            <CardDescription>When and where the club meets</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Meeting Day</Label>
                                    <Select value={meetingDay} onValueChange={setMeetingDay}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select day">
                                                {meetingDay || "Select day"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEETING_DAYS.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Meeting Time</Label>
                                    <Input
                                        type="time"
                                        value={meetingTime}
                                        onChange={e => setMeetingTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Venue / Room</Label>
                                    <Input
                                        placeholder="e.g. Room 201, Auditorium"
                                        value={venue}
                                        onChange={e => setVenue(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Maximum Capacity</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 30 (leave empty for unlimited)"
                                        value={capacity}
                                        onChange={e => setCapacity(e.target.value)}
                                        min={1}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Open to Classes <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                    <Select value="__placeholder__" onValueChange={(v) => {
                                        if (v !== "__placeholder__" && !targetClasses.includes(v)) {
                                            setTargetClasses([...targetClasses, v]);
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select classes...">
                                                {targetClasses.length > 0
                                                    ? `${targetClasses.length} class${targetClasses.length > 1 ? "es" : ""} selected`
                                                    : "All classes (default)"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__placeholder__" disabled>Select a class...</SelectItem>
                                            {classrooms.map(c => (
                                                <SelectItem key={c.id} value={c.id} disabled={targetClasses.includes(c.id)}>
                                                    {c.name} {targetClasses.includes(c.id) ? "✓" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {targetClasses.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {targetClasses.map(id => {
                                                const cls = classrooms.find(c => c.id === id);
                                                return (
                                                    <Badge key={id} variant="secondary" className="pr-1">
                                                        {cls?.name}
                                                        <button type="button" className="ml-1 hover:text-red-500" onClick={() => setTargetClasses(targetClasses.filter(c => c !== id))}>✕</button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About the Club */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-brand" /> About the Club
                            </CardTitle>
                            <CardDescription>Detailed information to attract students and parents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Description <span className="text-xs text-muted-foreground">(what is this club about?)</span></Label>
                                <textarea
                                    className="w-full p-3 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all outline-none resize-none h-24 bg-zinc-50"
                                    placeholder="Describe the club's purpose, activities, and what students will gain from joining..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>🎯 Goals & Objectives</Label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all outline-none resize-none h-28 bg-zinc-50"
                                        placeholder="- Develop critical thinking&#10;- Build teamwork skills&#10;- Participate in competitions"
                                        value={goals}
                                        onChange={e => setGoals(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>📋 Rules & Guidelines</Label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all outline-none resize-none h-28 bg-zinc-50"
                                        placeholder="- Regular attendance expected&#10;- Respect all members&#10;- Complete assignments on time"
                                        value={rules}
                                        onChange={e => setRules(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>✅ Eligibility Criteria <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                <Input
                                    placeholder="e.g. Open to all students, Grade 3 and above, Must pass audition"
                                    value={eligibility}
                                    onChange={e => setEligibility(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ═══════════════ RIGHT COLUMN (1/3) ═══════════════ */}
                <div className="space-y-6">

                    {/* Leadership */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" /> Leadership
                            </CardTitle>
                            <CardDescription>Assign staff to lead this club</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>President / Lead Mentor</Label>
                                <Select value={coachId || "__none__"} onValueChange={v => setCoachId(v === "__none__" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select mentor">
                                            {coachId
                                                ? `${selectedMentor?.firstName} ${selectedMentor?.lastName}`
                                                : "Select a staff member"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__" disabled>Select a staff member</SelectItem>
                                        {staff.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.firstName} {s.lastName} {s.designation ? `(${s.designation})` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Co-Mentor <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                <Select value={coMentorId || "__none__"} onValueChange={v => setCoMentorId(v === "__none__" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select co-mentor">
                                            {coMentorId
                                                ? `${selectedCoMentor?.firstName} ${selectedCoMentor?.lastName}`
                                                : "None"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">None</SelectItem>
                                        {staff.filter(s => s.id !== coachId).map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.firstName} {s.lastName} {s.designation ? `(${s.designation})` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedMentor && (
                                <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden">
                                        {selectedMentor.avatar ? (
                                            <img src={selectedMentor.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User className="w-5 h-5 text-brand" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{selectedMentor.firstName} {selectedMentor.lastName}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{selectedMentor.designation || "Staff"}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Preview */}
                    <Card className="border-dashed">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Card Preview
                            </CardTitle>
                            <CardDescription>How the club will appear on the listing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-5 bg-white rounded-2xl border shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center overflow-hidden">
                                        {logo ? (
                                            <img src={logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Shield className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-[10px]">Active</Badge>
                                        {categoryObj && (
                                            <Badge variant="outline" className={`${categoryObj.color} text-[10px] border-0`}>
                                                {categoryObj.label}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight">
                                        {name || "Club Name"}
                                    </h3>
                                    <p className="text-xs text-zinc-400 italic line-clamp-2 mt-1">
                                        {description || "Club description will appear here..."}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-3 border-t border-dashed">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3 w-3 text-zinc-400" />
                                        <span className="font-bold text-zinc-600">
                                            {selectedMentor ? `${selectedMentor.firstName} ${selectedMentor.lastName}` : "No Mentor"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Hash className="h-3 w-3 text-zinc-400" />
                                        <span className="font-bold text-zinc-600">{capacity || "∞"} seats</span>
                                    </div>
                                </div>
                                {buildMeetingSchedule() && (
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-medium">{buildMeetingSchedule()}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <StandardActionButton
                        type="submit"
                        variant="primary"
                        icon={Sparkles}
                        label="Create Club"
                        loading={loading}
                        loadingLabel="Creating..."
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-brand/20"
                    />
                </div>
            </form>
        </div>
    );
}
