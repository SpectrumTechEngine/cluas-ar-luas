# Cluas ar Luas: rebuild plan (first build = Units 1–2)

Learn Irish by ear. Duolingo-style game, but our own look, mascot and characters.
For adults, made with dyslexia in mind. Hidden link while testing.

## Ground rules

- **Never copy Duolingo**: no owl, no green-on-white look, no copied screens or names.
- **No tram / Luas theme ever** (trademark worry). "luas" only as the Irish word for speed.
- **No cursing.** Friendly Irish humour only.
- **No hearts/lives.** A mistake just brings that question back later in the lesson.
- **Every picture must pass the "guess it" test:** a person who has never seen the app must be able to guess the meaning from the picture alone. If a picture fails, the phrase changes or the picture is redrawn. This fixes the biggest problem with version 1 (e.g. 🎁 for "thank you", 🤔 for "how are you?").
- **Distractor rule:** wrong answers in a question must look clearly different from the right one (never two "waving" pictures together).
- Everything is spoken. Reading is optional help (Irish spelling + colour-coded sound-it-out spelling, both on by default).

## Look and feel

- **Mascot: Giorria the hare 🐇** (big ears = *cluas*, fast = *luas*). Drawn by us as SVG, with moods: happy, cheering, thinking, sleepy (streak reminder), dancing (lesson done).
- **Colours:** deep teal + warm gold + cream (from the icon). Dark mode too.
- **Font:** Lexend (easy to read), large sizes, wide spacing.
- **Pictures, two kinds, one consistent style:**
  - **Things** (tea, coffee, bread…): Noto Emoji artwork (free, Apache licence) saved in the app, so they look the same on every phone (version 1 used each phone's own emoji, which vary).
  - **Phrases** (hello, how are you, sorry…): our own **scene pictures**: two recurring people in a simple flat style, acting the phrase out, with a symbol bubble. E.g. *Gabh mo leithscéal* = person tapping another's shoulder; *Tá brón orm* = person who dropped a cup, sad face.
- Sounds: soft chime for right, gentle "boop" for not-quite, fanfare + hare dance at the end.

## The cast (voices = Orla and Colm, with pitch/speed changes)

| Character | Who | Voice |
|---|---|---|
| Giorria | the hare, your guide | Orla, higher + quicker |
| Nóra | runs the café | Orla |
| Peadar | regular at the café, a bit of a messer | Colm |
| Mamó | Granny, sweet but nosy | Orla, lower + slower |
| Cian | young lad, always in a hurry | Colm, higher + quicker |

## The home screen

- A winding **path** of round lesson buttons, grouped into **units**, with a **chest** halfway and a **unit challenge** at the end.
- Top bar: 🔥 streak, ⚡ XP today vs daily goal, ⚙️ settings.
- The hare sits next to your current lesson.

## Inside a lesson (10–12 questions, about 4 minutes)

| Type | What happens |
|---|---|
| 🆕 **Meet it** | Picture + phrase spoken twice + meaning in English. Tap to hear again / slowly |
| 🔊 **Hear → picture** | Hear the Irish, tap the right picture (3–4 choices) |
| 🔁 **Picture → sound** | See a picture, tap the sound that matches (3 sound buttons) |
| 🔗 **Match pairs** | 4 sounds + 4 pictures, join them up (bonus for speed, no penalty) |
| 🧩 **Build it** | Hear a sentence, tap sound tiles in the right order (each tile speaks) |
| 💬 **Finish the chat** | A character speaks; pick (or say) the right reply |
| 🎤 **Say it** | Say the phrase; **the app listens** and gives stars (see below) |

After each question, a big bar slides up: green "Ar fheabhas!" or gold "Nearly! Here it is again". The **Continue** button is always in the same place.

## Speaking check (the app hears you)

- You tap 🎤, say it, tap again (or it stops by itself after a pause).
- Azure's Irish listener writes down what it heard; the app compares it kindly (ignores fadas, capitals, small slips).
- ⭐⭐⭐ spot on · ⭐⭐ one word off (shows and plays that word slowly) · 🔁 have another go (plays the speaker, then you).
- Never says "wrong". Always an **"I said it right"** button and an **"I can't speak now"** button (turns speaking off for 15 minutes).
- **Behind the scenes:** a small Cloud Function on Firebase project chopthecheck gives the app a 10-minute Azure pass; the key never leaves the server. The owner runs the deploy in the terminal. Limit: about 5 hours of listening a month (free tier).
- **Before the Azure trial ends (~13 Dec 2026): click Upgrade** in Azure, Speech stays €0, set a €5 budget alert.
- Privacy line in settings: "Your recording is sent to Microsoft to check it, and is not kept by this app."

## Rewards

- ⚡ XP per lesson (+bonus for no repeats, + speed bonus in Match pairs).
- 🎯 Daily goal (choose 1, 2 or 3 lessons a day).
- 🔥 Streak, with one 🧊 freeze earned per week.
- 🏆 Achievements (first lesson, 7-day streak, 50 phrases, first ⭐⭐⭐ spoken…).
- 📦 Chest halfway through each unit (an extra hare outfit or a bonus story).
- League vs friends: **later**, not in the first build.

## Practice

- **Fix my mistakes**: a lesson made from what you got wrong.
- Phrases you know come back now and then, so they stick (spaced repetition).

## Unit 1: Ag Bualadh le Daoine (Meeting people)

| Lesson | Irish | Sound it out | English | Picture |
|---|---|---|---|---|
| 1 Hello | Dia dhuit | JEE-uh gwitch | hello | two people waving, smiling |
| | Dia is Muire dhuit | JEE-uh iss MWIR-uh gwitch | hello (the reply) | second person waving back, little "↩" bubble |
| | Haigh! | HY | hi! | quick wave, one hand up |
| | Fáilte! | FAWL-chuh | welcome! | door open, person with arms out |
| 2 How are you? | Conas atá tú? | KUN-us uh-TAW too | how are you? | person asking, bubble with 🙂/😐/🙁 |
| | Tá mé go maith | taw may guh MAH | I'm well | person thumbs up, big smile |
| | Níl mé go dona | neel may guh DUN-uh | not bad | person with hand flat, "so-so" tilt |
| | Tá mé tuirseach | taw may TUR-shukh | I'm tired | person yawning, droopy eyes |
| 3 Names | Cad is ainm duit? | kod iss AN-im ditch | what's your name? | person pointing at the other, bubble "?" over a name tag |
| | Is mise Nóra | iss MISH-uh NOR-uh | I'm Nóra | Nóra pointing at herself, name tag |
| | Seo é Peadar | shuh ay PAD-ur | this is Peadar | Nóra presenting Peadar with open hand |
| | Deas bualadh leat | jass BOO-lu lat | nice to meet you | two people shaking hands |
| 4 Goodbye | Slán | SLAWN | bye | person walking out a door, waving |
| | Slán go fóill | slawn guh FOE-il | bye for now | waving + small clock |
| | Feicfidh mé ar ball thú | FEK-ee may er BOWL hoo | see you later | waving + sun moving across sky |
| | Oíche mhaith | EE-huh WAH | good night | moon, person in pyjamas |
| 5 Manners | Le do thoil | leh duh HULL | please | person holding out a hand, hopeful face |
| | Go raibh maith agat | guh rev mah AG-ut | thank you | one person handing an object, the other with hand on heart |
| | Tá fáilte romhat | taw FAWL-chuh ROH-ut | you're welcome | the giver smiling, open palm |
| | Gabh mo leithscéal | gow muh LESH-kayl | excuse me | person tapping another's shoulder |
| | Tá brón orm | taw brone OR-um | I'm sorry | dropped cup, sad face |
| Challenge | mixed chat with Mamó (she asks your name, how you are, says goodbye) | | | |

## Unit 2: Sa Chaifé (At the café)

| Lesson | Irish | Sound it out | English | Picture |
|---|---|---|---|---|
| 1 Drinks | tae | TAY | tea | cup of tea (Noto 🍵 or drawn mug with tag) |
| | caife | KAF-eh | coffee | coffee cup ☕ |
| | uisce | ISH-kuh | water | glass of water |
| | bainne | BAN-yuh | milk | milk carton/bottle |
| | siúcra | SHOO-kruh | sugar | sugar cubes |
| 2 Food | arán | uh-RAWN | bread | loaf |
| | ceapaire | KYAP-ur-uh | sandwich | sandwich |
| | cáca | KAW-kuh | cake | slice of cake |
| | scón | SKONE | scone | scone |
| | brioscaí | BRISS-kee | biscuits | biscuits |
| 3 Ordering | Ba mhaith liom tae, le do thoil | buh WAH lum TAY, leh duh HULL | I'd like tea, please | person at counter, tea in bubble |
| | Ba mhaith liom caife | buh WAH lum KAF-eh | I'd like coffee | coffee in bubble |
| | Ar mhaith leat bainne? | er WAH lat BAN-yuh | would you like milk? | Nóra holding milk, "?" |
| | Ba mhaith | buh WAH | yes please (I would) | nod + tick |
| | Níor mhaith | neer WAH | no thanks (I wouldn't) | head shake + hand up |
| 4 How is it? | Tá sé go deas | taw shay guh JASS | it's nice | person sipping, happy |
| | Tá sé te | taw shay CHEH | it's hot | steaming cup, person blowing on it |
| | Tá sé fuar | taw shay FOO-ur | it's cold | cup with ice/snowflake, person shivering |
| | Go hálainn! | guh HAW-lin | lovely! | person with eyes closed, delighted |
| 5 Paying | An bille, le do thoil | un BIL-uh, leh duh HULL | the bill, please | hand raised, paper bill |
| | Cé mhéad atá air? | kay VAYD uh-TAW er | how much is it? | price tag "?" |
| | Seo duit | shuh ditch | here you go | hand passing money |
| | Go raibh míle maith agat | guh rev MEE-luh mah AG-ut | thanks a million | big smile, both hands on heart |
| Challenge | full café chat with Nóra (and Peadar trying to get you to pay for his scone) | | | |

All Irish and sound-it-out spellings to be double-checked again before recording, and every clip listened to by the owner.

## How it will be built

- New `content.js` (units, lessons, phrases, pictures, chats), new `app.js`, new styles. Same folder and offline setup.
- `tools/make-audio.mjs` extended for character voices (pitch/speed) and for individual words (sound tiles).
- `pictures/`: our SVG scenes + chosen Noto Emoji SVGs (licence note included).
- `functions/` speech pass for chopthecheck (owner deploys).
- Tested in the browser at phone size: every question type, every picture checked against its phrase, progress saving, pause.
- Then (with permission) GitHub + hidden link, and a test on the owner's phone (microphone).

## Later (not in the first build)

League vs friends, more units (Family, Weather, Shop, Out and About, Sport, Feelings), audio stories, hands-free mode, reminders, APK, ABAIR voices.
