import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { AlertCircle, Crown, LogOut, Mail, Phone, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function UpgradePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Get current user
    const userRes = await getCurrentUserAction();
    if (!userRes.success || !userRes.data) {
        redirect("/school-login");
    }

    const user = userRes.data as any;

    // Get school and subscription data
    const school = await prisma.school.findUnique({
        where: { slug },
        include: {
            subscription: {
                include: { plan: true }
            }
        }
    });

    if (!school) {
        redirect("/school-login");
    }

    // If SUPER_ADMIN, redirect to dashboard (they shouldn't see this page)
    if (user.role === "SUPER_ADMIN") {
        redirect(`/s/${slug}/dashboard`);
    }

    // Calculate days expired
    const now = new Date();
    const endDate = school.subscription?.endDate ? new Date(school.subscription.endDate) : null;
    const daysExpired = endDate ? Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Determine status message
    const isExpired = endDate && endDate < now;
    const isSuspended = school.subscription?.status === 'SUSPENDED';
    const isCancelled = school.subscription?.status === 'CANCELLED';
    const noSubscription = !school.subscription;

    let statusTitle = "Subscription Required";
    let statusMessage = "Your school needs an active subscription to access the dashboard.";

    if (isExpired) {
        statusTitle = "Subscription Expired";
        statusMessage = `Your subscription expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago.`;
    } else if (isSuspended) {
        statusTitle = "Subscription Suspended";
        statusMessage = "Your subscription has been temporarily suspended.";
    } else if (isCancelled) {
        statusTitle = "Subscription Cancelled";
        statusMessage = "Your subscription has been cancelled.";
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-6">
                {/* School Header */}
                <div className="text-center">
                    {school.logo ? (
                        <img src={school.logo} alt={school.name} className="h-16 w-16 mx-auto rounded-xl object-cover border-2 border-white shadow-lg" />
                    ) : (
                        <div className="h-16 w-16 mx-auto rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {school.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <h1 className="mt-4 text-2xl font-bold text-zinc-900">{school.name}</h1>
                    <p className="text-sm text-zinc-500 font-mono">{slug}.preschool-erp.com</p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl border-2 border-red-100 shadow-xl overflow-hidden">
                    {/* Alert Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{statusTitle}</h2>
                                <p className="text-sm text-red-50">{statusMessage}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Current Plan Info */}
                        {school.subscription && (
                            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="h-5 w-5 text-zinc-400" />
                                    <h3 className="font-bold text-zinc-900">Current Plan</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-zinc-500 text-xs font-medium">Plan Name</p>
                                        <p className="font-bold text-zinc-900">{school.subscription.plan?.name || "Unknown"}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-medium">Status</p>
                                        <p className="font-bold text-red-600">{school.subscription.status}</p>
                                    </div>
                                    {endDate && (
                                        <>
                                            <div>
                                                <p className="text-zinc-500 text-xs font-medium">End Date</p>
                                                <p className="font-bold text-zinc-900 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {endDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                            {isExpired && (
                                                <div>
                                                    <p className="text-zinc-500 text-xs font-medium">Days Expired</p>
                                                    <p className="font-bold text-red-600">{daysExpired} days</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* What You're Missing */}
                        <div>
                            <h3 className="font-bold text-zinc-900 mb-3">What you're missing:</h3>
                            <ul className="space-y-2">
                                {[
                                    "Access to student profiles and records",
                                    "Attendance tracking and reporting",
                                    "Fee management and billing",
                                    "Staff management and payroll",
                                    "Communication tools and notifications",
                                    "All other premium features"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                                        <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Section */}
                        <div className="pt-4 border-t border-zinc-100 space-y-3">
                            <p className="text-sm text-zinc-600">
                                To continue using the dashboard, please contact your school administrator to renew the subscription.
                            </p>

                            {/* Contact Admin Button */}
                            <a
                                href={`mailto:${school.email || 'admin@school.com'}?subject=Subscription Renewal Request&body=Hi, I would like to renew our subscription for ${school.name}.`}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Mail className="h-4 w-4" />
                                Contact Administrator
                            </a>

                            {/* Logout Button */}
                            <Link
                                href="/school-logout"
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Support Footer */}
                <div className="text-center text-sm text-zinc-500">
                    <p>Need help? Contact support at <a href="mailto:support@preschool-erp.com" className="text-blue-600 hover:underline font-medium">support@preschool-erp.com</a></p>
                </div>
            </div>
        </div>
    );
}
