// Audit every image the LIVE index.html actually references
const BASE = 'https://tesonorthcrosscountry.co.ke/';
(async () => {
  const html = await (await fetch(BASE, { cache: 'no-store' })).text();

  // 1) Images referenced in static HTML (src="...")
  const refs = [...html.matchAll(/src="([^"]+\.(?:jpe?g|png|webp))"/gi)].map(m => m[1]);

  // 2) Images referenced inside the inline JS data (gallery/stories defaults)
  const galleryRefs = [...html.matchAll(/image:\s*'([^']+\.(?:jpe?g|png|webp))'/gi)].map(m => m[1]);

  const all = [...new Set([...refs, ...galleryRefs])];
  console.log('Distinct image references found:', all.length);

  let ok = 0, bad = 0;
  for (const img of all) {
    const url = BASE + img.split('/').map(encodeURIComponent).join('/');
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const status = res.status;
      if (status === 200) { ok++; console.log(`  200  ${img}`); }
      else { bad++; console.log(`  ${status}  ${img}`); }
    } catch (e) { bad++; console.log(`  ERR  ${img}  (${e.message})`); }
  }
  console.log(`\nRESULT: ${ok} OK, ${bad} FAILED`);
})();