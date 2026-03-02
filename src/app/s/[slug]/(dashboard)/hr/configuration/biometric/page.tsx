"use client";

import { useEffect, useState } from "react";
import {
    Router,
    Server,
    Users,
    RefreshCcw,
    CheckCircle2,
    Link as LinkIcon,
    Copy,
    Activity,
    Info
} from "lucide-react";
import {
    getBiometricUnmappedUsersAction,
    getRecentBiometricLogsAction,
    mapBiometricUserAction,
    getConnectedDevicesAction,
    generateSampleBiometricDataAction
} from "@/app/actions/biometric-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { useParams } from "next/navigation";

export default function BiometricSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Data State
    const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
    const [unmappedIds, setUnmappedIds] = useState<string[]>([]);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<"mapping" | "logs">("mapping");
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [serverUrl, setServerUrl] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [devicesRes, unmappedRes, logsRes, staffRes] = await Promise.all([
                getConnectedDevicesAction(slug),
                getBiometricUnmappedUsersAction(slug),
                getRecentBiometricLogsAction(slug),
                getStaffAction(slug)
            ]);

            if (devicesRes.success) setConnectedDevices(devicesRes.data as any[]);
            if (unmappedRes.success) setUnmappedIds(unmappedRes.data as string[]);
            if (logsRes.success) setRecentLogs(logsRes.data as any[]);
            if (staffRes.success) setStaffList(staffRes.data as any[]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            loadData();
            // Auto refresh every 30 seconds
            const interval = setInterval(loadData, 30000);
            setServerUrl(`${window.location.origin}/api/biometric/push?sn=SN-TEST-8899`);
            return () => clearInterval(interval);
        }
    }, [slug]);

    const handleLinkUser = async (deviceUserId: string) => {
        if (!selectedUser) return alert("Please select a staff member first");

        const res = await mapBiometricUserAction(slug, deviceUserId, selectedUser);
        if (res.success) {
            alert("User mapped successfully!");
            loadData();
            setSelectedUser("");
        } else {
            alert("Error: " + res.error);
        }
    };

    const copyToClipboard = () => {
        if (!serverUrl) return;
        navigator.clipboard.writeText(serverUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">

            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Biometric Attendance</h1>
                    <p className="text-zinc-500">Connect devices and manage attendance data sources.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            const res = await generateSampleBiometricDataAction(slug);
                            if (res.success) loadData();
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100"
                    >
                        <Activity className="h-4 w-4" />
                        Generate Sample Data
                    </button>
                    <button
                        onClick={loadData}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh Status
                    </button>
                </div>
            </div>

            {/* Quick Connect Guide (Hero) */}
            <div className="relative overflow-hidden rounded-2xl bg-brand p-8 text-[var(--secondary-color)] shadow-lg shadow-brand/20">
                <div className="relative z-10 grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--secondary-color)] opacity-90 backdrop-blur-sm">
                            <Router className="h-3 w-3" /> Hardware Setup
                        </div>
                        <h2 className="text-3xl font-bold leading-tight">Connect your Machine in seconds</h2>
                        <p className="max-w-md text-[var(--secondary-color)] opacity-80">
                            Simply copy the Server URL below and paste it into your biometric device's "Cloud Server" or "ADMS" settings.
                        </p>

                        <div className="mt-4 space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-[var(--secondary-color)] opacity-60">Server URL Endpoint</label>
                            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-2 pr-4 backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20">
                                <code className="flex-1 px-3 font-mono text-sm tracking-wide text-[var(--secondary-color)] break-all">
                                    {serverUrl || "Loading..."}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="rounded-lg bg-white p-2 text-brand transition-colors hover:bg-zinc-100"
                                    title="Copy URL"
                                >
                                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Steps */}
                    <div className="hidden items-center justify-center md:flex">
                        <div className="space-y-6">
                            {[
                                { step: 1, text: "Connect device to WiFi/Lan" },
                                { step: 2, text: "Open ADMS / Cloud Settings in Menu" },
                                { step: 3, text: "Enter URL and Save. Check for 'Connected' icon." }
                            ].map((item) => (
                                <div key={item.step} className="flex items-center gap-4">
                                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/20 font-bold shadow-sm ring-4 ring-white/10">
                                        {item.step}
                                    </div>
                                    <span className="font-medium text-[var(--secondary-color)] opacity-90">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Background */}
                <div className="absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-indigo-500/20 blur-2xl"></div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Connected Devices (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900">
                            <Server className="h-5 w-5 text-zinc-500" />
                            Connected Devices
                        </h3>
                        {connectedDevices.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                                <Activity className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                                <p className="text-sm font-medium text-zinc-900">No active devices</p>
                                <p className="text-xs text-zinc-500">Devices will appear here once they send data.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {connectedDevices.map((device) => (
                                    <div key={device.serialNumber} className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-brand/30 hover:shadow-md">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex h-2.5 w-2.5 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-400'}`}>
                                                        <span className={`absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full opacity-75 ${device.status === 'ONLINE' ? 'bg-green-400' : 'hidden'}`}></span>
                                                    </span>
                                                    <span className="font-semibold text-zinc-900">{device.serialNumber || "Unknown Device"}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Last seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-zinc-500">Total Uploads</div>
                                                <div className="text-lg font-bold text-zinc-900">{device.totalPunches}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="rounded-xl bg-brand/5 p-4 border border-brand/10">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-brand flex-shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-brand">Need Help?</h4>
                                <p className="text-sm text-brand/80">
                                    Most devices use port 80 or 443. Ensure your firewall allows outbound traffic to our server.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Management (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-200 pb-2">
                        <button
                            onClick={() => setActiveTab("mapping")}
                            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors ${activeTab === "mapping" ? "border-brand text-brand" : "border-transparent text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            User Mapping
                            {unmappedIds.length > 0 && (
                                <span className="flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-600">
                                    {unmappedIds.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors ${activeTab === "logs" ? "border-brand text-brand" : "border-transparent text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <Activity className="h-4 w-4" />
                            Recent Logs
                        </button>
                    </div>

                    <div className="min-h-[300px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        {activeTab === "mapping" && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-900">Unmapped Biometric IDs</h3>
                                    <p className="text-sm text-zinc-500">
                                        These IDs have punched in but aren't linked to a specific staff member yet.
                                    </p>
                                </div>

                                {unmappedIds.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-4 rounded-full bg-green-50 p-4">
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        </div>
                                        <h4 className="text-zinc-900 font-medium">All Caught Up!</h4>
                                        <p className="mt-1 max-w-sm text-sm text-zinc-500">
                                            All biometric IDs are successfully mapped to system users. New IDs will appear here automatically.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-zinc-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-zinc-50 text-zinc-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Device ID</th>
                                                    <th className="px-4 py-3 font-medium">Assign To</th>
                                                    <th className="px-4 py-3 text-right font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 bg-white">
                                                {unmappedIds.map(id => (
                                                    <tr key={id} className="group hover:bg-zinc-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100 text-xs font-bold text-orange-700">
                                                                    {id}
                                                                </div>
                                                                <span className="text-zinc-600">Unknown User</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                className="w-full rounded-lg border-zinc-200 text-sm focus:border-brand focus:ring-brand"
                                                                value={selectedUser}
                                                                title="Select Staff Member"
                                                                onChange={(e) => setSelectedUser(e.target.value)}
                                                            >
                                                                <option value="">Select Staff Member...</option>
                                                                {staffList.map((staff: any) => (
                                                                    <option key={staff.id} value={staff.id}>
                                                                        {staff.firstName} {staff.lastName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleLinkUser(id)}
                                                                disabled={!selectedUser}
                                                                className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-brand shadow-sm ring-1 ring-inset ring-brand/20 transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:ring-zinc-200"
                                                            >
                                                                <LinkIcon className="h-3 w-3" /> Map User
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "logs" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-zinc-900">Recent Validations</h3>
                                        <p className="text-sm text-zinc-500">Live feed of processed biometric punches.</p>
                                    </div>
                                    <span className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Live
                                    </span>
                                </div>
                                <div className="rounded-xl border border-zinc-200 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 text-zinc-500">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Time</th>
                                                <th className="px-4 py-3 font-medium">User</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 text-right font-medium">Device ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 bg-white">
                                            {recentLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                                        No logs found recently.
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentLogs.map((log: any, i: number) => (
                                                    <tr key={i} className="hover:bg-zinc-50">
                                                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${log.userName === "Unknown" ? "bg-zinc-100 text-zinc-500" : "bg-indigo-100 text-indigo-700"
                                                                    }`}>
                                                                    {log.userName.charAt(0)}
                                                                </div>
                                                                {log.userName}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${log.statusLabel === 'IN' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                                log.statusLabel === 'OUT' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                                    'bg-zinc-50 text-zinc-600 ring-zinc-500/10'
                                                                }`}>
                                                                {log.statusLabel}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                                                            {log.deviceId || "N/A"}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
