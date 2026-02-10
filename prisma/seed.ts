
import { execSync } from "child_process";

async function main() {
    console.log("🌱 Starting Database Seeding...");

    const scripts = [

        "scripts/seed-master-data.ts",
        "scripts/seed-geo-data.ts",
        "scripts/seed-indian-cities.ts",
        "scripts/import-training-snapshot.ts"
    ];

    for (const script of scripts) {
        console.log(`\n--- Running ${script} ---`);
        try {
            execSync(`npx tsx ${script}`, { stdio: "inherit" });
        } catch (error) {
            console.error(`❌ Failed to run ${script}`);
            process.exit(1);
        }
    }

    console.log("\n✅ Database Seeding Completed Successfully.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
