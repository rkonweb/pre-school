import { CircularForm } from "@/components/dashboard/circulars/CircularForm";
import { createCircularAction } from "@/app/actions/circular-actions";

export default async function NewCircularPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="flex flex-col gap-6 pb-20">
            <CircularForm
                slug={slug}
                onSubmit={createCircularAction}
            />
        </div>
    );
}
