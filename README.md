# Circadian Rhythm Tracker – Tauri MVP

A desktop application (React + TypeScript + Tailwind CSS + Tauri) for visualising and tracking the human circadian rhythm.

---

## 🖌️ Theming

This project supports three built-in themes:

| Theme name | Description |
|------------|-------------|
| `light`    | Default light UI colours |
| `dark`     | Dark mode – enabled automatically on first launch |
| `terminal` | Monospace console-style palette |

Switch theme at runtime via the selector in the bottom-right corner of the interface. Your choice is persisted to `localStorage` and restored on next launch.

### Adding a new theme
1. Open `src/theme/themes.ts` and add a new key to the exported `themes` object.
2. Provide **HSL component strings** for each CSS variable – e.g. `"222.2 47.4% 11.2%"` – **not** hex values. This works with Tailwindʼs `hsl(var(--token) / <alpha-value>)` pattern and gives you automatic `/xx` opacity utilities.
3. Import/open the UI and verify colours with `bg-[token]/xx`, `ring-[token]/50`, etc.

## 🧪 Testing

Jest tests live in `src/**.test.ts(x)`.

```
# run all tests
npm test
```

Current coverage:
* `themeStore` – verifies persistence to localStorage and default selection.

## ✨ Design tokens

All colour tokens are set on the `:root` (light) and `.dark` (dark) scopes in `src/index.css`.
We use **HSL component variables** so Tailwindʼs alpha syntax works universally.

```css
/* Example */
:root {
  --primary: 217.2 91.2% 59.8%;
}
.text-primary/80 { /* ✅ compiles */ }
```

## 🤝 Contributing

1. Clone & install:
   ```bash
   git clone <repo>
   cd circadian-rythm-app
   npm install
   ```
2. Start dev mode (HMR):
   ```bash
   npm run dev
   ```
3. Before opening a PR:
   * Run `npm test` – all tests must pass.
   * Run `npm run lint` – no ESLint errors.
   * Follow the **Conventional Commits** spec for commit messages.

### Coding guidelines
* **Components** live in `src/components`; co-locate small hooks under `src/hooks`.
* Use the `cn()` helper from `src/lib/utils.ts` instead of ad-hoc `clsx`.
* Prefer **shadcn/ui** style utilities (`focus-visible:ring-ring/50`, `border-border`, etc.).
* Keep new colour tokens in HSL (as described above).

## 📜 Licence
MIT
