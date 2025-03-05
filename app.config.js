require('dotenv').config();

module.exports = () => ({
  expo: {
    name: "nocontact-app",
    slug: "nocontact-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "nocontact",  // Updated to match the app name
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ai.nocontact.app",
      config: {
        usesAppleSignIn: true
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-secure-store",
      "@react-native-google-signin/google-signin", // Add if you want Google sign-in
      "expo-apple-authentication"  // Added for Apple authentication
    ],
    experiments: {
      typedRoutes: true
    },
    // Add the new environment configuration here
    extra: {
      apiUrl: process.env.API_URL || "https://default-api-url.com",
      environment: process.env.NODE_ENV || "development",
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "2dd75407-bef6-4b32-8854-01130d49189a"
      }
    }
  }
});