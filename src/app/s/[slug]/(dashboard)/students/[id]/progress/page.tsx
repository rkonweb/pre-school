"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const StudentProgressTab = dynamic(() => import("@/components/dashboard/students/StudentProgressTab"), { ssr: false });

export default function ProgressTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    return <StudentProgressTab schoolSlug={slug} studentId={id} />;
}
