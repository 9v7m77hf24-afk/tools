# Cronologia & Lexicon — Offline PWAs

This repository contains four installable apps (PWA): **Cronologia** (iPad),
**Cronologia_iphone** (iPhone), **Lexicon** (multilingual dictionary,
iPad/laptop), and **Lexicon_iphone** (multilingual dictionary, iPhone). All
four work offline after a first online visit, and sync with GitHub whenever
there's a connection.

## Files

| File | Shared by | Purpose |
|---|---|---|
| `Cronologia.html` | — | Timeline app, iPad version |
| `Cronologia_iphone.html` | — | Timeline app, iPhone version |
| `Lexicon.html` | — | Dictionary app, iPad/laptop version |
| `Lexicon_iphone.html` | — | Dictionary app, iPhone version |
| `sw.js` | All four | Service worker — caches the app shell and Google Fonts |
| `cronologia-manifest.webmanifest` | Cronologia (iPad) only | PWA manifest (name, icon, standalone mode) |
| `cronologia-iphone-manifest.webmanifest` | Cronologia_iphone only | Cronologia_iphone's own PWA manifest |
| `lexicon-manifest.webmanifest` | Lexicon (iPad/laptop) only | Lexicon's PWA manifest |
| `lexicon-iphone-manifest.webmanifest` | Lexicon_iphone only | Lexicon_iphone's own PWA manifest |

Each app has its **own** manifest — never share a manifest between two
different apps, since each one's `start_url` points specifically to its own
`.html` file; sharing one has previously caused one version's shortcut to
accidentally open the wrong app (see the section below).

All files need to live **in the same folder** in the GitHub repo (the same
site published via GitHub Pages).

## Installation (first time, or after updating sw.js/manifest)

1. Publish all the files from the table above to that folder.
2. Open each app **once while online** — this installs the service worker
   and caches the app for the first time. (Note: it takes two visits for the
   cache to be complete — the first installs the service worker, the second
   is already served by it. Opening the page twice in a row while online,
   before going offline, guarantees the cache is ready.)
3. **Remove the current Home Screen shortcut** for each app (the old icon).
4. **Add the shortcut again** (Share → Add to Home Screen). This is an iOS
   quirk — an existing shortcut doesn't automatically start working offline
   just because the files changed on the server; it needs to be recreated.

After that, each app opens and works **fully offline** — browsing, adding,
editing — even with no connection at all.

`sw.js` always forces a real check with the server when loading the page
(`cache: 'no-store'` on the navigation request), rather than trusting the
phone's normal HTTP cache — this prevents an installed shortcut from getting
stuck on an old version of the app even after you've published new changes
to GitHub.

## What still needs internet

Regardless of whether the app is installed and caching is working, two
things always require a real connection, because they're requests to
external services:

- **GitHub sync** (the "Sync" button and its status dot, in all four apps).
  - 🟢 green = synced
  - 🟡/grey (pending) = offline, will sync automatically once the internet
    is back
  - 🔴 red = a real error (e.g. invalid token) — needs your attention

- **Automatic translation** (Lexicon/Lexicon_iphone only, "🌐 Translate" and
  "Pending translations" buttons). You can save a French/English/Latin/Greek
  word without a translation while offline — it gets marked "⏳ pending
  translation" — and the app translates it automatically once the
  connection returns.

`sw.js` is deliberately set up to **never** intercept these two requests
(`api.github.com` and `translation.googleapis.com`) — they always go
straight to the real network, so each app's own logic (pending/ok/err
states, the pending-translation queue) always sees the real result and
never a stale cached response.

## Translation usage safety cap (Lexicon & Lexicon_iphone)

Automatic translation uses the Google Cloud Translation API (Basic, v2),
which is billed per character beyond a monthly free allowance. Google's own
daily/per-minute quotas for this API can't be lowered as a hard stop on this
project — Google only offers usage *alerts* (email, after the fact) for
these particular quotas, not an enforceable cap.

To close that gap, **both Lexicon.html and Lexicon_iphone.html** enforce
their own local daily limit, independent of Google's quotas:

- A running character count is kept in `localStorage`
  (`lexicon_translate_usage`), resetting automatically at local midnight.
- Before every translation call — both the manual "Traduzir" button and the
  automatic "pending translations" batch job — the app checks this count.
  Once the day's budget would be exceeded, it refuses to make the API call
  at all (no request sent, no cost incurred).
- On a single manual translation, this shows a toast: *"limite diário de
  tradução atingido — tenta amanhã."* On the batch "pending translations"
  job, hitting the limit stops the batch immediately (instead of failing on
  every remaining word one by one) and shows a summary toast — how many
  words were translated before the limit hit, and that the rest will retry
  automatically the next day. Any pending entries left untranslated stay
  flagged and retry automatically once the daily budget resets.
- The limit is set via the `TRANSLATE_DAILY_CHAR_LIMIT` constant near the
  top of the translation code in each file — currently 5000 characters/day
  (roughly 800–1000 short word lookups) in both versions, well above normal
  personal use but tight enough to stop a bug or accidental loop from
  running up real cost.
- Each version tracks its own usage independently (same `localStorage` key
  name, but `localStorage` is per-device/per-browser, so iPad and iPhone
  usage don't share a single budget).

## When to repeat the install steps (remove/re-add shortcut)

You only need to remove and re-add the shortcut if `sw.js` or the
`.webmanifest` files are replaced with versions that have major structural
changes (for example, changing the caching strategy, or switching manifests
like what happened with Cronologia_iphone). Normal changes to the `.html`
files (new features, fixes) **don't** require repeating this — the service
worker will always fetch the latest version of the page when there's
internet, and only uses the cache when you're offline.

## Responsive toolbar (all apps)

In all four apps, the bottom toolbar has two layouts depending on screen
width:

- **Below 700px** (phone): icons with a label underneath, in a single
  compact row.
- **700px and up** (iPad/laptop): roomier horizontal buttons (icon beside
  the label), with no text truncation.

On the iPhone versions (Cronologia_iphone and Lexicon_iphone), the toolbar
stays fixed to the bottom of the screen, the "+" button is built into it (as
"New"), and the jump-to-top/bottom shortcuts sit next to the search bar at
the top — nothing floats on top of the content.

## Features by app

### Cronologia (iPad / iPhone)
- Timeline grouped by era and by date.
- Reorder same-date entries by dragging (⋮⋮ icon).
- The date column's width automatically adjusts to the visible content
  (iPhone version only).
- GitHub sync with an offline queue and automatic resume.

### Lexicon (iPad/laptop / iPhone)
- Six languages: French, English, Latin, Portuguese, Greek, Arabic.
- Book code automatically converted to uppercase.
- Automatic translation (Google Cloud Translation API, target pt-PT) with an
  offline queue, automatic resume, and a local daily usage safety cap (both
  versions — see above).
- GitHub sync with an offline queue and automatic resume.
