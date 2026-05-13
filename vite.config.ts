import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_auth",
      filename: "remoteEntry.js",
      exposes: {
        "./LoginPage": "./src/pages/LoginPage.tsx",
        "./SignUpPage": "./src/pages/SignUpPage.tsx",
        "./DashboardPage": "./src/pages/DashboardPage.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 4001,
    host: true,
  },
  preview: {
    port: 4001,
    host: true,
  },
});
