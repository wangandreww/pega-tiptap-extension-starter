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
    '@tiptap/core':                     ['TiptapBundle', 'Extension'],
    '@tiptap/starter-kit':              ['TiptapBundle', 'StarterKit'],
    '@tiptap/extension-heading':        ['TiptapBundle', 'Heading'],
    '@tiptap/extension-paragraph':      ['TiptapBundle', 'Paragraph'],
    '@tiptap/extension-image':          ['TiptapBundle', 'Image'],
    '@tiptap/extension-link':           ['TiptapBundle', 'Link'],
    '@tiptap/extension-table':          ['TiptapBundle', 'Table'],
    '@tiptap/extension-table-row':      ['TiptapBundle', 'TableRow'],
    '@tiptap/extension-table-cell':     ['TiptapBundle', 'TableCell'],
    '@tiptap/extension-table-header':   ['TiptapBundle', 'TableHeader'],
    '@tiptap/extension-code-block-lowlight': ['TiptapBundle', 'CodeBlockLowlight'],
    '@tiptap/extension-text-align':     ['TiptapBundle', 'TextAlign'],
    '@tiptap/extension-underline':      ['TiptapBundle', 'Underline'],
    '@tiptap/extension-color':          ['TiptapBundle', 'Color'],
    '@tiptap/extension-text-style':     ['TiptapBundle', 'TextStyle'],
    '@tiptap/extension-highlight':      ['TiptapBundle', 'Highlight'],
    '@tiptap/extension-subscript':      ['TiptapBundle', 'Subscript'],
    '@tiptap/extension-superscript':    ['TiptapBundle', 'Superscript'],
    '@tiptap/extension-font-family':    ['TiptapBundle', 'FontFamily'],
    '@tiptap/extension-mention':        ['TiptapBundle', 'Mention'],
    'prosemirror-state':                ['TiptapBundle', 'ProseMirrorState'],
    'prosemirror-view':                 ['TiptapBundle', 'ProseMirrorView'],
    'prosemirror-model':                ['TiptapBundle', 'ProseMirrorModel'],
    'prosemirror-transform':            ['TiptapBundle', 'ProseMirrorTransform'],
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
