require('dotenv').config();

module.exports = () => ({
  expo: {
    name: "nocontact-app",
    slug: "nocontact-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
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
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    // Add the new environment configuration here
    extra: {
      apiUrl: process.env.API_URL || "https://default-api-url.com",
      environment: process.env.NODE_ENV || "development"
    }
  }
});