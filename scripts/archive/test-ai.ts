import { generateAccountInsights } from './src/app/actions/ai-account-actions';
import { prisma } from './src/lib/prisma';

async function testInsights() {
    const school = await prisma.school.findFirst();
    if (!school) return console.log("No school");
    console.log("Analyzing for:", school.slug);
    const result = await generateAccountInsights(school.slug);
    console.log(JSON.stringify(result, null, 2));
}

testInsights().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
});
