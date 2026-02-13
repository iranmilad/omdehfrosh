import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const { parsed, publicVars } = loadEnv();

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    // Use relative paths so script/link tags work when app is served from any path or subpath.
    // Prevents "The script has an unsupported MIME type ('text/html')" when the server
    // returns index.html (e.g. 404 fallback) instead of the actual .js file.
    assetPrefix: './',
  },
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
