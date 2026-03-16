import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3006",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      }, // ✅ 新增：专门给 OSS 图片用的代理
      "/oss-resource": {
        target: "http://daan-pqf.oss-cn-beijing.aliyuncs.com",
        changeOrigin: true,
        // 关键：去掉前缀，这样 /oss-resource/avatars/1.png
        // 就会变成 http://daan-pqf.oss-cn-beijing.aliyuncs.com/avatars/1.png
        rewrite: (path) => path.replace(/^\/oss-resource/, ""),
      },
    },
  },
});
