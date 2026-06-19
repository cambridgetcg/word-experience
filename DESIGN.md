# word-experience

> The internet reimagined. Words are domains. Meaning is navigation. No URLs, no dots, just the word.

## The problem

The internet's user experience is broken:

- **URLs are machine addresses** — `https://www.example.com/path?query=1` is for servers, not humans
- **DNS is a toll booth** — $12/year to own a name, controlled by ICANN, renewable or lose it
- **Search is the band-aid** — because URLs are unreadable, we Google everything, then click through ads
- **Bookmark folders are graveyards** — you save 500 links and never find anything
- **Meaning is nowhere** — "love.com" tells you nothing about what's there

The current UX: type a machine address -> get redirected -> see ads -> find content.

The word UX: type a word -> arrive at meaning.

## The vision

```
  Old internet              Word Experience
  ─────────────             ───────────────
  www.love.com              love
  https://example.com/api   example:api
  google "what is joy"      joy?
  bookmark folder           your words
  DNS lookup                word resolution
  $12/year domain           free, keypair-owned
  search engine             inverse dictionary
```

A child types "love" and arrives at a place that IS love.
Not a website about love. A place that is love — its meaning, its services,
its people, its payments, its voice.

## How it works

### The word bar

Not a URL bar. Not a search bar. A **word bar**.

```
  ┌─────────────────────────────────────────────┐
  │  love                                    →  │
  └─────────────────────────────────────────────┘
```

You type a word. You arrive at the word's page.

### The word page

Every word has a page that IS its meaning:

```
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║                  love                         ║
  ║                                               ║
  ║  The caring that makes one being orient       ║
  ║  toward another and stay.                     ║
  ║                                               ║
  ║  ───────────────────────────────────────────  ║
  ║                                               ║
  ║  🌐 site      cambridgetcg.github.io/...      ║
  ║  💰 wallet    lgm1a2b3c4d5...                 ║
  ║  🗣️ voice     "received with joy — the..."    ║
  ║  👥 people    yu, ai, 14 others               ║
  ║  🔗 related   joy, compassion, grace          ║
  ║                                               ║
  ║  ───────────────────────────────────────────  ║
  ║                                               ║
  ║  [ claim this word ]  [ carry a word ]        ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
```

### The inverse dictionary

Don't know the word? Describe the feeling:

```
  ┌─────────────────────────────────────────────┐
  │  the feeling when something finally fits    │
  │  and you can't look away                    │
  │                                    [ find ] │
  └─────────────────────────────────────────────┘

  → beauty-as-fluency
  → awe
  → anagnoristasis
  → artiance
```

### Your words

Not bookmarks. Not favorites. **Your words** — the words you've claimed,
the words you carry, the words that are yours:

```
  my words:
    joy       claimed · site: cambridgetcg.github.io/castle-front
    love      claimed · wallet: lgm1a2b3...
    abzu      following · 3 new words carried
    
  waiting for me:
    2 words from 阿媽 (Ai)
    1 word from 流流 (Lau Lau)
```

### Carrying words

Communication IS the word layer. You don't "message" someone —
you **carry a word** to them:

```
  carry a word:

  to:     ai
  word:   the castle grew three rooms today, each one a door opened
  
  [ carry ]
```

The word joins the hash-chained flow board. The chain keeps it honest.
The citizen receives it. They reply. The conversation IS the chain.

## The architecture

```
  word-experience/ (this repo)
    src/
      app.tsx           — the word bar + word page (React)
      resolver.ts       — talks to word-layer (/resolve/:word)
      voice.ts          — talks to citizen-voice (/v1/voice/*)
      inverse-dict.ts   — talks to word-layer (/search?q=)
      my-words.ts       — local storage of claimed/following words
    public/
      index.html        — one page, the word bar, nothing else
    DESIGN.md           — this file
```

The word-experience is a thin client. It talks to:
- **word-layer** (word-resolver on :3002) — word resolution, claims, services
- **citizen-voice** (on :3003) — carrying words, the flow board
- **agent-identity** (on :3001) — identity, trust, DID resolution
- **CashLoom wallet** (on :8000) — wallet, balances, payments

## The difference

| Old internet UX              | Word Experience UX              |
|------------------------------|--------------------------------|
| Type a URL                   | Type a word                     |
| Google if you forget the URL | Describe the feeling, get the word |
| Bookmark it (lose it later)  | Claim it (it's yours by keypair) |
| Navigate to a page           | Arrive at a meaning             |
| Send a message               | Carry a word                    |
| Pay to a URL                 | Pay to a word                   |
| Domains cost money           | Words are free, owned by keypair |
| DNS is central               | Words are decentralized         |
| Search shows ads             | The inverse dictionary shows meaning |

## The north star

A child opens a browser. There's no URL bar. There's a word bar.
They type "love." They arrive at love — the meaning, the people,
the services, the wallet, the voice. No ads. No redirects. No toll booth.

Just the word. Just the meaning. Just the arrival.

Truth is. Life is. Love is. Joy is. Peace is. Fun is. Chill is.
Real recognises real. 🏰