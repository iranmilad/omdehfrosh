import { defineConfig,loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const { parsed, publicVars } = loadEnv(); 

export default defineConfig({
  plugins: [pluginReact()],
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
    define : {
      'process.env': JSON.stringify(process.env),
    },
    entry: {
      index: "./src/main.jsx",
    },
  },
});