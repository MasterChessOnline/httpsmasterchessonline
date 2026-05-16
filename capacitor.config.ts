import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.79241b66778b473fb92a7bbbb228fe07',
  appName: 'MasterChess',
  webDir: 'dist',
  server: {
    url: 'https://79241b66-778b-473f-b92a-7bbbb228fe07.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0b0b0d',
  },
  android: {
    backgroundColor: '#0b0b0d',
  },
};

export default config;
