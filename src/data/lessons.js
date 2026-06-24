import { patoisUnits } from './patoisCurriculum';

export const coursesData = {
  patois: {
    title: 'Jamaican Patois',
    flag: '🇯🇲',
    themeColor: '#009B3A',
    accentColor: '#F4B942',
    units: patoisUnits,
  },
  swahili: {
    title: 'Swahili',
    flag: '🇰🇪',
    themeColor: '#D4782C', // African warm orange
    accentColor: '#F4B942',
    units: [
      {
        id: 'swahili-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Hujambo & Basic Greetings',
        lessons: [
          {
            id: 'swa-l1',
            title: 'Hello',
            subtitle: 'Saying hello in Swahili',
            xp: 20,
            phrase: 'Hujambo',
            meaning: 'How are you?',
            note: 'Standard friendly greeting. The reply is "Sijambo" (I am fine).',
            type: 'star',
            quiz: {
              prompt: 'What is the correct reply to "Hujambo"?',
              answer: 'Sijambo',
              choices: ['Hujambo', 'Sijambo', 'Asante'],
            },
          },
          {
            id: 'swa-l2',
            title: 'Gratitude',
            subtitle: 'Saying thank you',
            xp: 25,
            phrase: 'Asante sana',
            meaning: 'Thank you very much',
            note: '"Asante" means thank you. Adding "sana" makes it very much.',
            type: 'star',
            quiz: {
              prompt: 'What does "Asante sana" mean?',
              answer: 'Thank you very much',
              choices: ['You are welcome', 'Thank you very much', 'No problem'],
            },
          },
          {
            id: 'swa-chest1',
            title: 'Treasure Chest',
            type: 'chest',
            xp: 50,
            claimed: false,
          },
          {
            id: 'swa-l3',
            title: 'Welcome',
            subtitle: 'Inviting someone in',
            xp: 30,
            phrase: 'Karibu',
            meaning: 'Welcome',
            note: 'Used to welcome someone into a home or to say "you are welcome" after thanks.',
            type: 'camera',
            quiz: {
              prompt: 'What does "Karibu" mean?',
              answer: 'Welcome',
              choices: ['Goodbye', 'Welcome', 'Excuse me'],
            },
          },
          {
            id: 'swa-l4',
            title: 'Trophy Match',
            subtitle: 'Kiswahili Basics Review',
            xp: 40,
            phrase: 'Habari gani?',
            meaning: 'What is the news?',
            note: 'A very common greeting asking how things are going.',
            type: 'trophy',
            quiz: {
              prompt: 'What does "Habari gani?" mean?',
              answer: 'What is the news? / How are things?',
              choices: ['What is the news? / How are things?', 'Goodnight', 'Who are you?'],
            },
          },
        ],
      },
    ],
  },
  aave: {
    title: 'Black American English',
    flag: '🇺🇸',
    themeColor: '#CE82FF', // Purple
    accentColor: '#1CB0F6',
    units: [
      {
        id: 'aave-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Vibe check & Chill expressions',
        lessons: [
          {
            id: 'aave-l1',
            title: 'Greeting',
            subtitle: 'How to greet friends',
            xp: 20,
            phrase: "What's good?",
            meaning: 'What is going on? / How are you?',
            note: 'A highly common modern greeting expressing interest in a friend\'s status.',
            type: 'star',
            quiz: {
              prompt: 'What does "What\'s good?" mean?',
              answer: 'How are you doing?',
              choices: ['Is the food good?', 'How are you doing?', 'Goodbye'],
            },
          },
          {
            id: 'aave-l2',
            title: 'Agreement',
            subtitle: 'Showing solid agreement',
            xp: 25,
            phrase: 'For real',
            meaning: 'Honestly / Indeed',
            note: 'Often abbreviated as "FR" in text, expressing complete agreement or honesty.',
            type: 'star',
            quiz: {
              prompt: 'What does saying "For real" express?',
              answer: 'Sincere agreement',
              choices: ['Doubt', 'Sincere agreement', 'A question'],
            },
          },
          {
            id: 'aave-chest1',
            title: 'Reward Chest',
            type: 'chest',
            xp: 55,
            claimed: false,
          },
          {
            id: 'aave-l3',
            title: 'Social Slang',
            subtitle: 'Expressing friendship',
            xp: 30,
            phrase: 'No cap',
            meaning: 'No lie / Seriously',
            note: '"Cap" means to lie or exaggerate. "No cap" means telling the absolute truth.',
            type: 'camera',
            quiz: {
              prompt: 'What does "No cap" mean?',
              answer: 'No lie / Seriously',
              choices: ['I forgot my hat', 'No lie / Seriously', 'Stop talking'],
            },
          },
        ],
      },
    ],
  },
  belize: {
    title: 'Belizean Creole',
    flag: '🇧🇿',
    themeColor: '#003F87', // Belize Royal Blue
    accentColor: '#D21034', // Belize Red
    units: [
      {
        id: 'bel-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Meeting Belizean People',
        lessons: [
          {
            id: 'bel-l1',
            title: 'Meeting up',
            subtitle: 'Belize Kriol greeting',
            xp: 20,
            phrase: 'Weh di go ahn?',
            meaning: 'What is going on?',
            note: 'The primary informal greeting in Belize. The typical response is "Nothin much" or "All is good".',
            type: 'star',
            quiz: {
              prompt: 'What does "Weh di go ahn?" mean?',
              answer: 'What is going on?',
              choices: ['Where are you going?', 'What is going on?', 'Who is that?'],
            },
          },
          {
            id: 'bel-l2',
            title: 'Understanding',
            subtitle: 'Asking if they follow',
            xp: 25,
            phrase: 'Yu get mi?',
            meaning: 'Do you understand me?',
            note: 'Frequently spoken at the end of sentences to ensure the listener is following along.',
            type: 'star',
            quiz: {
              prompt: 'Translate: "Yu get mi?"',
              answer: 'Do you understand me?',
              choices: ['Did you catch me?', 'Do you understand me?', 'Do you have it?'],
            },
          },
        ],
      },
    ],
  },
  igbo: {
    title: 'Igbo',
    flag: '🇳🇬',
    themeColor: '#071A12', // Forest dark green
    accentColor: '#F4B942',
    units: [
      {
        id: 'igbo-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Igbo Greetings & Welcome',
        lessons: [
          {
            id: 'igbo-l1',
            title: 'Welcome',
            subtitle: 'Warm welcome phrase',
            xp: 20,
            phrase: 'Nnọọ',
            meaning: 'Welcome',
            note: 'Standard Igbo welcoming expression used when a guest arrives at your house.',
            type: 'star',
            quiz: {
              prompt: 'What does "Nnọọ" mean in Igbo?',
              answer: 'Welcome',
              choices: ['Goodbye', 'Welcome', 'Thank you'],
            },
          },
          {
            id: 'igbo-l2',
            title: 'How are you?',
            subtitle: 'Inquiring health',
            xp: 25,
            phrase: 'Kedu ka I mere?',
            meaning: 'How are you doing?',
            note: '"Kedu" means "how". It is the most common conversational starter.',
            type: 'star',
            quiz: {
              prompt: 'What does "Kedu" stand for?',
              answer: 'How',
              choices: ['Where', 'How', 'Who'],
            },
          },
        ],
      },
    ],
  },
  nouchi: {
    title: 'Nouchi Ivoirien',
    flag: '🇨🇮',
    themeColor: '#D4782C', // Orange
    accentColor: '#009B3A', // Green
    units: [
      {
        id: 'nouchi-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'La rue d\'Abidjan',
        lessons: [
          {
            id: 'nou-l1',
            title: 'Greeting',
            subtitle: 'Say hello in Nouchi',
            xp: 20,
            phrase: 'Ça dit quoi?',
            meaning: 'What is going on?',
            note: 'Literally "What does it say?". Used by youths in Côte d\'Ivoire as a general greeting.',
            type: 'star',
            quiz: {
              prompt: 'Que signifie "Ça dit quoi?" en Nouchi?',
              answer: 'What is going on? / Comment ça va?',
              choices: ['What is going on? / Comment ça va?', 'What is he saying?', 'Goodbye'],
            },
          },
          {
            id: 'nou-l2',
            title: 'Money Slang',
            subtitle: 'Talking about cash',
            xp: 25,
            phrase: 'Gbahe / Dogo',
            meaning: 'Money / Cash',
            note: 'Slang terms representing money, critical for market and street situations.',
            type: 'star',
            quiz: {
              prompt: 'Que signifie "Gbahe"?',
              answer: 'Money / Cash',
              choices: ['Friend', 'Money / Cash', 'Car'],
            },
          },
        ],
      },
    ],
  },
  haitian: {
    title: 'Créole Haïtien',
    flag: '🇭🇹',
    themeColor: '#003F87', // Blue
    accentColor: '#D21034', // Red
    units: [
      {
        id: 'hai-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Bonswa & Basics',
        lessons: [
          {
            id: 'hai-l1',
            title: 'Greeting',
            subtitle: 'Standard greetings',
            xp: 20,
            phrase: 'Sak pase?',
            meaning: 'What is happening?',
            note: 'A classic greeting in Haiti. The typical response is "N ap boule" (Everything is fine).',
            type: 'star',
            quiz: {
              prompt: 'What is the common reply to "Sak pase?"',
              answer: 'N ap boule',
              choices: ['Bonswa', 'N ap boule', 'Mesi'],
            },
          },
        ],
      },
    ],
  },
  wolof: {
    title: 'Wolof',
    flag: '🇸🇳',
    themeColor: '#071A12',
    accentColor: '#F4B942',
    units: [
      {
        id: 'wol-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Wolof Greetings',
        lessons: [
          {
            id: 'wol-l1',
            title: 'Hello',
            subtitle: 'Saying hello',
            xp: 20,
            phrase: 'Nangaadef',
            meaning: 'How are you?',
            note: 'The fundamental greeting in Senegal. You reply "Mangi fi rekk" (I am here only / I am good).',
            type: 'star',
            quiz: {
              prompt: 'How do you say "How are you?" in Wolof?',
              answer: 'Nangaadef',
              choices: ['Nangaadef', 'Mangi fi rekk', 'Jerejef'],
            },
          },
        ],
      },
    ],
  },
  sudanese: {
    title: 'Sudanese Arabic',
    flag: '🇸🇩',
    themeColor: '#009B3A',
    accentColor: '#D21034',
    units: [
      {
        id: 'sud-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Sudanese Welcome',
        lessons: [
          {
            id: 'sud-l1',
            title: 'Greetings',
            subtitle: 'How are you',
            xp: 20,
            phrase: 'Kayfak / Shadid?',
            meaning: 'How are you? / Are you strong?',
            note: 'Used daily in Khartoum. "Shadid" means robust or strong, showing concern for health.',
            type: 'star',
            quiz: {
              prompt: 'What does "Shadid" literally mean?',
              answer: 'Strong / Robust',
              choices: ['Weak', 'Strong / Robust', 'Tired'],
            },
          },
        ],
      },
    ],
  },
  nubian: {
    title: 'Nubian',
    flag: '🇪🇬',
    themeColor: '#D4782C',
    accentColor: '#003F87',
    units: [
      {
        id: 'nub-u1',
        title: 'SECTION 1, UNIT 1',
        description: 'Nubian Expressions',
        lessons: [
          {
            id: 'nub-l1',
            title: 'Hello',
            subtitle: 'General greeting',
            xp: 20,
            phrase: 'Salamat',
            meaning: 'Greetings / Peace',
            note: 'Used along the Nile Valley in southern Egypt and northern Sudan.',
            type: 'star',
            quiz: {
              prompt: 'What is "Salamat" used for?',
              answer: 'Greetings / Peace',
              choices: ['Goodbye', 'Greetings / Peace', 'Thank you'],
            },
          },
        ],
      },
    ],
  },
};
