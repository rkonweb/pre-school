import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-mobile';

async function getAuthorizedUser(req: Request) {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return null;

    const userId = payload.sub as string;
    return await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, schoolId: true, role: true }
    });
}

export async function GET(
  request: Request,
  { params }: { params: { module: string } }
) {
  try {
    const user = await getAuthorizedUser(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { module } = params;
    const schoolId = user.schoolId;
    
    switch (module) {
      case 'admissions':
        const admissions = await prisma.admission.findMany({
          where: { schoolId },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: admissions });
      
      case 'staff':
        const staff = await prisma.user.findMany({
          where: { schoolId, role: { in: ['TEACHER', 'DRIVER', 'STAFF', 'ADMIN'] } },
          include: { customRole: true },
          orderBy: { firstName: 'asc' }
        });
        return NextResponse.json({ success: true, data: staff });

      case 'roles':
        const roles = await prisma.role.findMany({
          where: { schoolId },
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        });
        return NextResponse.json({ success: true, data: roles });

      case 'classrooms':
        const classrooms = await prisma.classroom.findMany({
          where: { schoolId },
          orderBy: { name: 'asc' }
        });
        return NextResponse.json({ success: true, data: classrooms });

      case 'billing':
        const fees = await prisma.fee.findMany({
          where: { student: { schoolId } }, // Ensure fee belongs to student in this school
          include: { student: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50
        });
        
        // Map data to match the generic list item expectations in frontend
        const mappedFees = fees.map((f: any) => ({
          id: f.id,
          name: f.title,
          amount: f.amount,
          status: f.status,
          dueDate: f.dueDate,
          studentName: f.student ? `${f.student.firstName} ${f.student.lastName || ''}`.trim() : 'Unknown Student'
        }));
        return NextResponse.json({ success: true, data: mappedFees });
        
      default:
        // Use MasterData for generic rapid-prototyping modules
        const masterRecords = await prisma.masterData.findMany({
          where: { 
            type: module,
            name: { startsWith: `${schoolId}_` } 
          },
          orderBy: { createdAt: 'desc' }
        });
        
        const parsedData = masterRecords.map((record: any) => {
          try {
             return { id: record.id, ...JSON.parse(record.code || '{}') };
          } catch(e) {
             return { id: record.id, name: record.name };
          }
        });
        
        return NextResponse.json({ success: true, data: parsedData });
    }
  } catch (error) {
    console.error(`[GET /crud/${params.module}] error:`, error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { module: string } }
) {
  try {
    const user = await getAuthorizedUser(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { module } = params;
    const schoolId = user.schoolId;
    const body: any = await request.json();
    let result;

    switch (module) {
      case 'admissions':
        result = await prisma.admission.create({
          data: {
            schoolId,
            studentName: body.studentName || 'New Student',
            parentName: body.parentName || 'Unknown Parent',
            enrolledGrade: body.grade,
            parentPhone: body.phone,
            stage: body.status || 'INQUIRY'
          }
        });
        break;

      case 'staff':
        result = await prisma.user.create({
          data: {
            schoolId,
            mobile: body.phone || `mock_${Date.now()}`,
            firstName: body.name?.split(' ')[0] || body.name,
            lastName: body.name?.split(' ').slice(1).join(' '),
            role: body.role || 'STAFF',
            department: body.branch
          }
        });
        break;

      case 'billing':
        const firstStudent = await prisma.student.findFirst({ where: { schoolId } });
        if(!firstStudent) {
            return NextResponse.json({ success: false, error: 'Must have at least one student to create a fee' }, { status: 400 });
        }
        result = await prisma.fee.create({
            data: {
                studentId: firstStudent.id,
                title: body.feeHead || 'General Fee',
                amount: parseFloat(body.amount) || 0,
                status: body.status?.toUpperCase() || 'PENDING',
                dueDate: body.dueDate ? new Date(body.dueDate) : new Date()
            }
        });
        break;

      default:
        result = await prisma.masterData.create({
          data: {
            type: module,
            name: `${schoolId}_${Date.now()}`,
            code: JSON.stringify(body),
          }
        });
        break;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(`[POST /crud/${params.module}] error:`, error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { module: string } }
) {
  try {
    const user = await getAuthorizedUser(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { module } = params;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID param' }, { status: 400 });
    }

    switch (module) {
      case 'admissions':
        await prisma.admission.delete({ where: { id } });
        break;
      case 'staff':
        await prisma.user.delete({ where: { id } });
        break;
      case 'billing':
        await prisma.fee.delete({ where: { id } });
        break;
      default:
        await prisma.masterData.delete({ where: { id } });
        break;
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error(`[DELETE /crud/${params.module}] error:`, error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
