# Ford Mobile — Vehicle Companion App

A premium React Native + Expo 54 vehicle companion app built for the Ford brand. Features biometric authentication, live sensor telemetry, service scheduling with calendar sync, AI-powered chat, emergency SOS, and a full glassmorphism design system.

---

## Integrantes

| Nome | RM |
|------|----|
| Matheus Riveira Montovaneli | 555499 |
| André Nakamatsu Rocha | 555004 |
| João Marcelo Furtado Romero | 555199 |

---

## Table of Contents

- [Product Overview](#product-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Screens & Features](#screens--features)
- [Design System](#design-system)
- [State Management](#state-management)
- [Services & Integrations](#services--integrations)
- [Sensors & Native APIs](#sensors--native-apis)
- [Testing](#testing)
- [Configuration](#configuration)

---

## Product Overview

Ford Mobile is a vehicle owner companion app. After authenticating and scanning their VIN, users get a unified dashboard to monitor their car's health, log trips, manage service appointments, and get AI-assisted support — all wrapped in a premium light-mode UI inspired by Apple's design language.

### Core Features

| Feature | Description |
|---------|-------------|
| **Biometric Auth** | Face ID / fingerprint login + re-lock on app background |
| **VIN Scanner** | Camera barcode reader with Ford WMI validation |
| **Live Telemetry** | Real-time simulated RPM, engine temp, fuel level, tire pressure |
| **Trip Logger** | Odometer-based trip recording with fuel consumption estimates and voice notes |
| **Service Scheduling** | Book appointments, sync to device calendar, receive push notifications |
| **AI Assistant** | Regex-matched canned answers with text-to-speech output (PT-BR) |
| **SOS / Assist Mode** | Shake + crash detection via accelerometer → emergency modal with location sharing |
| **Barometer Advisor** | Pressure-based weather and altitude alerts |
| **3D Vehicle Card** | Pan gesture + gyroscope parallax on home screen |
| **Glassmorphism UI** | BlurView surfaces, mesh gradient backgrounds, spring animations |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Platform** | Expo SDK 54 + React Native 0.81.5 |
| **Language** | TypeScript (strict mode, React 19.1.0) |
| **Navigation** | Expo Router v6 (file-based, typed routes) |
| **State** | Zustand v5 + `persist` middleware |
| **Storage** | `expo-secure-store` (auth) + AsyncStorage (non-sensitive) |
| **Animations** | React Native Reanimated 4 + Gesture Handler 2 |
| **Graphics** | `expo-blur`, `expo-linear-gradient`, `react-native-svg`, Skia |
| **Sensors** | `expo-sensors` (Accelerometer, Barometer, DeviceMotion, Gyroscope) |
| **Audio** | `expo-audio` (recording + playback) |
| **Notifications** | `expo-notifications` + `expo-background-task` |
| **Auth** | `expo-local-authentication` (Face ID / fingerprint) |
| **Camera** | `expo-camera` (barcode scanning) |
| **Calendar** | `expo-calendar` (device calendar integration) |
| **Location** | `expo-location` (GPS for SOS) |
| **Speech** | `expo-speech` (TTS for AI replies) |
| **Icons** | `@expo/vector-icons` + `expo-symbols` (SF Symbols on iOS) |
| **Typography** | `@expo-google-fonts/inter` (400, 600, 700, 800 weights) |
| **Architecture** | React 19 Compiler (automatic memoization) + New Architecture (enabled) |
| **Testing** | Jest + jest-expo preset |

---

## Architecture

```
ford/
├── app/                    # Expo Router screens (file-based routes)
│   ├── index.tsx           # Root route guard (auth redirect)
│   ├── _layout.tsx         # Root layout: fonts, biometric lock, notifications
│   ├── (auth)/             # Login + signup stack
│   ├── (onboarding)/       # Slides carousel + vehicle setup
│   └── (tabs)/             # Main tab navigation (4 tabs)
│
├── components/             # Reusable UI components
├── constants/              # Design tokens (theme.ts) + static data (dealers.ts)
├── hooks/                  # Sensor hooks + theme utilities
├── store/                  # Zustand stores (auth, trip, service, sos)
├── services/               # Business logic (chat, calendar, background reminders)
├── storage/                # Secure storage adapter for Zustand persist
├── utils/                  # Pure functions (VIN decoder, maps, service history)
└── __tests__/              # Jest test suite (24 files)
```

### Navigation Graph

```
app/index.tsx (route guard)
│
├── !isAuthenticated → (auth)/login
│                           └── signup
│
├── !hasOnboarded → (onboarding)/slides
│                           └── vehicle-setup
│
└── authenticated + onboarded → (tabs)
        ├── index          (Home dashboard)
        ├── my-car         (Telemetry + trips)
        ├── schedule       (Service booking)
        └── ai-assistant   (AI chat)
```

### Data Flow

```
Sensors (expo-sensors)
    → Custom hooks (useLiveTelemetry, useShakeDetector, …)
    → Screen components
    → Zustand stores (persist to AsyncStorage / SecureStore)
    → UI re-render via Reanimated shared values
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator (Android Studio)
- Physical device recommended for sensors (accelerometer, barometer, camera)

### Install

```bash
cd ford
npm install
```

### Run

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Expo Go (limited — sensors and biometrics may not work)
npx expo start
```

### Verify Dependencies

```bash
npx expo-doctor   # should show 18/18 checks passing
```

### Run Tests

```bash
npm test                    # all tests
npm test -- --coverage      # with coverage report
npm test -- --watch         # watch mode
```

---

## Project Structure

### `app/` — Screens

| File | Route | Purpose |
|------|-------|---------|
| `index.tsx` | `/` | Auth redirect guard |
| `_layout.tsx` | root | Fonts, biometric lock, notification setup |
| `(auth)/login.tsx` | `/login` | Email + password + biometric auth |
| `(auth)/signup.tsx` | `/signup` | Account creation |
| `(onboarding)/slides.tsx` | `/slides` | 3-slide parallax carousel |
| `(onboarding)/vehicle-setup.tsx` | `/vehicle-setup` | VIN scanner + vehicle form |
| `(tabs)/index.tsx` | `/` (tab) | Home dashboard |
| `(tabs)/my-car.tsx` | `/my-car` | Live telemetry + trip logger |
| `(tabs)/schedule.tsx` | `/schedule` | Service appointment management |
| `(tabs)/ai-assistant.tsx` | `/ai-assistant` | AI chat interface |

### `components/` — UI Components

| Component | Description |
|-----------|-------------|
| `animated-button.tsx` | Gradient CTA button with spring press (scale 0.97) and haptic |
| `animated-word.tsx` | Staggered word-by-word entrance animation |
| `ford-logo.tsx` | Ford oval SVG logo, color-switchable |
| `glass-input.tsx` | BlurView text input with animated focus glow ring |
| `liquid-glass-tab-bar.tsx` | Frosted glass bottom navigation bar with active blob indicator |
| `mesh-gradient.tsx` | 8-blob animated background with gyroscope parallax depth |
| `service-history-chart.tsx` | Monthly bar chart + service-type pie chart (react-native-svg) |
| `slide-illustrations.tsx` | SVG icons for onboarding slides |
| `sos-modal.tsx` | Emergency bottom sheet: Ford Assist call, emergency contact, GPS share |
| `trip-logger.tsx` | Odometer form, fuel selector, consumption calc, trip history chart |
| `vehicle-card-3d.tsx` | 3D card with pan gesture + gyro tilt + gloss highlight |
| `vin-scanner.tsx` | Camera barcode modal with 17-char VIN validation |
| `voice-note.tsx` | Audio recorder/player using expo-audio with animated pulse |

### `constants/`

| File | Contents |
|------|----------|
| `theme.ts` | Colors, Typography, Spacing, Radius, Springs, Blur scales |
| `dealers.ts` | 3 Ford São Paulo dealers (name, address, lat/lng, phone, hours) |

### `hooks/`

| Hook | Purpose | Sensor |
|------|---------|--------|
| `useLiveTelemetry` | Simulates RPM/temp/fuel/tire with realistic jitter | — |
| `useShakeDetector` | 3 peaks of 1.6g within 1s window → callback | Accelerometer |
| `useCrashDetector` | Net force > 4g → crash callback (10s cooldown) | Accelerometer |
| `useBarometerAdvisor` | Pressure thresholds → weather/altitude alerts | Barometer |
| `useGyroTilt` | Device orientation → spring-smoothed ±1 tilt values | DeviceMotion |
| `use-color-scheme` | System light/dark scheme (platform-split) | — |
| `use-theme-color` | Token-safe color picker for light/dark | — |

### `store/`

| Store | Persisted Fields | Storage |
|-------|-----------------|---------|
| `auth.ts` | `user`, `vehicle` | SecureStore |
| `service.ts` | `appointments` | AsyncStorage |
| `trip.ts` | `trips` | AsyncStorage |
| `sos.ts` | `emergencyContact` | AsyncStorage |

### `services/`

| Service | Description |
|---------|-------------|
| `chat.ts` | Regex-matched AI responses, 900ms + random jitter latency |
| `calendarService.ts` | Creates device calendar event 1h before appointment |
| `backgroundReminder.ts` | Background task (every 12h) sends notification for upcoming appointments |

### `utils/`

| Util | Description |
|------|-------------|
| `vin.ts` | 17-char VIN decoder: year extraction, Ford WMI detection, I/O/Q rejection |
| `maps.ts` | Google Maps deep link builder for dealer routing |
| `serviceHistory.ts` | Groups appointments by month and service type for chart data |

---

## Screens & Features

### Auth Flow

**Login (`app/(auth)/login.tsx`)**
- Glass inputs for email + password
- Biometric button (Face ID / fingerprint) — auto-hides if unsupported
- Animated entrance: header fades in, form slides up from 40px
- Haptic feedback on auth attempts
- Routes to onboarding if first time, else to home

**Signup (`app/(auth)/signup.tsx`)**
- Name + email + password
- Same glass input + animation patterns as login

---

### Onboarding Flow

**Slides (`app/(onboarding)/slides.tsx`)**
- 3 full-screen horizontal slides:
  1. **Schedule** — book your service appointments
  2. **Track** — monitor vehicle health and trips
  3. **Support** — AI assistant and emergency features
- Per-slide accent color, SVG illustration, AnimatedWords entrance
- Width-animated dot pagination
- Last slide reveals "Get Started" CTA

**Vehicle Setup (`app/(onboarding)/vehicle-setup.tsx`)**
- VIN scanner: opens camera, reads barcode, validates 17-char Ford VIN
- Manual form: car model, year, plate
- Saves to auth store → complete onboarding flag

---

### Home Dashboard (`app/(tabs)/index.tsx`)

```
┌─────────────────────────────┐
│ Ford logo     Greeting      │
│               Date          │
├─────────────────────────────┤
│  [Settings] [Profile] [Call]│
├─────────────────────────────┤
│     3D Vehicle Card         │
│  (pan + gyro + gloss)       │
├─────────────────────────────┤
│  Barometer Advisor Card     │
│  (pressure → weather alert) │
├─────────────────────────────┤
│  Assist Mode Toggle         │
│  (enables shake/crash det.) │
└─────────────────────────────┘
```

**SOS Flow**: Shake gesture → `useShakeDetector` → SOS modal appears
- Call Ford Assist (phone link)
- Call emergency contact
- Share current GPS location via Google Maps link
- `useCrashDetector` triggers same modal on impact > 4g

---

### My Car (`app/(tabs)/my-car.tsx`)

Biometric gate on entry (re-auth required).

**Live Telemetry Section**
- RPM gauge (animated bar, 0–8000 rpm)
- Engine temperature (animated bar, °C)
- Fuel level (% with color: green/yellow/red)
- Tire pressure (4 bars, PSI)
- Refreshes on 1-second interval via `useLiveTelemetry`

**Health Rings**
- Battery health %
- Brake health %
- AC health %
- Ring animations via Reanimated

**Trip Logger**
- Odometer input: km start + km end
- Fuel type picker: Gasoline / Ethanol / Flex
- Auto-calculates: distance (km) + consumption (L/100km)
  - Gasoline: 11.5 L/100km estimate
  - Ethanol: 13.2 L/100km estimate
  - Flex: 12.0 L/100km estimate
- Attach voice note (record/play/delete)
- Trip history: mini bar chart of last 10 trips by distance

---

### Schedule (`app/(tabs)/schedule.tsx`)

**Appointment List**
- Upcoming, completed, cancelled status with color coding
- Each entry: service type, date, time, dealer name
- Tap → detail modal

**Booking Form**
- Service type picker: Oil Change, Tire Rotation, Brake Inspection, General Check, Battery Check, AC Service
- Date picker + time picker
- Dealer selector (3 São Paulo locations)
- "Add to Calendar" button → creates device event 1h before with alarm
- "Set Reminder" button → schedules push notification (9am day-before)

**Service History Charts**
- Bar chart: monthly appointment count (last 6 months)
- Pie chart: breakdown by service type

**Dealer Routing**
- Each appointment shows dealer address
- Tap "Directions" → opens Google Maps with dealer coordinates

---

### AI Assistant (`app/(tabs)/ai-assistant.tsx`)

```
┌─────────────────────────────┐
│                             │
│    [Ford AI Avatar Circle]  │
│    [Equalizer bars]         │
│                             │
│  [Suggestion chips row]     │
├─────────────────────────────┤
│  Chat bubble (AI, glass)    │
│            Chat bubble (You)│
│  ...                        │
├─────────────────────────────┤
│  [Text input] [Send button] │
└─────────────────────────────┘
```

- Equalizer bar animation while AI is "speaking"
- Thinking dots animation during response delay
- Text-to-speech output via `expo-speech` (PT-BR voice)
- Suggestion chips: tap to auto-send predefined questions
- Canned responses for: warranty, oil changes, tire care, battery, brakes, fuel types, dealers
- 900ms base latency + random 500ms jitter (simulates network)

---

## Design System

The app uses a **light-mode glassmorphism** design system stored in `constants/theme.ts`.

### Color Palette

```typescript
Colors = {
  // Ford brand
  navy:       '#003478',   // Primary dark brand color
  blue:       '#0142C0',   // Accent / interactive elements
  blueLight:  '#3385FF',   // Secondary highlight

  // Surfaces (light mode)
  surface:    '#EEF2FF',   // App root background
  card:       '#FFFFFF',   // Elevated surface (cards)
  cardAlt:    '#F4F7FF',   // Alt elevated surface

  // Text
  white:      '#FFFFFF',   // Text on colored surfaces
  text:       '#0B1735',   // Primary text
  mutedLight: '#4A5E82',   // Secondary text
  muted:      '#7A8BAD',   // Tertiary text / labels

  // Utility
  border:     '#C8D5ED',
  danger:     '#E53935',
  success:    '#00C853',
}
```

### Typography

| Token | Size | Weight | Letter-Spacing | Line-Height | Usage |
|-------|------|--------|----------------|-------------|-------|
| `heading` | 28px | 700 | -0.5 | 34 | Screen titles |
| `subheading` | 18px | 600 | -0.3 | 24 | Section headers |
| `body` | 15px | 400 | 0 | 22 | Main content |
| `label` | 13px | 600 | +0.5 | 18 | Form labels |
| `caption` | 12px | 400 | +0.2 | 16 | Hints, small text |
| `micro` | 10px | 700 | +1.5 | 14 | Tags, badges, "FORD" |

### Spacing Scale

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `xxl` | 48px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 8px | Small chips |
| `md` | 12px | Inputs, chips, tags |
| `lg` | 20px | Cards, primary buttons |
| `xl` | 32px | Modals, bottom sheets, tab bar |
| `pill` | 100px | Badge pills |

### Spring Animation Presets

All interactive animations use spring physics. `withTiming` is reserved for fades and color transitions only.

| Preset | Config | Usage |
|--------|--------|-------|
| `snap` | `{ damping: 15, stiffness: 300 }` | Button press feedback |
| `bounce` | `{ damping: 12, stiffness: 180 }` | Elements entering screen |
| `soft` | `{ damping: 18, stiffness: 160 }` | Return to neutral position |
| `rigid` | `{ damping: 20, stiffness: 220 }` | 3D cards, heavy objects |

Standard button press pattern:
```typescript
// pressIn
scale.value = withSpring(0.97, Springs.snap)
// pressOut
scale.value = withSpring(1.0, Springs.soft)
```

### Blur Intensity Scale

| Level | iOS Intensity | Android Fallback |
|-------|--------------|-----------------|
| `light` | 20 | `rgba(238,242,255,0.80)` |
| `medium` | 40 | `rgba(238,242,255,0.90)` |
| `heavy` | 60 | `rgba(238,242,255,0.95)` |
| `opaque` | 80 | `rgba(238,242,255,0.98)` |

Usage guidelines:
- **Tab bar, modals, bottom sheets** → `heavy`
- **Cards, content surfaces** → `medium`
- **Inputs** → `medium`
- **Tooltips, chips** → `light`

### Glass Surface Composition

Layer order (bottom → top):

1. **Ambient glow** — `position: absolute` view with blue tint (`rgba(1,66,192,0.08)`)
2. **BlurView** — `overflow: 'hidden'`, platform-specific intensity
3. **Border** — `borderWidth: 1`, `borderColor: 'rgba(0,52,120,0.12)'`
4. **Content** — text, icons, etc.
5. **Focus glow ring** (inputs only) — `position: absolute`, `inset: -2`, animated opacity

---

## State Management

All stores use **Zustand v5** with `persist` middleware and custom storage adapters.

### Auth Store (`store/auth.ts`)

```typescript
interface State {
  user: { name: string; email: string } | null
  vehicle: { model: string; year: string; plate: string } | null
  isAuthenticated: boolean
  hasOnboarded: boolean
}
// Persisted: user + vehicle only (auth flags reset on app restart)
// Storage: expo-secure-store (encrypted)
```

### Service Store (`store/service.ts`)

```typescript
type ServiceType = 'Oil Change' | 'Tire Rotation' | 'Brake Inspection'
                 | 'General Check' | 'Battery Check' | 'AC Service'
type ServiceStatus = 'upcoming' | 'completed' | 'cancelled'

interface Appointment {
  id: string
  type: ServiceType
  date: string
  time: string
  dealer: string
  status: ServiceStatus
  notes?: string
}
// Persisted: appointments
// Seeded with 3 example entries on first launch
```

### Trip Store (`store/trip.ts`)

```typescript
type FuelType = 'Gasoline' | 'Ethanol' | 'Flex'

interface Trip {
  id: string
  date: string             // ISO date
  kmStart: number
  kmEnd: number
  fuelType: FuelType
  distanceKm: number       // kmEnd - kmStart
  consumptionL100km: number // estimated from fuel type
  voiceNoteUri?: string    // file URI from expo-audio
}
// Persisted: trips
```

### SOS Store (`store/sos.ts`)

```typescript
interface State {
  isAssistModeOn: boolean    // enables shake/crash detection
  emergencyContact: string | null
  persistentNotifId: string | null
}
// Persisted: emergencyContact only
```

---

## Services & Integrations

### AI Chat (`services/chat.ts`)

No backend. Responses are matched via regex against a keyword dictionary:

| Topic | Sample Response |
|-------|----------------|
| Recalls / warranty | 3yr/100k bumper-to-bumper, 5yr/100k powertrain |
| Oil changes | Every 10,000 km or 12 months |
| Tires | 32 PSI recommended, rotation at 10k km |
| Battery health | Current: 94% |
| Brake health | Current: 65% |
| Fuel types | Gasoline / Ethanol / Flex explanation |
| Dealers | Lists 3 São Paulo locations with addresses |

Simulated latency: 900ms base + up to 500ms random jitter.
Response spoken aloud via `expo-speech` in PT-BR.

### Calendar Integration (`services/calendarService.ts`)

- Requests calendar permission on first use
- Creates a device calendar event titled `🔧 Ford [ServiceType]`
- Event location: dealer name
- Alarm: 60 minutes before the appointment

### Background Reminders (`services/backgroundReminder.ts`)

- Registered with `expo-background-task` as `ford-service-reminder`
- Runs every 12 hours (system-controlled interval)
- Checks for appointments within the next 3 days
- Fires a local push notification with days-remaining and service type
- Requires notification permission to be granted

### Maps Routing (`utils/maps.ts`)

Builds a Google Maps deep link for each dealer:
```
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}
```
Falls back to a name-based search if coordinates are missing.

### Location (SOS, `components/sos-modal.tsx`)

- Requests `expo-location` permission when SOS modal opens
- Current coordinates → shareable Google Maps link
- Shared via `Linking.openURL()`

---

## Sensors & Native APIs

### Accelerometer — Shake & Crash Detection

**`useShakeDetector`**
- Polls accelerometer at ~20ms intervals
- Detects 3 acceleration peaks above **1.6g** within a 1-second sliding window
- 3-second cooldown between triggers
- Used to open SOS modal

**`useCrashDetector`**
- Calculates net force: `√(x² + y² + z²)`
- Triggers when force exceeds **4g**
- 10-second cooldown
- Used to trigger SOS modal on impact

### Barometer (`useBarometerAdvisor`)

Pressure thresholds:
- `< 900 hPa` → high altitude warning
- `< 980 hPa` → storm / rain incoming
- Drop `> 3 hPa` in readings → rain approaching

### DeviceMotion / Gyroscope (`useGyroTilt`)

- Reads `beta` (front-back tilt) and `gamma` (left-right tilt) from DeviceMotion
- Normalizes to ±1 range
- Spring-smoothed with `Springs.soft` preset
- Drives parallax depth on `MeshGradient` blobs and `VehicleCard3D` gloss position

### Biometric Authentication

- Uses `expo-local-authentication`
- Detects available hardware: Face ID, fingerprint, iris
- Login screen: biometric button only shown if hardware available
- `app/_layout.tsx`: re-locks app when returning from background (`AppState` change)
- My Car screen: requires re-auth on every entry

### Audio (`expo-audio`)

- Recording: `HIGH_QUALITY` preset, saves as WAV to app documents directory
- Playback: `expo-audio` AudioPlayer
- Delete: removes file + clears URI from trip store
- Animated pulse dot shows recording state

---

## Testing

**Framework**: Jest + `jest-expo` preset
**Total**: 24 test files, approximately 2,400 lines

### Test Coverage by Category

| Category | Files | What's Tested |
|----------|-------|---------------|
| Hooks | 9 | Sensor callbacks, thresholds, cooldowns, state transitions |
| Stores | 5 | CRUD operations, computed values, persist partials |
| Store Middleware | 1 | Zustand persist + secure storage integration |
| Services | 3 | Chat response matching, calendar event creation, background task logic |
| Storage | 1 | SecureStore adapter (get/set/remove) |
| Utils | 4 | VIN validation, Maps URL generation, service history grouping |
| Components | 1 | VIN scanner validation logic |
| Constants | 1 | Theme token structure and values |

### Coverage Targets

Configured in `jest.config.js`:
- `utils/**/*.ts`
- `store/**/*.ts`
- `services/**/*.ts`
- `hooks/**/*.ts`
- `constants/**/*.ts`
- `storage/**/*.ts`

### Running Tests

```bash
npm test                      # run all
npm test -- --coverage        # with HTML coverage report
npm test -- --watch           # interactive watch mode
npm test -- store/auth        # single file
```

---

## Configuration

### `app.json` Highlights

```json
{
  "expo": {
    "name": "ford",
    "slug": "ford",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "android": {
      "edgeToEdgeEnabled": true
    },
    "ios": {
      "supportsTablet": true
    },
    "web": {
      "output": "static"
    },
    "plugins": [
      "expo-router",
      "expo-splash-screen",
      "expo-secure-store",
      "expo-audio",
      "expo-background-task",
      "expo-asset"
    ]
  }
}
```

### Key Runtime Dependencies

```
expo ~54.0.33                            react 19.1.0
react-native 0.81.5                      expo-router ~6.0.23
zustand ^5.0.13                          react-native-reanimated ~4.1.1
react-native-gesture-handler ~2.28.0     expo-blur ~15.0.8
expo-sensors ~15.0.8                     expo-camera ~17.0.10
expo-local-authentication ~17.0.8        expo-audio ~1.1.1
expo-notifications ~0.32.17              expo-calendar ~15.0.8
expo-background-task ~1.0.10             expo-location ~19.0.8
expo-speech ~14.0.8                      expo-haptics ~15.0.8
expo-secure-store ~15.0.8                @react-native-async-storage/async-storage 2.2.0
react-native-svg 15.12.1                 @shopify/react-native-skia 2.2.12
lottie-react-native ~7.3.1               @expo-google-fonts/inter ^0.4.2
@expo/vector-icons ^15.0.3               expo-symbols ~1.0.8
```

### Dealer Data

Three hardcoded Ford dealers in São Paulo used across scheduling, AI responses, and map routing:

| Name | Neighborhood |
|------|-------------|
| Ford Morumbi | Morumbi, SP |
| Ford Santo André | Santo André, SP |
| Ford Tatuapé | Tatuapé, SP |

Each entry includes: full address, latitude/longitude, phone number, and business hours.

---

> **Academic context**: All telemetry data is simulated. The AI assistant uses canned responses. No backend or real Ford API is connected. Built as a Year 3 university challenge to demonstrate advanced React Native patterns, native sensor integration, and premium mobile UI design.
