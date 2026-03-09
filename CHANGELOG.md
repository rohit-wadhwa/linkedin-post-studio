# Changelog

All notable changes to LinkedIn Post Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.1] - 2026-03-09

### Fixed
- Italic formatting for letter 'h' — U+1D455 is unassigned in Unicode, now correctly maps to U+210E (Planck constant)
- Detection and reversion of italic 'h' works correctly in both directions

### Added
- 10 new test cases in Section 13 of QA harness covering the Unicode italic h gap

## [1.1.0] - 2026-03-09

### Fixed
- Bold/italic formatting can now be toggled OFF (was one-way only)
- Selection no longer expands to the entire line after formatting

### Added
- Format switching: click a different format to switch directly (e.g., bold to italic)
- Browser-based QA test harness with 54 automated tests
- Link/Unlink toolbar buttons
- Buy Me a Coffee button in extension popup
- Single-panel UX: template and preview panels are now mutually exclusive
- LinkedIn-style hashtag, link, and mention rendering in preview panel

### Changed
- Extracted `UNICODE_RANGES` as module-level constant for readability
- Improved toolbar injection for LinkedIn Shadow DOM migration
- Enhanced mobile overflow handling in preview panel

## [1.0.0] - 2026-03-05

### Added
- Inline formatting toolbar injected directly into LinkedIn's post editor
- Bold, italic, and bold-italic text formatting using Unicode characters
- Bullet list insertion (bullet, arrow, dash, check mark)
- Separator/divider insertion (line, dots, stars, wave)
- Template system with CRUD operations via Chrome Storage API
- 8 default templates (hooks, CTAs, hashtags, post structures)
- Live preview panel with desktop/mobile toggle
- Real-time character and word counter
- Keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)
- Template import/export as JSON files
- Extension popup with settings toggles and usage stats
- Background service worker for settings management
- Privacy policy, support docs, and Chrome Web Store assets
- GitHub Actions deploy workflow for Chrome Web Store publishing
- GitHub issue templates (bug report, feature request)
- GitHub Sponsors and Buy Me a Coffee funding configuration

### Developer
- Rohit Wadhwa (https://github.com/rohit-wadhwa)
