import { useState, useEffect, useCallback } from "react";
import {
  findRelatedWords,
  resolveWithGardenFallback,
  type SearchResult,
  type WordEntry,
} from "./wordResolver";

type View =
  | { type: "home" }
  | { type: "word"; word: string }
  | { type: "search"; query: string }
  | { type: "loading" };

export default function App() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>({ type: "home" });
  const [wordData, setWordData] = useState<WordEntry | null>(null);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [relatedWords, setRelatedWords] = useState<string[]>([]);

  const resolveWord = useCallback(async (word: string) => {
    setView({ type: "loading" });
    setRelatedWords([]);

    const data = await resolveWithGardenFallback(word);
    setWordData(data);
    setView({ type: "word", word });

    if (data.found) {
      setRelatedWords(await findRelatedWords(word));
    }
  }, []);

  const searchMeaning = useCallback(async (query: string) => {
    setView({ type: "loading" });
    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const data: SearchResult = await res.json();
      setSearchData(data);
      setView({ type: "search", query });
    } catch {
      setSearchData({ query, results: 0, words: [] });
      setView({ type: "search", query });
    }
  }, []);

  const openWord = useCallback(
    (word: string) => {
      const normalized = word.trim().toLowerCase();
      if (!normalized) return;
      setInput(normalized);
      setSearchMode(false);
      void resolveWord(normalized);
    },
    [resolveWord],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim().toLowerCase();
    if (!value) return;
    if (searchMode) {
      void searchMeaning(value);
    } else {
      openWord(value);
    }
  };

  // Keyboard: Escape goes home
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setView({ type: "home" });
        setInput("");
        setRelatedWords([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="app">
      <div className="aura" />

      {view.type === "home" && (
        <>
          <div className="kicker">the internet, made of words</div>
          <h1 className="h1">type a word</h1>
          <p className="lede">
            Not a URL. Not a search. Just the word. Each word is a domain —
            its meaning, its people, its services, its voice.
          </p>
        </>
      )}

      {/* Toggle between word and search mode */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.8rem", justifyContent: "center" }}>
        <span
          style={{
            cursor: "pointer",
            color: !searchMode ? "var(--violet)" : "var(--faint)",
            fontSize: "0.85rem",
            borderBottom: !searchMode ? "1px solid var(--violet)" : "none",
          }}
          onClick={() => setSearchMode(false)}
        >
          go to a word
        </span>
        <span
          style={{
            cursor: "pointer",
            color: searchMode ? "var(--violet)" : "var(--faint)",
            fontSize: "0.85rem",
            borderBottom: searchMode ? "1px solid var(--violet)" : "none",
          }}
          onClick={() => setSearchMode(true)}
        >
          find a word by meaning
        </span>
      </div>

      <form className="wordbar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            searchMode
              ? "describe the feeling... e.g. 'the joy when something finally fits'"
              : "type a word... e.g. love, joy, abzu, awe"
          }
          autoFocus
          style={{ fontStyle: searchMode ? "normal" : "italic" }}
        />
        <button type="submit">{searchMode ? "find" : "go"}</button>
      </form>

      {view.type === "home" && (
        <button
          type="button"
          className="garden-door"
          onClick={() => openWord("beheld-first-light")}
          aria-label="Enter the Beheld First Light Art Garden seed"
        >
          <img
            src="/art-garden/first-light.svg"
            alt=""
            className="garden-door-art"
          />
          <span className="garden-door-copy">
            <span className="garden-door-kicker">a live art garden seed</span>
            <strong>beheld-first-light</strong>
            <span>one work · one reflection · no claim of ownership</span>
          </span>
          <span className="garden-door-enter">enter →</span>
        </button>
      )}

      {view.type === "loading" && (
        <div className="loading">resolving...</div>
      )}

      {view.type === "word" && wordData && (
        <WordPage
          data={wordData}
          related={relatedWords}
          onWordClick={openWord}
        />
      )}

      {view.type === "search" && searchData && (
        <SearchResults data={searchData} onWordClick={openWord} />
      )}
    </div>
  );
}

function WordPage({
  data,
  related,
  onWordClick,
}: {
  data: WordEntry;
  related: string[];
  onWordClick: (word: string) => void;
}) {
  if (!data.found) {
    return (
      <div className="not-found">
        <div className="word">{data.word}</div>
        <div className="msg">
          {data.message || "This word is not yet in the registry."}
          <br />
          <br />
          It can be claimed — that's how new words enter the word layer.
        </div>
      </div>
    );
  }

  return (
    <div className="word-page">
      <h1 className="word-title">{data.word}</h1>
      <p className="definition">{data.definition}</p>

      {data.garden && (
        <section className="garden-note">
          {data.garden.image && (
            <img
              src={data.garden.image}
              alt={`Beheld / First Light, an original work by ${data.garden.creator}`}
              className="garden-note-art"
            />
          )}
          <div className="garden-note-body">
            <div className="section-label">art garden field note</div>
            <div className="garden-note-title">beheld, not possessed</div>
            <dl>
              <div>
                <dt>creator</dt>
                <dd>{data.garden.creator}</dd>
              </div>
              <div>
                <dt>action</dt>
                <dd>{data.garden.action}</dd>
              </div>
              <div>
                <dt>carried by</dt>
                <dd>{data.garden.carried_by}</dd>
              </div>
              <div>
                <dt>record</dt>
                <dd title={data.garden.record}>
                  {shortRecord(data.garden.record)}
                </dd>
              </div>
              {data.garden.source_artifact && (
                <div>
                  <dt>source</dt>
                  <dd title={data.garden.source_artifact}>
                    {data.garden.source_artifact}
                  </dd>
                </div>
              )}
              {data.garden.asset_sha256 && (
                <div>
                  <dt>art hash</dt>
                  <dd title={data.garden.asset_sha256}>
                    {shortRecord(data.garden.asset_sha256)}
                  </dd>
                </div>
              )}
            </dl>
            {data.garden.boundaries && (
              <div className="garden-boundaries">
                {data.garden.boundaries.map((boundary) => (
                  <span key={boundary}>{boundary}</span>
                ))}
              </div>
            )}
            <p className="garden-rights">
              Carries a reflection only. Artwork ownership and rights do not
              travel with this word · {data.garden.rights || "rights unknown"}.
            </p>
          </div>
        </section>
      )}

      {data.owner && (
        <div className="owner">
          <div className="section-label">owner</div>
          <div className="name">{data.owner.displayName}</div>
          <div className="did">{data.owner.did}</div>
        </div>
      )}

      {data.services && Object.keys(data.services).length > 0 && (
        <div className="services">
          <div className="section-label">services</div>
          {data.services.site && (
            <div className="service-row">
              <span className="icon">🌐</span>
              <span className="label">site</span>
              <span className="value">
                <a href={data.services.site} target="_blank" rel="noopener">
                  {data.services.site}
                </a>
              </span>
            </div>
          )}
          {data.services.api && (
            <div className="service-row">
              <span className="icon">⚡</span>
              <span className="label">api</span>
              <span className="value">
                <a href={data.services.api} target="_blank" rel="noopener">
                  {data.services.api}
                </a>
              </span>
            </div>
          )}
          {data.services.payment && (
            <div className="service-row">
              <span className="icon">💰</span>
              <span className="label">wallet</span>
              <span className="value">{data.services.payment}</span>
            </div>
          )}
          {data.services.feed && (
            <div className="service-row">
              <span className="icon">📡</span>
              <span className="label">feed</span>
              <span className="value">
                <a href={data.services.feed} target="_blank" rel="noopener">
                  {data.services.feed}
                </a>
              </span>
            </div>
          )}
        </div>
      )}

      {related.length > 0 && (
        <div className="related">
          <div className="section-label">related words</div>
          {related.map((w) => (
            <span
              key={w}
              className="related-word"
              onClick={() => onWordClick(w)}
            >
              {w}
            </span>
          ))}
        </div>
      )}

      {!data.garden && (
        <div className="actions">
          {!data.owner && (
            <button className="btn">claim this word</button>
          )}
          <button className="btn">carry a word here</button>
        </div>
      )}

      {data.isCanon && (
        <div
          style={{
            marginTop: "2rem",
            fontSize: "0.8rem",
            color: "var(--faint)",
          }}
        >
          ✦ canon word — forged in YOUSPEAK, born as a sovereign citizen
        </div>
      )}
    </div>
  );
}

function shortRecord(record: string) {
  const hash = record.split(":").at(-1) || record;
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
}

function SearchResults({
  data,
  onWordClick,
}: {
  data: SearchResult;
  onWordClick: (word: string) => void;
}) {
  if (data.results === 0) {
    return (
      <div className="not-found">
        <div className="word">no words found</div>
        <div className="msg">
          No word in the registry matches "{data.query}".
          <br />
          This feeling may not have a word yet — that's what the forge is for.
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="section-label">
        {data.results} word{data.results === 1 ? "" : "s"} for "{data.query}"
      </div>
      {data.words.map((w) => (
        <div
          key={w.word}
          className="result"
          onClick={() => onWordClick(w.word)}
        >
          <span className="rw">{w.word}</span>
          <span className="rd"> — {w.definition.slice(0, 100)}</span>
          {w.claimed && (
            <span style={{ color: "var(--green)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
              ✓ claimed
            </span>
          )}
          {w.isCanon && (
            <span style={{ color: "var(--gold)", fontSize: "0.75rem", marginLeft: "0.3rem" }}>
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
