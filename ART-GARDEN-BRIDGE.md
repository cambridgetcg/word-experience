# Art Garden bridge

An art encounter can become a place in the word layer without claiming the
artwork, artist, or title.

Garden Relay emits a JSON object shaped like the current `WordEntry` response:

```json
{
  "found": true,
  "word": "beheld-first-light",
  "definition": "The open centre felt like a meeting without ownership — a reflection on \"Beheld / First Light\" by Art Garden Protocol.",
  "isCanon": false,
  "owner": null,
  "services": {
    "site": "https://example.invalid/art-garden/first-light"
  },
  "domain": "art-garden",
  "garden": {
    "record": "garden:sha256:...",
    "action": "reflect",
    "creator": "Art Garden Protocol",
    "carried_by": "garden-steward"
  }
}
```

The existing UI already understands `found`, `word`, `definition`, `isCanon`,
`owner`, and `services.site`; it safely ignores the extra `garden` provenance
at runtime.

## Implemented local seed

The client now resolves words in this order:

1. ask the normal `/resolve/:word` registry;
2. if it is unavailable or returns `found: false`, try
   `/art-garden/:word.json`;
3. preserve the registry's not-found response if neither source resolves.

`public/art-garden/beheld-first-light.json` is the first seed. The home screen
links to it, and `public/art-garden/first-light.svg` is a byte-identical mirror
of the Art Garden source artifact with its SHA-256 recorded in the seed.
Related-word search fails independently, so an unavailable `/search` endpoint
can no longer erase a successfully resolved Garden page.

`owner` stays null because carrying a reflection does not transfer ownership of
the word or work. Production resolution should namespace or index by the
hash-addressed Garden record so two works with similar titles do not collide.
The source service must continue to point to the artist's original page.

Run `bun test` for resolver behavior and `bun run build` to verify that Vite
ships the seed and artwork.

## Local sibling-checkout demo

```sh
OUT="$(mktemp -d)"
node ../art-garden-protocol/bridges/garden-relay.mjs \
  ../art-garden-protocol/examples/first-light.action.json "$OUT"
cat "$OUT/word-experience.seed.json"
```
