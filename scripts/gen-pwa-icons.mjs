import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'apps', 'web', 'public');

const NAVY = '#152a3d';
const SOL = '#f4b942';

function iconSvg(size) {
  const r = Math.round(size * 0.22);
  const cx = size / 2;
  const fontSize = Math.round(size * 0.42);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${NAVY}"/>
  <text x="${cx}" y="${cx}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${SOL}" text-anchor="middle" dominant-baseline="central">Fx</text>
</svg>`;
}

const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of targets) {
  await sharp(Buffer.from(iconSvg(size)))
    .png()
    .toFile(join(publicDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}
