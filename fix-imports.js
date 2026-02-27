const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, 'scripts');
const files = fs.readdirSync(scriptsDir);

files.forEach(file => {
    if (file.endsWith('.ts')) {
        const filePath = path.join(scriptsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('from "../src/generated/client"')) {
            content = content.replace(/from "\.\.\/src\/generated\/client"/g, 'from "../src/generated/client_final"');
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        }
    }
});
