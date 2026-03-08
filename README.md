# LinkedIn Post Studio

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/lcdkgjcfpahnnkjkllicbfijiihdjgol?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome%20Web%20Store&color=4285F4)](https://chromewebstore.google.com/detail/linkedin-post-studio/lcdkgjcfpahnnkjkllicbfijiihdjgol)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/lcdkgjcfpahnnkjkllicbfijiihdjgol?style=for-the-badge&logo=googlechrome&logoColor=white&label=Users&color=34A853)](https://chromewebstore.google.com/detail/linkedin-post-studio/lcdkgjcfpahnnkjkllicbfijiihdjgol)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/lcdkgjcfpahnnkjkllicbfijiihdjgol?style=for-the-badge&logo=googlechrome&logoColor=white&label=Rating&color=FBBC05)](https://chromewebstore.google.com/detail/linkedin-post-studio/lcdkgjcfpahnnkjkllicbfijiihdjgol)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

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

### From Chrome Web Store (Recommended)

<a href="https://chromewebstore.google.com/detail/linkedin-post-studio/lcdkgjcfpahnnkjkllicbfijiihdjgol">
  <img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png" alt="Available in the Chrome Web Store" width="248" height="75">
</a>

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/rohit-wadhwa/linkedin-post-studio.git
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

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- Fork the project.
- Create your feature branch (`git checkout -b feature/AmazingFeature`).
- Commit your changes (`git commit -m 'Add some AmazingFeature'`).
- Push to the branch (`git push origin feature/AmazingFeature`).
- Open a Pull Request.

## Support

Found LinkedIn Post Studio useful? Consider [supporting further development](https://www.buymeacoffee.com/rohit.wadhwa).

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=rohit.wadhwa&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00)](https://www.buymeacoffee.com/rohit.wadhwa)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support or Contact

Having trouble with LinkedIn Post Studio? Check out our [GitHub Issues](https://github.com/rohit-wadhwa/linkedin-post-studio/issues) for documentation and support or contact us directly for help.

<a href="https://twitter.com/RohitWadhwa52" target="_blank"><img src="https://raw.githubusercontent.com/nakulbhati/nakulbhati/master/contain/tw.png" alt="Twitter" width="30"></a>
<a href="https://www.linkedin.com/in/rohit-wadhwa" target="_blank"><img src="https://raw.githubusercontent.com/nakulbhati/nakulbhati/master/contain/in.png" alt="LinkedIn" width="30"></a>
<a href="https://github.com/rohit-wadhwa" target="_blank"><img src="https://raw.githubusercontent.com/nakulbhati/nakulbhati/master/contain/git.png" alt="GitHub" width="30"></a>
<a href="https://about.me/rohit.wadhwa" target="_blank"><img src="https://raw.githubusercontent.com/nakulbhati/nakulbhati/master/contain/www.png" alt="Website" width="30"></a>

## Acknowledgments

Built to solve the frustration of writing formatted LinkedIn posts without external tools.

[![Github Hits](https://hits.sh/github.com/rohit-wadhwa/linkedin-post-studio.svg)](https://github.com/rohit-wadhwa/linkedin-post-studio/)

---

[![Available in the Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png)](https://chromewebstore.google.com/detail/linkedin-post-studio/lcdkgjcfpahnnkjkllicbfijiihdjgol)
