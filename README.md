# GRE Word Roots

A small reference web app for GRE vocabulary: for every word in the GRE Vocabulary Flashcards decks
(Common Words I–VII, Basic I–IX, Advanced I–IX) it shows the meaning, etymology, French equivalent
and a memory hook. You can colour-mark words, write notes and set each deck's status. Everything you
add is stored on your device (export/import a backup from the home page).

No practice mode on purpose: this is the companion to the flashcard app.

## Use on your phone
Open the GitHub Pages URL in Safari, tap Share → Add to Home Screen.

## Editing the word data
Each deck is a JSON file in `data/` (`w` word, `p` part of speech, `m` meaning, `e` etymology,
`f` French, `t` memory hook, optional `x` warning label). After editing, run `node build.js`
to regenerate `words.js`, then commit.
