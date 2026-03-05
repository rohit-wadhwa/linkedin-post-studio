# LinkedIn Post Studio — Project Memory

## What This Is

A **free, lightweight Chrome extension** that enhances the LinkedIn post editor with formatting tools, reusable templates, and live preview. It injects an inline toolbar directly into LinkedIn's post composer — no external dashboard, no copy-paste workflow.

**Repository**: `rohit-wadhwa/linkedin-post-studio`
**Extension type**: Chrome Extension (Manifest V3)
**License**: MIT
**Price**: Free (intentionally — this is a strategic differentiator)

## Owner & Contact

- **Owner**: Rohit Wadhwa
- **GitHub**: https://github.com/rohit-wadhwa
- **LinkedIn**: https://www.linkedin.com/in/rohit-wadhwa
- **Twitter**: https://twitter.com/RohitWadhwa52
- **Website**: https://about.me/rohit.wadhwa
- **Buy Me a Coffee**: https://www.buymeacoffee.com/rohit.wadhwa

## Community & Support Configuration

The following community files are set up:
- `.github/FUNDING.yml` — GitHub Sponsors (`rohit-wadhwa`) + Buy Me a Coffee link. This enables the "Sponsor" button on the GitHub repo.
- `.github/ISSUE_TEMPLATE/bug_report.md` — Standardized bug report template with fields for reproduction steps, expected behavior, and environment info.
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request template with problem description, proposed solution, and alternatives.
- `README.md` — Includes Buy Me a Coffee button, social links (Twitter, LinkedIn, GitHub, website), hit counter badge, and contributing guidelines.

## Strategic Positioning

LinkedIn Post Studio sits in the sweet spot between bare-bones text formatters (too basic, often abandoned) and full platforms like AuthoredUp ($20/mo) and Taplio ($39/mo) (too expensive, too complex).

### What We Are
- The best **free formatting and crafting tool** for LinkedIn posts
- "You bring the ideas, we make them look great"
- Focused, reliable, lightweight, privacy-respecting

### What We Are NOT — Hard Rules
- **NO built-in AI content generation.** The market is saturated (Reepl, Taplio, Supergrow all do this). It would require API costs (killing the free model) and creates privacy concerns. If AI is ever considered, it must be **Bring Your Own GenAI (BYOG)** — user provides their own API key, we just provide the UI integration. This is not currently planned.
- **NO scheduling, CRM, or lead generation.** These pull the extension into enterprise territory with high complexity and compliance risk. LinkedIn actively blocks automation tools (Taplio was banned).
- **NO cross-platform posting** (X/Twitter, etc.). Stay focused on LinkedIn.
- **NO cookie tracking or analytics collection.** GDPR-safe. Minimal permissions (`storage` + `activeTab` only).

## Architecture Overview

```
extension/
├── manifest.json              # Chrome Extension Manifest V3
├── content-script.js          # Entry point — detects LinkedIn editor via MutationObserver,
│                              # injects toolbar, provides core formatting API
│                              # Exposes: window.LinkedInPostStudio (LPS) global
├── toolbar-ui.js              # Creates toolbar DOM, button groups, template panel,
│                              # preview panel, keyboard shortcuts
├── styles.css                 # All extension styles (toolbar, panels, preview)
├── storage/
│   └── template-manager.js    # Template CRUD via Chrome Storage API
│                              # Ships 8 default templates
├── background/
│   └── background.js          # Service worker — settings, messaging, usage stats
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup logic — settings toggles, template import/export
└── assets/icons/              # Extension icons (16, 48, 128px)
```

### Key Patterns

- **No build step.** Plain vanilla JS, no bundler, no framework. Load-and-go.
- **Global namespace**: All modules communicate via `window.LinkedInPostStudio` (aliased as `LPS`). Each IIFE extends this object.
- **Content script load order** (defined in manifest.json): `content-script.js` → `toolbar-ui.js` → `template-manager.js`
- **Editor detection**: `content-script.js` uses `MutationObserver` on `document.body` to detect when LinkedIn's post editor appears/disappears.
- **Unicode formatting**: LinkedIn doesn't support HTML bold/italic. We use Unicode Mathematical Alphanumeric Symbols (U+1D400 range) for bold, italic, bold-italic.
- **Templates**: Stored in `chrome.storage.local` under key `lps_templates`. 8 defaults ship with the extension. Users can create, edit, delete, import/export.
- **Settings**: Stored under `lps_settings` in `chrome.storage.local`. Managed via background service worker message passing.

### LinkedIn DOM Selectors (may break with LinkedIn updates)
```js
editorContainer: '.share-creation-state__text-editor, .ql-editor, [contenteditable="true"][role="textbox"]'
shareBox: '.share-box-feed-entry__trigger, .share-creation-state'
modalEditor: '.share-creation-state__text-editor .ql-editor'
postModal: '.share-box--is-open, .artdeco-modal--layer-default'
```

## Current Features (v1.0.0)

| Feature | File(s) | Status |
|---------|---------|--------|
| Inline formatting toolbar | toolbar-ui.js, styles.css | Done |
| Bold / Italic / Bold-Italic (Unicode) | content-script.js | Done |
| Bullet lists (•, →, —, ✓) | content-script.js | Done |
| Separators (line, dots, stars, wave) | content-script.js | Done |
| Template system (CRUD, categories) | template-manager.js, toolbar-ui.js | Done |
| 8 default templates (hooks, CTAs, hashtags, structures) | template-manager.js | Done |
| Live preview (desktop/mobile toggle) | toolbar-ui.js | Done |
| Character & word counter | content-script.js, toolbar-ui.js | Done |
| Keyboard shortcuts (Ctrl+B, Ctrl+I) | toolbar-ui.js | Done |
| Template import/export (JSON) | popup.js | Done |
| Extension popup (settings, stats) | popup/ | Done |

## Roadmap — GitHub Issues & Milestones

### Milestone 1: Foundation & Polish (v1.1)
Priority bug fixes and UX polish for initial release readiness.
Key issues:
- LinkedIn character limit warning (3,000 chars) with color-coded indicator
- "See more" fold indicator in preview (~210 chars on mobile)
- Fix toolbar z-index/positioning conflicts with LinkedIn UI
- Accessibility improvements (ARIA, focus management, high contrast)
- Template search/filter in panel

### Milestone 2: Content & Templates (v1.2)
Expand the template library and content creation tools.
Key issues:
- Ship 50+ pre-built templates (hooks, CTAs, frameworks, hashtags by industry)
- Post structure templates with placeholder sections (Story, Listicle, Hot Take, Case Study)
- Emoji picker integration
- Hashtag suggestions by industry/topic

### Milestone 3: Smart Features (v1.3)
Add intelligent features that differentiate from basic formatters.
Key issues:
- Readability score / reading time estimate
- Draft auto-save (survives tab closure)
- Post history / versioning
- "See more" fold indicator with exact line preview

### Milestone 4: Growth & Ecosystem (v1.4)
Features to support growth, teams, and community.
Key issues:
- Template sharing (import from URL)
- Draft export/share for team use
- Usage analytics dashboard in popup
- Chrome Web Store listing optimization

## Competitive Landscape (as of March 2025)

| Competitor | Price | Key Strength | Key Weakness |
|-----------|-------|-------------|-------------|
| **AuthoredUp** | $19.95/mo | 200+ templates, preview, analytics | No free tier, sync bugs, no AI |
| **Reepl AI** | $0-29/mo | AI generation, CRM | Privacy concerns, bloated, low adoption |
| **Taplio** | $39-65/mo | AI + scheduling, lead DB | LinkedIn blocks it, 2.1/5 Trustpilot, expensive |
| **Supergrow.ai** | $19-39/mo | AI voice training, scheduling | No free tier |
| **Text Formatters** | Free | Simple, free | No templates, no preview, abandoned |
| **LinkedIn Post Studio** | **Free** | Formatting + templates + preview | Needs more templates, polish |

### Our Competitive Advantages
1. **Free** — every major competitor charges $20-65/month
2. **Inline in LinkedIn** — no external dashboard, no copy-paste
3. **Minimal permissions** — only `storage` + `activeTab` (competitors request broad access)
4. **Focused scope** — formatting and crafting only, not a bloated platform
5. **Active development** — many text formatters are abandoned

## Development Notes

### How to Test Locally
1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked" → select the `extension/` folder
4. Go to linkedin.com, open the post editor → toolbar appears

### Adding New Features
- **New formatting options**: Add to `content-script.js` (logic) and `toolbar-ui.js` (button)
- **New template categories**: Add to the `<select>` in `toolbar-ui.js:openTemplateEditor()` and default templates in `template-manager.js`
- **New settings**: Add to `background.js` (storage), `popup.html` (UI), `popup.js` (logic)
- **New toolbar sections**: Follow the `createButtonGroup()` pattern in `toolbar-ui.js`

### Important Gotchas
- LinkedIn's DOM structure changes frequently. The selectors in `content-script.js:SELECTORS` may need updating.
- Unicode bold/italic only works for A-Z, a-z, and 0-9 (bold digits only). Special characters, accented letters, and non-Latin scripts pass through unchanged.
- `chrome.storage.local` has a 10MB limit. Template storage should be fine but worth monitoring if we add draft history.
- The MutationObserver watches all of `document.body` which can be performance-sensitive. Keep the callback lightweight.

### No Build System
This is intentional. The extension is vanilla JS with no dependencies, no bundler, no transpiler. This keeps it simple, auditable, and fast. Don't add a build step unless there's a compelling reason.

## Where to Start

**If you're a new agent picking this up:**
1. Read this file first (you're doing that)
2. Check the GitHub issues for the current milestone priorities
3. The codebase is small — 6 JS files, ~600 lines total. Read all of them.
4. Test changes by loading the extension in Chrome Developer Mode
5. Follow the "Hard Rules" above — especially no AI features, no scheduling, stay free
