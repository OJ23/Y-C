# Savour Mobile

Native Expo/React Native client for Savour. The existing Express application remains the backend and web client.

## Run locally

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` to an address reachable by the device.
2. Run `npm install`.
3. Run `npm start`, then open the project in Expo Go or a development build.

Android Emulator can reach a server on the development computer through `http://10.0.2.2:5173`. A physical phone must use the computer's LAN address.

## Store builds

Configure the final Apple bundle identifier, Android package, icons, signing accounts, privacy metadata, and store listing before running `eas build --platform all`.
