"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const HealthRecordManager = dynamic(() => import("@/components/dashboard/student/HealthRecordManager"), { ssr: false });

export default function HealthTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    return <HealthRecordManager studentId={id} slug={slug} />;
}
