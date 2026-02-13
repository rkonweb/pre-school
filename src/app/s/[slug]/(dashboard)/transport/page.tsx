import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function TransportDashboard({ params }: { params: { slug: string } }) {
    const school = await prisma.school.findUnique({ where: { slug: params.slug }, include: { transportVehicles: true, transportRoutes: true } });
    if (!school) return <div>School not found</div>;

    const vehicles = school.transportVehicles;
    const routes = school.transportRoutes;

    // Calculate stats
    const totalVehicles = vehicles.length;
    const totalRoutes = routes.length;

    // Get pending requests count
    const pendingRequests = await prisma.studentTransportProfile.count({
        where: {
            student: { schoolId: school.id },
            status: "PENDING"
        }
    });

    const activeStudents = await prisma.studentTransportProfile.count({
        where: {
            student: { schoolId: school.id },
            status: { in: ["APPROVED", "ACTIVE"] }
        }
    });

    const stats = [
        { label: "Total Vehicles", value: totalVehicles, icon: Bus, color: "text-brand", bg: "bg-brand/10", href: `/s/${params.slug}/transport/vehicles` },
        { label: "Active Routes", value: totalRoutes, icon: MapPin, color: "text-brand", bg: "bg-brand/10", href: `/s/${params.slug}/transport/routes` },
        { label: "Active Students", value: activeStudents, icon: Users, color: "text-green-600", bg: "bg-green-100", href: `/s/${params.slug}/transport/assignments` },
        { label: "Pending Requests", value: pendingRequests, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100", href: `/s/${params.slug}/transport/requests` },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Transport Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions or Recent Activity could go here */}

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href={`/s/${params.slug}/transport/routes`} className="text-brand hover:underline">Manage Routes & Stops</Link>
                        <Link href={`/s/${params.slug}/transport/requests`} className="text-brand hover:underline">Process Applications</Link>
                        <Link href={`/s/${params.slug}/transport/vehicles`} className="text-brand hover:underline">Manage Fleet</Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
