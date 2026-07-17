export interface GardenProvenance {
  record: string;
  protocol: string;
  action: string;
  creator: string;
  carried_by: string;
  image?: string;
  source_artifact?: string;
  asset_sha256?: string;
  rights?: string;
  boundaries?: string[];
}
export interface WordEntry {
  found: boolean;
  word?: string;
  definition?: string;
  isCanon?: boolean;
  owner?: { did: string; displayName: string } | null;
  services?: {
    site?: string;
    api?: string;
    feed?: string;
    payment?: string;
  } | null;
  domain?: string;
  message?: string;
  garden?: GardenProvenance;
}

export interface SearchResult {
  query: string;
  results: number;
  words: Array<{
    word: string;
    definition: string;
    isCanon: boolean;
    claimed: boolean;
  }>;
}

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

async function fetchJson<T>(
  path: string,
  fetcher: Fetcher,
): Promise<T | null> {
  try {
    const response = await fetcher(path);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function resolveWithGardenFallback(
  word: string,
  fetcher: Fetcher = fetch,
): Promise<WordEntry> {
  const encoded = encodeURIComponent(word);
  const registryEntry = await fetchJson<WordEntry>(
    `/resolve/${encoded}`,
    fetcher,
  );

  if (registryEntry?.found) {
    return registryEntry;
  }

  const gardenEntry = await fetchJson<WordEntry>(
    `/art-garden/${encoded}.json`,
    fetcher,
  );

  if (gardenEntry?.found) {
    return gardenEntry;
  }

  return (
    registryEntry || {
      found: false,
      word,
      message: "Could not reach the word resolver",
    }
  );
}

export async function findRelatedWords(
  word: string,
  fetcher: Fetcher = fetch,
): Promise<string[]> {
  const result = await fetchJson<SearchResult>(
    `/search?q=${encodeURIComponent(word)}`,
    fetcher,
  );

  if (!result || !Array.isArray(result.words)) {
    return [];
  }

  return result.words
    .map((entry) => entry.word)
    .filter((related) => related !== word)
    .slice(0, 6);
}
