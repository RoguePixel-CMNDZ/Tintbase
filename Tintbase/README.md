# Tintbase

QR-powered paint color intelligence for commercial painters.

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Install & Run

```bash
cd Tintbase
npm install
npx expo start
```

Then scan the QR code with Expo Go on your phone.

---

## Project Structure

```
Tintbase/
├── App.js                          # Root — font loading + providers
├── app.json                        # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── navigation/
    │   └── AppNavigator.js         # Stack + bottom tab navigation
    ├── screens/
    │   ├── SplashScreen.js         # Animated brand splash
    │   ├── SignInScreen.js         # Email/password + Google SSO
    │   ├── OnboardingScreen.js     # 3-step role/company/permissions setup
    │   ├── DashboardScreen.js      # Home: stats, recent scans, swatch grid, projects
    │   ├── ScannerScreen.js        # Live QR camera + paint detail bottom sheet
    │   └── PaintDetailScreen.js    # Full paint spec — 4-tab detail view
    ├── components/
    │   ├── LogoMark.js             # Reusable brand logo grid
    │   └── SwatchCard.js           # Paint swatch card with fav toggle
    ├── data/
    │   └── paints.js               # Paint library (SW + Behr), QR map, projects
    └── theme/
        └── colors.js               # Design token colors + shadows
```

---

## Screens

| Screen | Description |
|--------|-------------|
| Splash | Animated brand reveal → auto-navigates to Sign In |
| Sign In | Email/password, Google SSO, role selector chips |
| Onboarding | 3-step wizard: role → company & crew → permissions |
| Dashboard | Stats cards, recent scans, color library grid, active projects |
| Scanner | Live camera QR scan → animated detection → paint spec bottom sheet |
| Paint Detail | 4-tab full spec: Specs / Formula / Application / History |

---

## QR Code Integration

QR codes encode a `locationId` string (e.g. `WTB-L1-MAIN`).

The `QR_MAP` in `src/data/paints.js` maps location IDs → paint record IDs:

```js
export const QR_MAP = {
  'WTB-L1-MAIN': 1,  // Westfield Tower B Lobby → Repose Gray SW 7015
  'HVO-F3-CORR': 2,  // Harbor View Corridor → Naval SW 6244
  // ...
};
```

In production, replace the static `QR_MAP` with a Supabase Edge Function call:

```js
const { data } = await supabase
  .from('paint_locations')
  .select('paint_id, paints(*)')
  .eq('location_id', scannedCode)
  .single();
```

---

## Paint Brands

**Sherwin-Williams**  
Colors: Repose Gray (SW 7015), Naval (SW 6244), Alabaster (SW 7008), Accessible Beige (SW 7036), Iron Ore (SW 7069)

**Behr**  
Colors: Pale Smoke (N520-3)

Each paint record includes:
- Color name, brand, product line, color code
- LRV, sheen, VOC, tint base
- Coverage rate, coats required, dry/recoat times
- Full colorant formula (pigment name + ratio)
- Surface compatibility, prep requirements, application method
- Environmental conditions (temp/humidity)
- Location history (building, zone, applied by, scan count)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 51 |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Fonts | Bebas Neue + DM Sans (Google Fonts via Expo) |
| Icons | @expo/vector-icons (Ionicons) |
| Gradients | expo-linear-gradient |
| Camera/QR | expo-camera (CameraView with barcode scanning) |
| Gestures | react-native-gesture-handler |
| Animations | React Native Animated API |

---

## Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

Configure `eas.json` with your Apple Team ID and Android keystore before building.

---

## Recommended Next Steps

1. **Backend**: Set up Supabase project, run migration for `paints`, `paint_locations`, `users` tables
2. **Auth**: Wire `SignInScreen` to `supabase.auth.signInWithPassword()`
3. **QR Admin**: Build admin web panel to generate and bind QR codes to paint records
4. **Offline**: Add MMKV storage + React Query persistence for field use without signal
5. **PDF Export**: Add `expo-print` to export paint spec sheets from `PaintDetailScreen`
6. **More brands**: Add Benjamin Moore, PPG, Dunn-Edwards color data

---

*Tintbase — Built with BuildFlow*
