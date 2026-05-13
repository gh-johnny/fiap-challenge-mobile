# Ford App — UI Build TODO

## Stack decisions
- Expo Router ~6 + React Native 0.81
- Zustand v5 (in-memory state)
- expo-blur (liquid glass nav bar)
- Dark mode only, Ford brand colors
- No backend — all state in memory

## Ford brand palette
- Navy: `#003478`
- Blue: `#0142C0`
- White: `#FFFFFF`
- Surface: `#0A0F1E`
- Card: `#0D1526`
- Muted: `#6B7A9A`

## Screens & components

### Foundation
- [x] Install zustand + expo-blur + react-native-svg
- [x] Create TODO.md
- [x] Update `constants/theme.ts` with Ford palette
- [x] Create `store/auth.ts` (Zustand — user, vehicle, isAuthenticated, hasOnboarded)
- [x] Create `components/ford-logo.tsx` (SVG oval logo)
- [x] Update `app/_layout.tsx` — auth guard routing (auth → onboarding → tabs)

### Auth flow
- [x] `app/(auth)/_layout.tsx`
- [x] `app/(auth)/login.tsx` — email + password, Ford logo, dark navy bg
- [x] `app/(auth)/signup.tsx` — name + email + password

### Onboarding flow
- [x] `app/(onboarding)/_layout.tsx`
- [x] `app/(onboarding)/slides.tsx` — 3 full-screen parallax slides (Schedule / Track / Support)
- [x] `app/(onboarding)/vehicle-setup.tsx` — bottom sheet modal over car silhouette

### Tabs
- [x] `app/(tabs)/_layout.tsx` — custom liquid glass floating pill nav bar
- [x] `app/(tabs)/index.tsx` — home dashboard (user name + car info cards)
- [x] `app/(tabs)/my-car.tsx` — stub
- [x] `app/(tabs)/schedule.tsx` — stub
- [x] `app/(tabs)/ai-assistant.tsx` — stub

### Components
- [x] `components/liquid-glass-tab-bar.tsx` — frosted blur floating pill

## Visual upgrade (session 2)
- [x] Animated mesh gradient background (shared across all screens)
- [x] Car silhouette with floating parallax animation on login
- [x] Glassmorphic inputs with focus glow + haptic on focus
- [x] Gradient shimmer + spring press CTA button
- [x] Reanimated slide icons (calendar, radar, chat bubbles)
- [x] Animated dot pagination (width-interpolated)
- [x] 3D tilt vehicle card with gloss highlight (gesture-driven)
- [x] Full haptic choreography (selection, success, error)
- [x] Inter font loaded via @expo-google-fonts/inter
- [x] Entrance animations on all screens (fade + slide up)
- [x] Fixed expo-blur version (15.0.8 via npx expo install)

## Known gaps / next session
- [ ] Test on device — verify blur/mesh renders on Android
- [ ] Ford logo SVG paths are hand-drawn, may need polish
- [ ] Stub tabs (My Car, Schedule, AI) need real screens
- [ ] No persistence — state resets on app kill (by design, in-memory)
- [ ] Could replace slide-animation.tsx with real Lottie JSON from lottiefiles.com

## Session notes
- Started: 2026-05-06
- Auth guard: unauthenticated → (auth), authenticated + not onboarded → (onboarding), done → (tabs)
- Deleted old explore.tsx tab (was default Expo template)
