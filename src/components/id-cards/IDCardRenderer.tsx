"use client";

import dynamic from "next/dynamic";
import { IDZone } from "./IDCardKonvaCanvas";

const IDCardKonvaCanvas = dynamic(() => import("./IDCardKonvaCanvas"), { ssr: false });

interface StudentData {
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    grade?: string;
    bloodGroup?: string;
    avatar?: string;
}

interface SchoolData {
    name: string;
    logo?: string | null;
}

interface IDCardRendererProps {
    template: {
        layout: string;
        orientation: 'VERTICAL' | 'HORIZONTAL';
        width?: number;
        height?: number;
        unit?: 'mm' | 'cm' | 'in';
        bleed?: number;
        safeMargin?: number;
    };
    student?: StudentData;
    school?: SchoolData;
    zoom?: number;
    useDesignContent?: boolean;
    side?: 'FRONT' | 'BACK';
}

export function IDCardRenderer({ template, student, school, zoom = 1, useDesignContent = false, side }: IDCardRendererProps) {
    const rawZones: IDZone[] = JSON.parse(template.layout);

    // Filter zones based on side if provided
    const zones = side
        ? rawZones.filter(z => (z.side || 'FRONT') === side)
        : rawZones;

    // Map dynamic fields
    const processedZones = zones.map(zone => {
        let content = zone.mockContent;

        if (!useDesignContent) {
            switch (zone.type) {
                case 'STUDENT_NAME':
                    if (student) content = `${student.firstName} ${student.lastName}`;
                    break;
                case 'ADMISSION_NUMBER':
                    if (student) content = student.admissionNumber || "N/A";
                    break;
                case 'GRADE':
                    if (student) content = student.grade || "N/A";
                    break;
                case 'BLOOD_GROUP':
                    if (student) content = student.bloodGroup || "N/A";
                    break;
                case 'SCHOOL_NAME':
                    if (school) content = school.name;
                    break;
                case 'STUDENT_PHOTO':
                    if (student) content = student.avatar || 'https://images.unsplash.com/photo-1597524419828-976722243053?q=80&w=256&h=256&fit=crop';
                    break;
                case 'SCHOOL_LOGO':
                    if (school) content = school.logo || '/logo.png';
                    break;
                case 'QR_CODE':
                    // Simple QR generation using student ID/Admission No
                    if (student) content = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student.admissionNumber || student.firstName}`;
                    break;
            }
        }

        return {
            ...zone,
            mockContent: content
        };
    });

    return (
        <IDCardKonvaCanvas
            zones={processedZones}
            orientation={template.orientation}
            zoom={zoom}
            readOnly={true}
            allowDrag={false}
            allowTransformer={false}
            width={template.width}
            height={template.height}
            unit={template.unit}
            bleed={template.bleed}
            safeMargin={template.safeMargin}
            showGuides={false}
        />
    );
}
