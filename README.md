# Pega Tiptap Extension Starter

Starter template for building custom Tiptap extensions for the Pega Rich Text
Editor (Infinity 26+).

Use this if your extension pulls in npm dependencies and needs to be
pre-bundled to a browser-compatible UMD/IIFE file before uploading to Pega.

> **You only need this starter if your extension requires npm packages.** The
> starter's purpose is Webpack build tooling that bundles npm dependencies and
> maps their imports to Pega's `TiptapBundle` global at runtime.
>
> For behavior-only extensions using just `TiptapBundle.Extension.create` /
> `TiptapBundle.Node.create`, no build tooling is needed — write the code
> directly as a Pega Text File rule. See the Pega documentation topic
> *"Adding an external extension to the Rich text editor."*

## Compatibility

- **Target UI stack:** Pega Traditional UI (not Constellation)
- **Target Platform:** Pega Infinity 26 and later
- **Tiptap version:** 2.1.13 (bundled by Pega)
- **DOMPurify version:** 3.4.x

## Prerequisites

- Node.js 18+ and npm
- A Pega Infinity 26+ instance with the Tiptap-based RTE
- Basic familiarity with Tiptap v2 (https://tiptap.dev/docs)

## Quick start

```bash
git clone https://github.com/wangandreww/pega-tiptap-extension-starter.git
cd pega-tiptap-extension-starter
npm install
npm run build
```

That produces `dist/my-extension.js` — the file you upload to Pega.

## What's in the box

| File | Purpose |
|------|---------|
| `src/extension.js`      | Your extension code. Ships with four examples: a keyboard shortcut, a custom node (callout box), a style-only page-view extension, and a custom toolbar button. |
| `webpack.config.js`     | Webpack config with `TiptapBundle` externals pre-wired. **Do not remove the externals block** — it's what makes Pega compatibility work. |
| `package.json`          | Dependencies. Add more Tiptap extensions as needed with `npm install @tiptap/extension-<name>`. |
| `dist/my-extension.js`  | Build output (gitignored). Upload this to Pega. |

## How the `externals` config works

When you write:

```js
import { Extension } from '@tiptap/core';
```

Webpack does **not** bundle `@tiptap/core` into your output. Instead it
compiles that import into a runtime lookup of `TiptapBundle.Extension` — the
global exposed by Pega's `pztiptap_bundle.js`.

**Why it matters:** Your built file is tiny (a few KB, not megabytes) and it
reuses the exact same Tiptap classes the Pega RTE already loaded. If you
bundled your own copy of Tiptap, `instanceof` checks and shared registries
would silently break.

If you add a new npm dependency that also needs to come from Pega's bundle,
add a corresponding entry to the `externals` map in
[`webpack.config.js`](./webpack.config.js).

## Deploying to Pega

### 1. Upload the built file as a Text File rule

- Pega Infinity Studio → **Create** → **Technical** → **Text File**
- Label: a meaningful name (e.g., `my_tiptap_extension`)
- App name (directory): `webwb`
- File type (extension): `js`
- Context: your dev branch and app ruleset
- Click **Create and open**
- Click **Upload file**, select `dist/my-extension.js`, save, check in

### 2. Attach to your harness

- Open the harness rule that hosts the RTE
- Go to **Scripts & Styles** tab
- Add your extension file (`webwb/my_tiptap_extension.js`)
- **Important:** the entry must appear **below** `pztiptap_bundle` so the
  `TiptapBundle` global is defined before your extension runs, and it must
  load **before** the editor initializes (which is the default behavior for
  harness scripts).
- Save and check in

### 3. Clear the static content cache

Pega Infinity Studio → **Configure** → **System** → **Settings** → **Clear
Static Content Cache**

### 4. Verify

Open a page with the RTE. In DevTools console:

```js
Object.keys(pega.u.d.customTiptapExtensions);
// → should include "acme.uppercaseShortcut" and "acme.callout"
```

Try the extensions:

- Select some text and press `Cmd+Shift+U` (macOS) or `Ctrl+Shift+U` (Windows)
  — the selection should uppercase.
- Run `TIPTAPEDITOR.instances[<yourEditorId>].commands.insertCallout('info')`
  in the console to insert a callout box.

## Writing your own extension

1. Delete or replace the example code in `src/extension.js`.
2. Write your extension using standard Tiptap v2 APIs
   (`Extension.create`, `Node.create`, `Mark.create`).
3. Use a namespaced name: `"yourCompany.yourExtension"` — not `"myExt"` — to
   avoid collisions with other extensions that may register on the same page.
4. Register on `pega.u.d.customTiptapExtensions[name] = yourExtension`.
5. Run `npm run build` and redeploy.

## Version compatibility (IMPORTANT)

Pega's traditional-UI Rich Text Editor is built on **Tiptap 2.x**
(currently 2.1.13). Every Tiptap extension you install **must be a v2
release** — Tiptap v3 is a breaking major and its extensions will fail
silently against Pega's runtime.

**The trap:** running `npm install @tiptap/extension-<name>` without a
version specifier installs the *latest* version, which today is v3.x.
Always pin to v2:

```bash
# Recommended — always append @^2
npm install @tiptap/extension-mention@^2

# Or, closer to Pega's exact bundled version
npm install @tiptap/extension-mention@~2.1.13
```

This starter's `package.json` includes an `overrides` block that pins
every well-known `@tiptap/*` package to `^2.1.13`. That protects you
against *transitive* v3 pulls (a package you install depending on a v3
`@tiptap/core`, for example), but it does **not** override the version
of a package you install directly. Always use `@^2` on the install
command.

Non-Tiptap packages (tippy.js, popper, mammoth.js, etc.) have their own
versioning and are not constrained by this.

## Adding an npm-based extension

Full walkthrough using `@tiptap/extension-placeholder` (shows placeholder text
when the editor is empty) as an example.

### 1. Install the package

```bash
npm install @tiptap/extension-placeholder
```

### 2. Decide: bundle it, or externalize it?

Check whether Pega's `TiptapBundle` already exports this package (see the
Pega documentation topic *"Adding an external extension to the Rich text
editor"* for the current export list — includes `StarterKit`, `Link`,
`Image`, `Table`, `TextAlign`, `Underline`, etc.).

- **Already in `TiptapBundle`?** — Add an entry to `externals` in
  [`webpack.config.js`](./webpack.config.js). Your build output stays tiny
  and shares Pega's copy at runtime:
  ```js
  externals: {
    '@tiptap/extension-somename': ['TiptapBundle', 'SomeName'],
    // ...
  }
  ```
- **Not in `TiptapBundle`?** — Do nothing. Webpack will bundle the package
  into your output file. That's the case for `@tiptap/extension-placeholder`.

### 3. Import and register in `src/extension.js`

```js
import Placeholder from '@tiptap/extension-placeholder';

// ...existing extensions...

window.pega.u.d.customTiptapExtensions['acme.placeholder'] = Placeholder.configure({
  placeholder: 'Start typing here…',
});
```

### 4. Build

```bash
npm run build
```

Produces a fresh `dist/my-extension.js` with the placeholder code bundled in.

### 5. Redeploy

Re-upload `dist/my-extension.js` to your existing Text File rule in Pega and
clear the static content cache. No harness changes needed — the same file is
already attached.

### 6. Verify

Open a page with the RTE. Empty editors should now show "Start typing here…"
as a hint. In DevTools:

```js
Object.keys(pega.u.d.customTiptapExtensions);
// → [..., "acme.placeholder"]
```

### Gotchas

- **CommonJS-only packages** — some older packages don't ship ES modules
  cleanly. If the build errors with `Foo is not a constructor`, try
  `const Foo = require('foo').default;` instead of `import Foo from 'foo'`.
- **Peer dependency warnings** — many Tiptap extensions declare
  `@tiptap/core` as a peer. `npm install` may warn about unmet peers; this
  is fine because `@tiptap/core` is a direct dependency of this starter.
- **Bundle size** — every package you bundle (Case B in step 2) adds to
  the output file. Prefer externalizing whenever Pega's `TiptapBundle`
  already ships the package.

## Constraints (from Pega's documentation)

- Extensions must use the Tiptap v2 API (`Extension.create`, `Node.create`,
  `Mark.create`).
- Delivered as browser-compatible JavaScript (UMD or IIFE). ES module
  `import`/`export` is not supported at runtime — Webpack handles this
  conversion for you.
- If your extension outputs custom HTML tags/attributes, add them to
  `pega.u.d.rteCustomAllowedTags` so DOMPurify doesn't strip them.

## Adding a custom toolbar button

Custom toolbar buttons are registered via a separate registry from custom
extensions: `pega.u.d.customTiptapToolbarButtons`. Registered buttons appear
at the end of the RTE toolbar in a "custom" group, separated by a divider
from the built-in buttons.

### Contract

```js
pega.u.d.customTiptapToolbarButtons = pega.u.d.customTiptapToolbarButtons || {};

pega.u.d.customTiptapToolbarButtons['acme.sayHello'] = {
  label: 'Say Hello',                         // required — tooltip and aria-label
  icon: '<svg viewBox="0 0 24 24">...</svg>', // required — inline SVG or webwb/foo.svg URL
  onClick: (editor, buttonEl) => {            // required — fires on click
    alert('HELLO!');
  },
};
```

### Rules and guarantees

- **Namespace required.** Button IDs must contain a `.` (e.g.
  `"acme.sayHello"`, not `"sayHello"`). Non-namespaced IDs are rejected with
  a console warning to prevent collisions with Pega's built-in button IDs.
- **Icons are sanitized.** Inline SVG icons pass through the RTE's DOMPurify
  configuration — event handlers and script content are stripped. URL icons
  are restricted to relative paths, `http(s)`, and `data:image/*` URIs;
  `javascript:` and `vbscript:` are rejected.
- **Always enabled.** There is no `isEnabled` contract in the v1 API. If
  your button should no-op under certain conditions (e.g., no text selected),
  guard inside `onClick`: `if (editor.state.selection.empty) return;`.
- **No API for adding buttons between built-ins.** All custom buttons render
  at the end of the toolbar. Ordering within the custom group follows the
  order entries are added to the registry.
- **Registration timing.** Register at page-parse time (inside your
  extension file's top-level IIFE). Buttons registered after `new Editor()`
  fires do not appear on that editor instance.

### Example — inline SVG icon

```js
pega.u.d.customTiptapToolbarButtons['acme.uppercase'] = {
  label: 'Uppercase selection',
  icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM12 3L4 17h2.5l1.5-4h8l1.5 4H20L12 3z"/></svg>',
  onClick: (editor) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const text = editor.state.doc.textBetween(from, to, ' ');
    editor.chain().focus().insertContentAt({ from, to }, text.toUpperCase()).run();
  },
};
```

### Example — icon hosted as a Pega Text File / Binary File rule

Upload your icon as a Binary File rule (App name `webwb`, extension `svg`
or `png`), then reference it by relative path:

```js
pega.u.d.customTiptapToolbarButtons['acme.wordImport'] = {
  label: 'Upload Word document',
  icon: 'webwb/word_icon.svg',
  onClick: async (editor) => {
    // ... open file picker, convert with mammoth, insert HTML ...
  },
};
```

## Troubleshooting

**`TiptapBundle is undefined` in the browser console**
Your extension file is loading before `pztiptap_bundle.js`. In your harness's
Scripts & Styles tab, move your entry below `pztiptap_bundle`.

**Extension registered but doesn't seem active**
Check timing: your file must run before `new Editor()` is called. If you
lazy-load the file on user action (or inject it into a modal after page load),
it will miss the registration window. Load it at page-parse time via the
harness.

**Works in dev, broken after deploy**
Clear the static content cache in the target environment.

**Namespace collision — extension mysteriously replaced**
Another extension is registering under the same name.
`pega.u.d.customTiptapExtensions` is a plain object — last write wins. Always
namespace your extension names (`acme.foo` rather than `foo`).

**Custom tags/attributes disappearing from saved content**
DOMPurify is sanitizing them. Add your custom tags to
`pega.u.d.rteCustomAllowedTags` (a `Set` or comma-separated string). Attributes
require extending the DOMPurify config; see `pega.u.d.rteCustomDisAllowedTags`
docs.

## License

Apache License 2.0. See [LICENSE](./LICENSE) for the full text.
