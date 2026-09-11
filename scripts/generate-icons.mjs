// Gera os PNGs de ícone do PWA a partir de public/icons/icon.svg.
// Rode novamente com `node scripts/generate-icons.mjs` sempre que trocar a logo.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
mkdirSync(iconsDir, { recursive: true });

const svgBuffer = readFileSync(path.join(iconsDir, "icon.svg"));

// Ícone com respiro extra nas bordas, seguro para "maskable" (Android recorta em círculo).
const maskableSvg = svgBuffer
  .toString("utf-8")
  .replace('viewBox="0 0 512 512"', 'viewBox="-100 -100 712 712"');

const targets = [
  { file: "icon-192.png", size: 192, source: svgBuffer },
  { file: "icon-512.png", size: 512, source: svgBuffer },
  { file: "icon-maskable-512.png", size: 512, source: Buffer.from(maskableSvg) },
  { file: "apple-touch-icon.png", size: 180, source: svgBuffer },
  { file: "favicon-32.png", size: 32, source: svgBuffer },
];

for (const target of targets) {
  await sharp(target.source, { density: 384 })
    .resize(target.size, target.size)
    .png()
    .toFile(path.join(iconsDir, target.file));
  console.log(`gerado: public/icons/${target.file}`);
}
