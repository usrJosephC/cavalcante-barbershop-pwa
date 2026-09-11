import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Evita que o Turbopack suba a raiz do workspace até C:\Users\Joseph (onde há um
  // package.json/lockfile de outra ferramenta, sem relação com este projeto).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
