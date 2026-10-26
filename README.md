# GRE Word Roots

A small reference web app for GRE vocabulary: for every word in the GRE Vocabulary Flashcards decks
(Common Words I–VII, Basic I–IX, Advanced I–IX) it shows the meaning, etymology, French equivalent
and a memory hook. You can colour-mark words, write notes and set each deck's status. Everything you
add is stored on your device (export/import a backup from the home page).

The Plan tab runs a 13-day schedule to the test (7 Nov 2026): each day has a Learn session
(sort the day's decks card by card: hide words you already know, mark the rest Hard / Shaky / Known)
and a Review session (spaced: decks learned 1, 3 and 7 days ago that aren't Known yet, plus every
Hard and Flag word). The last days switch to review only. Open any date with `?date=YYYY-MM-DD`
to preview it.

Practice tab: pick decks and colours (default Common Words I–VII, Hard), then guess each word's meaning from three choices, three words per screen. Scores (right +1, wrong −2, 6 = memorised) are stored apart from the colour marks, which never change; Hard words show a small red→green marker in the lists. Keys: 1–3 answer, Space = next.

## Use on your phone
Open the GitHub Pages URL in Safari, tap Share → Add to Home Screen.

## Editing the word data
Each deck is a JSON file in `data/` (`w` word, `p` part of speech, `m` meaning, `e` etymology,
`f` French, `t` memory hook, optional `x` warning label). After editing, run `node build.js`
to regenerate `words.js`, then commit.

## Sync between devices (laptop + phone)

Progress (colour marks, notes, hidden words, review dates) is stored in the browser, and can be synced to a **separate private GitHub repo** (e.g. `gre-progress`) through the GitHub contents API. Open `#/sync` in the app for the setup steps. The repo holds one file, `progress.json`; each device holds a fine-grained token limited to that repo (Contents: read and write), stored in that browser's localStorage only.

Merge rule: every word carries a timestamp of its last change; the newest change per word wins, review dates keep the latest, day ticks are OR-ed. Syncs on open, 2.5 s after a change, on tab focus, and every 90 s. Offline changes are pushed later.

## Desktop

At ≥1000 px wide the layout switches to a laptop view: plan and timeline side by side, words in a 2–3 column card grid, centred flashcards. Keyboard: `/` search, in sessions Space = reveal, `1/2/3` = Hard/Shaky/Got it, `H` = already know (Learn), Backspace = undo.
