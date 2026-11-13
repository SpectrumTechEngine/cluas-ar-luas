// Cluas ar Luas: every phrase, lesson, chat and spoken instruction.
// Used by the app and by tools/make-audio.mjs (which turns every line here into sound files).
//
// say  = sound-it-out spelling: one chunk per Irish word, hyphens split syllables, CAPITALS = strong syllable.
// look = picture family: two phrases with the same look are never offered together as answer choices.
// Sound files are named after ids, so better recordings can replace them later without code changes.
(function () {
const P = (id, ga, say, en, look) => ({ id, ga, say, en, look });

const PHRASES = [
  // ---------- Unit 1: Meeting people ----------
  P('hello',      'Dia dhuit',               'JEE-uh gwitch',               'hello',               'wave'),
  P('reply',      'Dia is Muire dhuit',      'JEE-uh iss MWIR-uh gwitch',   'hello (the reply)',   'wave'),
  P('hi',         'Haigh!',                  'HY',                          'hi!',                 'wave'),
  P('welcome',    'Fáilte!',                 'FAWL-chuh',                   'welcome!',            'door'),

  P('howareyou',  'Conas atá tú?',           'KUN-us uh-TAW too',           'how are you?',        'ask'),
  P('imwell',     'Tá mé go maith.',         'taw may guh MAH',             "I'm well",            'feel'),
  P('notbad',     'Níl mé go dona.',         'neel may guh DUN-uh',         'not bad',             'feel'),
  P('tired',      'Tá mé tuirseach.',        'taw may TUR-shukh',           "I'm tired",           'sleep'),

  P('whatsname',  'Cad is ainm duit?',       'kod iss AN-im ditch',         "what's your name?",   'ask'),
  P('isme',       'Is mise Nóra.',           'iss MISH-uh NOR-uh',          "I'm Nóra",            'name'),
  P('thisis',     'Seo é Peadar.',           'shuh ay PAD-ur',              'this is Peadar',      'name'),
  P('nicetomeet', 'Deas bualadh leat.',      'jass BOO-lu lat',             'nice to meet you',    'shake'),

  P('bye',        'Slán.',                   'SLAWN',                       'bye',                 'leave'),
  P('byefornow',  'Slán go fóill.',          'slawn guh FOE-il',            'bye for now',         'leave'),
  P('seeyou',     'Feicfidh mé ar ball thú.','FEK-ee may er BOWL hoo',      'see you later',       'leave'),
  P('night',      'Oíche mhaith.',           'EE-huh WAH',                  'good night',          'sleep'),

  P('please',     'Le do thoil.',            'leh duh HULL',                'please',              'please'),
  P('thanks',     'Go raibh maith agat.',    'guh rev mah AG-ut',           'thank you',           'thank'),
  P('yourewelcome','Tá fáilte romhat.',      'taw FAWL-chuh ROH-ut',        "you're welcome",      'thank'),
  P('excuseme',   'Gabh mo leithscéal.',     'gow muh LESH-kayl',           'excuse me',           'tap'),
  P('sorry',      'Tá brón orm.',            'taw brone OR-um',             "I'm sorry",           'sorry'),

  // ---------- Unit 2: At the café ----------
  P('tea',        'tae',                     'TAY',                         'tea',                 'tea'),
  P('coffee',     'caife',                   'KAF-eh',                      'coffee',              'coffee'),
  P('water',      'uisce',                   'ISH-kuh',                     'water',               'water'),
  P('milk',       'bainne',                  'BAN-yuh',                     'milk',                'milk'),
  P('sugar',      'siúcra',                  'SHOO-kruh',                   'sugar',               'sugar'),

  P('bread',      'arán',                    'uh-RAWN',                     'bread',               'bread'),
  P('sandwich',   'ceapaire',                'KYAP-ur-uh',                  'sandwich',            'sandwich'),
  P('cake',       'cáca',                    'KAW-kuh',                     'cake',                'cake'),
  P('scone',      'scón',                    'SKONE',                       'scone',               'scone'),
  P('biscuits',   'brioscaí',                'BRISS-kee',                   'biscuits',            'biscuit'),

  P('wanttea',    'Ba mhaith liom tae, le do thoil.', 'buh WAH lum TAY, leh duh HULL', "I'd like tea, please", 'order'),
  P('wantcoffee', 'Ba mhaith liom caife.',   'buh WAH lum KAF-eh',          "I'd like coffee",     'order'),
  P('wantmilk',   'Ar mhaith leat bainne?',  'er WAH lat BAN-yuh',          'would you like milk?','offer'),
  P('yes',        'Ba mhaith.',              'buh WAH',                     'yes please (I would)','yesno'),
  P('no',         'Níor mhaith.',            'neer WAH',                    "no thanks (I wouldn't)", 'yesno'),

  P('nice',       'Tá sé go deas.',          'taw shay guh JASS',           "it's nice",           'taste'),
  P('hot',        'Tá sé te.',               'taw shay CHEH',               "it's hot",            'hot'),
  P('cold',       'Tá sé fuar.',             'taw shay FOO-ur',             "it's cold",           'cold'),
  P('lovely',     'Go hálainn!',             'guh HAW-lin',                 'lovely!',             'taste'),

  P('bill',       'An bille, le do thoil.',  'un BIL-uh, leh duh HULL',     'the bill, please',    'bill'),
  P('howmuch',    'Cé mhéad atá air?',       'kay VAYD uh-TAW er',          'how much is it?',     'price'),
  P('hereyougo',  'Seo duit.',               'shuh ditch',                  'here you go',         'give'),
  P('thanksmil',  'Go raibh míle maith agat.','guh rev MEE-luh mah AG-ut',  'thanks a million',    'thank'),
];

// Chats: character a says a phrase, character b answers. The learner picks b's line.
// wrong = answers that clearly don't fit (never another reply that would also be right).
const C = (a, says, b, reply, wrong) => ({ a, says, b, reply, wrong });

const UNITS = [
  {
    id: 'u1', name: 'Meeting people', ga: 'Ag Bualadh le Daoine', colour: '#13453f',
    lessons: [
      { id: 'u1l1', name: 'Hello',        phrases: ['hello', 'reply', 'hi', 'welcome'],
        chat: [C('nora', 'hello', 'peadar', 'reply', ['night', 'sorry'])] },
      { id: 'u1l2', name: 'How are you?', phrases: ['howareyou', 'imwell', 'notbad', 'tired'],
        chat: [C('peadar', 'howareyou', 'mamo', 'imwell', ['welcome', 'hi'])] },
      { id: 'u1l3', name: 'Names',        phrases: ['whatsname', 'isme', 'thisis', 'nicetomeet'],
        chat: [C('mamo', 'whatsname', 'nora', 'isme', ['tired', 'hello']), C('nora', 'thisis', 'mamo', 'nicetomeet', ['howareyou', 'welcome'])] },
      { id: 'u1l4', name: 'Goodbye',      phrases: ['bye', 'byefornow', 'seeyou', 'night'],
        chat: [C('cian', 'seeyou', 'nora', 'byefornow', ['welcome', 'tired'])] },
      { id: 'u1l5', name: 'Manners',      phrases: ['please', 'thanks', 'yourewelcome', 'excuseme', 'sorry'],
        chat: [C('peadar', 'thanks', 'nora', 'yourewelcome', ['sorry', 'howareyou'])] },
    ],
    challenge: [
      C('mamo', 'hello', 'nora', 'reply', ['bye', 'please']),
      C('mamo', 'howareyou', 'nora', 'imwell', ['bye', 'please']),
      C('nora', 'thisis', 'mamo', 'nicetomeet', ['sorry', 'night']),
      C('peadar', 'thanks', 'mamo', 'yourewelcome', ['whatsname', 'hi']),
      C('peadar', 'bye', 'mamo', 'byefornow', ['please', 'hello']),
    ],
  },
  {
    id: 'u2', name: 'At the café', ga: 'Sa Chaifé', colour: '#7a4a1f',
    lessons: [
      { id: 'u2l1', name: 'Drinks',       phrases: ['tea', 'coffee', 'water', 'milk', 'sugar'] },
      { id: 'u2l2', name: 'Food',         phrases: ['bread', 'sandwich', 'cake', 'scone', 'biscuits'] },
      { id: 'u2l3', name: 'Ordering',     phrases: ['wanttea', 'wantcoffee', 'wantmilk', 'yes', 'no'],
        chat: [C('nora', 'wantmilk', 'peadar', 'yes', ['hot', 'hereyougo'])] },
      { id: 'u2l4', name: 'How is it?',   phrases: ['nice', 'hot', 'cold', 'lovely'],
        chat: [C('mamo', 'hot', 'nora', 'sorry', ['yes', 'hi'])] },
      { id: 'u2l5', name: 'Paying',       phrases: ['bill', 'howmuch', 'hereyougo', 'thanksmil'],
        chat: [C('peadar', 'bill', 'nora', 'hereyougo', ['wantmilk', 'night']), C('peadar', 'hereyougo', 'nora', 'thanksmil', ['sorry', 'whatsname'])] },
    ],
    challenge: [
      C('nora', 'hello', 'cian', 'reply', ['night', 'cold']),
      C('cian', 'wantcoffee', 'nora', 'wantmilk', ['bye', 'tired']),
      C('nora', 'wantmilk', 'cian', 'no', ['sorry', 'night']),
      C('cian', 'bill', 'nora', 'hereyougo', ['hot', 'hello']),
      C('cian', 'hereyougo', 'nora', 'thanksmil', ['wantcoffee', 'cold']),
      C('nora', 'bye', 'cian', 'byefornow', ['wantmilk', 'please']),
    ],
  },
];

// The cast. Voices: Orla or Colm, with pitch/speed changes for each character.
const CHARS = {
  nora:   { name: 'Nóra',   voice: 'orla', pitch: '+0%',  rate: '-5%' },
  peadar: { name: 'Peadar', voice: 'colm', pitch: '-6%',  rate: '-5%' },
  mamo:   { name: 'Mamó',   voice: 'orla', pitch: '-12%', rate: '-15%' },
  cian:   { name: 'Cian',   voice: 'colm', pitch: '+12%', rate: '+5%' },
};

// Irish praise (teacher voice) and the app's name
const IRISH = [
  { id: 'praise1', ga: 'Maith thú!',   say: 'mah HOO' },
  { id: 'praise2', ga: 'An-mhaith!',   say: 'AN-wah' },
  { id: 'praise3', ga: 'Ar fheabhas!', say: 'er OW-us' },
  { id: 'praise4', ga: 'Togha!',       say: 'TOW-uh' },
  { id: 'appname', ga: 'Cluas ar Luas', say: 'KLOO-us er LOO-us' },
];

// Spoken instructions in English (Emily with Orla, Connor with Colm)
const ENGLISH = {
  p_welcome: "Hello! I'm Giorria the hare. Let's learn Irish by ear. Tap the first circle to start.",
  p_meet:    'New phrase. Listen.',
  p_pick:    'Listen, then tap the picture that matches.',
  p_sound:   'Which sound matches this picture? Tap each one to hear it, then tap check.',
  p_pairs:   'Match each sound to its picture.',
  p_build:   'Listen, then tap the sounds in the right order.',
  p_chat:    'Listen to the chat. What comes next?',
  p_say:     'Your turn. Tap the microphone and say it.',
  p_heard3:  'Spot on!',
  p_heard2:  'Very close! Listen to this bit.',
  p_heard1:  'Have another go. Listen first.',
  p_nearly:  'Nearly. Here it is again.',
  p_done:    'Lesson done. Well done!',
  p_unit:    'Unit complete! Brilliant work.',
  p_chest:   'You found a chest!',
  p_fix:     "Let's fix a few tricky ones.",
};
for (const p of PHRASES) ENGLISH['mean_' + p.id] = 'It means: ' + p.en.replace(/ \(.*\)/, '') + '.';

// ---------- helpers shared by the app and the audio maker ----------
const plain = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
// the words of a phrase, each with its sound-it-out chunk and sound file id
function words(p) {
  const ga = p.ga.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  const say = p.say.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  return ga.map((w, i) => ({ ga: w, say: say[i] || '', id: 'w_' + plain(w).replace(/ /g, '_') }));
}

self.CONTENT = { PHRASES, UNITS, CHARS, IRISH, ENGLISH, plain, words };
})();
