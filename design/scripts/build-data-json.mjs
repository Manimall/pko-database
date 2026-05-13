#!/usr/bin/env node
// One-shot bootstrap: reads the current TS data files via tsx and writes their
// values as JSON into public/data/. Run once when migrating; afterwards
// update_data.py emits the JSONs directly.
//
// Usage:
//   pnpm exec tsx design/scripts/build-data-json.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const designDir = resolve(here, '..');
const outDir = resolve(designDir, 'public', 'data');

await mkdir(outDir, { recursive: true });

const datasets = [
  { module: '../src/app/data/ratingData.ts',     exportName: 'ratingData',        outFile: 'rating.json' },
  { module: '../src/app/data/logoMap.ts',        exportName: 'logoMap',           outFile: 'logo-map.json' },
  { module: '../src/app/data/articlesData.ts',   exportName: 'articles',          outFile: 'articles.json' },
  { module: '../src/app/data/companyDetails.ts', exportName: 'companyDetailsMap', outFile: 'company-details.json' },
  { module: '../src/app/data/investmentData.ts', exportName: 'bonds',             outFile: 'investment-bonds.json' },
  { module: '../src/app/data/investmentData.ts', exportName: 'siteLoans',         outFile: 'investment-loans.json' },
  { module: '../src/app/data/investmentData.ts', exportName: 'corporates',        outFile: 'investment-corporates.json' },
  { module: '../src/app/data/investmentData.ts', exportName: 'allInvestments',    outFile: 'investment-all.json' },
];

for (const { module, exportName, outFile } of datasets) {
  const mod = await import(resolve(here, module));
  const value = mod[exportName];
  if (value === undefined) {
    console.error(`Export ${exportName} not found in ${module}`);
    process.exit(1);
  }
  const json = JSON.stringify(value);
  await writeFile(resolve(outDir, outFile), json);
  console.log(`  ✓ ${outFile} (${(json.length / 1024).toFixed(1)} KB)`);
}

console.log(`\nWrote ${datasets.length} JSON files to ${outDir}`);
