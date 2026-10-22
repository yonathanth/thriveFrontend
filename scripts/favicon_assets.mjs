// Render the small Thrive mark to every browser and installed-app icon format.
// Run from any directory with: node scripts/favicon_assets.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const favicon = new URL('public/favicon/', root);
const svg = await readFile(new URL('favicon.svg', favicon));

for (const [size, name] of [
  [16, 'favicon-16x16.png'],
  [32, 'favicon-32x32.png'],
  [180, 'apple-touch-icon.png'],
  [192, 'android-chrome-192x192.png'],
  [512, 'android-chrome-512x512.png'],
]) {
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(name, favicon)));
}

// Keep the whole mark inside the central 80% maskable safe zone.
await sharp(svg).resize(352, 352).extend({
  top: 80, bottom: 80, left: 80, right: 80, background: '#050507',
}).png().toFile(fileURLToPath(new URL('maskable-512x512.png', favicon)));

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * sizes.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
const ico = Buffer.concat([directory, ...images]);
await writeFile(new URL('favicon.ico', favicon), ico);
await writeFile(new URL('app/favicon.ico', root), ico);
await writeFile(new URL('app/(public)/icon.svg', root), svg);
console.log('Updated SVG, ICO, touch and installed-app icons.');
