import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const { parsed, publicVars } = loadEnv();

export default defineConfig({
  plugins: [
    pluginReact(), // React support
  ],
  html: {
    template: "./index.html",
  },
  compilerOptions: {
    paths: {
      "@assets/*": ["./src/assets/*"],
      "@libs/*": ["./src/libs/*"],
    },
  },
  source: {
    define: {
      "process.env": JSON.stringify(process.env),
    },
    entry: {
      index: "./src/main.jsx", // Update to the new TypeScript entry file
    },
    extensions: [".tsx", ".ts", ".jsx", ".js"], // Add TypeScript extensions
  },
});
