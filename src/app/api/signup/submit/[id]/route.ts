import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTenantAction } from '@/app/actions/tenant-actions';

// PATCH /api/signup/submit/[id] — approve or reject application, optionally provision tenant
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, adminNotes, provisionTenant, slug, planId } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Fetch the application
        const application = await prisma.schoolApplication.findUnique({ where: { id } });
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Update application status
        const updated = await prisma.schoolApplication.update({
            where: { id },
            data: { status, adminNotes: adminNotes || null }
        });

        // If approving and provisioning is requested, create the tenant
        let tenantResult: { success: boolean; schoolId?: string; slug?: string; error?: string } = { success: true };

        if (status === 'APPROVED' && provisionTenant) {
            if (!slug) {
                return NextResponse.json({ error: 'School slug is required to provision tenant' }, { status: 400 });
            }
            if (!planId) {
                return NextResponse.json({ error: 'Plan ID is required to provision tenant' }, { status: 400 });
            }

            // Check slug uniqueness
            const existing = await prisma.school.findUnique({ where: { slug } });
            if (existing) {
                return NextResponse.json({ error: `Slug "${slug}" is already taken. Please choose another.` }, { status: 409 });
            }

            const result = await createTenantAction({
                name: application.schoolName,
                subdomain: slug,
                website: application.website || undefined,
                address: undefined,
                city: application.city,
                state: application.state,
                zip: application.pincode,
                country: 'India',
                contactEmail: application.email,
                contactPhone: application.schoolPhone || application.mobile,
                adminName: `${application.firstName} ${application.lastName}`,
                email: application.email,
                adminPhone: `${application.phoneCode}${application.mobile}`.replace('+91', ''),
                adminDesignation: application.designation,
                plan: planId,
                currency: 'INR',
                timezone: 'UTC+5:30 (IST)',
                dateFormat: 'DD/MM/YYYY',
                modules: [],
                region: 'India',
                brandColor: '#6366F1',
                motto: application.schoolTagline || undefined,
                foundingYear: application.yearEstd,
                logo: undefined,
                customDomain: undefined,
                latitude: undefined,
                longitude: undefined,
                socialMedia: {}
            });

            if (!result.success) {
                // Revert application status back to PENDING on failure
                await prisma.schoolApplication.update({
                    where: { id },
                    data: { status: 'PENDING', adminNotes: null }
                });
                return NextResponse.json({ error: result.error || 'Failed to provision tenant' }, { status: 500 });
            }

            // Find the newly created school to return its slug
            const newSchool = await prisma.school.findUnique({ where: { slug } });
            tenantResult = { success: true, schoolId: newSchool?.id, slug };
        }

        return NextResponse.json({
            success: true,
            application: updated,
            tenant: tenantResult.success ? { schoolId: tenantResult.schoolId, slug: tenantResult.slug } : undefined
        });
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }
}
