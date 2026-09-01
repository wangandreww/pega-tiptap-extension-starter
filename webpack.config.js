const path = require('path');

/**
 * The `externals` block below is the key part of this config.
 *
 * When you write `import { Extension } from '@tiptap/core'` in your source,
 * Webpack will NOT bundle @tiptap/core into your output. Instead, it compiles
 * the import into a runtime lookup of `TiptapBundle.Extension` — the global
 * that Pega's pztiptap_bundle.js already exposes on the page.
 *
 * Result: your built extension file is small (kilobytes, not megabytes) and
 * reuses the exact same Tiptap classes the Pega RTE is already using, so
 * `instanceof` checks and shared registries work correctly.
 */
module.exports = {
  entry: './src/extension.js',
  output: {
    filename: 'my-extension.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'var',
      name: 'MyExtensionBundle',
    },
  },
  externals: {
    // Only externalize packages that Pega's TiptapBundle actually exports.
    // These map an ES-module import in your source to a runtime lookup on the
    // TiptapBundle global that pztiptap_bundle.js defines. If you externalize
    // something the bundle DOESN'T export, the runtime lookup returns undefined
    // and your extension will silently break. When in doubt, leave a package
    // out of this map — Webpack will bundle it into your output instead.
    // @tiptap/core has multiple named exports (Extension, Node, Mark, ...).
    // Map the whole module to `TiptapBundle` — then a named import like
    // `import { Extension } from '@tiptap/core'` compiles to `TiptapBundle.Extension`.
    // (Do NOT use ['TiptapBundle', 'Extension'] — that maps the entire module
    // to the Extension class, so `Extension` from it becomes
    // `TiptapBundle.Extension.Extension`, which is undefined at runtime.)
    '@tiptap/core':                          'TiptapBundle',
    '@tiptap/starter-kit':                   ['TiptapBundle', 'StarterKit'],
    '@tiptap/extension-image':               ['TiptapBundle', 'Image'],
    '@tiptap/extension-link':                ['TiptapBundle', 'Link'],
    '@tiptap/extension-table':               ['TiptapBundle', 'Table'],
    '@tiptap/extension-table-row':           ['TiptapBundle', 'TableRow'],
    '@tiptap/extension-table-cell':          ['TiptapBundle', 'TableCell'],
    '@tiptap/extension-table-header':        ['TiptapBundle', 'TableHeader'],
    '@tiptap/extension-code-block-lowlight': ['TiptapBundle', 'CodeBlockLowlight'],
    '@tiptap/extension-text-align':          ['TiptapBundle', 'TextAlign'],
    '@tiptap/extension-underline':           ['TiptapBundle', 'Underline'],
    '@tiptap/extension-color':               ['TiptapBundle', 'Color'],
    '@tiptap/extension-text-style':          ['TiptapBundle', 'TextStyle'],
    '@tiptap/extension-highlight':           ['TiptapBundle', 'Highlight'],
    '@tiptap/extension-subscript':           ['TiptapBundle', 'Subscript'],
    '@tiptap/extension-superscript':         ['TiptapBundle', 'Superscript'],
    '@tiptap/extension-font-family':         ['TiptapBundle', 'FontFamily'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
