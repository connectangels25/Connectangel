# date:- 13/07/2026
# Changelog

## Auth & Login

- **Navbar flash on login** — Navbar was showing Sign In/Sign Up buttons for 2-3 seconds after login before profile appeared. Added `loading` state check from `useAuth()` so auth-dependent UI is hidden until session is resolved.

- **Google login redirect loop for unregistered users** — Unregistered Google accounts were bounced home → login → signup. Added `isRedirectingRef` flag to prevent React state updates during redirect, and redirects to `/signup?error=not_registered` with a toast: "This Google account is not registered. Please sign up first."

- **OAuth page flash** — During Google OAuth verification, the home page flashed briefly. Added a full-screen animated loading overlay in `AuthProvider` that covers the entire app during auth state loading (z-9999).

- **"Remember me" text** — Changed "Keep me logged in for 30 days" to "Remember me" on the login page.

- **Button label** — Changed "Sign In to Dashboard" to "Sign In".

## Admin Dashboard

- **Latest 5 users with Show More** — Admin dashboard now shows only the 5 most recent users in the User Management widget. Added a "Show all X users" button that navigates to `/usermanagement`.

- **Actions column hidden on dashboard** — The actions column (View Profile, Delete, MoreVertical) is hidden when `limitLatest` prop is set, so the dashboard preview shows a cleaner view.

## Pricing Page

- **Moved pricing content to /hide** — Original pricing page content moved from `/pricing` to `/hide`. New blank pricing page created at `/pricing` with skeleton layout (hero, toggle, three empty cards) ready to be filled.

## Responsiveness Fixes

### High Priority

- **EventDetails.tsx** — Banner image was `hidden md:block` (invisible on mobile). Changed to show on all screens with responsive height. Right sidebar with Quick Facts/Register button was `hidden lg:block`; now visible on all screens.

- **CreateEventPage.tsx** — Agenda grid had no responsive breakpoint (`grid-cols-[100px_1fr_1fr_40px]` on all sizes causing overflow). Added `grid-cols-1 sm:grid-cols-[100px_1fr_1fr_40px]`.

- **SignupPage.tsx** — Social buttons used `grid-cols-2` on all sizes, clipping text on small phones. Changed to `grid-cols-1 sm:grid-cols-2`.

- **ChatSidebar.tsx** — Fixed 320px width with no mobile handling. Changed to full-screen overlay on mobile with backdrop, responsive width on desktop.

### Medium Priority

- **EventsPage.tsx** — Added horizontal scrollable "Top Events" carousel on mobile (sidebar was hidden on mobile).

- **CreateEventPage.tsx** — Summary panel was `hidden lg:block`; now visible on all screens. Parent layout changed to `flex-col lg:flex-row` for proper stacking.

- **Navbar.tsx** — Search bar was `hidden lg:block` with no mobile alternative. Added search input in the mobile menu drawer.

- **AdminQuickActions.tsx** — `grid-cols-2` on all sizes. Changed to `grid-cols-1 sm:grid-cols-2`.

- **AdminUserManagement.tsx** — Reduced table column min-widths for better mobile fit.

- **AdminSidebar.tsx** — Mobile sidebar width adjusted from fixed w-64 to `w-[85vw] max-w-[280px]`.

- **Admin dashboard pages (mobile)** — Sidebar container was taking 256px (`w-64`) on all screen sizes, creating empty black space on the left and pushing content off-screen on mobile. Added `max-lg:w-0 max-lg:overflow-hidden max-lg:border-r-0` to the sidebar container on all 4 admin pages (`AdminDashboard`, `UserManagementDashboard`, `EventDashboard`, `PotentialPage`) so it collapses to zero width on mobile while content fills the full width.

- **EcosystemHero.tsx** — Floating badges used absolute positioning that overflowed viewport on mobile. Hidden on small screens.

- **ComingSoonChat.tsx** — Hardcoded `calc(100vh - 65px)` replaced with `flex-1` layout.

## Navigation & Login

- **Home button on admin login page** — Added a small "← Home" button at the top of the admin login page so you can easily go back to the main website without typing the URL.

- **Sign In / Sign Up buttons now light up** — When you're on the Sign In page, the "Sign In" button in the top bar will be highlighted, and when you're on the Sign Up page, the "Sign Up" button will be highlighted. This makes it easier to see which page you're currently on.

## Build Fixes

- **ChatSidebar.tsx fragment** — Fixed unclosed React fragment (`<>` without `</>`) that caused build failure.
