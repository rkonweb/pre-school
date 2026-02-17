import { TrainingClient } from "@/components/training/TrainingClient";
import { getTrainingModulesAction } from "@/app/actions/training-actions";

export default async function TrainingPage() {
    // Fetch modules server-side for initial render
    const res = await getTrainingModulesAction();
    const modules = res.success ? res.data : [];

    return (
        <TrainingClient initialModules={modules} />
    );
}
