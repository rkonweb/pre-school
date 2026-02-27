"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateUserSchoolAction } from './session-actions'

// ==========================================
// HOSTEL CRUD
// ==========================================

export async function createHostelAction(slug: string, data: {
    name: string,
    capacity: number,
    gender: string,
    address?: string,
    managerName?: string,
    managerPhone?: string
}) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        const school = await prisma.school.findUnique({ where: { slug } })
        if (!school) return { success: false, error: "School not found" }

        await prisma.hostel.create({
            data: {
                ...data,
                schoolId: school.id
            }
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateHostelAction(slug: string, id: string, data: {
    name?: string,
    capacity?: number,
    gender?: string,
    address?: string,
    managerName?: string,
    managerPhone?: string
}) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.hostel.update({
            where: { id, school: { slug } },
            data
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getHostelsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        const school = await prisma.school.findUnique({ where: { slug } })
        if (!school) return { success: false, error: "School not found" }

        const hostels = await prisma.hostel.findMany({
            where: { schoolId: school.id },
            include: {
                rooms: {
                    include: {
                        allocations: {
                            where: { status: "ACTIVE" },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        grade: true,
                                        avatar: true,
                                        parentMobile: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Serialize output
        return { success: true, data: JSON.parse(JSON.stringify(hostels)) }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteHostelAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.hostel.delete({
            where: { id, school: { slug } }
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ==========================================
// HOSTEL ROOMS
// ==========================================

export async function createHostelRoomAction(slug: string, data: {
    roomNumber: string,
    floor?: string,
    capacity: number,
    roomType: string,
    amenities: string[],
    baseCost: number,
    hostelId: string
}) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.hostelRoom.create({
            data: {
                roomNumber: data.roomNumber,
                floor: data.floor,
                capacity: data.capacity,
                roomType: data.roomType,
                baseCost: data.baseCost,
                amenities: JSON.stringify(data.amenities),
                hostel: { connect: { id: data.hostelId, school: { slug } } }
            }
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateHostelRoomAction(slug: string, id: string, data: {
    roomNumber?: string,
    floor?: string,
    capacity?: number,
    roomType?: string,
    amenities?: string[],
    baseCost?: number
}) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        const updateData: any = { ...data }
        if (data.amenities) {
            updateData.amenities = JSON.stringify(data.amenities)
        }

        await prisma.hostelRoom.update({
            where: { id, hostel: { school: { slug } } },
            data: updateData
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteHostelRoomAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.hostelRoom.delete({
            where: { id, hostel: { school: { slug } } }
        })
        revalidatePath(`/s/${slug}/hostel/settings`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}


// ==========================================
// ALLOCATIONS & BILLING
// ==========================================

export async function allocateStudentToRoomAction(slug: string, roomId: string, studentId: string, monthlyFee: number) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success || !auth.user) return { success: false, error: auth.error ?? "Not authenticated" }

        // verify capacity and ownership
        const room = await prisma.hostelRoom.findUnique({
            where: { id: roomId, hostel: { school: { slug } } },
            include: { allocations: { where: { status: "ACTIVE" } } }
        })

        if (!room) return { success: false, error: "Room not found" }
        if (room.allocations.length >= room.capacity) return { success: false, error: "Room is at full capacity" }

        // Remove from any previous room
        await prisma.hostelAllocation.updateMany({
            where: { studentId, status: "ACTIVE", room: { hostel: { school: { slug } } } },
            data: { status: "VACATED", endDate: new Date() }
        })

        await prisma.hostelAllocation.create({
            data: {
                studentId,
                roomId,
                monthlyFee,
                startDate: new Date(),
                status: "ACTIVE"
            }
        })

        revalidatePath(`/s/${slug}/hostel/allocation`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function generateHostelFeeInvoiceAction(slug: string, allocationId: string, dueDate: Date, description: string) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        const allocation = await prisma.hostelAllocation.findUnique({
            where: { id: allocationId, room: { hostel: { school: { slug } } } },
            include: { room: true }
        })

        if (!allocation) return { success: false, error: "Allocation not found" }

        // Creates a real Fee record linking to unified Billing
        await prisma.fee.create({
            data: {
                title: `Hostel Fee - ${allocation.room.roomNumber}`,
                amount: allocation.monthlyFee,
                dueDate: new Date(dueDate),
                studentId: allocation.studentId,
                description: description,
                category: "HOSTEL",
                status: "PENDING"
            }
        })
        revalidatePath(`/s/${slug}/hostel/billing`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
export async function vacateStudentFromRoomAction(slug: string, roomId: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(slug)
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.hostelAllocation.updateMany({
            where: {
                roomId,
                studentId,
                status: "ACTIVE",
                room: { hostel: { school: { slug } } }
            },
            data: {
                status: "VACATED",
                endDate: new Date()
            }
        })

        revalidatePath(`/s/${slug}/hostel/allocation`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
