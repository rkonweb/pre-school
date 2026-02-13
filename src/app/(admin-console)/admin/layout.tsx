import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-console/AdminSidebar";
import { SuperAdminProvider } from "@/context/super-admin-context";
import { isSuperAdminAuthenticated } from "@/app/actions/admin-auth-actions";
import { ModalProvider } from "@/components/ui/modal/ModalContext";
import { GlobalModalRenderer } from "@/components/ui/modal/GlobalModal";
import { AdminLayoutInner } from "@/app/(admin-console)/admin/AdminLayoutInner";

// Helper to clean up pathname for comparison in server component
// This is used sparingly since we prefer middleware for sophisticated redirects
async function checkAuth(isLoginPage: boolean) {
    const isAuthenticated = await isSuperAdminAuthenticated();

    if (!isAuthenticated && !isLoginPage) {
        redirect("/admin/login");
    }

    if (isAuthenticated && isLoginPage) {
        redirect("/admin/dashboard");
    }

    return isAuthenticated;
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In Server Components, we don't have access to usePathname directly.
    // However, layouts in Next.js 13+ can't easily know the full path 
    // without headers or params. 
    // For admin, we use middleware for the bulk of redirects.

    // We can't easily detect "isLoginPage" here without headers.
    // But we CAN wrap everything in providers.

    return (
        <SuperAdminProvider>
            <ModalProvider>
                {/* 
                  The actual "Layout" with Sidebar is rendered only when NOT on login.
                  Since we can't reliably check breadcrumbs here without client hooks,
                  we rely on the children to tell us if they need the sidebar, 
                  OR we use a wrapper.
                */}
                <AdminLayoutInner>
                    {children}
                </AdminLayoutInner>
                <GlobalModalRenderer />
            </ModalProvider>
        </SuperAdminProvider>
    );
}

// Separate client component for pathname-dependent UI
