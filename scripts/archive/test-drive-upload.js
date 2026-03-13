// Test Shared Drive upload with new ID
const { google } = require('googleapis');

async function testSharedDriveUpload() {
    const clientEmail = 'preschool-drive-uploader@ridex-480712.iam.gserviceaccount.com';
    const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDEBilxWRKXeIB+
6b3LTo84AP7OmOqO+EGZ/Ac7KkhuxXkBHepPBCh+C9PpMZlbf+eTOUuXTVMD4ft1
Yo89CA5HD3xGHDbZfdy6Op+0PmQWfeCGn08s/BZhLeXpmf+WpkVMRpfdlGIbXVVm
cj4d6ZrZrmTSmU6HUINngiNX2C11I4flHNZsynHAHdwsI/aCqAOEDL2/XbQw1Fc7
EN+kiAGG1DBQRdET8adjJEvbElK7lJuaGcFcOQ7l3fIgsiMx4/Rzi/ca/OHMBl9U
FXB39v5+chHbNthj5qYz4L2fo+cNS7TOidtEvifLxOYr9/Iiiy2IVhIgyP1YG6iy
tqZrINHFAgMBAAECggEAA06Q551qquBL8QtdOejOK1IY+lmqDoj+a+wy7KFlLdLQ
nJKcn7VtcwyDO3pF7aOiv63fw8je9aab6Po/E5CA047duD3eaJziJ5VSZgAHc2zi
my+YB/I/KAFWN5kMrsXvTvIbh1yeRK5QAOjWE25PDNncT/echrvc+6Oky2T70ok9
sCaEFAyrFRuotYF+HA5ouOuNPi2184J90YKdPBvb7dpklaMOGzso5HhLUsz6drJ4
adli81Ka6bJpYZ98Ps2I+ELPfV1llvWzRRYkejsKc5Ew4MelGR4417VKta+FdYmm
4ZEJPjV31yNdGDFtkTrQttMgmKOOo7VK2/Ds2AHVAQKBgQD/unDnv0bU0CHXp3Cn
RqoLQnrXJQxSOvAupA4veDv9zg1hR/xRcwm/fOM9hlHnOfVIVnEKFFlVNZ504mXD
RT4VSlv3+YTiEM0LwHKLeqPflNgrp5gtx5KqPHvDQ18D344jxXjm8xdNdq3uiWD0
sJPz5lkibEXqOPlUnjegHi9K/QKBgQDEO3spXDTm/fvIOzThZkqp3sYxaLsfu5+u
4zqM5yKDI9zX6rt61rPTPQqkxO+7yjR2kidrWpfkCcg5QLDlsVRrV1zh0ol33mYC
KtWog+tqEkBTaBtEjXsr3eSadVDBZ72noVoHY1zWrCaopAsY/G+M+x/lM11z/IKd
JiTRGzxQaQKBgQC8/drHSrNcP91i9VnqJe0xmRYTvkuW0fwDXDcnmeIsNoXo6Txu
LWh83h1KsOQC0PCXX1r3KgbDVHcgxtiSMbAqJ+REJWGxeN0w3C9LKX3GlMgVqyxq
WN3pdf25Vyb3Q9ZWVXB+rhUAqL7uVRUUgRM243voVsBs02JgyPUvHl+xOQKBgDwO
HCZPUt1y05C3Ffr5jFYqmKtcaxBOIpOqdSvUPQq3egoWi6QPe19lqhE9OEVXn/C9
0BSZ2CxxFfb3pmvVdomXZhSyk2G9DakSJOt63BxNU6RzEw1K42xMb38Z8koOjstz
pRLnxOzqKLap5b+S2iziWiOSMcKif/LKTrA0TqQpAoGAcXm3Cc7SvkizHoQORo56
CIqr3YkpYrKZ0dqnesB7NcF2G8rBTlLkuegxHYK7opAEy41KEkc+wiw0EeQSsvqM
kU5x+j7rllgwh7UBk0sJNbK1F7k8MBFzjCOs79CUH+WGukHyjufDDQ3c8KwRTzWN
wt1lKo1h1E8X2s1tk4kcInA=
-----END PRIVATE KEY-----`;
    const sharedDriveId = '0AO3SHZteIjaMUk9PVA'; // New Shared Drive ID

    console.log('🔑 Testing Shared Drive upload...');
    console.log('   Shared Drive ID:', sharedDriveId);

    try {
        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const { Readable } = require('stream');
        const testContent = Buffer.from('Test from PreSchool App - ' + new Date().toISOString());
        const stream = new Readable();
        stream.push(testContent);
        stream.push(null);

        console.log('\n📤 Uploading to Shared Drive...');
        const response = await drive.files.create({
            requestBody: {
                name: `test_${Date.now()}.txt`,
                parents: [sharedDriveId],
            },
            media: {
                mimeType: 'text/plain',
                body: stream,
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        console.log('\n✅ Upload successful!');
        console.log('   File ID:', response.data.id);
        console.log('   Web Link:', response.data.webViewLink);

        // Make it public
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        const publicUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
        console.log('   Public URL:', publicUrl);
        console.log('\n🎉 Google Drive is working! Check your Shared Drive.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response?.data) {
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSharedDriveUpload();
