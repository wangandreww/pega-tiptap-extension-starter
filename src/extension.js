/**
 * Example custom Tiptap extension for the Pega Rich Text Editor.
 *
 * This starter shows four patterns:
 *   1. A behavior-only Extension (keyboard shortcut for uppercase transform).
 *   2. A Node that renders a custom "callout box" block.
 *   3. A style-only Extension (page-view CSS injected into the RTE iframe).
 *   4. A custom toolbar button registered via pega.u.d.customTiptapToolbarButtons.
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
/* ----------------------------------------------------------------------------
 * Example 3 — Style-only Extension: page-view CSS.
 *
 * Rather than a ProseMirror decoration-based pagination plugin (which fails
 * against Pega's Tiptap 2.1.13 setup — see the "why not tiptap-pagination-plus"
 * note in the README), this extension injects CSS into the RTE iframe on
 * editor create. Result: the editor content area renders as an 8.5" × 11"
 * white "page" with padding and a drop shadow on a light-grey background —
 * Word-like editing surface. Content flows continuously; no hard page breaks.
 * -------------------------------------------------------------------------- */
const PageView = Extension.create({
  name: 'acme.pageView',
  onCreate() {
    const iframeDoc = this.editor.view.dom.ownerDocument;
    if (iframeDoc.getElementById('acme-page-view-styles')) return;
    const style = iframeDoc.createElement('style');
    style.id = 'acme-page-view-styles';
    style.textContent = `
      .ProseMirror {
        background: #ffffff;
        width: 8.5in;
        min-height: 11in;
        margin: 20px auto;
        padding: 1in;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        box-sizing: border-box;
      }
      body {
        background: #e8eaed;
      }
    `;
    iframeDoc.head.appendChild(style);
  },
});

/* ----------------------------------------------------------------------------
 * Example 4 — Custom toolbar button.
 *
 * Registered on pega.u.d.customTiptapToolbarButtons (a separate registry
 * from customTiptapExtensions). Buttons appear in a "custom" group at the
 * end of the RTE toolbar, separated by a divider.
 *
 * Contract:
 *   label:   string  (required — tooltip and aria-label)
 *   icon:    string  (required — inline SVG or webwb/foo.svg URL)
 *   onClick: (editor, buttonEl) => void  (required)
 *
 * Custom buttons are always enabled. Guard inside onClick if you need
 * conditional behavior — e.g., check editor.state.selection.empty.
 *
 * IDs must be namespaced (contain a "."), e.g. "acme.sayHello".
 * -------------------------------------------------------------------------- */
const SayHelloButton = {
  label: 'Say Hello',
  icon:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' +
    '</svg>',
  onClick: (editor) => {
    alert('HELLO!');
  },
};

/* ----------------------------------------------------------------------------
 * Register everything with Pega's RTE.
 *
 * The customTiptapExtensions map is read by the editor at construction time
 * (see getCustomExtensions in pztiptap_rte.js). Every entry becomes an
 * active extension on every RTE instance on the page.
 *
 * The customTiptapToolbarButtons map is read when the toolbar is built (see
 * buildCustomToolbarGroup in pztiptap_rte.js). Every entry appears at the
 * end of the toolbar in a "custom" group.
 *
 * Use namespaced names ("acme.foo", not "foo") to avoid collisions with
 * other extensions or buttons that may register on the same page.
 * -------------------------------------------------------------------------- */
(function registerWithPega() {
  if (typeof window === 'undefined') return;

  window.pega = window.pega || {};
  window.pega.u = window.pega.u || {};
  window.pega.u.d = window.pega.u.d || {};
  window.pega.u.d.customTiptapExtensions = window.pega.u.d.customTiptapExtensions || {};
  window.pega.u.d.customTiptapToolbarButtons = window.pega.u.d.customTiptapToolbarButtons || {};

  window.pega.u.d.customTiptapExtensions['acme.uppercaseShortcut'] = UppercaseShortcut;
  window.pega.u.d.customTiptapExtensions['acme.callout']            = CalloutNode;
  window.pega.u.d.customTiptapExtensions['acme.pageView']           = PageView;

  window.pega.u.d.customTiptapToolbarButtons['acme.sayHello']       = SayHelloButton;
})();

export { UppercaseShortcut, CalloutNode, PageView, SayHelloButton };
