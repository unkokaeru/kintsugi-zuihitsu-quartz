# Comprehensive UI/UX Improvements for Kintsugi Zuihitsu

A unified plan to enhance usability, accessibility, and novelty across the site—embracing the kintsugi (golden repair) and zuihitsu (wandering essay) philosophy throughout. This includes 16 features spanning navigation, reading experience, mobile UX, visual polish, and novel interactive elements.

---

## Implementation Phases

| Phase | Features | Rationale |
|-------|----------|-----------|
| **1. Foundation** | Steps 1, 10, 15 | Fix core issues (dates), accessibility, and quick wins (print) |
| **2. Navigation** | Steps 3, 4, 5, 7 | Improve how users move through content |
| **3. Reading** | Steps 2, 6, 11 | Enhance the reading experience |
| **4. Index & Ambience** | Steps 12, 13 | Make the homepage memorable |
| **5. Novel Features** | Steps 8, 9, 14, 16 | Add distinctive, philosophy-aligned interactions |

---

## Phase 1: Foundation

### 1. Fix Git-Based Date Display

**Goal:** Ensure `lastmod.ts` correctly extracts git commit dates. Modify `ContentMeta.tsx` to display the last commit date and time (not just date), with graceful fallback for untracked files.

**Files to modify:**
- `quartz/plugins/transformers/lastmod.ts`
- `quartz/components/ContentMeta.tsx`
- `quartz/components/Date.tsx`

**Details:**
- Show both date and time of last commit
- Add graceful fallback UI for untracked files
- Avoid showing "Invalid Date" or generic placeholder

---

### 10. Accessibility Pass

**Goal:** Ensure the site is accessible to all users including those using keyboards, screen readers, and those with motion sensitivity.

**Files to modify:**
- `quartz/components/Header.tsx` — Add skip-to-content link
- `quartz/styles/base.scss` — Add visible focus rings
- `quartz/styles/custom.scss` — Add `@media (prefers-reduced-motion)` rules
- Various components — Add ARIA labels on interactive elements

**Details:**
- Skip-to-content link at the top of every page
- Visible focus indicators for keyboard navigation
- Disable Sunlit and progress bar animations when user prefers reduced motion
- ARIA labels on all interactive elements (search, theme toggle, reader mode, explorer)

---

### 15. Add Print Stylesheet and Print Button

**Goal:** Allow users to print articles cleanly with a dedicated button.

**Files to create/modify:**
- `quartz/styles/print.scss` — New print stylesheet
- `quartz/components/PrintButton.tsx` — New component
- `quartz/components/index.ts` — Export new component
- `quartz.layout.ts` — Add print button to layout

**Details:**
- Hide navigation, sidebars, and interactive elements in print
- Adjust typography for paper (serif, appropriate sizes)
- Proper page breaks (avoid breaking inside code blocks, images)
- Print icon button near article title that triggers `window.print()`

---

## Phase 2: Navigation

### 3. Enhance Table of Contents with Active Section Highlighting

**Goal:** Highlight the currently visible heading in the ToC as users scroll.

**Files to modify:**
- `quartz/components/TableOfContents.tsx`
- `quartz/components/scripts/toc.inline.ts`
- `quartz/components/styles/toc.scss`

**Details:**
- Use `IntersectionObserver` to detect which heading is in view
- Smooth transitions when active section changes
- Visual indicator (background highlight, bold, or left border) for active item

---

### 4. Add Global Keyboard Navigation

**Goal:** Power users can navigate the site entirely with keyboard shortcuts.

**Files to create/modify:**
- `quartz/components/scripts/keyboard.inline.ts` — New script
- `quartz/components/KeyboardHelp.tsx` — New help modal component
- `quartz/components/index.ts` — Export new component

**Shortcuts to implement:**
| Key | Action |
|-----|--------|
| `j` / `k` | Navigate to next/previous section |
| `g` then `h` | Go home |
| `g` then `t` | Focus Table of Contents |
| `/` | Focus search |
| `r` | Toggle reader mode |
| `?` | Show help modal |

---

### 5. Implement Local Bookmarks/Favorites

**Goal:** Users can star pages for quick access, persisted in localStorage.

**Files to create/modify:**
- `quartz/components/Favorites.tsx` — New component
- `quartz/components/scripts/favorites.inline.ts` — New script
- `quartz/components/styles/favorites.scss` — New styles
- `quartz/components/index.ts` — Export new component
- `quartz.layout.ts` — Add to layout

**Details:**
- Star icon on each page (filled when favorited)
- Favorites panel/overlay showing all starred notes
- Could integrate into Explorer as a collapsible section
- Data stored in localStorage

---

### 7. Add Mobile Bottom Navigation Bar

**Goal:** Thumb-friendly navigation on mobile devices.

**Files to create/modify:**
- `quartz/components/MobileNav.tsx` — New component
- `quartz/components/styles/mobilenav.scss` — New styles
- `quartz/components/index.ts` — Export new component
- `quartz.layout.ts` — Add to layout

**Details:**
- Fixed bottom bar, visible only at ≤800px viewport width
- Icons for: Search, Explorer toggle, Theme toggle, Reader mode, Favorites
- Subtle blur/glass effect matching site aesthetic
- Proper safe-area-inset handling for notched phones

---

## Phase 3: Reading

### 2. Add Reading Progress Indicator

**Goal:** Show reading progress as a golden bar at the top of the viewport.

**Files to create/modify:**
- `quartz/components/ProgressBar.tsx` — New component
- `quartz/components/scripts/progressbar.inline.ts` — New script
- `quartz/components/styles/progressbar.scss` — New styles
- `quartz/components/index.ts` — Export new component
- `quartz.layout.ts` — Add to layout

**Details:**
- Thin bar (2-3px) at viewport top
- Golden/sage color matching kintsugi theme
- Fills left-to-right as user scrolls through article
- Respects `prefers-reduced-motion` (no animation, instant updates)

---

### 6. Extend ReaderMode with Typography Controls

**Goal:** Let users customize their reading experience.

**Files to modify:**
- `quartz/components/ReaderMode.tsx`
- `quartz/components/scripts/readermode.inline.ts`
- `quartz/components/styles/readermode.scss`

**Controls to add:**
| Control | Options |
|---------|---------|
| Font size | Small / Medium / Large (3 steps) |
| Line width | Narrow / Medium / Wide |
| Background | Default / Sepia / Warm paper |

**Details:**
- Popover panel triggered from reader mode button
- All settings persisted in localStorage
- CSS custom properties for easy theming

---

### 11. Add Service Worker for Offline Reading

**Goal:** Previously visited pages work offline.

**Files to create/modify:**
- `quartz/static/sw.js` — New service worker
- `quartz/components/Head.tsx` — Register service worker
- `quartz/components/scripts/offline.inline.ts` — Optional offline indicator

**Details:**
- Cache-first strategy for static assets (CSS, JS, fonts)
- Network-first for content (HTML) with cache fallback
- Cache `contentIndex.json` for offline search
- Subtle "offline available" indicator (optional)

---

## Phase 4: Index & Ambience

### 12. Create Unique Index Page Styling

**Goal:** Make the homepage visually distinct and memorable.

**Files to modify:**
- `content/index.md` — Add `cssclasses: index-page` frontmatter
- `quartz/styles/custom.scss` — Add index-specific styles

**Styling ideas:**
- Full-width hero section with the kintsugi SVG
- Animated SVG entrance (subtle fade/scale)
- Larger welcome typography
- Different layout (centered content, less sidebar emphasis)
- "Enter the garden" call-to-action

---

### 13. Add Time-Aware Index Ambience

**Goal:** The index page feels alive, changing with the time of day.

**Files to modify:**
- `quartz/components/Sunlit.tsx`
- `quartz/components/scripts/sunlit.inline.ts`
- `quartz/components/styles/sunlit.scss`

**Time periods:**
| Time | Ambience |
|------|----------|
| 5am - 9am | Soft dawn pastels, gentle warmth |
| 9am - 5pm | Bright daylight, clear visibility |
| 5pm - 8pm | Golden hour, warm amber tones |
| 8pm - 5am | Dusky purples, cool night tones |

**Details:**
- Only active on index page (check slug)
- Uses `new Date().getHours()` to determine period
- Reuses existing sunrise/sunset keyframe infrastructure
- Subtle enough not to distract, noticeable enough to delight

---

## Phase 5: Novel Features

### 8. Enhance Graph with Tag Filtering and Golden Thread Styling

**Goal:** Make the graph more useful and visually aligned with kintsugi philosophy.

**Files to modify:**
- `quartz/components/Graph.tsx`
- `quartz/components/scripts/graph.inline.ts`
- `quartz/components/styles/graph.scss`

**Features:**
- Tag filter dropdown to show only notes with specific tags
- Folder clustering option
- Visited nodes connected by golden threads (not gray lines)
- "Repaired cracks" visual metaphor for navigation paths

---

### 9. Add "Golden Thread" Path Animation

**Goal:** When clicking a link to another note, animate a golden line on the graph tracing the journey.

**Files to modify:**
- `quartz/components/scripts/graph.inline.ts`
- `quartz/components/styles/graph.scss`

**Details:**
- Detect navigation between linked notes
- Animate a golden line from source node to destination node
- Line persists briefly then fades
- Uses existing D3/PixiJS infrastructure
- Path history builds up during a session (showing the "thread" of exploration)

---

### 14. Implement "Zuihitsu Flow" Navigation

**Goal:** Guide readers to related content in the spirit of wandering essays.

**Files to create/modify:**
- `quartz/components/NextRead.tsx` — New component
- `quartz/components/scripts/nextread.inline.ts` — New script
- `quartz/components/styles/nextread.scss` — New styles
- `quartz/components/index.ts` — Export new component
- `quartz.layout.ts` — Add to afterBody

**Details:**
- Displayed at the end of articles (before Sunlit)
- Shows 2-3 related notes based on:
  - Shared tags
  - Backlinks
  - Same folder
- Prompt text: "The brush might flow to…" (随筆 reference)
- Elegant card-style links with hover preview

---

### 16. Add RSS Feed for Recent Changes

**Goal:** Readers can subscribe to updates via RSS.

**Files to modify:**
- `quartz/plugins/emitters/contentIndex.ts` or create new `rssFeed.ts`
- `quartz.config.ts` — Enable RSS emitter

**Details:**
- Generate RSS/Atom feed of recently modified notes
- Sort by modified date from git/frontmatter
- Include note excerpt in feed items
- Add RSS icon/link in footer or sidebar
- Standard feed URL: `/feed.xml` or `/rss.xml`

---

## Technical Notes

### Shared Infrastructure

- **Graph enhancements (8, 9)** share code—implement together using `graph.inline.ts` and PixiJS for smooth golden thread animations
- **Sunlit time awareness (13)** can reuse existing sunrise/sunset keyframes, triggered by `new Date().getHours()` instead of theme change
- **Service worker (11)** should use cache-first for static assets, network-first for content

### Code Style

- Follow existing TypeScript patterns in the codebase
- Use Preact for components (not React)
- SCSS for styles, following BEM-ish naming
- Inline scripts use the `*.inline.ts` pattern for client-side code
- SOLID principles: single responsibility per component, dependency injection via props

### Testing Checklist

For each feature, verify:
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Works on mobile (≤800px)
- [ ] Works on tablet (800-1200px)
- [ ] Works on desktop (≥1200px)
- [ ] Respects `prefers-reduced-motion`
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] No console errors
- [ ] SPA navigation works (cleanup handlers registered)

---

## File Structure After Implementation

```
quartz/components/
├── Favorites.tsx          # NEW
├── KeyboardHelp.tsx       # NEW
├── MobileNav.tsx          # NEW
├── NextRead.tsx           # NEW
├── PrintButton.tsx        # NEW
├── ProgressBar.tsx        # NEW
├── scripts/
│   ├── favorites.inline.ts    # NEW
│   ├── keyboard.inline.ts     # NEW
│   ├── nextread.inline.ts     # NEW
│   ├── offline.inline.ts      # NEW
│   ├── progressbar.inline.ts  # NEW
│   └── ... (existing)
├── styles/
│   ├── favorites.scss     # NEW
│   ├── mobilenav.scss     # NEW
│   ├── nextread.scss      # NEW
│   ├── print.scss         # NEW
│   ├── progressbar.scss   # NEW
│   └── ... (existing)
└── ... (existing)

quartz/static/
└── sw.js                  # NEW - Service worker
```

---

## Summary

This plan transforms Kintsugi Zuihitsu from a capable digital garden into a distinctive, accessible, and delightful reading experience. The golden thread metaphor weaves through multiple features (progress bar, graph connections, navigation paths), while practical improvements (keyboard shortcuts, offline support, print styles) make the site genuinely useful for serious readers and researchers.

The implementation follows the site's existing code patterns and philosophy, extending rather than replacing the thoughtful foundations already in place.
