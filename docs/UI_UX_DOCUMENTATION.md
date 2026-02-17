# PEAL - UI/UX Documentation

**Project:** PEAL - Pride, Empowerment and Love  
**Platform:** Women Empowerment Web Application  
**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui

---

## 1. Project Overview

**PEAL** is a women empowerment platform that enables women to share their dreams and goals, find mentors, connect with supporters, post video content, request funding, and celebrate success stories.

### Target Users

- **Women** seeking mentorship, funding, and community support
- **Sponsors** looking to support and mentor women
- **Mentors** offering guidance and expertise

### Core Features

- Video feed with TikTok-style vertical scrolling
- Mentor matching system
- Funding/sponsorship requests
- Success story sharing
- User profiles with settings
- Multi-language support (English, Spanish, French, Portuguese)
- Dark/light theme support

---

## 2. Design System

### 2.1 Color Palette

The project uses a sophisticated rose-based color system with semantic tokens.

#### Brand Colors

| Color           | Hex                    | Usage                           |
| --------------- | ---------------------- | ------------------------------- |
| Primary         | `#f43f5e` (rose-500)   | CTAs, highlights, active states |
| Primary Hover   | `#e11d48` (rose-600)   | Button hover states             |
| Primary Light   | `#ffe4e6` (rose-100)   | Backgrounds, hover backgrounds  |
| Secondary       | `#f97316` (orange-500) | Gradients, accents              |
| Secondary Light | `#ffedd5` (orange-100) | Secondary backgrounds           |
| Accent          | `#ec4899` (pink-500)   | Decorative elements             |
| Accent Light    | `#fce7f3` (pink-100)   | Accent backgrounds              |

#### Semantic Colors (CSS Variables)

```css
/* Light Theme */
--background: 0 0% 100% --foreground: 240 10% 3.9% --card: 0 0% 100% --primary: 346 77% 49.8%
	--secondary: 0 0% 96.1% --muted: 240 4.8% 95.9% --accent: 240 4.8% 95.9% --destructive: 0 84.2%
	60.2% --border: 240 5.9% 90% --input: 240 5.9% 90% --ring: 346 77% 49.8% /* Dark Theme */
	--background: 240 10% 3.9% --foreground: 0 0% 98% --card: 240 10% 3.9% --primary: 346 77% 49.8%
	--secondary: 240 3.7% 15.9% --muted: 240 3.7% 15.9% --destructive: 0 62.8% 30.6% --border: 240
	3.7% 15.9%;
```

### 2.2 Typography

| Element    | Font  | Weight                  | Size             |
| ---------- | ----- | ----------------------- | ---------------- |
| Body       | Inter | 400 (regular)           | 1rem (16px)      |
| Headings   | Inter | 600-700 (semibold-bold) | 1.25rem - 2.5rem |
| Navigation | Inter | 500 (medium)            | 0.875rem - 1rem  |
| Labels     | Inter | 500 (medium)            | 0.875rem         |
| Small Text | Inter | 400                     | 0.75rem          |

**Font Implementation:**

```tsx
// app/layout.tsx
const inter = Inter({ subsets: ["latin"] })
<body className={`${inter.className} antialiased`}>
```

### 2.3 Spacing System

| Token       | Value  | Usage                |
| ----------- | ------ | -------------------- |
| `p-4`       | 1rem   | Mobile page padding  |
| `p-8`       | 2rem   | Desktop page padding |
| `p-6`       | 1.5rem | Card padding         |
| `space-y-6` | 1.5rem | Section gaps         |
| `gap-4`     | 1rem   | Grid gaps            |
| `gap-6`     | 1.5rem | Desktop grid gaps    |

### 2.4 Border Radius

| Element        | Radius  | Tailwind Class  |
| -------------- | ------- | --------------- |
| Cards          | 1.5rem  | `rounded-3xl`   |
| Buttons        | 1rem    | `rounded-2xl`   |
| Small elements | 0.75rem | `rounded-xl`    |
| Default        | 0.5rem  | `var(--radius)` |

### 2.5 Layout Container

```typescript
// tailwind.config.ts
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

---

## 3. Pages & Routes

| Route               | Page            | Description                                           |
| ------------------- | --------------- | ----------------------------------------------------- |
| `/`                 | Landing         | Redirects to dashboard                                |
| `/dashboard`        | Dashboard       | Main hub with welcome, goals, trending videos, events |
| `/feed`             | Video Feed      | Grid/vertical video content with search and filters   |
| `/mentor-match`     | Mentor Match    | Mentor discovery and connection                       |
| `/requests`         | Requests        | Funding requests with progress tracking               |
| `/success`          | Success Stories | Before/after showcases and impact metrics             |
| `/login`            | Login           | Email/password authentication                         |
| `/register`         | Register        | 3-step registration form                              |
| `/onboarding`       | Onboarding      | User type selection and profile setup                 |
| `/profile/settings` | Settings        | Profile, notifications, privacy, preferences          |

---

## 4. Components

### 4.1 shadcn/ui Components

| Component    | File                              | Purpose               |
| ------------ | --------------------------------- | --------------------- |
| Button       | `components/ui/button.tsx`        | Primary actions       |
| Card         | `components/ui/card.tsx`          | Content containers    |
| Dialog       | `components/ui/dialog.tsx`        | Modal overlays        |
| Input        | `components/ui/input.tsx`         | Text input fields     |
| Textarea     | `components/ui/textarea.tsx`      | Multi-line text       |
| Label        | `components/ui/label.tsx`         | Form labels           |
| Select       | `components/ui/select.tsx`        | Dropdown menus        |
| Switch       | `components/ui/switch.tsx`        | Toggle controls       |
| Checkbox     | `components/ui/checkbox.tsx`      | Boolean selections    |
| Avatar       | `components/ui/avatar.tsx`        | User images           |
| Badge        | `components/ui/badge.tsx`         | Tags and labels       |
| Progress     | `components/ui/progress.tsx`      | Progress bars         |
| Separator    | `components/ui/separator.tsx`     | Section dividers      |
| ScrollArea   | `components/ui/scroll-area.tsx`   | Scrollable containers |
| Skeleton     | `components/ui/skeleton.tsx`      | Loading placeholders  |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | Dropdown menus        |
| Slider       | `components/ui/slider.tsx`        | Range controls        |

### 4.2 Custom Components

#### AdaptiveNavigation

- **Desktop:** Fixed left sidebar (w-72) with user profile, navigation, quick actions
- **Mobile:** Top header + bottom navigation dock (macOS-style)
- **Breakpoint:** `lg` (1024px)

```tsx
// Desktop sidebar structure
<aside className="w-72 fixed left-0 top-0 h-screen">
  - Logo + Brand
  - User Profile Card
  - Navigation Items (Home, Feed, Mentors, Requests, Success)
  - Quick Actions (Create Request, Share Video, Messages)
  - Settings + Theme Toggle
</aside>

// Mobile bottom dock
<nav className="fixed bottom-0 w-full h-16 bg-white/80 dark:bg-gray-900/80">
  - Home, Feed, Mentors, Requests, Success icons
</nav>
```

#### VideoModal

- Full-screen dialog for video playback
- Contains: video player, author info, title, description, actions
- Category badges with dynamic colors

#### VideoFeedGrid

- Responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Lazy loading: 4 videos initially, adds 4 more progressively

#### VideoFeedVertical

- TikTok-style full-screen vertical scrolling
- Scroll snap: `scroll-snap-type: y mandatory`
- Mobile-optimized touch handling

#### VideoPlayer

- HTML5 video with autoplay
- Custom controls overlay
- Poster image support

#### VideoThumbnail

- Thumbnail image with gradient overlay
- Play button on hover
- Category-based gradient backgrounds

#### NotificationCenter

- Dropdown with notification list
- Filter tabs: All, Likes, Comments, Follows, Reactions
- Unread badges (99+ max)
- Mark as read/delete actions

#### ThemeToggle

- Icon button (sun/moon)
- Persists to localStorage
- Key: `peal-ui-theme`

### 4.3 Reusable Patterns

#### Card Styling

```tsx
bg-white/80 dark:bg-gray-900/80
backdrop-blur-xl
rounded-3xl
border border-rose-100 dark:border-gray-700
shadow-sm
transition-colors duration-300
```

#### Button Variants

- **Primary:** `bg-gradient-to-r from-rose-500 to-orange-500 text-white`
- **Secondary:** `border-rose-200 hover:bg-rose-50`
- **Ghost:** `hover:bg-rose-50 dark:hover:bg-gray-800`

#### Active Navigation Item

```tsx
bg-gradient-to-r from-rose-500 to-orange-500
text-white
shadow-lg shadow-rose-200 dark:shadow-rose-800
```

---

## 5. Navigation

### 5.1 Navigation Structure

#### Desktop Sidebar (w-72)

```
- PEAL Logo + Brand Name
- User Profile Card
  - Avatar
  - Name
  - Role (Woman/Sponsor)
  - Skills (max 3)
- Navigation:
  - 🏠 Home (/dashboard)
  - 📹 Feed (/feed)
  - 👥 Mentors (/mentor-match)
  - 💝 Requests (/requests)
  - 🌟 Success (/success)
- Quick Actions:
  - + Create Request
  - 📤 Share Video
  - 💬 Messages
- Footer:
  - ⚙️ Settings
  - 🌙 Theme Toggle
```

#### Mobile Layout

- **Top Header:** Logo, search, notifications, theme, profile
- **Bottom Dock:** 5 navigation items with icons and labels

### 5.2 Active State Detection

```typescript
// lib/utils/navigation.ts
isActiveRoute(pathname: string, href: string): boolean
// Returns true if pathname === href or pathname.startsWith(href + "/")
```

---

## 6. UI/UX Patterns

### 6.1 Video Feed Behavior

#### Grid View

- Responsive columns (1-4 based on viewport)
- Lazy loading: 4 videos initially, adds 4 more every second
- Gradual reveal animation

#### Vertical (Reels) View

- TikTok-style full-screen vertical scroll
- Scroll snap to each video
- Mobile-optimized touch handling
- Filter overlay in mobile view

#### Video Interactions

- Like button with heart animation
- Share functionality
- Comment modal
- Category filtering
- Search by title/tags

### 6.2 Modals/Dialogs

- **Video Modal:** Full-screen on mobile, max-w-4xl on desktop, 90vh height
- **Radix UI Dialog** primitive with:
  - Smooth animations (fade, zoom)
  - Focus trap
  - Escape to close
  - Backdrop click to close

### 6.3 Forms

#### Login

- Email + password fields
- Social login buttons (Google, Facebook)
- "Forgot password" link
- Link to register page

#### Register (3-Step)

1. Email/phone + social login options
2. Personal details (name, location, skills/goals based on user type)
3. Bio + terms agreement

#### Onboarding (2-Step)

1. User type selection (Woman/Sponsor) with visual cards
2. Profile setup based on type

#### Settings

- Profile information with avatar upload
- Notification toggles (switches)
- Privacy controls (visibility dropdown)
- Theme/language/timezone selectors

### 6.4 Notifications

#### Toast Notifications (sonner)

- Success/error/info variants
- Auto-dismiss
- Position: bottom-right

#### Notification Center

- Dropdown from bell icon
- Real-time simulation (10% chance every 30 seconds)
- Types: like, comment, follow, reaction, mention, video_upload, achievement
- Color-coded icons
- Unread badge count (99+ max)
- Filter by type

### 6.5 Animations & Transitions

#### Global Transitions

```css
* {
	transition:
		background-color 0.3s ease,
		border-color 0.3s ease,
		color 0.2s ease;
}
```

#### Video Hover Effect

```css
video:hover {
	transform: scale(1.02);
}
```

#### Video Overlay

```css
.video-overlay {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}
.video-overlay.hidden {
	opacity: 0;
	transform: translateY(10px);
}
```

#### Loading Skeleton

```css
.video-loading {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}
```

#### Heart Animation (Double-Tap Like)

```css
@keyframes heartPop {
	0% {
		transform: scale(0) rotate(-45deg);
		opacity: 0;
	}
	50% {
		transform: scale(1.2) rotate(-45deg);
		opacity: 1;
	}
	100% {
		transform: scale(0) rotate(-45deg);
		opacity: 0;
	}
}
.heart-animation {
	animation: heartPop 0.8s ease-out;
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

| Breakpoint | Width   | Layout Changes                   |
| ---------- | ------- | -------------------------------- |
| Default    | < 640px | Mobile navigation, single column |
| sm         | 640px   | 2-column grids                   |
| md         | 768px   | -                                |
| lg         | 1024px  | Desktop sidebar, 3-column grids  |
| xl         | 1280px  | 4-column grids                   |
| 2xl        | 1400px  | Max container (1400px)           |

### 7.2 Mobile Optimizations

```css
/* Touch optimization */
.mobile-video-transition {
	transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-action-button {
	min-height: 44px;
	min-width: 44px;
}

/* Prevent zoom on double tap */
.video-container {
	touch-action: manipulation;
}

/* iOS bounce scroll prevention */
.prevent-bounce {
	overscroll-behavior: none;
	-webkit-overflow-scrolling: touch;
}
```

### 7.3 Mobile-Specific UI

- Bottom navigation dock (macOS-style)
- Larger touch targets (44px minimum)
- Search overlay for vertical feed
- Responsive text (hide labels on smallest screens)
- Hidden scrollbars with custom touch scrolling
- Pull-to-refresh animation support

---

## 8. Accessibility

### 8.1 Implemented Features

- **Semantic HTML:** Proper heading hierarchy, buttons, links, form labels
- **Keyboard Navigation:** Tab navigation through forms and menus
- **Focus States:** Visible focus rings on interactive elements
- **ARIA Support:** Screen reader text, proper form labels
- **Color Contrast:** Primary rose colors maintain sufficient contrast
- **Dark Mode:** Maintains readability in dark theme

### 8.2 Focus States

```css
.mobile-button:focus-visible {
	outline: 2px solid #fff;
	outline-offset: 2px;
}
```

### 8.3 Potential Improvements

- Add ARIA live regions for notifications
- Implement skip navigation links
- Add more comprehensive keyboard shortcuts
- Improve focus trapping in modals

---

## 9. Internationalization (i18n)

### 9.1 Supported Languages

| Language   | Code | Flag |
| ---------- | ---- | ---- |
| English    | en   | 🇺🇸   |
| Spanish    | es   | 🇪🇸   |
| French     | fr   | 🇫🇷   |
| Portuguese | pt   | 🇧🇷   |

### 9.2 Implementation

- `LanguageProvider` wraps the application
- `useLanguage` hook provides translations
- Translations stored in `lib/data/translations.ts`
- Dynamic language switching in settings
- Language preference persisted to localStorage

---

## 10. Theme System

### 10.1 Theme Provider

```tsx
// components/theme-provider.tsx
<ThemeProvider defaultTheme="light" storageKey="peal-ui-theme">
```

- Uses `next-themes`
- Supports: `light`, `dark`, `system`
- Default: `light`
- Storage key: `peal-ui-theme`

### 10.2 Dark Mode Adaptations

The project includes extensive dark mode overrides in `globals.css`:

- Gradient backgrounds → solid dark colors
- Glassmorphism → adjusted backdrop blur
- Text colors → light variants
- Hover states → subtle color tints

---

## 11. Data Structures

### 11.1 User Types

- **Woman:** Seeks mentorship, funding, support
- **Sponsor:** Provides funding and support

### 11.2 Content Types

- **Videos:** Title, description, category, tags, author, reactions
- **Requests:** Title, description, category, goal amount, current amount, supporters
- **Success Stories:** Title, before/after images, description, impact metrics
- **Mentors:** Name, skills, bio, availability, connection status

### 11.3 Notification Types

- `like` - Someone liked your video
- `comment` - Someone commented on your video
- `follow` - Someone followed you
- `reaction` - Someone reacted to your post
- `mention` - Someone mentioned you
- `video_upload` - New video from followed user
- `achievement` - Milestone reached

---

## 12. File Structure

```
peal/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── globals.css         # Global styles + CSS variables
│   ├── page.tsx            # Landing (redirects to dashboard)
│   ├── dashboard/         # Main dashboard
│   ├── feed/              # Video feed
│   ├── mentor-match/      # Mentor matching
│   ├── requests/          # Funding requests
│   ├── success/           # Success stories
│   ├── login/             # Authentication
│   ├── register/          # Registration
│   ├── onboarding/        # New user setup
│   └── profile/settings/  # User settings
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── adaptive-navigation.tsx
│   ├── video-modal.tsx
│   ├── video-feed-grid.tsx
│   ├── video-feed-vertical.tsx
│   ├── video-player.tsx
│   ├── video-thumbnail.tsx
│   ├── notification-center.tsx
│   ├── theme-toggle.tsx
│   └── ...
├── hooks/                  # Custom React hooks
├── lib/
│   ├── data/              # Mock data
│   ├── utils/             # Utility functions
│   │   ├── navigation.ts
│   │   └── video-thumbnail.ts
│   └── services/          # API services
├── tailwind.config.ts     # Tailwind configuration
├── postcss.config.mjs     # PostCSS configuration
└── components.json        # shadcn/ui configuration
```

---

## 13. Development Notes

### 13.1 Build Commands

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### 13.2 Dependencies

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TypeScript
- **Styling:** Tailwind CSS, tailwindcss-animate
- **Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Utilities:** class-variance-authority, clsx, tailwind-merge

---

## 14. Summary

PEAL is a well-structured women empowerment platform with:

- **Modern Design:** Glassmorphism, gradients, smooth transitions
- **Comprehensive Theming:** Light/dark/system support
- **Video-Centric:** TikTok-style feeds with custom players
- **Social Features:** Mentors, requests, success stories
- **Mobile-First:** Adaptive navigation, touch optimization
- **Accessible:** Keyboard navigation, focus states, semantic HTML
- **International:** 4 languages supported
- **Component Library:** shadcn/ui with custom extensions

The application follows Next.js best practices with the App Router, server components where possible, and client components for interactivity.
