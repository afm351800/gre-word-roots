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

## Use on your phone
Open the GitHub Pages URL in Safari, tap Share → Add to Home Screen.

## Editing the word data
Each deck is a JSON file in `data/` (`w` word, `p` part of speech, `m` meaning, `e` etymology,
`f` French, `t` memory hook, optional `x` warning label). After editing, run `node build.js`
to regenerate `words.js`, then commit.
