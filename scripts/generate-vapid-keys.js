// Script to generate VAPID keys for Web Push notifications
// Run with: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

console.log('Generating VAPID keys for Web Push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:admin@preschool.com\n');
console.log('⚠️  Keep the private key secret! Never commit it to version control.');
