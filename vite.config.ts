import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: {
      host: "localhost", //  era "::" — expunha em toda a rede local
      port: 8080,
      hmr: {
        overlay: false,
      },
    },

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },

    build: {
      //  Source maps só em desenvolvimento — em prod expõem seu código fonte
      sourcemap: isDev,

      //  Remove console.log e debugger em produção
      minify: "esbuild",
      target: "esnext",
    },

    //  Headers de segurança no servidor de dev
    // (em produção configure no Vercel/Netlify/Nginx)
    ...(isDev && {
      preview: {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    }),
  };
});