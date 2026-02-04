const { execSync } = require('child_process');

const seedFiles = [
    'seed-homepage.js',
    'seed-features.js',
    'seed-pricing.js',
    'seed-careers.js',
    'seed-blog.js',
    'seed-contact.js'
];

console.log("🚀 Starting Global CMS Seeding...");

seedFiles.forEach(file => {
    try {
        console.log(`\n📄 Seeding ${file}...`);
        const output = execSync(`node scripts/${file}`, { encoding: 'utf-8' });
        console.log(output);
    } catch (error) {
        console.error(`❌ Failed to seed ${file}:`, error.message);
    }
});

console.log("\n✅ Global Seeding Complete!");
