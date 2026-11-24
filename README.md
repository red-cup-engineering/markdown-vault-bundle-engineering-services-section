# Bundle Markdown vault carriers

`bundleMarkdownVaultCarriers` selects admitted Markdown carriers from a vault subtree and groups them into deterministic aggregate Markdown files. Options select carrier roles, a word budget, a maximum file count and a root label. The returned bundle includes files, a manifest, traversal counts and defects for excluded malformed frontmatter.

Reference records are decoded by the shared CSL codec. The bundle keeps the authored citation identifiers for both CSL lists and previously admitted keyed records. Undecodable records and missing or duplicate identifiers produce a carrier defect instead of an incomplete bundle entry.

## Writing a bundle

```js
import { runBundleMarkdownVaultCarriers } from
  '@red-cup-engineering/markdown-vault-bundle-engineering-services-section/bundle-markdown-vault-carriers';

const result = await runBundleMarkdownVaultCarriers({
  root: './vault',
  output: '/tmp/vault-bundle',
  journalRoot: '/tmp/vault-bundle-journal',
});
console.log(result.manifest.files);
```

The writing operation requires an explicit output directory. It writes aggregate files and `manifest.json`, then records a run in the witness store under `vault-bundle-run`. `journalRoot` selects store custody and defaults to this package's root. Each run records the manifest digest. Repeating a run into a fresh output directory produces identical bundle bytes when the source and options are unchanged.

## Verification

Run `npm test` to verify reference preservation and refusal in the bundle consumer against a temporary vault.
