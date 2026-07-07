---
name: pdf-lib WinAnsi text limits
description: Standard fonts in pdf-lib throw on non-WinAnsi characters
---
pdf-lib standard fonts (Helvetica etc.) use WinAnsi encoding. `drawText` throws on characters outside it — e.g. `≈` (U+2248), `→`, curly quotes — which silently killed the whole PDF pack (best-effort catch returned null).
**Why:** discovered when the eSIM PDF pack generated 0 bytes in production; a country-info currency string contained `≈`.
**How to apply:** sanitize ALL dynamic text before drawing (map ≈→~, →→->, smart quotes→ascii, strip other non-Latin-1), or embed a Unicode TTF via fontkit.
