/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables, filtering out problematic Windows vars
  const env = loadEnv(mode, process.cwd(), [
    'VITE_',
    'NODE_ENV',
    'PUBLIC_'
  ]); //This allows me to actually build the app now 

  return {
    plugins: [react(), legacy()],
    define: {
      'process.env': Object.keys(env).reduce((acc, key) => {
        // Filter out environment variables with parentheses
        if (!key.includes('(') && !key.includes(')')) {
          acc[key] = JSON.stringify(env[key]);
        }
        return acc; //ignores the two problem files i had that did not even exist
      }, {})
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts"
    }
  };
});
