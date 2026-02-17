import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rkonweb.preschool',
  appName: 'Pre-School Parent',
  webDir: 'out',
  server: {
    url: 'http://10.0.2.2:3000', // 10.0.2.2 is the bridge to your computer's localhost
    cleartext: true
  }
};

export default config;
