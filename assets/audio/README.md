# Generated lesson audio

Run `npm run audio:dry-run` to preview files, then `npm run audio:generate` after adding the ElevenLabs API key and language voice IDs to `.env`.

The generator creates one folder per language and skips existing MP3 files by default:

```text
assets/audio/patois/wah_gwaan.mp3
assets/audio/swahili/habari.mp3
assets/audio/igbo/nne.mp3
```

`manifest.json` is generated after a live run. ElevenLabs is called only by the local Node.js script; the API key must never be exposed to the mobile app.
