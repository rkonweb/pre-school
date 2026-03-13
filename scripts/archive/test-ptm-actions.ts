import { getPTMSessionsAction } from "./src/app/actions/parent-phase3-actions";
import { getClassroomsAction } from "./src/app/actions/classroom-actions";

async function run() {
    try {
        console.log("Testing getPTMSessionsAction...");
        const res1 = await getPTMSessionsAction("bodhi-board");
        console.log("Result 1:", JSON.stringify(res1).substring(0, 100));
    } catch (e: any) {
        console.error("Crash 1:", e.message);
    }

    try {
        console.log("Testing getClassroomsAction...");
        const res2 = await getClassroomsAction("bodhi-board");
        console.log("Result 2:", JSON.stringify(res2).substring(0, 100));
    } catch (e: any) {
        console.error("Crash 2:", e.message);
    }
}

run();
