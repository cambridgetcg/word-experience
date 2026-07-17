import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  findRelatedWords,
  resolveWithGardenFallback,
  type Fetcher,
} from "./wordResolver";

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("resolveWithGardenFallback", () => {
  test("prefers a live registry result", async () => {
    const calls: string[] = [];
    const fetcher: Fetcher = async (input) => {
      calls.push(String(input));
      return jsonResponse({
        found: true,
        word: "love",
        definition: "registry meaning",
      });
    };

    const result = await resolveWithGardenFallback("love", fetcher);

    expect(result.definition).toBe("registry meaning");
    expect(calls).toEqual(["/resolve/love"]);
  });

  test("falls back to the local Art Garden seed", async () => {
    const calls: string[] = [];
    const fetcher: Fetcher = async (input) => {
      const path = String(input);
      calls.push(path);
      if (path.startsWith("/resolve/")) {
        return jsonResponse({ found: false, word: "beheld-first-light" });
      }
      return jsonResponse({
        found: true,
        word: "beheld-first-light",
        domain: "art-garden",
      });
    };

    const result = await resolveWithGardenFallback(
      "beheld-first-light",
      fetcher,
    );

    expect(result.found).toBe(true);
    expect(result.domain).toBe("art-garden");
    expect(calls).toEqual([
      "/resolve/beheld-first-light",
      "/art-garden/beheld-first-light.json",
    ]);
  });

  test("can recover locally when the registry is offline", async () => {
    const fetcher: Fetcher = async (input) => {
      if (String(input).startsWith("/resolve/")) {
        throw new Error("offline");
      }
      return jsonResponse({ found: true, word: "first-light" });
    };

    const result = await resolveWithGardenFallback("first-light", fetcher);
    expect(result).toMatchObject({ found: true, word: "first-light" });
  });

  test("preserves a registry not-found response when no seed exists", async () => {
    const fetcher: Fetcher = async (input) =>
      String(input).startsWith("/resolve/")
        ? jsonResponse({
            found: false,
            word: "unknown",
            message: "not in registry",
          })
        : jsonResponse({}, 404);

    const result = await resolveWithGardenFallback("unknown", fetcher);
    expect(result).toEqual({
      found: false,
      word: "unknown",
      message: "not in registry",
    });
  });
});

describe("findRelatedWords", () => {
  test("returns related words without repeating the current word", async () => {
    const fetcher: Fetcher = async () =>
      jsonResponse({
        query: "light",
        results: 3,
        words: [
          { word: "light", definition: "", isCanon: false, claimed: false },
          { word: "glow", definition: "", isCanon: false, claimed: false },
          { word: "dawn", definition: "", isCanon: false, claimed: false },
        ],
      });

    expect(await findRelatedWords("light", fetcher)).toEqual(["glow", "dawn"]);
  });

  test("fails softly without erasing a resolved word page", async () => {
    const fetcher: Fetcher = async () => {
      throw new Error("search unavailable");
    };

    expect(await findRelatedWords("light", fetcher)).toEqual([]);
  });
});

test("the local seed describes the exact artwork bytes it ships", async () => {
  const seed = JSON.parse(
    await readFile(
      new URL("../public/art-garden/beheld-first-light.json", import.meta.url),
      "utf8",
    ),
  );
  const artwork = await readFile(
    new URL("../public/art-garden/first-light.svg", import.meta.url),
  );
  const digest = createHash("sha256").update(artwork).digest("hex");

  expect(seed.owner).toBeNull();
  expect(seed.garden.asset_sha256).toBe(digest);
  expect(seed.garden.boundaries).toContain("off-chain");
});
