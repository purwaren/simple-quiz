# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static, vanilla JS quiz portal for Indonesian primary school students. Covers Islamic history (Khalifah) and Arabic vocabulary (Peristiwa Alam). No build system — open `index.html` directly in a browser or serve with any static file server.

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework, no bundler)
- Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
- Google Fonts: Fredoka One (headings), Quicksand (body)
- Canvas API for certificate generation
- All quiz data as JSON files

## Architecture

```
index.html      — Single-page app shell (all screens present, toggled with .hidden)
script.js       — All app logic: state, rendering, scoring, certificate
quizzes/        — Quiz data as JSON; index.json lists all available quizzes
images/         — Static images referenced by quiz JSON
```

Screen flow: Landing → Welcome (name/class input) → Quiz → Results

## Quiz JSON Schema

### `quizzes/index.json` — quiz registry
```json
[{ "id": "slug", "title": "...", "description": "...", "icon": "emoji", "file": "quizzes/slug.json" }]
```

### Individual quiz file — three question types:

**multiple-choice** — `answer` is the 0-based index of the correct option
```json
{ "type": "multiple-choice", "question": "...", "options": ["A","B","C","D"], "answer": 2 }
```

**drag-drop** (tap-to-place) — `_______` (7 underscores) marks the blank; `answer` is the exact string
```json
{ "type": "drag-drop", "question": "...", "sentence": "Teks _______ lanjutan.", "options": ["Benar","Salah"], "answer": "Benar" }
```

**matching** — `pairs` maps left IDs to right IDs; items support optional `image` and/or `text`
```json
{
  "type": "matching",
  "question": "...",
  "left":  [{ "id": "L1", "image": "images/foo.avif", "text": "Label" }],
  "right": [{ "id": "R1", "text": "Pasangan" }],
  "pairs": { "L1": "R1" }
}
```

## Adding a New Quiz

1. Create `quizzes/<slug>.json` using the schema above (see `quizzes/template.json`)
2. Add an entry to `quizzes/index.json`
3. Drop any images into `images/`

## Key Conventions

- UI language is Indonesian (Bahasa Indonesia)
- Matching cards use fixed height `h-[160px] md:h-[260px]` — keep all cards uniform
- Arabic text in matching cards uses `text-3xl md:text-5xl` for readability
- Score is always out of 100; each question is worth equal weight
- Certificate downloads as `Sertifikat_<name>_<class>.png` via Canvas API

## Key Files

| File | Purpose |
|------|---------|
| `quizzes/index.json` | Master list of all quizzes shown on landing page |
| `quizzes/template.json` | Reference template for all three question types |
| `script.js` | All logic: `renderQuestion`, `calculateScore`, `generateCertificate` |
