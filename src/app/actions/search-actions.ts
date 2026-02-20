"use server";

import { elastic } from "@/lib/elasticsearch";

// Helper to check client
function getClient() {
    if (!elastic) {
        throw new Error("Search service unavailble");
    }
    return elastic;
}

export async function searchGlobalAction(schoolSlug: string, term: string) {
    try {
        const client = getClient();
        if (!term || term.length < 2) return { success: true, data: { students: [], leads: [], staff: [] } };

        const result = await client.search({
            index: ['students', 'leads', 'staff'],
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { schoolSlug: schoolSlug } },
                            {
                                multi_match: {
                                    query: term,
                                    fields: [
                                        'fullName^3', 'firstName^2', 'lastName^2',
                                        'parentName', 'childName',
                                        'admissionNumber', 'email', 'mobile',
                                        'className', 'designation', 'department'
                                    ],
                                    fuzziness: 'AUTO'
                                }
                            }
                        ]
                    }
                },
                highlight: {
                    fields: {
                        '*': {}
                    }
                },
                size: 20
            } as any
        });

        const hits = result.hits.hits;
        const students = hits.filter((h: any) => h._index === 'students').map((h: any) => ({ id: h._id, ...h._source }));
        const leads = hits.filter((h: any) => h._index === 'leads').map((h: any) => ({ id: h._id, ...h._source }));
        const staff = hits.filter((h: any) => h._index === 'staff').map((h: any) => ({ id: h._id, ...h._source }));

        return { success: true, data: { students, leads, staff } };

    } catch (error: any) {
        console.error("Global Search Error:", error);
        return { success: false, error: "Search failed" };
    }
}

export async function searchStudentsElasticAction(schoolSlug: string, query: string, filters: any = {}) {
    try {
        const client = getClient();

        const must: any[] = [
            { term: { schoolSlug: schoolSlug } }
        ];

        const must_not: any[] = [];

        if (query) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['fullName^3', 'admissionNumber^4', 'parentName', 'parentMobile'],
                    fuzziness: 'AUTO'
                }
            });
        }

        if (filters.status && filters.status !== 'all') {
            must.push({ match: { status: filters.status } });
        } else if (filters.excludeStatus) {
            must_not.push({ match: { status: filters.excludeStatus } });
        }

        if (filters.class && filters.class !== 'all') {
            must.push({ match: { 'className.keyword': filters.class } }); // keyword for exact match
        }
        if (filters.gender && filters.gender !== 'all') {
            must.push({ match: { gender: filters.gender } });
        }

        const result = await client.search({
            index: 'students',
            body: {
                query: {
                    bool: { must, must_not }
                },
                size: 50
            } as any
        });

        const students = result.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source
        }));

        // Use safe access for total.value as it might be a number or object depending on version
        const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

        return { success: true, students, total };

    } catch (error) {
        console.error("Student Search Error:", error);
        return { success: false, error: "Search failed" };
    }
}

export async function searchLeadsElasticAction(schoolSlug: string, query: string, filters: any = {}) {
    try {
        const client = getClient();

        const must: any[] = [
            { term: { schoolSlug: schoolSlug } }
        ];

        if (query) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['parentName^2', 'childName^2', 'mobile^3', 'source'],
                    fuzziness: 'AUTO'
                }
            });
        }

        if (filters.status && filters.status !== 'all') {
            must.push({ match: { status: filters.status } }); // Lead status is keyword friendly usually
        }

        const result = await client.search({
            index: 'leads',
            body: {
                query: {
                    bool: { must }
                },
                size: 50
            } as any
        });

        const leads = result.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source
        }));

        const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

        return { success: true, leads, total };
    } catch (error) {
        console.error("Lead Search Error:", error);
        return { success: false, error: "Search failed" };
    }
}

export async function searchStaffElasticAction(schoolSlug: string, query: string, filters: any = {}) {
    try {
        const client = getClient();

        const must: any[] = [
            { term: { schoolSlug: schoolSlug } }
        ];

        if (query) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['fullName^3', 'email^2', 'mobile', 'designation', 'department'],
                    fuzziness: 'AUTO'
                }
            });
        }

        if (filters.designation && filters.designation !== 'all') {
            must.push({ match: { designation: filters.designation } });
        }
        if (filters.department && filters.department !== 'all') {
            must.push({ match: { department: filters.department } });
        }

        const result = await client.search({
            index: 'staff',
            body: {
                query: {
                    bool: { must }
                },
                size: 50
            } as any
        });

        const staff = result.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source
        }));

        const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

        return { success: true, staff, total };
    } catch (error) {
        console.error("Staff Search Error:", error);
        return { success: false, error: "Search failed" };
    }
}
