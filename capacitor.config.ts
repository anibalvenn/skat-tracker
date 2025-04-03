import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skattracker.app',
  appName: 'Skat Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    App: {
      // This allows us to handle the back button event
      backButtonBehavior: 'none'
    }
  }
};

export default config;