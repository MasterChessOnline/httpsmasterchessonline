import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'live.masterchess.app',
  appName: 'MasterChess',
  webDir: 'dist',
  server: {
    url: 'https://masterchess.live',
    cleartext: false,
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
