// Source graphics for the tab / device icons and shared-link preview.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const icon = await readFile(new URL('../public/ds-icon.svg', import.meta.url));
const publicDir = new URL('../public/', import.meta.url);
for (const size of [16, 32, 48, 180, 192, 512]) {
  const filename = size === 180 ? 'apple-touch-icon.png' : `ds-icon-${size}.png`;
  const image = sharp(icon).resize(size, size);
  if (size === 180) image.flatten({ background: '#2c4531' });
  await image.png().toFile(new URL(filename, publicDir).pathname);
}
// PNG-backed ICO supports browsers and crawlers that request /favicon.ico directly.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(size => sharp(icon).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + i * 16;
  header[entry] = size; header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(pngs[i].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += pngs[i].length;
});
await writeFile(new URL('favicon.ico', publicDir), Buffer.concat([header, ...pngs]));
await writeFile(new URL('favicon.svg', publicDir), icon);

const photo = (await readFile(new URL('../public/images/sling-long-cords.png', import.meta.url))).toString('base64');
const mark = icon.toString().replace('<svg ', '<svg x="65" y="54" width="74" height="74" ');
const preview = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f8f6ef"/>
${mark}
<text x="65" y="242" fill="#2c4531" font-family="Georgia,serif" font-size="65" letter-spacing="-2">See the</text>
<text x="65" y="321" fill="#2c4531" font-family="Georgia,serif" font-size="65" letter-spacing="-2">David Sling</text>
<text x="69" y="381" fill="#72796b" font-family="Arial,sans-serif" font-size="22">Leather + paracord.</text>
<text x="69" y="562" fill="#2c4531" font-family="Arial,sans-serif" font-size="18" letter-spacing="1">david-slings.com</text>
<image x="504" y="58" width="657" height="514" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${photo}"/>
</svg>`;
await sharp(Buffer.from(preview)).jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile(new URL('images/david-sling-share-v1.jpg', publicDir).pathname);
console.log('Built DS icons and 1200 × 630 link preview.');
