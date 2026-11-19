# Decks ♠ — a chess-like game
Static site + Supabase (auth, Postgres, Realtime). No build step.
## Host it on GitHub Pages (no terminal)
1. Unzip this folder on your computer.
2. On github.com click New repository, name it (e.g. `decks`), set it Public, click Create.
3. Click "uploading an existing file", drag in everything inside the unzipped folder (index.html, app.js, Images folder, etc. so index.html sits at the top level), then Commit changes.
4. Settings > Pages > Source: "Deploy from a branch", Branch: main, folder: / (root), Save.
5. After a minute your site is at https://YOUR-USERNAME.github.io/REPO-NAME/
6. In Supabase: Authentication > URL Configuration, set Site URL to that address and add it under Redirect URLs.
7. For quick testing, Authentication > Providers > Email: turn off "Confirm email".
The Supabase project and schema are already set up and `config.js` is filled in.
## Rules
8x8 board, white starts, capture the enemy King to win (no check/checkmate).
- Ace: rook moves. Queen: any direction. King: one step any way.
- Jack: knight leaps. Joker: slides diagonally plus one step straight.
- Chip: moves forward 1 (2 from start), captures diagonally, becomes a Queen on the last row.
## Known limits
Moves are validated in the browser; for cheat-proof play move validation into a Postgres function or Edge Function. No clocks, draws, or resign yet.
