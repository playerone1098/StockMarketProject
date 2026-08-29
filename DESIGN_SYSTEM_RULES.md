# StockVista & JodhpurTraders — Modern Responsive Design System Rules

> **Core Philosophy**: Zero-Designer, Icon-Light, Text-First Responsive UI Architecture.
> Designed to enable engineers and AI assistants to build premium, modern, accessible, and responsive user interfaces without requiring visual designers, custom icon packages, or external graphic assets.

---

## 1. Core Principles

### 1. Text-First & Icon-Light (Zero-Designer Strategy)
- **Rely on Typography over Icons**: Replace complex SVG icons or heavy icon fonts with clear, action-oriented text labels, Unicode glyphs (`▲`, `▼`, `→`, `←`, `•`, `✓`, `✕`, `★`, `◆`), and structured text tags (e.g., `[BUY]`, `[SELL]`, `[EDIT]`, `[DELETE]`).
- **Text Buttons**: Use self-descriptive text buttons with subtle inline visual cues (e.g. `View Chart →`, `Filter by Sector [▼]`, `← Back to Dashboard`).
- **Initials-Based Avatars**: Replace missing user/company logos with 2-letter uppercase text avatars (`RE` for Reliance, `TC` for TCS, `JD` for John Doe) styled with dual-tone text backgrounds.
- **Micro-Badges & Text Indicators**: Express status and trends using high-contrast pill badges and text tokens rather than graphical badges or custom artwork.

### 2. Modern Financial Aesthetic
- **Font Stack**: Primary body and UI headers use `Outfit` and `Inter` (sans-serif) for clean numerical and financial data rendering. Monospace font (`Courier New` / `Consolas`) for tickers, stock codes, and numerical tables.
- **Dark & Light Harmony**: Deep navy tones (`#0f1322` / `#1e253f`) paired with crisp white backgrounds, subtle border dividers (`border-gray-100`), and emerald accent highlights (`#10b981`).
- **Elevation & Card Depth**: Subtle shadows (`shadow-sm`, `hover:shadow-lg`) combined with smooth 0.2s–0.3s cubic-bezier transitions (`card-hover`).

### 3. Universal Mobile & Desktop Responsiveness
- **Mobile-First Layout**: Grid layouts scale seamlessly across breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- **Touch-Friendly Hit Targets**: Interactive elements (buttons, form fields, text tabs) MUST have a minimum height/touch-target of `44px` (`py-2.5 px-4`) on mobile devices.
- **Horizontal Overflow Guards**: Tables, stock lists, and market tickers MUST use `overflow-x-auto` with touch momentum scrolling (`-webkit-overflow-scrolling: touch`) to prevent horizontal screen breaking on mobile.

---

## 2. Design System Color Tokens & Utility Reference

### Palette Definitions (Tailwind CSS)

| Token Name | Hex Code | Purpose / Usage |
|---|---|---|
| `navy-950` | `#0f1322` | Dark background headers, main hero sections, dark mode cards |
| `navy-900` | `#1e253f` | Dark section containers, card hover states in dark mode |
| `navy-800` | `#293559` | Sub-headers, secondary dark text, borders |
| `navy-100` | `#e9edf5` | Light badge backgrounds, neutral card borders |
| `navy-50`  | `#f4f6fa` | Subtle section backgrounds, active tab background |
| `brand-600` | `#059669` | Primary green accent (positive change, buy action text) |
| `brand-500` | `#10b981` | Vibrant emerald green (buttons, badges, highlights) |
| `brand-50`  | `#f0fdf4` | Positive trend light badge background |
| `red-600`   | `#dc2626` | Negative change, sell action text, drop arrow `▼` |
| `red-50`    | `#fef2f2` | Negative trend light badge background |

---

## 3. Standardized Text Component Guidelines

### A. Text Buttons & Interactive Actions (Icon-Free)

1. **Primary Text Button (Solid Pill / Card)**
   ```jsx
   <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95 text-sm inline-flex items-center justify-center">
     Explore Market Data →
   </button>
   ```

2. **Secondary Outlined Text Button**
   ```jsx
   <button className="border border-navy-200 hover:border-navy-400 text-navy-800 font-medium px-4 py-2 rounded-xl bg-white hover:bg-navy-50 transition-all text-sm inline-flex items-center justify-center">
     Filter Results [All]
   </button>
   ```

3. **Inline Link Text Button (Card Action)**
   ```jsx
   <span className="text-xs font-bold text-brand-600 group-hover:text-brand-700 group-hover:underline inline-flex items-center gap-1">
     View Details →
   </span>
   ```

4. **Danger / Caution Text Button**
   ```jsx
   <button className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition border border-red-200">
     [Delete Post]
   </button>
   ```

---

### B. Initials-Based Avatars (Zero External Graphics Needed)

When company logos or user profile avatars are absent, use 2-character initials:

```jsx
export const TextAvatar = ({ text, size = "md" }) => {
  const initials = text ? text.trim().slice(0, 2).toUpperCase() : "ST";
  const sizeClasses = size === "sm" 
    ? "w-7 h-7 text-xs" 
    : size === "lg" 
    ? "w-12 h-12 text-base font-extrabold" 
    : "w-9 h-9 text-sm font-bold";

  return (
    <div className={`${sizeClasses} rounded-xl bg-navy-100 text-navy-900 border border-navy-200 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-colors duration-200 shrink-0`}>
      {initials}
    </div>
  );
};
```

---

### C. Text Badges & Financial Trend Pills

1. **Positive / Bullish Trend Badge**
   ```jsx
   <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
     ▲ +2.45%
   </span>
   ```

2. **Negative / Bearish Trend Badge**
   ```jsx
   <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
     ▼ -1.80%
   </span>
   ```

3. **Status Tag (Target / Recommendation / Event)**
   ```jsx
   <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-md bg-navy-100 text-navy-800 border border-navy-200">
     [BUY CALL]
   </span>
   ```

---

### D. Responsive Mobile & Desktop Layout Rules

1. **Card Container Layout Standard**
   - Base Padding: `p-4 sm:p-6`
   - Border & Rounded Corners: `rounded-2xl border border-gray-100 bg-white shadow-sm`
   - Hover Effect: `hover:shadow-md hover:border-brand-300 transition-all duration-200`

2. **Responsive Grid Layout Pattern**
   ```jsx
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
     {/* Cards rendered here */}
   </div>
   ```

3. **Mobile-Friendly Horizontal Overflow Wrapper (Tables & Data Lists)**
   ```jsx
   <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
     <table className="w-full text-left min-w-[600px] border-collapse">
       {/* Table content */}
     </table>
   </div>
   ```

4. **Mobile Text Navigation Bar (Iconless Menu Toggle)**
   ```jsx
   <button 
     onClick={toggleMenu}
     className="sm:hidden px-3 py-1.5 rounded-lg border border-navy-200 text-navy-800 font-bold text-xs bg-navy-50 hover:bg-navy-100"
   >
     {isOpen ? '[CLOSE MENU ✕]' : '[MENU ☰]'}
   </button>
   ```

---

## 4. Text-Glyph Dictionary for Developer & AI Use

Instead of searching for or loading icon libraries (`lucide-react`, `font-awesome`, `react-icons`), developers and AI assistants must use native text glyphs:

| Category | Text Glyph | Usage |
|---|---|---|
| Price Trend Up | `▲` | Positive day change, bullish targets |
| Price Trend Down | `▼` | Negative day change, bearish targets |
| Navigation Next | `→` | Card action link, submit button, next page |
| Navigation Prev | `←` | Back link, previous page |
| External Link | `↗` | Open external source, news URL |
| Expand Dropdown | `[▼]` or `▼` | Dropdown trigger indicator |
| Collapse Dropdown| `[▲]` or `▲` | Dropdown close indicator |
| Filter / Options | `[FILTER]` | Section filter trigger |
| Bullet / Divider | `•` | Inline text separator |
| Check / Success | `✓` | Form verification, success alert |
| Close / Cancel | `✕` | Close modal, clear search input |
| Star / Highlight | `★` | Featured item, bookmark badge |
| Diamond / Status | `◆` | Indicator dot, sector tag |

---

## 5. Mobile & Desktop Responsive Testing Checklist

When creating any page or component, verify:
- [ ] **No horizontal overflow** on 320px–414px screen widths (mobile).
- [ ] **Touch targets** are at least 44px height for touch inputs and text buttons on mobile.
- [ ] **Font legibility**: Primary body text is minimum 14px (`text-sm`) on mobile, secondary captions minimum 11px–12px (`text-xs`).
- [ ] **No icon dependency**: Component renders 100% cleanly without external icon font files or SVG icon libraries.
- [ ] **Text button state clarity**: Text buttons have distinct hover, focus, and active states (`hover:bg-*`, `active:scale-95`).
- [ ] **High contrast accessibility**: All text badges and text buttons exceed WCAG AA contrast standards over light/dark backgrounds.

---

## 6. Light & Dark Mode Architecture & Rules

### Core Rules for Dual Theme Support
1. **Class-Based Theme Control**:
   - Both the public website (`frontend`) and the admin panel (`admin`) MUST use Tailwind CSS class-based dark mode (`darkMode: 'class'`).
   - The active theme state (`'light'` or `'dark'`) MUST be applied as a `dark` class on the `<html>` root document element (`document.documentElement.classList.add('dark')` / `classList.remove('dark')`).

2. **Persistent User Preference**:
   - Theme selection MUST be persisted in `localStorage` under key `'theme'` (values: `'dark'` | `'light'`).
   - Default theme: `'dark'` (or fallback matching system preference `window.matchMedia('(prefers-color-scheme: dark)').matches`).

3. **Text-First Theme Toggle UI**:
   - Following our Zero-Designer, Icon-Light philosophy, theme toggles MUST use clear text indicators with Unicode glyphs:
     - `[DARK 🌙]` / `[LIGHT ☀️]` or `[THEME: LIGHT ☀️]` / `[THEME: DARK 🌙]`.
   - Theme toggles must be easily accessible in the main navigation headers, user profile dropdowns, sidebars, and Account Settings pages.

4. **Dual Theme Color Mapping Standards**:
   - Every background, surface card, text element, and border MUST specify both Light and Dark mode classes:
     - **Main Outer Background**: `bg-slate-50 dark:bg-navy-950` (website) / `bg-gray-100 dark:bg-zinc-950` (admin)
     - **Primary Card Containers**: `bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800` (website) / `bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800` (admin)
     - **Secondary / Sub Cards**: `bg-slate-100/70 dark:bg-navy-950/60 border-slate-200 dark:border-navy-800`
     - **Primary Headings**: `text-slate-900 dark:text-white`
     - **Secondary Body Text**: `text-slate-600 dark:text-gray-300`
     - **Muted Subtext & Captions**: `text-slate-500 dark:text-gray-400`
     - **Interactive Controls (Inputs, Selects)**: `bg-white dark:bg-navy-950 text-slate-900 dark:text-white border-slate-300 dark:border-navy-800 focus:border-brand-500`
     - **Hover & Active States**: `hover:bg-slate-100 dark:hover:bg-navy-800`
     - **Financial Badges**: Bullish (`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30`), Bearish (`bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30`).

