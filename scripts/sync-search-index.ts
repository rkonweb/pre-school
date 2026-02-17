
import { PrismaClient } from '../src/generated/client_v2';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ELASTICSEARCH_NODE || !process.env.ELASTICSEARCH_API_KEY) {
    console.error('Missing Elasticsearch configuration. Please set ELASTICSEARCH_NODE and ELASTICSEARCH_API_KEY in .env');
    process.exit(1);
}

const prisma = new PrismaClient();
const elastic = new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY
    }
});

async function createIndexIfNotExists(indexName: string) {
    const exists = await elastic.indices.exists({ index: indexName });
    if (!exists) {
        await elastic.indices.create({ index: indexName });
        console.log(`Created index: ${indexName}`);
    }
}

async function syncStudents() {
    console.log('Syncing Students...');
    await createIndexIfNotExists('students');

    const students = await prisma.student.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            status: true,
            gender: true,
            avatar: true,
            school: { select: { slug: true } },
            classroom: { select: { name: true } },
            parentName: true,
            parentMobile: true,
        }
    });

    const body = students.flatMap(doc => [
        { index: { _index: 'students', _id: doc.id } },
        {
            ...doc,
            fullName: `${doc.firstName} ${doc.lastName}`,
            className: doc.classroom?.name || 'Unassigned',
            schoolSlug: doc.school.slug
        }
    ]);

    if (body.length > 0) {
        const response = await elastic.bulk({ refresh: true, body });
        if (response.errors) {
            console.error('Bulk index errors', response.items.filter((item: any) => item.index && item.index.error));
        }
        console.log(`Indexed ${students.length} students`);
    } else {
        console.log('No students to index');
    }
}

async function syncLeads() {
    console.log('Syncing Leads...');
    await createIndexIfNotExists('leads');

    // Fetch from Admission table (Leads)
    const leads = await prisma.admission.findMany({
        select: {
            id: true,
            studentName: true,
            parentName: true,
            parentPhone: true,
            marketingStatus: true,
            source: true,
            school: { select: { slug: true } }
        }
    });

    const body = leads.flatMap(doc => [
        { index: { _index: 'leads', _id: doc.id } },
        {
            id: doc.id,
            childName: doc.studentName,
            parentName: doc.parentName,
            mobile: doc.parentPhone,
            status: doc.marketingStatus,
            source: doc.source,
            schoolSlug: doc.school.slug
        }
    ]);

    if (body.length > 0) {
        const response = await elastic.bulk({ refresh: true, body });
        if (response.errors) {
            console.error('Bulk index errors', response.items.filter((item: any) => item.index && item.index.error));
        }
        console.log(`Indexed ${leads.length} leads`);
    } else {
        console.log('No leads to index');
    }
}

async function syncStaff() {
    console.log('Syncing Staff...');
    await createIndexIfNotExists('staff');

    const staff = await prisma.user.findMany({
        where: { role: { not: 'PARENT' } }, // Exclude parents if they are in User table
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            designation: true,
            department: true,
            status: true,
            avatar: true,
            school: { select: { slug: true } }
        }
    });

    const body = staff.flatMap(doc => [
        { index: { _index: 'staff', _id: doc.id } },
        {
            ...doc,
            fullName: `${doc.firstName} ${doc.lastName}`,
            schoolSlug: doc.school?.slug
        }
    ]);

    if (body.length > 0) {
        const response = await elastic.bulk({ refresh: true, body });
        if (response.errors) {
            console.error('Bulk index errors', response.items.filter((item: any) => item.index && item.index.error));
        }
        console.log(`Indexed ${staff.length} staff members`);
    } else {
        console.log('No staff to index');
    }
}

async function main() {
    try {
        await syncStudents();
        await syncLeads();
        await syncStaff();
        console.log('Sync complete');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
