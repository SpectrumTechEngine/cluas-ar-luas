# Cluas ar Luas

Learn Irish by ear: a Duolingo-style course made with dyslexia in mind, for adults. Sounds and pictures first, reading optional.
Hidden link: https://thespectrumtechengine.com/cluas-ar-luas/

## Files

- `content.js`: every phrase (Irish, sound-it-out spelling, English, picture family), the units and lessons, the chats, the cast, spoken instructions
- `pics.js`: every picture, drawn as SVG in code (`PIC(id)`), and Giorria the hare (`HARE(mood, outfit)`)
- `app.js`: the app (path, lessons, 7 question types, XP, streak, achievements, settings)
- `hear.js`: the speaking check (records, sends to the listener, compares kindly)
- `index.html`: page + styles. `sw.js`: offline copy (bump the cache name on every release)
- `audio/`: sound files made by `tools/make-audio.mjs` with Azure voices
  - `audio/orla/`, `audio/colm/`: teacher voice (phrases, slow versions, single words, English instructions)
  - `audio/ch/`: the characters' lines in chats (Nóra, Peadar, Mamó, Cian)
- `functions/`: the `cluasHear` Cloud Function (Firebase project chopthecheck) that passes recordings to Azure's Irish listener. The Azure key is the secret `AZURE_SPEECH_KEY`.
- `PLAN.md`: the plan the first build follows

## Tools

- `node tools/make-audio.mjs`: makes missing sound files (`--check` just checks content.js; `--force` remakes all)
- `node tools/dev-hear.mjs`: local listener on port 5332 for testing on this computer
- `node tools/test-hear.mjs 10`: Azure's voice says phrases into Azure's listener and the app scores them
- `tools/gallery.html`: every picture on one page. `tools/phone.html`: the app in three phone-sized frames
- `tools/deploy-listener.ps1`: puts the Azure key in Firebase and deploys the listener (the owner runs this)

Swapping to other recordings later (e.g. ABAIR): replace files with the same names.
