import { prisma } from "@/lib/prisma";
import { MapPin, Bus, Clock, Phone, User as UserIcon, CheckCircle, XCircle, Hourglass, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeader, StatusChip, ErpCard, C } from "@/components/ui/erp-ui";

// Status styles are now handled by StatusChip or Badge from ERP UI kit

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
        <div className="space-y-6">
            <SectionHeader
                title="Transport Application Status"
                subtitle={`All student transport applications · ${school.name}`}
                icon={<Bus size={18} color={C.amber} />}
                action={
                    <Link
                        href={`/s/${slug}/transport/application/requests`}
                        className="px-6 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-2"
                    >
                        Manage Requests <ArrowRight className="h-4 w-4" />
                    </Link>
                }
            />

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
                        return (
                            <ErpCard key={profile.id} hover className="border-zinc-100">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 font-black text-zinc-900 text-lg uppercase shadow-sm border border-zinc-200/50">
                                            {s.firstName?.[0]}{s.lastName?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-zinc-900 uppercase tracking-tight text-lg leading-tight">{s.firstName} {s.lastName}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                {s.admissionNumber ? `${s.admissionNumber} • ` : ""}Grade {s.grade ?? "–"}
                                            </p>
                                            {(s.parentName || s.parentMobile) && (
                                                <p className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 mt-2">
                                                    <Phone className="h-3.5 w-3.5 text-brand" />
                                                    {s.parentName ? `${s.parentName}` : ""}{s.parentMobile ? ` • ${s.parentMobile}` : ""}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <StatusChip label={profile.status.charAt(0) + profile.status.slice(1).toLowerCase()} />
                                </div>

                                {profile.applicationAddress && (
                                    <div className="mt-6 flex items-start gap-3 text-sm bg-zinc-50/50 p-4 rounded-[20px] border border-zinc-100">
                                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em]">Requested Address</span>
                                            <p className="text-zinc-700 font-bold mt-1">{profile.applicationAddress}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.status === "REJECTED" && profile.rejectionReason && (
                                    <div className="mt-4 flex items-start gap-3 text-sm bg-red-50/50 p-4 rounded-[20px] border border-red-100">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.1em]">Rejection Reason</span>
                                            <p className="text-red-700 font-bold mt-1">{profile.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.status === "APPROVED" && profile.route && (
                                    <div className="mt-6 grid md:grid-cols-3 gap-4">
                                        <div className="bg-amber-50/30 border border-amber-100/50 p-4 rounded-[24px]">
                                            <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                <Bus className="h-3.5 w-3.5" /> Route
                                            </p>
                                            <p className="font-black text-zinc-900 uppercase tracking-tight">{profile.route.name}</p>
                                            {profile.route.pickupVehicle && (
                                                <p className="text-[10px] font-bold text-amber-700 mt-2 bg-amber-100/50 w-fit px-2 py-0.5 rounded-md">
                                                    {profile.route.pickupVehicle.registrationNumber}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-[24px]">
                                            <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                <UserIcon className="h-3.5 w-3.5" /> Driver
                                            </p>
                                            <p className="font-black text-zinc-900 uppercase tracking-tight">{profile.route.driver?.name ?? "Not assigned"}</p>
                                            {profile.route.driver?.phone && (
                                                <p className="text-[10px] font-bold text-indigo-700 mt-2 flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" /> {profile.route.driver.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-[24px]">
                                            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                <MapPin className="h-3.5 w-3.5" /> Ops Context
                                            </p>
                                            <div className="text-xs space-y-2">
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="font-bold text-zinc-700">IN:</span> {profile.pickupStop?.name ?? "–"}
                                                    {profile.pickupStop?.pickupTime && <span className="font-black text-emerald-600 ml-auto">{profile.pickupStop.pickupTime}</span>}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-red-500" />
                                                    <span className="font-bold text-zinc-700">OUT:</span> {profile.dropStop?.name ?? profile.pickupStop?.name ?? "–"}
                                                    {(profile.dropStop?.dropTime ?? profile.pickupStop?.dropTime) && (
                                                        <span className="font-black text-red-600 ml-auto">{profile.dropStop?.dropTime ?? profile.pickupStop?.dropTime}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profile.status === "APPROVED" && (
                                    <div className="mt-6 flex flex-wrap items-center gap-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest border-t border-zinc-100 pt-5">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg">FEE</span>
                                            <strong className="text-zinc-900 text-sm tracking-tight font-black">₹{profile.transportFee.toFixed(0)}</strong>
                                        </div>
                                        {profile.startDate && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg">START</span>
                                                <strong className="text-zinc-900">{new Date(profile.startDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                                            </div>
                                        )}
                                        <div className="ml-auto bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                                            <CheckCircle className="h-3 w-3" />
                                            Active Manifest
                                        </div>
                                    </div>
                                )}
                            </ErpCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
