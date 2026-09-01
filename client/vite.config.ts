// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "cert/server.key")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "cert/server.crt")
      ),
    },

    proxy: {
      "/api": {
        target: "http://192.168.182.211:2000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});