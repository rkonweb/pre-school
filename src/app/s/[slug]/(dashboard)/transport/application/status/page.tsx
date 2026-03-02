import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bus, Clock, Phone, User as UserIcon, CheckCircle, XCircle, Hourglass, Users } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
    APPROVED: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
    PENDING: { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
    REJECTED: { badge: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
};

export default async function TransportStatusPage(
    props: { params: Promise<{ slug: string }>; searchParams: Promise<{ status?: string }> }
) {
    const { slug } = await props.params;
    const { status: filterStatus } = await props.searchParams;

    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return <div className="p-6 text-red-500">School not found.</div>;

    const allProfiles = await prisma.studentTransportProfile.findMany({
        where: { student: { schoolId: school.id } },
        include: {
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    admissionNumber: true,
                    grade: true,
                    parentName: true,
                    parentMobile: true,
                },
            },
            route: {
                include: {
                    pickupVehicle: { select: { model: true, registrationNumber: true, capacity: true } },
                    driver: { select: { name: true, phone: true } },
                }
            },
            pickupStop: { select: { name: true, pickupTime: true, dropTime: true } },
            dropStop: { select: { name: true, pickupTime: true, dropTime: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    const total = allProfiles.length;
    const pending = allProfiles.filter(p => p.status === "PENDING").length;
    const approved = allProfiles.filter(p => p.status === "APPROVED").length;
    const rejected = allProfiles.filter(p => p.status === "REJECTED").length;

    const profiles = filterStatus && filterStatus !== "ALL"
        ? allProfiles.filter(p => p.status === filterStatus)
        : allProfiles;

    const tabs = [
        { key: "ALL", label: "All", count: total, Icon: Users, color: "text-zinc-600" },
        { key: "PENDING", label: "Pending", count: pending, Icon: Hourglass, color: "text-amber-600" },
        { key: "APPROVED", label: "Approved", count: approved, Icon: CheckCircle, color: "text-emerald-600" },
        { key: "REJECTED", label: "Rejected", count: rejected, Icon: XCircle, color: "text-red-600" },
    ];

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transport Application Status</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">All student transport applications · {school.name}</p>
                </div>
                <Link
                    href={`/s/${slug}/transport/application/requests`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Manage Requests →
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: total, color: "text-zinc-800", bg: "bg-zinc-50", border: "border-zinc-200" },
                    { label: "Pending", value: pending, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
                    { label: "Approved", value: approved, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
                    { label: "Rejected", value: rejected, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                        <p className="text-sm text-zinc-500">{c.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(({ key, label, count, Icon, color }) => {
                    const active = (filterStatus ?? "ALL") === key;
                    return (
                        <Link
                            key={key}
                            href={`/s/${slug}/transport/application/status?status=${key}`}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${active
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                                }`}
                        >
                            <Icon className={`h-4 w-4 ${active ? "text-white" : color}`} />
                            {label}
                            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                                {count}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Profile List */}
            {profiles.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                    <Bus className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No applications found</p>
                    <p className="text-sm mt-1">
                        {filterStatus && filterStatus !== "ALL"
                            ? `No ${filterStatus.toLowerCase()} transport applications yet.`
                            : "No transport applications submitted yet."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {profiles.map(profile => {
                        const s = profile.student;
                        const style = STATUS_STYLES[profile.status] ?? STATUS_STYLES["PENDING"];
                        return (
                            <Card key={profile.id} className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    {/* Row 1: Student info + status */}
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 font-bold text-zinc-600 text-sm">
                                                {s.firstName?.[0]}{s.lastName?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-900">{s.firstName} {s.lastName}</p>
                                                <p className="text-sm text-zinc-500">
                                                    {s.admissionNumber ? `${s.admissionNumber} · ` : ""}Grade {s.grade ?? "–"}
                                                </p>
                                                {(s.parentName || s.parentMobile) && (
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                                        <Phone className="h-3 w-3" />
                                                        {s.parentName ? `${s.parentName}` : ""}{s.parentMobile ? ` · ${s.parentMobile}` : ""}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`shrink-0 ${style.badge} font-medium`}>
                                            {style.label}
                                        </Badge>
                                    </div>

                                    {/* Applied Address */}
                                    {profile.applicationAddress && (
                                        <div className="mt-3 flex items-start gap-2 text-sm bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                            <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Requested Address</span>
                                                <p className="text-zinc-700 mt-0.5">{profile.applicationAddress}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejection reason */}
                                    {profile.status === "REJECTED" && profile.rejectionReason && (
                                        <div className="mt-3 flex items-start gap-2 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Rejection Reason</span>
                                                <p className="text-red-700 mt-0.5">{profile.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Approved details */}
                                    {profile.status === "APPROVED" && profile.route && (
                                        <div className="mt-4 grid md:grid-cols-3 gap-3">
                                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <Bus className="h-3 w-3" /> Route
                                                </p>
                                                <p className="font-medium text-blue-900">{profile.route.name}</p>
                                                {profile.route.pickupVehicle && (
                                                    <p className="text-xs text-blue-600 mt-0.5">
                                                        {profile.route.pickupVehicle.model} · {profile.route.pickupVehicle.registrationNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg">
                                                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <UserIcon className="h-3 w-3" /> Driver
                                                </p>
                                                <p className="font-medium text-purple-900">{profile.route.driver?.name ?? "Not assigned"}</p>
                                                {profile.route.driver?.phone && (
                                                    <p className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {profile.route.driver.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <MapPin className="h-3 w-3" /> Stops
                                                </p>
                                                <div className="text-xs space-y-1">
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-emerald-500" />
                                                        <span className="font-medium">Pickup:</span> {profile.pickupStop?.name ?? "–"}
                                                        {profile.pickupStop?.pickupTime && <span className="text-emerald-600">@ {profile.pickupStop.pickupTime}</span>}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-red-400" />
                                                        <span className="font-medium">Drop:</span> {profile.dropStop?.name ?? profile.pickupStop?.name ?? "–"}
                                                        {(profile.dropStop?.dropTime ?? profile.pickupStop?.dropTime) && (
                                                            <span className="text-red-500">@ {profile.dropStop?.dropTime ?? profile.pickupStop?.dropTime}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fee + Dates */}
                                    {profile.status === "APPROVED" && (
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500 border-t pt-3">
                                            <span>💰 Monthly Fee: <strong className="text-zinc-800">₹{profile.transportFee.toFixed(0)}</strong></span>
                                            {profile.startDate && (
                                                <span>📅 Start: <strong className="text-zinc-800">{new Date(profile.startDate).toLocaleDateString("en-IN")}</strong></span>
                                            )}
                                            {profile.endDate && (
                                                <span>📅 End: <strong className="text-zinc-800">{new Date(profile.endDate).toLocaleDateString("en-IN")}</strong></span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
