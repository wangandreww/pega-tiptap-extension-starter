/**
 * Example custom Tiptap extension for the Pega Rich Text Editor.
 *
 * This starter shows two patterns:
 *   1. A behavior-only Extension (keyboard shortcut for uppercase transform).
 *   2. A Node that renders a custom "callout box" block.
 *
 * Replace or extend these with your own logic.
 *
 * Build:   npm run build
 * Output:  dist/my-extension.js  (upload this to Pega as a Text File rule)
 */

import { Extension, Node } from '@tiptap/core';

/* ----------------------------------------------------------------------------
 * Example 1 — Behavior-only extension: Ctrl/Cmd+Shift+U uppercases selection.
 * -------------------------------------------------------------------------- */
const UppercaseShortcut = Extension.create({
  name: 'acme.uppercaseShortcut',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-u': () => {
        const { state, dispatch } = this.editor.view;
        const { from, to } = state.selection;
        if (from === to) return false;

        const text = state.doc.textBetween(from, to, ' ');
        dispatch(state.tr.insertText(text.toUpperCase(), from, to));
        return true;
      },
    };
  },
});

/* ----------------------------------------------------------------------------
 * Example 2 — Custom Node: <div class="callout callout-info">...</div>
 * -------------------------------------------------------------------------- */
const CalloutNode = Node.create({
  name: 'acme.callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (el) => {
          if (el.classList.contains('callout-warning')) return 'warning';
          if (el.classList.contains('callout-error'))   return 'error';
          return 'info';
        },
        renderHTML: (attrs) => ({ class: `callout callout-${attrs.type}` }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.callout' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      insertCallout: (type = 'info') => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: { type },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New callout' }] }],
        }),
    };
  },
});

/* ----------------------------------------------------------------------------
 * Register with Pega's RTE.
 *
 * The `pega.u.d.customTiptapExtensions` map is read by the editor at construction
 * time (see getCustomExtensions in pztiptap_rte.js). Every entry becomes an
 * active extension on every RTE instance on the page.
 *
 * Use a namespaced name ("acme.foo", not "foo") to avoid collisions with
 * other extensions that other apps or vendors may register.
 * -------------------------------------------------------------------------- */
(function registerWithPega() {
  if (typeof window === 'undefined') return;

  window.pega = window.pega || {};
  window.pega.u = window.pega.u || {};
  window.pega.u.d = window.pega.u.d || {};
  window.pega.u.d.customTiptapExtensions = window.pega.u.d.customTiptapExtensions || {};

  window.pega.u.d.customTiptapExtensions['acme.uppercaseShortcut'] = UppercaseShortcut;
  window.pega.u.d.customTiptapExtensions['acme.callout']            = CalloutNode;
})();

export { UppercaseShortcut, CalloutNode };
