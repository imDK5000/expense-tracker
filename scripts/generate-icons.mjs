import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcIcon = join(__dirname, '..', 'public', 'icon-source.jpg');
const publicDir = join(__dirname, '..', 'public');

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 16,  name: 'favicon-16x16.png' },
];

for (const { size, name } of sizes) {
  await sharp(srcIcon)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, name));
  console.log(`✓ Generated ${name} (${size}x${size})`);
}

console.log('\nAll icons generated successfully!');
