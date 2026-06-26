# Diaspora build brief

## Current product direction

Diaspora is a warm, modern language-learning app inspired by Duolingo and Airlearn. The app should feel lesson-first: teaching cards, audio, illustrations, cultural context, exercises, tutor correction, and progress flow are more important than showing the mascot everywhere.

## Visual direction

- Use a hybrid theme.
- Onboarding and teaching screens can use clean light backgrounds.
- Focused lesson/exercise screens may keep premium dark panels where useful.
- Dark/brown mode can return later as a settings option.
- Do not reintroduce a dark-only rule.

## Mascot direction

- Use one consistent original universal cat tutor.
- The cat supports the learning experience; it is not the whole product.
- Keep the design legally distinct from external references.
- Use small language accessories only: tam, scarf, cap, beret, collar pattern.
- Do not bring back the previous yellow mascot as the main brand mascot.

## Stable engineering constraints

- Preserve Firebase Auth, Firestore progress, generated curriculum, audio generation, and image registry.
- Do not migrate to Expo Router.
- Use `expo-audio`, not `expo-av`.
- Do not use native `Alert.alert` for app flow.
- Do not push to GitHub unless explicitly requested.
