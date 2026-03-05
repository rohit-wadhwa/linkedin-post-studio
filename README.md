# LinkedIn Post Studio

> Write better LinkedIn posts directly inside LinkedIn.

A Chrome extension that enhances the LinkedIn post editor with formatting tools, reusable templates, and live preview features to help users write clean, structured, and engaging posts directly inside LinkedIn.

## Features

- **Inline Formatting** — Bold, italic, and bold-italic using Unicode characters that work natively on LinkedIn
- **Bullet Lists** — One-click bullet points, arrows, dashes, and check marks
- **Separators** — Line, dot, star, and wave dividers to structure your posts
- **Post Templates** — Save and reuse writing blocks for hooks, CTAs, hashtags, and post structures
- **Live Preview** — See how your post will look on desktop and mobile before publishing
- **Character & Word Counter** — Real-time stats while you write
- **Keyboard Shortcuts** — Ctrl+B for bold, Ctrl+I for italic
- **Template Import/Export** — Share templates as JSON files

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/linkedin-post-studio.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `extension` folder from this repository
6. Navigate to LinkedIn — the toolbar appears when you open the post editor

## Project Structure

```
linkedin-post-studio/
├── extension/
│   ├── manifest.json          # Chrome extension manifest (v3)
│   ├── content-script.js      # Detects LinkedIn editor, core formatting logic
│   ├── toolbar-ui.js          # Toolbar UI creation and interaction
│   ├── styles.css             # All extension styles
│   ├── background/
│   │   └── background.js      # Service worker for settings and messaging
│   ├── storage/
│   │   └── template-manager.js # Template CRUD with Chrome storage API
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI
│   │   ├── popup.css          # Popup styles
│   │   └── popup.js           # Popup interactions
│   └── assets/
│       └── icons/             # Extension icons (16, 48, 128px)
└── README.md
```

## How It Works

1. **Content script** detects when the LinkedIn post editor opens using a MutationObserver
2. **Toolbar** is injected above the editor with formatting buttons
3. **Unicode conversion** transforms selected text into bold/italic characters that LinkedIn renders natively
4. **Templates** are stored locally using the Chrome Storage API
5. **Preview panel** shows a real-time rendering of your post content

## Default Templates

The extension ships with starter templates:

| Template | Category |
|----------|----------|
| Hook: Question | Post Hooks |
| Hook: Surprising Stat | Post Hooks |
| CTA: Engagement | CTAs |
| CTA: Follow | CTAs |
| Hashtags: Tech | Hashtags |
| Hashtags: Career | Hashtags |
| Structure: Listicle | General |
| Structure: Story Post | General |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` / `Cmd+B` | Bold selected text |
| `Ctrl+I` / `Cmd+I` | Italicize selected text |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

Built to solve the frustration of writing formatted LinkedIn posts without external tools.
