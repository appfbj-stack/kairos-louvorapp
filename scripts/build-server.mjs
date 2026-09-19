// build-server.mjs — wrapper que evita problemas de escape do PowerShell
// com o flag --define:import.meta.url
// Usado tanto em dev (npm run build) quanto em CI/Docker

import { build } from "esbuild";
import path from "path";
import fs from "fs";

// Plugin que resolve o client do Prisma gerado em generated/prisma/client.ts
// sem precisar de extensão no import (default do esbuild).
const prismaClientPlugin = {
  name: "prisma-client-resolver",
  setup(build) {
    build.onResolve(
      { filter: /\.\.\/\.\.\/generated\/prisma\/client$/ },
      (args) => {
        // Tenta .ts primeiro, depois .js
        const candidates = [
          path.resolve(args.resolveDir, args.path + ".ts"),
          path.resolve(args.resolveDir, args.path + ".js"),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) return { path: c };
        }
        // Fallback absoluto
        const abs = path.resolve(process.cwd(), "generated/prisma/client.ts");
        if (fs.existsSync(abs)) return { path: abs };
        return undefined;
      }
    );
  },
};

await build({
  entryPoints: ["src/server/server.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  sourcemap: true,
  outfile: "dist/server.cjs",
  define: {
    "import.meta.url": JSON.stringify("file:///app/dist/server.cjs"),
  },
  nodePaths: ["./node_modules"],
  loader: { ".node": "empty" },
  absWorkingDir: process.cwd(),
  resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  plugins: [prismaClientPlugin],
});

console.log("✅ Server bundled to dist/server.cjs");
