# Savour

Savour is a food-discovery platform for finding restaurants and Nigerian dishes, saving places and meals, and recording dining history. This repository contains both the existing web/API application and the installable Android/iOS application.

## Applications

```text
campgrounds/
├── index.js, routes/, controllers/, models/, views/, public/
│   └── Node.js, Express, EJS, MongoDB web application and JSON API
└── mobile/
    └── Expo and React Native Android/iOS application
```

The applications have separate dependency manifests:

- Root `package.json`: Express backend and EJS website.
- `mobile/package.json`: Expo/React Native application.

Do not install backend packages inside `mobile` or Expo packages at the repository root.

## Features

- Restaurant discovery with search, filters, list, and map views.
- Nigerian dishes and recipe categories.
- Restaurant and dish bookmarks shared through MongoDB.
- Visited restaurant history.
- Restaurant creation, Cloudinary image upload, MapTiler geocoding, and reviews.
- Passport sessions for the web application.
- Versioned `/api/v1` endpoints for the native application.
- Short-lived access tokens and rotating refresh tokens.
- Secure native refresh-token storage through Expo SecureStore.
- Expo Router foundation, persistent mobile navigation, Discover, Bookmarked, Create, and Profile experiences.
- Light, dark, and system themes.

## Technology

### Web and API

- Node.js, Express, EJS, and EJS Mate
- MongoDB, Mongoose, and Connect Mongo
- Passport Local and Passport Local Mongoose
- JSON Web Tokens for native authentication
- Joi and sanitize-html
- Cloudinary and Multer
- MapTiler
- Helmet, rate limiting, compression, and Pino logging

### Mobile

- Expo SDK 56 and React Native
- Expo Router
- TanStack Query
- Expo SecureStore, ImagePicker, and Location
- FlashList and AsyncStorage

## Requirements

- Node.js 18 or newer
- npm
- Local MongoDB for development, or a reachable MongoDB deployment
- Cloudinary credentials for uploaded restaurant images
- A MapTiler API key for maps and geocoding
- Expo Go or an Android/iOS development build for mobile testing

## Backend and web setup

1. Install root dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env` and provide the required values:

   ```powershell
   Copy-Item .env.example .env
   ```

   Production requires strong, different values for `SESSION_SECRET`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.

3. Start MongoDB and optionally seed content:

   ```powershell
   npm run seed:recipes
   ```

4. Start Savour:

   ```powershell
   npm run dev
   ```

5. Open `http://localhost:5173`.

Development uses `mongodb://127.0.0.1/YP` unless `MONGO_URI` is explicitly configured. Production may use `MONGO_URI` or the legacy `DB_URL`.

## Mobile setup

1. Install mobile dependencies separately:

   ```powershell
   cd mobile
   npm install
   ```

2. Create the mobile environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set `EXPO_PUBLIC_API_BASE_URL` to an address the device can reach:

   ```dotenv
   EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5173/api/v1
   ```

   `10.0.2.2` is the usual Android Emulator host alias. A physical phone needs the development computer's LAN address or an approved HTTPS tunnel; it cannot use the computer's `localhost`.

4. Start Expo:

   ```powershell
   npm start
   ```

## Commands

| Location | Command | Purpose |
| --- | --- | --- |
| Repository root | `npm start` | Start the Express server |
| Repository root | `npm run dev` | Start Express with file watching |
| Repository root | `npm test` | Run backend tests |
| Repository root | `npm run seed` | Seed restaurants |
| Repository root | `npm run seed:recipes` | Upsert bundled recipes |
| `mobile/` | `npm start` | Start Expo |
| `mobile/` | `npm run android` | Open the Android application |
| `mobile/` | `npm run ios` | Open the iOS application; local simulator builds require macOS |
| `mobile/` | `npm run typecheck` | Check native TypeScript |

## API and authentication

The EJS website continues to use Passport sessions stored in MongoDB. The native application uses `/api/v1` bearer-token endpoints. Native refresh tokens are rotated, stored as hashes on the server, and saved in encrypted device storage.

Never place MongoDB credentials, session/JWT secrets, or the Cloudinary API secret in the Expo application or an `EXPO_PUBLIC_` environment variable.

## Git workflow

This is currently one repository, so web/API and mobile changes can be pushed together. Separate commits keep the history reviewable:

```powershell
# Commit coordinated backend and web changes
git add .gitignore .env.example README.md package.json package-lock.json index.js controllers middleware models routes services tests views public data schemas.js seeds
git commit -m "Add Savour web and versioned API updates"

# Commit the native application
git add mobile
git commit -m "Add Savour Expo mobile application"

# Push both commits to the same branch
git push origin main
```

Review `git status` and `git diff --staged` before every commit. Do not use `git add .` unless every displayed file belongs in the commit.

The root `.env` was historically tracked. Remove it from Git's index before pushing; the local file remains on disk:

```powershell
git rm --cached .env
git add .gitignore .env.example
git commit -m "Stop tracking environment secrets"
```

If `.env` was ever pushed to a remote repository, rotate every credential it contained. Ignoring or deleting the file does not erase secrets from existing Git history.

The root `node_modules` directory was historically tracked. `.gitignore` prevents new dependency files from being added, but already tracked files must be removed from Git's index once with:

```powershell
git rm -r --cached node_modules
git commit -m "Stop tracking installed dependencies"
```

This removes `node_modules` from Git, not from the local disk. Dependencies are restored from the committed lockfiles with `npm install`.

## Store builds

Before App Store or Play Store submission, configure final application identifiers, icons, splash assets, production HTTPS API URL, signing accounts, privacy metadata, and store listings. Store binaries can then be created with EAS Build.

## Security

- Never commit `.env`, signing keys, access tokens, or production credentials.
- Use HTTPS in production.
- Restrict MongoDB, Cloudinary, and MapTiler credentials by environment and intended usage.
- Keep the Express and Multer major versions pinned until their integrations are tested separately.
