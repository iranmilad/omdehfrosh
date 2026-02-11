import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const { parsed, publicVars } = loadEnv();

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    proxy: {
      '/api': {
        target: process.env.RSBUILD_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/universal-payment': {
        target: process.env.RSBUILD_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  html: {
    template: './index.html',
  },
  "compilerOptions": {
    "paths": {
      "@assets/*": ["./src/assets/*"],
      "@libs/*": ["./src/Libs/*"],
    }
  },
  source: {
    define: {
      // Expose all parsed env variables
      'process.env': JSON.stringify(parsed),
    },
    entry: {
      index: "./src/main.jsx",
    },
  },
});
