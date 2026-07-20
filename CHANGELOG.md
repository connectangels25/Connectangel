# date:- 20/07/2026
# Changelog

## Admin Dashboard

- **Delete user now works reliably** — Fixed `delete-user` edge function: profile is now explicitly deleted before auth user (FK cascade wasn't triggering), `deleted_emails` uses `upsert` instead of `insert` to prevent duplicate key errors on retry, and email is only blocked after successful deletion.

## Auth & Login

- **Google avatar auto-sync** — When a user logs in with Google, their Google profile picture is automatically saved to the `profiles` table. Navbar, AdminSidebar, AdminNavbar, and EventDashboardNavbar now read `profile?.avatar_url` as the primary source for avatars.

- **Trial days from account creation** — Free trial remaining days now always calculated from `created_at` (join date) instead of `trial_started_at`. Both `AuthContext` and admin dashboard use `created_at` directly, so users who joined months ago correctly show "Expired" rather than "26d left".

- **Login redirect improved** — After sign-in, users now go to `/` instead of always `/pricing`. `PendingPlanGate` handles the redirect: new users without a plan get sent to pricing, returning users with a plan go straight to homepage. PricingPage also redirects users who already have a plan.

## Pricing Page

- **Removed model names** — Free plan card no longer shows a model name. Pro plan now shows "Pro Model – Advanced AI model for deeper insights" instead of the raw model name.

- **GST indicator** — Added "+ GST" after the price on the Pro plan card.

## UI/UX

- **Unified loading screen** — Created reusable `LoadingScreen` component with the custom ConnectAngel double-ring spinner + brand text. Applied to 10 loading states across the app (route guards, event details, admin sections, etc.). Fixed vertical centering with `flex-1` and `min-h-[400px]`.

# date:- 18/07/2026
# Changelog

## Subscription System Overhaul

- **Completely separate Free & Pro plans** — Free (26-day trial) and Pro (30-day subscription) are now independent systems. Free plan logic only checks `plan='free'` and `trial_started_at`, Pro logic only checks `plan='pro'` and `pro_started_at`. No cross-dependency for security.

- **Pro subscription tracking** — Added `pro_started_at` column to profiles. Clicking "Subscribe Now" records the timestamp and starts a 30-day countdown. Future payment integration can simply gate the `setPlan('pro')` call behind successful payment.

- **Pro days remaining in admin** — Admin User Management table now shows `Pro: Xd left` for Pro users (from `pro_started_at`) and a "Pro Expired" status badge when the 30 days are up.

- **Pricing page guard** — Pro users with an active subscription can no longer click the Subscribe button (shows "Already Active", disabled). Once Pro expires, the button changes to "Reactivate Pro". Free trial button also disabled for active Pro users.

- **Backfill for existing Pro users** — Migration sets `pro_started_at = NOW()` for all existing Pro users who had `NULL`, giving them a full 30 days from today.

- **Navbar badges** — Pro badge now shows remaining days (`Pro: Xd left`). Free trial badge and Pro badge display independently without interfering.

- **Expired overlay** — Full-screen expiry overlay now only triggers for free trial expiry. Pro expiry is handled separately.

- **Potential page** — Blocks access for both expired free AND expired Pro users, showing the upgrade prompt.

- **Pending plan gate** — New users must explicitly start a trial or subscribe before accessing the app (redirected to `/pricing`).

---

# date:- 16/07/2026

## Pricing & Subscription

- **Pro badge in Navbar** — Pro members now see a blue "Pro" badge with a crown icon in the top navigation bar (both desktop and mobile). Previously, paying users were still shown the free trial countdown message instead of a Pro badge.

- **Trial days from registration date** — The 26-day free trial now starts counting from the day the user created their account, not from when they clicked the "Try Free" button on the pricing page. This also shows correct remaining days in the admin dashboard.

- **Trial banner no longer shows for Pro users** — Fixed a bug where Pro subscribers were still seeing the "Free trial: X days left" message in the navbar. Now they only see their Pro badge.

- **New users no longer forced to pricing page** — New users can now access the app immediately after signing up without being forced to visit the pricing page first.

## Admin Dashboard

- **Free Deactivated badge for expired users** — Admin panel now shows "Free Deactivated" (in amber with a ban icon) for free users whose 26-day trial has ended, instead of incorrectly showing them as "Free Active".

## Expired Plan

- **Full-screen notice when trial expires** — When a free user's trial ends, a full-screen overlay appears on every page load (including right after login) with a crown icon and two options: "Upgrade to Pro" or "Continue with limited access".

- **Potential page locked with upgrade option** — Expired users who try to visit the Potential page now see a clear message saying their plan has expired along with an "Upgrade to Pro" button, instead of being silently sent back to the home page.

- **Login/Signup pages hidden from logged-in users** — Users who are already logged in can no longer access the login, signup, or admin login pages. If they try, they are automatically redirected to the home page.

## UI/UX

- **Loading screen theme fix** — Fixed the loading screen so it correctly shows the user's selected dark or light theme right from the start, instead of briefly flashing the wrong theme.

- **Password show/hide toggle** — Added an eye icon to all password fields so users can easily show or hide their password while typing (login, signup, admin login, and admin change credentials pages).

## Bug Fixes

- **Admin user deletion now works** — Fixed an error that occurred when admins tried to delete a user from the admin panel. The delete function was referencing a database table by the wrong name. Also improved the error messages so admins see the actual problem instead of a generic error.

- **Google sign-up now works correctly** — New users can now successfully create an account using Google sign-up. Existing users who try to sign up again with Google are told "This email is already registered. Please sign in instead." instead of being silently logged in.

---

# date:- 13/07/2026

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
