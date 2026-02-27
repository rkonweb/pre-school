import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bus, Clock, Phone, User as UserIcon } from "lucide-react";

export default async function TransportStatusPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    // TODO: Get student from session
    // const student = await getStudent();
    const student = null; // Placeholder

    if (!student) {
        return <div className="p-6">Student specific view.</div>
    }

    const profile = await prisma.studentTransportProfile.findUnique({
        where: { studentId: (student as any).id }, // Cast for placeholder
        include: {
            route: { include: { pickupVehicle: true, driver: true } },
            pickupStop: true,
            dropStop: true
        }
    });

    if (!profile) {
        return <div>You have not applied for transport.</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Transport Status</h1>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Application Status</CardTitle>
                        <Badge
                            variant={profile.status === "APPROVED" ? "outline" : "secondary"}
                            className={profile.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}
                        >
                            {profile.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {profile.status === "PENDING" && (
                        <p>Your application for <strong>{profile.applicationAddress}</strong> is under review.</p>
                    )}

                    {profile.status === "APPROVED" && profile.route && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Bus className="h-5 w-5 text-brand" />
                                    Route Details
                                </h3>
                                <div className="bg-zinc-50 p-4 rounded-lg space-y-3">
                                    <div>
                                        <p className="text-sm text-zinc-500">Route Name</p>
                                        <p className="text-zinc-500">{profile.route?.name || "Not assigned"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Vehicle</p>
                                        <p className="font-medium">{profile.route?.pickupVehicle?.model} ({profile.route?.pickupVehicle?.capacity} seats)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-purple-600" />
                                    Driver Info
                                </h3>
                                <div className="bg-zinc-50 p-4 rounded-lg space-y-3">
                                    <div>
                                        <p className="text-sm text-zinc-500">Name</p>
                                        <p className="font-medium">{profile.route.driver?.name || "Not Assigned"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Contact</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> {profile.route.driver?.phone || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                    Your Stops
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="border border-l-4 border-l-brand p-4 rounded-r-lg bg-brand/5">
                                        <p className="font-bold text-brand mb-1">Pickup</p>
                                        <p className="font-medium text-lg">{profile.pickupStop?.name}</p>
                                        <p className="text-zinc-500 flex items-center gap-1 mt-1">
                                            <Clock className="h-4 w-4" /> {profile.pickupStop?.pickupTime}
                                        </p>
                                    </div>
                                    <div className="border border-l-4 border-l-green-500 p-4 rounded-r-lg bg-green-50/10">
                                        <p className="font-bold text-green-800 mb-1">Drop-off</p>
                                        <p className="font-medium text-lg">{profile.dropStop?.name || profile.pickupStop?.name}</p>
                                        <p className="text-zinc-500 flex items-center gap-1 mt-1">
                                            <Clock className="h-4 w-4" /> {profile.dropStop?.dropTime || profile.pickupStop?.dropTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
