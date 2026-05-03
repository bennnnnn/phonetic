/**
 * Vocabulary word themes — used in the vocabulary section of the home screen.
 * Each theme has an emoji, description, and list of words with pronunciation.
 *
 * Pronunciation is a simple English respelling — what the word sounds like,
 * not IPA phonetics. E.g. bought → bot, caught → kot, through → throo.
 *
 * To add a new theme: add an entry here. No other code changes needed.
 */

export type VocabWord = {
  text: string
  pron: string // simple respelling
}

const WORDS = {
  Fruits: {
    emoji: '🍎',
    desc: 'apple · banana · orange · more',
    words: [
      // ── Has emojis ──
      { text: 'apple', pron: 'ap-uhl' },          // 🍎
      { text: 'banana', pron: 'buh-na-nuh' },      // 🍌
      { text: 'orange', pron: 'or-inj' },          // 🍊
      { text: 'grape', pron: 'grayp' },            // 🍇
      { text: 'lemon', pron: 'lem-uhn' },          // 🍋
      { text: 'lime', pron: 'lyme' },              // 🍋‍🟩
      { text: 'cherry', pron: 'cher-ee' },         // 🍒
      { text: 'peach', pron: 'peech' },            // 🍑
      { text: 'pear', pron: 'pair' },              // 🍐
      { text: 'mango', pron: 'mang-goh' },         // 🥭
      { text: 'kiwi', pron: 'kee-wee' },           // 🥝
      { text: 'melon', pron: 'mel-uhn' },          // 🍈
      { text: 'strawberry', pron: 'straw-ber-ee' }, // 🍓
      { text: 'blueberry', pron: 'bloo-ber-ee' },  // 🫐
      { text: 'pineapple', pron: 'pyne-ap-uhl' },  // 🍍
      { text: 'coconut', pron: 'koh-kuh-nut' },    // 🥥
      { text: 'watermelon', pron: 'waw-tuhr-mel-uhn' }, // 🍉
      { text: 'avocado', pron: 'av-uh-kah-doh' },  // 🥑
      { text: 'olive', pron: 'ol-iv' },             // 🫒

      // ── Need Flaticon SVGs ──
      { text: 'plum', pron: 'plum' },
      { text: 'apricot', pron: 'ap-ri-kot' },
      { text: 'nectarine', pron: 'nek-tuh-reen' },
      { text: 'pomegranate', pron: 'pom-uh-gran-it' },
      { text: 'papaya', pron: 'puh-pye-yuh' },
      { text: 'guava', pron: 'gwah-vuh' },
      { text: 'lychee', pron: 'lee-chee' },
      { text: 'durian', pron: 'door-ee-uhn' },
      { text: 'fig', pron: 'fig' },
      { text: 'date', pron: 'dayt' },
      { text: 'grapefruit', pron: 'grayp-froot' },
      { text: 'tangerine', pron: 'tan-juh-reen' },
      { text: 'clementine', pron: 'klem-uhn-tyne' },
      { text: 'kumquat', pron: 'kum-kwot' },
      { text: 'persimmon', pron: 'puhr-sim-uhn' },
      { text: 'honeydew', pron: 'hun-ee-dyoo' },
      { text: 'cantaloupe', pron: 'kan-tuh-lohp' },
      { text: 'jackfruit', pron: 'jak-froot' },
      { text: 'dragonfruit', pron: 'drag-uhn-froot' },
      { text: 'passionfruit', pron: 'pash-uhn-froot' },
      { text: 'starfruit', pron: 'star-froot' },
      { text: 'plantain', pron: 'plan-tin' },
      { text: 'raspberry', pron: 'raz-ber-ee' },
      { text: 'blackberry', pron: 'blak-ber-ee' },
      { text: 'cranberry', pron: 'kran-ber-ee' },
      { text: 'boysenberry', pron: 'boy-zuhn-ber-ee' },
      { text: 'gooseberry', pron: 'goos-ber-ee' },
      { text: 'mulberry', pron: 'mul-ber-ee' },
      { text: 'rhubarb', pron: 'roo-barb' },
      { text: 'tamarind', pron: 'tam-uh-rind' },
    ],
  },
  Vegetables: {
    emoji: '🥦',
    desc: 'carrot · tomato · broccoli · more',
    words: [
      // ── Has emojis ──
      { text: 'carrot', pron: 'kair-uht' },     // 🥕
      { text: 'tomato', pron: 'tuh-may-toh' },   // 🍅
      { text: 'potato', pron: 'puh-tay-toh' },   // 🥔
      { text: 'onion', pron: 'uhn-yuhn' },       // 🧅
      { text: 'pepper', pron: 'pep-uhr' },        // 🫑
      { text: 'corn', pron: 'korn' },             // 🌽
      { text: 'broccoli', pron: 'brok-uh-lee' },  // 🥦
      { text: 'cucumber', pron: 'kyoo-kum-buhr' }, // 🥒
      { text: 'eggplant', pron: 'eg-plant' },     // 🍆
      { text: 'garlic', pron: 'gar-lik' },        // 🧄
      { text: 'bean', pron: 'been' },             // 🫘
      { text: 'pea', pron: 'pee' },               // 🫛
      { text: 'pumpkin', pron: 'pump-kin' },      // 🎃
      { text: 'mushroom', pron: 'mush-room' },    // 🍄
      { text: 'ginger', pron: 'jin-juhr' },       // 🫚
      { text: 'chestnut', pron: 'ches-nut' },     // 🌰
      { text: 'peanut', pron: 'pee-nut' },        // 🥜
      { text: 'hot-pepper', pron: 'hot-pep-uhr' }, // 🌶️

      // ── Need Flaticon SVGs ──
      { text: 'celery', pron: 'sel-uh-ree' },
      { text: 'lettuce', pron: 'let-iss' },
      { text: 'spinach', pron: 'spin-itch' },
      { text: 'cabbage', pron: 'kab-ij' },
      { text: 'asparagus', pron: 'uh-spair-uh-gus' },
      { text: 'beetroot', pron: 'beet-root' },
      { text: 'radish', pron: 'rad-ish' },
      { text: 'turnip', pron: 'tur-nip' },
      { text: 'cauliflower', pron: 'kol-ee-flow-uhr' },
      { text: 'zucchini', pron: 'zoo-kee-nee' },
      { text: 'artichoke', pron: 'ar-ti-chohk' },
      { text: 'kale', pron: 'kayl' },
      { text: 'sweet-potato', pron: 'sweet-puh-tay-toh' },
      { text: 'okra', pron: 'oh-kruh' },
      { text: 'leek', pron: 'leek' },
      { text: 'parsnip', pron: 'par-snip' },
      { text: 'rhubarb', pron: 'roo-barb' },
      { text: 'sprout', pron: 'sprowt' },
    ],
  },
  Kitchen: {
    emoji: '🍳',
    desc: 'spoon · knife · pan · more',
    words: [
      // ── Utensils (has emojis) ──
      { text: 'spoon', pron: 'spoon' },           // 🥄
      { text: 'fork', pron: 'fork' },              // 🍴
      { text: 'knife', pron: 'nife' },             // 🔪
      { text: 'chopsticks', pron: 'chop-stiks' },  // 🥢

      // ── Dishware (has emojis) ──
      { text: 'plate', pron: 'playt' },            // 🍽️
      { text: 'bowl', pron: 'bohl' },              // 🥣
      { text: 'cup', pron: 'kup' },                // 🥤

      // ── Cookware (has emojis) ──
      { text: 'pan', pron: 'pan' },                // 🍳
      { text: 'pot', pron: 'pot' },                // 🍲

      // ── Storage & pantry (has emojis) ──
      { text: 'jar', pron: 'jar' },                // 🫙
      { text: 'honey', pron: 'hun-ee' },           // 🍯
      { text: 'ice', pron: 'yss' },                // 🧊

      // ── Serving (has emojis) ──
      { text: 'teapot', pron: 'tee-pot' },         // 🫖
      { text: 'fondue', pron: 'fon-dyoo' },        // 🫕

      // ── Kitchenware (need Flaticon SVGs) ──
      { text: 'cutting-board', pron: 'kut-ing-bord' },
      { text: 'rolling-pin', pron: 'roh-ling-pin' },
      { text: 'colander', pron: 'kol-un-duhr' },
      { text: 'grater', pron: 'gray-tuhr' },
      { text: 'peeler', pron: 'pee-luhr' },
      { text: 'whisk', pron: 'wisk' },
      { text: 'ladle', pron: 'lay-dl' },
      { text: 'tongs', pron: 'tongz' },
      { text: 'measuring-cup', pron: 'mezh-ur-ing-kup' },
      { text: 'mixing-bowl', pron: 'mik-sing-bohl' },
      { text: 'baking-tray', pron: 'bayk-ing-tray' },
      { text: 'muffin-tin', pron: 'muf-in-tin' },

      // ── Appliances (need Flaticon SVGs) ──
      { text: 'oven', pron: 'uhv-uhn' },
      { text: 'stove', pron: 'stohv' },
      { text: 'microwave', pron: 'mye-kroh-wayv' },
      { text: 'toaster', pron: 'toh-stuhr' },
      { text: 'kettle', pron: 'ket-uhl' },
      { text: 'fridge', pron: 'frij' },
      { text: 'freezer', pron: 'free-zuhr' },
      { text: 'dishwasher', pron: 'dish-wosh-uhr' },
      { text: 'blender', pron: 'blen-duhr' },
      { text: 'mixer', pron: 'mik-suhr' },
      { text: 'air-fryer', pron: 'air-fry-uhr' },
      { text: 'slow-cooker', pron: 'sloh-kook-uhr' },
      { text: 'coffee-maker', pron: 'kof-ee-may-kuhr' },

      // ── Cleaning (need Flaticon SVGs) ──
      { text: 'sink', pron: 'sink' },
      { text: 'sponge', pron: 'spunj' },
      { text: 'dish-rack', pron: 'dish-rak' },
      { text: 'trash-can', pron: 'trash-kan' },
    ],
  },
  Furniture: {
    emoji: '🛋️',
    desc: 'bed · sofa · table · more',
    words: [
      // ── Seating (has emojis) ──
      { text: 'chair', pron: 'chair' },          // 🪑
      { text: 'sofa', pron: 'soh-fuh' },         // 🛋️

      // ── Sleeping (has emojis) ──
      { text: 'bed', pron: 'bed' },             // 🛏️
      { text: 'pillow', pron: 'pil-oh' },        // 🛌

      // ── Lighting (has emojis) ──
      { text: 'lamp', pron: 'lamp' },            // 💡

      // ── Tables & surfaces (need Flaticon SVGs) ──
      { text: 'table', pron: 'tay-buhl' },
      { text: 'desk', pron: 'desk' },
      { text: 'nightstand', pron: 'nyte-stand' },
      { text: 'coffee-table', pron: 'kof-ee-tay-buhl' },
      { text: 'dining-table', pron: 'dy-ning-tay-buhl' },
      { text: 'vanity', pron: 'van-uh-tee' },

      // ── Seating extra (need Flaticon SVGs) ──
      { text: 'stool', pron: 'stool' },
      { text: 'bench', pron: 'bench' },
      { text: 'ottoman', pron: 'ot-uh-muhn' },
      { text: 'rocking-chair', pron: 'rok-ing-chair' },
      { text: 'armchair', pron: 'arm-chair' },
      { text: 'futon', pron: 'fyoo-ton' },

      // ── Storage (need Flaticon SVGs) ──
      { text: 'shelf', pron: 'shelf' },
      { text: 'bookshelf', pron: 'book-shelf' },
      { text: 'cabinet', pron: 'kab-uh-net' },
      { text: 'drawer', pron: 'dror' },
      { text: 'dresser', pron: 'dres-uhr' },
      { text: 'wardrobe', pron: 'wor-drohb' },
      { text: 'closet', pron: 'kloz-it' },
      { text: 'chest', pron: 'chest' },
      { text: 'trunk', pron: 'trunk' },

      // ── Decor & textiles (need Flaticon SVGs) ──
      { text: 'rug', pron: 'rug' },
      { text: 'curtain', pron: 'kur-tuhn' },
      { text: 'mirror', pron: 'mir-uhr' },
      { text: 'clock', pron: 'klok' },
      { text: 'vase', pron: 'vayss' },
      { text: 'picture-frame', pron: 'pik-chur-fraym' },
      { text: 'cushion', pron: 'koosh-uhn' },
      { text: 'blanket', pron: 'blang-ket' },
      { text: 'mattress', pron: 'mat-riss' },
    ],
  },
  'Car Parts': {
    emoji: '🚗',
    desc: 'engine · brake · wheel · more',
    words: [
      // ── Has emojis ──
      { text: 'wheel', pron: 'weel' },           // 🛞
      { text: 'tire', pron: 'tire' },             // 🛞
      { text: 'engine', pron: 'en-jin' },         // 🔧
      { text: 'brake', pron: 'brayk' },           // 🛑
      { text: 'horn', pron: 'horn' },             // 📯
      { text: 'seat', pron: 'seet' },             // 💺
      { text: 'door', pron: 'dor' },              // 🚪
      { text: 'window', pron: 'win-doh' },        // 🪟
      { text: 'mirror', pron: 'mir-uhr' },        // 🪞
      { text: 'battery', pron: 'bat-uh-ree' },    // 🔋
      { text: 'gear', pron: 'geer' },             // ⚙️
      { text: 'dashboard', pron: 'dash-bord' },   // 📊

      // ── Need Flaticon SVGs ──
      { text: 'pedal', pron: 'ped-uhl' },
      { text: 'trunk', pron: 'trunk' },
      { text: 'hood', pron: 'hood' },
      { text: 'bumper', pron: 'bum-puhr' },
      { text: 'headlight', pron: 'hed-lyte' },
      { text: 'taillight', pron: 'tayl-lyte' },
      { text: 'steering-wheel', pron: 'steer-ing-weel' },
      { text: 'windshield', pron: 'wind-sheeld' },
      { text: 'exhaust', pron: 'eg-zawst' },
      { text: 'radiator', pron: 'ray-dee-ay-tuhr' },
      { text: 'muffler', pron: 'muf-luhr' },
      { text: 'spare-tire', pron: 'spair-tire' },
      { text: 'jack', pron: 'jak' },
      { text: 'seatbelt', pron: 'seet-belt' },
      { text: 'airbag', pron: 'air-bag' },
      { text: 'ignition', pron: 'ig-nish-un' },
    ],
  },
  Body: {
    emoji: '🦵',
    desc: 'head · shoulder · knee · more',
    words: [
      // ── Has emojis ──
      { text: 'head', pron: 'hed' },              // 🗣️
      { text: 'hand', pron: 'hand' },              // ✋
      { text: 'foot', pron: 'foot' },              // 🦶
      { text: 'arm', pron: 'arm' },                // 💪
      { text: 'leg', pron: 'leg' },                // 🦵
      { text: 'face', pron: 'fayss' },             // 😃
      { text: 'nose', pron: 'nohz' },              // 👃
      { text: 'mouth', pron: 'mowth' },            // 👄
      { text: 'eye', pron: 'eye' },                // 👁️
      { text: 'ear', pron: 'eer' },                // 👂
      { text: 'back', pron: 'bak' },               // 🔙
      { text: 'knee', pron: 'nee' },               // 🦵
      { text: 'finger', pron: 'fing-guhr' },       // ☝️
      { text: 'elbow', pron: 'el-boh' },           // 💪
      { text: 'shoulder', pron: 'shohl-duhr' },    // 🙋
      { text: 'neck', pron: 'nek' },               // 🧣
      { text: 'chest', pron: 'chest' },            // 💪
      { text: 'tooth', pron: 'tooth' },            // 🦷
      { text: 'tongue', pron: 'tung' },            // 👅
      { text: 'thumb', pron: 'thum' },             // 👍
      { text: 'ankle', pron: 'ang-kuhl' },         // 🦶
      { text: 'wrist', pron: 'rist' },             // ⌚

      // ── Need Flaticon SVGs ──
      { text: 'forehead', pron: 'for-hed' },
      { text: 'chin', pron: 'chin' },
      { text: 'cheek', pron: 'cheek' },
      { text: 'jaw', pron: 'jaw' },
      { text: 'eyebrow', pron: 'eye-brow' },
      { text: 'eyelash', pron: 'eye-lash' },
      { text: 'nostril', pron: 'nos-tril' },
      { text: 'lip', pron: 'lip' },
      { text: 'palm', pron: 'pahm' },
      { text: 'fist', pron: 'fist' },
      { text: 'nail', pron: 'nayl' },
      { text: 'knuckle', pron: 'nuk-uhl' },
      { text: 'hip', pron: 'hip' },
      { text: 'thigh', pron: 'thye' },
      { text: 'shin', pron: 'shin' },
      { text: 'calf', pron: 'kaf' },
      { text: 'heel', pron: 'heel' },
      { text: 'toe', pron: 'toh' },
      { text: 'spine', pron: 'spyne' },
      { text: 'rib', pron: 'rib' },
      { text: 'waist', pron: 'wayst' },
      { text: 'belly', pron: 'bel-ee' },
      { text: 'skin', pron: 'skin' },
      { text: 'muscle', pron: 'mus-uhl' },
      { text: 'brain', pron: 'brayn' },
      { text: 'heart', pron: 'hart' },
      { text: 'lung', pron: 'lung' },
      { text: 'bone', pron: 'bohn' },
    ],
  },
  Clothes: {
    emoji: '👕',
    desc: 'shirt · jacket · scarf · more',
    words: [
      // ── Has emojis ──
      { text: 'shirt', pron: 'shurt' },           // 👕
      { text: 'pants', pron: 'pants' },            // 👖
      { text: 'dress', pron: 'dress' },            // 👗
      { text: 'coat', pron: 'koht' },              // 🧥
      { text: 'hat', pron: 'hat' },                // 🎩
      { text: 'shoe', pron: 'shoo' },              // 👟
      { text: 'sock', pron: 'sok' },               // 🧦
      { text: 'belt', pron: 'belt' },              // 🩳
      { text: 'glove', pron: 'gluv' },             // 🧤
      { text: 'scarf', pron: 'skarf' },            // 🧣
      { text: 'jacket', pron: 'jak-it' },          // 🧥
      { text: 'boot', pron: 'boot' },              // 🥾
      { text: 'sweater', pron: 'swet-uhr' },       // 🧶
      { text: 'shorts', pron: 'shorts' },          // 🩳
      { text: 'skirt', pron: 'skurt' },            // 👗
      { text: 'tie', pron: 'tye' },                // 👔
      { text: 'vest', pron: 'vest' },              // 🦺
      { text: 'uniform', pron: 'yoo-nuh-form' },   // 👔
      { text: 'sneaker', pron: 'snee-kuhr' },      // 👟
      { text: 'sandal', pron: 'san-duhl' },        // 🩴

      // ── Need Flaticon SVGs ──
      { text: 't-shirt', pron: 'tee-shurt' },
      { text: 'hoodie', pron: 'hood-ee' },
      { text: 'jeans', pron: 'jeenz' },
      { text: 'raincoat', pron: 'rayn-koht' },
      { text: 'suit', pron: 'soot' },
      { text: 'blazer', pron: 'blay-zuhr' },
      { text: 'cardigan', pron: 'kar-di-guhn' },
      { text: 'tank-top', pron: 'tank-top' },
      { text: 'overalls', pron: 'oh-vuhr-olz' },
      { text: 'pajamas', pron: 'puh-jah-muhz' },
      { text: 'robe', pron: 'rohb' },
      { text: 'swimsuit', pron: 'swim-soot' },
      { text: 'umpire', pron: 'um-pyre' },
      { text: 'helmet', pron: 'hel-met' },
      { text: 'cap', pron: 'kap' },
      { text: 'beanie', pron: 'bee-nee' },
      { text: 'earmuffs', pron: 'eer-mufs' },
      { text: 'sunglasses', pron: 'sun-glas-ez' },
      { text: 'watch', pron: 'woch' },
      { text: 'bracelet', pron: 'brays-let' },
      { text: 'necklace', pron: 'nek-liss' },
      { text: 'ring', pron: 'ring' },
    ],
  },
  'Body Actions': {
    emoji: '🫣',
    desc: 'sneeze · cough · whisper · more',
    words: [
      // ── Has emojis ──
      { text: 'sneeze', pron: 'sneez' },          // 🤧
      { text: 'cough', pron: 'kof' },              // 😷
      { text: 'snore', pron: 'snor' },             // 💤
      { text: 'spit', pron: 'spit' },              // 💦
      { text: 'stare', pron: 'stair' },            // 👀
      { text: 'squint', pron: 'skwint' },          // 😑
      { text: 'blink', pron: 'blink' },            // 👁️
      { text: 'wink', pron: 'wink' },              // 😉
      { text: 'yawn', pron: 'yawn' },              // 🥱
      { text: 'sigh', pron: 'sye' },               // 😮‍💨
      { text: 'whisper', pron: 'wis-puhr' },       // 🤫
      { text: 'shout', pron: 'showt' },            // 📢
      { text: 'whistle', pron: 'wis-uhl' },        // 🎵
      { text: 'laugh', pron: 'laf' },              // 😂
      { text: 'smile', pron: 'smyle' },            // 😊
      { text: 'cry', pron: 'krye' },               // 😭
      { text: 'wave', pron: 'wayv' },              // 👋
      { text: 'clap', pron: 'klap' },              // 👏
      { text: 'nod', pron: 'nod' },                // 👍
      { text: 'hug', pron: 'hug' },                // 🤗
      { text: 'chew', pron: 'choo' },              // 🦷
      { text: 'swallow', pron: 'swol-oh' },        // 🤤

      // ── Need Flaticon SVGs ──
      { text: 'glare', pron: 'glair' },
      { text: 'glance', pron: 'glanss' },
      { text: 'frown', pron: 'frown' },
      { text: 'grin', pron: 'grin' },
      { text: 'giggle', pron: 'gig-uhl' },
      { text: 'scream', pron: 'skreem' },
      { text: 'burp', pron: 'burp' },
      { text: 'hiccup', pron: 'hik-up' },
      { text: 'stretch', pron: 'strech' },
      { text: 'shiver', pron: 'shiv-uhr' },
      { text: 'tremble', pron: 'trem-buhl' },
      { text: 'blush', pron: 'blush' },
      { text: 'pout', pron: 'powt' },
      { text: 'fidget', pron: 'fij-et' },
      { text: 'squirm', pron: 'skwurm' },
      { text: 'shrug', pron: 'shrug' },
      { text: 'point', pron: 'poynt' },
      { text: 'salute', pron: 'suh-loot' },
      { text: 'bow', pron: 'bow' },
      { text: 'kneel', pron: 'neel' },
      { text: 'kick', pron: 'kik' },
      { text: 'punch', pron: 'punch' },
      { text: 'slap', pron: 'slap' },
      { text: 'pinch', pron: 'pinch' },
      { text: 'tickle', pron: 'tik-uhl' },
    ],
  },
  Feelings: {
    emoji: '💫',
    desc: 'happy · brave · proud · more',
    words: [
      // ── Has emojis ──
      { text: 'happy', pron: 'hap-ee' },           // 😊
      { text: 'sad', pron: 'sad' },                 // 😢
      { text: 'angry', pron: 'ang-gree' },          // 😠
      { text: 'tired', pron: 'tired' },             // 😴
      { text: 'scared', pron: 'skaird' },           // 😨
      { text: 'brave', pron: 'brayv' },             // 🦸
      { text: 'calm', pron: 'kahm' },               // 🧘
      { text: 'shy', pron: 'shye' },                // 😳
      { text: 'kind', pron: 'kind' },               // 💕
      { text: 'silly', pron: 'sil-ee' },            // 🤪
      { text: 'worried', pron: 'wur-eed' },         // 😟
      { text: 'excited', pron: 'ek-sy-ted' },       // 🤩
      { text: 'nervous', pron: 'nur-vus' },         // 😰
      { text: 'lonely', pron: 'lohn-lee' },         // 😔
      { text: 'surprised', pron: 'suhr-pryzd' },    // 😲
      { text: 'confused', pron: 'kun-fyoozd' },     // 😕
      { text: 'jealous', pron: 'jel-us' },          // 😒
      { text: 'grateful', pron: 'grayt-ful' },      // 🙏
      { text: 'curious', pron: 'kyoor-ee-us' },     // 🤔
      { text: 'proud', pron: 'prowd' },             // 🏆

      // ── Need Flaticon SVGs ──
      { text: 'love', pron: 'luv' },
      { text: 'hate', pron: 'hayt' },
      { text: 'hope', pron: 'hohp' },
      { text: 'trust', pron: 'trust' },
      { text: 'guilt', pron: 'gilt' },
      { text: 'shame', pron: 'shaym' },
      { text: 'envy', pron: 'en-vee' },
      { text: 'greed', pron: 'greed' },
      { text: 'bored', pron: 'bord' },
      { text: 'lazy', pron: 'lay-zee' },
      { text: 'polite', pron: 'puh-lyte' },
      { text: 'rude', pron: 'rood' },
      { text: 'honest', pron: 'on-ist' },
      { text: 'loyal', pron: 'loy-uhl' },
      { text: 'generous', pron: 'jen-uhr-us' },
      { text: 'selfish', pron: 'sel-fish' },
    ],
  },
  Nature: {
    emoji: '🌿',
    desc: 'river · cloud · star · more',
    words: [
      // ── Has emojis ──
      { text: 'rain', pron: 'rayn' },              // 🌧️
      { text: 'snow', pron: 'snoh' },              // ❄️
      { text: 'sun', pron: 'sun' },                // ☀️
      { text: 'moon', pron: 'moon' },              // 🌙
      { text: 'star', pron: 'star' },              // ⭐
      { text: 'tree', pron: 'tree' },              // 🌳
      { text: 'leaf', pron: 'leef' },              // 🍃
      { text: 'cloud', pron: 'klowd' },            // ☁️
      { text: 'wind', pron: 'wind' },              // 💨
      { text: 'wave', pron: 'wayv' },              // 🌊
      { text: 'rock', pron: 'rok' },               // 🪨
      { text: 'river', pron: 'riv-uhr' },           // 🏞️
      { text: 'lake', pron: 'layk' },              // 🏞️
      { text: 'hill', pron: 'hil' },               // ⛰️
      { text: 'ocean', pron: 'oh-shun' },           // 🌊
      { text: 'mountain', pron: 'mown-tin' },       // 🏔️
      { text: 'forest', pron: 'for-ist' },          // 🌲
      { text: 'flower', pron: 'flow-uhr' },         // 🌸
      { text: 'rainbow', pron: 'rayn-boh' },        // 🌈
      { text: 'island', pron: 'eye-land' },         // 🏝️
      { text: 'cave', pron: 'kayv' },              // ⛰️
      { text: 'volcano', pron: 'vol-kay-noh' },     // 🌋
    ],
  },
  Animals: {
    emoji: '🐾',
    desc: 'dog · horse · lion · more',
    words: [
      // ── Has emojis ──
      { text: 'cat', pron: 'kat' },                // 🐱
      { text: 'dog', pron: 'dog' },                // 🐶
      { text: 'bird', pron: 'burd' },              // 🐦
      { text: 'fish', pron: 'fish' },              // 🐟
      { text: 'horse', pron: 'horss' },            // 🐴
      { text: 'cow', pron: 'kow' },                // 🐮
      { text: 'pig', pron: 'pig' },                // 🐷
      { text: 'sheep', pron: 'sheep' },            // 🐑
      { text: 'duck', pron: 'duk' },               // 🦆
      { text: 'bear', pron: 'bair' },              // 🐻
      { text: 'lion', pron: 'lye-uhn' },           // 🦁
      { text: 'wolf', pron: 'wolf' },              // 🐺
      { text: 'deer', pron: 'deer' },              // 🦌
      { text: 'mouse', pron: 'mowss' },            // 🐭
      { text: 'fox', pron: 'foks' },               // 🦊
      { text: 'rabbit', pron: 'rab-it' },          // 🐰
      { text: 'frog', pron: 'frog' },              // 🐸
      { text: 'turtle', pron: 'tur-tuhl' },        // 🐢
      { text: 'owl', pron: 'owl' },                // 🦉
      { text: 'eagle', pron: 'ee-guhl' },          // 🦅
      { text: 'shark', pron: 'shark' },            // 🦈
      { text: 'whale', pron: 'wayl' },             // 🐳
      { text: 'dolphin', pron: 'dol-fin' },        // 🐬
      { text: 'monkey', pron: 'mung-kee' },        // 🐒
      { text: 'elephant', pron: 'el-uh-funt' },    // 🐘
      { text: 'snake', pron: 'snayk' },            // 🐍
      { text: 'butterfly', pron: 'but-uhr-flye' }, // 🦋
      { text: 'bee', pron: 'bee' },                // 🐝
    ],
  },
  'Time & Weather': {
    emoji: '⏰',
    desc: 'storm · fog · warm · more',
    words: [
      // ── Has emojis ──
      { text: 'day', pron: 'day' },                // ☀️
      { text: 'week', pron: 'week' },              // 📅
      { text: 'month', pron: 'munth' },            // 📅
      { text: 'year', pron: 'yeer' },              // 🗓️
      { text: 'hot', pron: 'hot' },                // 🥵
      { text: 'cold', pron: 'kohld' },             // 🥶
      { text: 'warm', pron: 'warm' },              // 🌤️
      { text: 'cool', pron: 'kool' },              // 😎
      { text: 'wet', pron: 'wet' },                // 💧
      { text: 'dry', pron: 'drye' },               // 🏜️
      { text: 'bright', pron: 'brite' },           // ☀️
      { text: 'dark', pron: 'dark' },              // 🌑
      { text: 'storm', pron: 'storm' },            // ⛈️
      { text: 'fog', pron: 'fog' },                // 🌫️
      { text: 'breeze', pron: 'breez' },           // 💨
      { text: 'hurricane', pron: 'hur-uh-kayn' },  // 🌀
      { text: 'tornado', pron: 'tor-nay-doh' },    // 🌪️
      { text: 'humid', pron: 'hyoo-mid' },         // 💧
      { text: 'freezing', pron: 'free-zing' },     // 🥶
      { text: 'mild', pron: 'myld' },              // 🌤️
    ],
  },
  'Food & Drink': {
    emoji: '🍔',
    desc: 'bread · milk · pizza · more',
    words: [
      // ── Has emojis ──
      { text: 'bread', pron: 'bred' },             // 🍞
      { text: 'cheese', pron: 'cheez' },            // 🧀
      { text: 'milk', pron: 'milk' },               // 🥛
      { text: 'butter', pron: 'but-uhr' },          // 🧈
      { text: 'egg', pron: 'eg' },                  // 🥚
      { text: 'rice', pron: 'ryce' },               // 🍚
      { text: 'pasta', pron: 'pah-stuh' },          // 🍝
      { text: 'pizza', pron: 'peet-suh' },          // 🍕
      { text: 'burger', pron: 'bur-guhr' },         // 🍔
      { text: 'fries', pron: 'fryz' },              // 🍟
      { text: 'sandwich', pron: 'sand-wich' },      // 🥪
      { text: 'soup', pron: 'soop' },               // 🍜
      { text: 'pancake', pron: 'pan-kayk' },        // 🥞
      { text: 'cookie', pron: 'kook-ee' },          // 🍪
      { text: 'chocolate', pron: 'chok-luht' },     // 🍫
      { text: 'juice', pron: 'jooss' },             // 🧃
      { text: 'tea', pron: 'tee' },                 // 🫖
      { text: 'coffee', pron: 'kof-ee' },           // ☕
      { text: 'ice-cream', pron: 'ys-kreem' },      // 🍦
      { text: 'salt', pron: 'solt' },               // 🧂
      { text: 'sugar', pron: 'shoog-uhr' },         // 🧂

      // ── Need Flaticon SVGs ──
      { text: 'bacon', pron: 'bay-kun' },
      { text: 'sausage', pron: 'saw-sij' },
      { text: 'ham', pron: 'ham' },
      { text: 'steak', pron: 'stayk' },
      { text: 'chicken', pron: 'chik-en' },
      { text: 'fish', pron: 'fish' },
      { text: 'shrimp', pron: 'shrimp' },
      { text: 'noodles', pron: 'noo-dlz' },
      { text: 'dumpling', pron: 'dump-ling' },
      { text: 'salad', pron: 'sal-uhd' },
      { text: 'popcorn', pron: 'pop-korn' },
      { text: 'cereal', pron: 'seer-ee-uhl' },
      { text: 'yogurt', pron: 'yoh-guht' },
      { text: 'cake', pron: 'kayk' },
      { text: 'pie', pron: 'pye' },
      { text: 'candy', pron: 'kan-dee' },
      { text: 'jam', pron: 'jam' },
      { text: 'oil', pron: 'oyl' },
      { text: 'vinegar', pron: 'vin-uh-guhr' },
      { text: 'sauce', pron: 'sawss' },
    ],
  },
  'Home & Rooms': {
    emoji: '🏠',
    desc: 'house · kitchen · bathroom · more',
    words: [
      // ── Has emojis ──
      { text: 'house', pron: 'hows' },             // 🏠
      { text: 'room', pron: 'room' },               // 🚪
      { text: 'kitchen', pron: 'kich-en' },         // 🍳
      { text: 'bathroom', pron: 'bath-room' },      // 🚿
      { text: 'bedroom', pron: 'bed-room' },        // 🛏️
      { text: 'garage', pron: 'guh-rahj' },         // 🚗
      { text: 'garden', pron: 'gar-dn' },           // 🌻
      { text: 'roof', pron: 'roof' },               // 🏠
      { text: 'floor', pron: 'flor' },              // 🏢
      { text: 'wall', pron: 'wol' },                // 🧱
      { text: 'lock', pron: 'lok' },                // 🔒
      { text: 'key', pron: 'kee' },                 // 🔑
      { text: 'trash', pron: 'trash' },             // 🗑️
      { text: 'shower', pron: 'show-uhr' },         // 🚿
      { text: 'toilet', pron: 'toy-let' },          // 🚽
      { text: 'bathtub', pron: 'bath-tub' },        // 🛁
      { text: 'broom', pron: 'broom' },             // 🧹
      { text: 'vacuum', pron: 'vak-yoom' },         // 🧹

      // ── Need Flaticon SVGs ──
      { text: 'living-room', pron: 'liv-ing-room' },
      { text: 'dining-room', pron: 'dy-ning-room' },
      { text: 'hallway', pron: 'hol-way' },
      { text: 'balcony', pron: 'bal-kuh-nee' },
      { text: 'basement', pron: 'bays-ment' },
      { text: 'attic', pron: 'at-ik' },
      { text: 'stairs', pron: 'stairz' },
      { text: 'front-door', pron: 'frunt-dor' },
      { text: 'house-window', pron: 'hows-win-doh' },
      { text: 'fence', pron: 'fenss' },
      { text: 'gate', pron: 'gayt' },
      { text: 'driveway', pron: 'dryve-way' },
      { text: 'patio', pron: 'pat-ee-oh' },
      { text: 'chimney', pron: 'chim-nee' },
      { text: 'smoke-detector', pron: 'smohk-de-tek-tuhr' },
    ],
  },
  Transportation: {
    emoji: '🚗',
    desc: 'car · plane · train · more',
    words: [
      // ── Has emojis ──
      { text: 'car', pron: 'kar' },                // 🚗
      { text: 'bus', pron: 'bus' },                // 🚌
      { text: 'train', pron: 'trayn' },            // 🚂
      { text: 'plane', pron: 'playn' },            // ✈️
      { text: 'bike', pron: 'byke' },              // 🚲
      { text: 'truck', pron: 'truk' },             // 🚛
      { text: 'van', pron: 'van' },                // 🚐
      { text: 'taxi', pron: 'tak-see' },           // 🚕
      { text: 'subway', pron: 'sub-way' },         // 🚇
      { text: 'ferry', pron: 'fer-ee' },           // ⛴️
      { text: 'helicopter', pron: 'hel-i-kop-tuhr' }, // 🚁
      { text: 'boat', pron: 'boht' },              // ⛵
      { text: 'scooter', pron: 'skoo-tuhr' },      // 🛴
      { text: 'skateboard', pron: 'skayt-bord' },  // 🛹
      { text: 'station', pron: 'stay-shun' },      // 🚉
      { text: 'airport', pron: 'air-port' },       // ✈️
      { text: 'bridge', pron: 'brij' },            // 🌉
      { text: 'map', pron: 'map' },                // 🗺️

      // ── Need Flaticon SVGs ──
      { text: 'ticket', pron: 'tik-it' },
      { text: 'ambulance', pron: 'am-byoo-lanss' },
      { text: 'police-car', pron: 'puh-lees-kar' },
      { text: 'fire-truck', pron: 'fire-truk' },
      { text: 'motorcycle', pron: 'moh-tuh-sy-kuhl' },
      { text: 'tractor', pron: 'trak-tuhr' },
      { text: 'sailboat', pron: 'sayl-boht' },
      { text: 'canoe', pron: 'kuh-noo' },
      { text: 'kayak', pron: 'kye-ak' },
      { text: 'hot-air-balloon', pron: 'hot-air-buh-loon' },
      { text: 'parachute', pron: 'pair-uh-shoot' },
      { text: 'rocket', pron: 'rok-et' },
      { text: 'spaceship', pron: 'spays-ship' },
      { text: 'tram', pron: 'tram' },
      { text: 'cable-car', pron: 'kay-buhl-kar' },
      { text: 'rickshaw', pron: 'rik-shaw' },
      { text: 'forklift', pron: 'fork-lift' },
      { text: 'bulldozer', pron: 'bul-doh-zuhr' },
    ],
  },
  'Sports & Hobbies': {
    emoji: '⚽',
    desc: 'soccer · swimming · yoga · more',
    words: [
      // ── Has emojis ──
      { text: 'soccer', pron: 'sok-uhr' },         // ⚽
      { text: 'basketball', pron: 'bas-ket-bol' },  // 🏀
      { text: 'tennis', pron: 'ten-iss' },          // 🎾
      { text: 'swimming', pron: 'swim-ing' },       // 🏊
      { text: 'running', pron: 'run-ing' },         // 🏃
      { text: 'yoga', pron: 'yoh-guh' },            // 🧘
      { text: 'dancing', pron: 'dan-sing' },        // 💃
      { text: 'singing', pron: 'sing-ing' },        // 🎤
      { text: 'painting', pron: 'paynt-ing' },      // 🎨
      { text: 'reading', pron: 'reed-ing' },        // 📖
      { text: 'gaming', pron: 'gaym-ing' },         // 🎮
      { text: 'fishing', pron: 'fish-ing' },        // 🎣
      { text: 'camping', pron: 'kamp-ing' },        // 🏕️
      { text: 'skiing', pron: 'skee-ing' },         // ⛷️
      { text: 'surfing', pron: 'surf-ing' },        // 🏄
      { text: 'climbing', pron: 'klyme-ing' },      // 🧗
      { text: 'gym', pron: 'jim' },                 // 🏋️
      { text: 'jump', pron: 'jump' },               // 🤸
      { text: 'throw', pron: 'throh' },             // 🤾
      { text: 'catch', pron: 'kach' },              // 🧤

      // ── Need Flaticon SVGs ──
      { text: 'football', pron: 'foot-bol' },
      { text: 'baseball', pron: 'bays-bol' },
      { text: 'golf', pron: 'golf' },
      { text: 'volleyball', pron: 'vol-ee-bol' },
      { text: 'hockey', pron: 'hok-ee' },
      { text: 'boxing', pron: 'bok-sing' },
      { text: 'karate', pron: 'kuh-rah-tee' },
      { text: 'cycling', pron: 'sy-kling' },
      { text: 'hiking', pron: 'hy-king' },
      { text: 'horseback-riding', pron: 'horss-bak-ry-ding' },
      { text: 'skating', pron: 'skay-ting' },
      { text: 'snowboarding', pron: 'snoh-bor-ding' },
      { text: 'bowling', pron: 'boh-ling' },
      { text: 'table-tennis', pron: 'tay-buhl-ten-iss' },
      { text: 'badminton', pron: 'bad-min-tuhn' },
      { text: 'cooking', pron: 'kook-ing' },
      { text: 'baking', pron: 'bay-king' },
      { text: 'gardening', pron: 'gar-dning' },
      { text: 'photography', pron: 'fuh-tog-ruh-fee' },
      { text: 'knitting', pron: 'nit-ing' },
    ],
  },
  Shopping: {
    emoji: '🛍️',
    desc: 'store · cart · price · more',
    words: [
      // ── Has emojis ──
      { text: 'store', pron: 'stor' },             // 🏪
      { text: 'price', pron: 'pryce' },             // 💰

      // ── Need Flaticon SVGs ──
      { text: 'shopping-cart', pron: 'shop-ing-kart' },
      { text: 'shopping-bag', pron: 'shop-ing-bag' },
      { text: 'checkout', pron: 'chek-owt' },
      { text: 'receipt', pron: 'ri-seet' },
      { text: 'cash', pron: 'kash' },
      { text: 'credit-card', pron: 'kred-it-kard' },
      { text: 'discount', pron: 'dis-kownt' },
      { text: 'coupon', pron: 'koo-pon' },
      { text: 'sale', pron: 'sayl' },
      { text: 'return', pron: 'ri-turn' },
      { text: 'refund', pron: 'ree-fund' },
      { text: 'exchange', pron: 'eks-chaynj' },
      { text: 'size', pron: 'syze' },
      { text: 'fitting-room', pron: 'fit-ing-room' },
      { text: 'aisle', pron: 'yle' },
      { text: 'shelf', pron: 'shelf' },
      { text: 'barcode', pron: 'bar-kohd' },
      { text: 'scanner', pron: 'skan-uhr' },
      { text: 'cashier', pron: 'kash-eer' },
      { text: 'customer', pron: 'kus-tuh-muhr' },
      { text: 'manager', pron: 'man-ij-uhr' },
      { text: 'shopping-list', pron: 'shop-ing-list' },
      { text: 'grocery', pron: 'groh-suh-ree' },
      { text: 'deli', pron: 'del-ee' },
      { text: 'bakery', pron: 'bay-kuh-ree' },
      { text: 'butcher', pron: 'booch-uhr' },
      { text: 'pharmacy', pron: 'far-muh-see' },
      { text: 'mall', pron: 'mol' },
      { text: 'market', pron: 'mar-ket' },
      { text: 'food-court', pron: 'food-kort' },
    ],
  },
  'School & Office': {
    emoji: '📚',
    desc: 'book · pencil · teacher · more',
    words: [
      // ── Has emojis ──
      { text: 'book', pron: 'book' },              // 📖
      { text: 'pencil', pron: 'pen-sil' },          // ✏️
      { text: 'paper', pron: 'pay-puhr' },          // 📄
      { text: 'scissors', pron: 'siz-uhrz' },       // ✂️
      { text: 'ruler', pron: 'roo-luhr' },          // 📏

      // ── Need Flaticon SVGs ──
      { text: 'teacher', pron: 'tee-chuhr' },
      { text: 'student', pron: 'stoo-dent' },
      { text: 'classroom', pron: 'klas-room' },
      { text: 'homework', pron: 'hohm-wurk' },
      { text: 'exam', pron: 'eg-zam' },
      { text: 'grade', pron: 'grayd' },
      { text: 'desk', pron: 'desk' },
      { text: 'whiteboard', pron: 'wyte-bord' },
      { text: 'chalkboard', pron: 'chok-bord' },
      { text: 'notebook', pron: 'noht-book' },
      { text: 'backpack', pron: 'bak-pak' },
      { text: 'calculator', pron: 'kal-kyoo-lay-tuhr' },
      { text: 'computer', pron: 'kuhm-pyoo-tuhr' },
      { text: 'printer', pron: 'prin-tuhr' },
      { text: 'eraser', pron: 'ee-ray-zuhr' },
      { text: 'pen', pron: 'pen' },
      { text: 'marker', pron: 'mar-kuhr' },
      { text: 'glue', pron: 'gloo' },
      { text: 'tape', pron: 'tayp' },
      { text: 'stapler', pron: 'stay-pluhr' },
      { text: 'clip', pron: 'klip' },
      { text: 'folder', pron: 'fohl-duhr' },
      { text: 'envelope', pron: 'en-vuh-lohp' },
      { text: 'stamp', pron: 'stamp' },
      { text: 'calendar', pron: 'kal-en-duhr' },
      { text: 'clock', pron: 'klok' },
      { text: 'schedule', pron: 'skej-ool' },
      { text: 'recess', pron: 'ree-sess' },
      { text: 'library', pron: 'lye-brer-ee' },
      { text: 'cafeteria', pron: 'kaf-uh-teer-ee-uh' },
    ],
  },
  'Jobs & Careers': {
    emoji: '💼',
    desc: 'doctor · teacher · nurse · more',
    words: [
      // ── Has emojis ──
      { text: 'doctor', pron: 'dok-tuhr' },        // 🧑‍⚕️
      { text: 'nurse', pron: 'nurss' },             // 🧑‍⚕️
      { text: 'police', pron: 'puh-lees' },         // 👮
      { text: 'firefighter', pron: 'fire-fy-tuhr' }, // 🧑‍🚒
      { text: 'pilot', pron: 'py-let' },            // 🧑‍✈️

      // ── Need Flaticon SVGs ──
      { text: 'teacher', pron: 'tee-chuhr' },
      { text: 'engineer', pron: 'en-juh-neer' },
      { text: 'lawyer', pron: 'loy-yuhr' },
      { text: 'scientist', pron: 'sy-en-tist' },
      { text: 'chef', pron: 'shef' },
      { text: 'farmer', pron: 'far-muhr' },
      { text: 'builder', pron: 'bil-duhr' },
      { text: 'plumber', pron: 'plum-uhr' },
      { text: 'electrician', pron: 'ee-lek-trish-un' },
      { text: 'mechanic', pron: 'muh-kan-ik' },
      { text: 'dentist', pron: 'den-tist' },
      { text: 'vet', pron: 'vet' },
      { text: 'pharmacist', pron: 'far-muh-sist' },
      { text: 'programmer', pron: 'proh-gram-uhr' },
      { text: 'artist', pron: 'ar-tist' },
      { text: 'writer', pron: 'ry-tuhr' },
      { text: 'musician', pron: 'myoo-zish-un' },
      { text: 'actor', pron: 'ak-tuhr' },
      { text: 'singer', pron: 'sing-uhr' },
      { text: 'athlete', pron: 'ath-leet' },
      { text: 'reporter', pron: 'ri-por-tuhr' },
      { text: 'librarian', pron: 'lye-brer-ee-un' },
      { text: 'secretary', pron: 'sek-ruh-ter-ee' },
      { text: 'receptionist', pron: 'ri-sep-shun-ist' },
      { text: 'waiter', pron: 'way-tuhr' },
      { text: 'waitress', pron: 'way-triss' },
      { text: 'cashier', pron: 'kash-eer' },
      { text: 'guard', pron: 'gard' },
      { text: 'judge', pron: 'juj' },
    ],
  },
  'Technology': {
    emoji: '💻',
    desc: 'phone · computer · tablet · more',
    words: [
      // ── Has emojis ──
      { text: 'phone', pron: 'fohn' },             // 📱
      { text: 'computer', pron: 'kuhm-pyoo-tuhr' }, // 💻
      { text: 'tablet', pron: 'tab-let' },          // 📱
      { text: 'keyboard', pron: 'kee-bord' },       // ⌨️
      { text: 'mouse', pron: 'mowss' },             // 🖱️
      { text: 'printer', pron: 'prin-tuhr' },       // 🖨️
      { text: 'camera', pron: 'kam-ruh' },          // 📷
      { text: 'headphone', pron: 'hed-fohnz' },      // 🎧
      { text: 'battery', pron: 'bat-uh-ree' },      // 🔋
      { text: 'plug', pron: 'plug' },               // 🔌

      // ── Need Flaticon SVGs ──
      { text: 'laptop', pron: 'lap-top' },
      { text: 'monitor', pron: 'mon-i-tuhr' },
      { text: 'smartwatch', pron: 'smart-woch' },
      { text: 'speaker', pron: 'spee-kuhr' },
      { text: 'router', pron: 'roo-tuhr' },
      { text: 'charger', pron: 'char-juhr' },
      { text: 'cable', pron: 'kay-buhl' },
      { text: 'usb', pron: 'yoo-es-bee' },
      { text: 'hard-drive', pron: 'hard-dryve' },
      { text: 'memory-card', pron: 'mem-uh-ree-kard' },
      { text: 'screen', pron: 'skreen' },
      { text: 'touchscreen', pron: 'tuch-skreen' },
      { text: 'app', pron: 'ap' },
      { text: 'website', pron: 'web-syte' },
      { text: 'password', pron: 'pas-wurd' },
      { text: 'wifi', pron: 'wy-fye' },
      { text: 'download', pron: 'down-lohd' },
      { text: 'upload', pron: 'up-lohd' },
      { text: 'email', pron: 'ee-mayl' },
      { text: 'video-call', pron: 'vid-ee-oh-kol' },
      { text: 'selfie', pron: 'sel-fee' },
    ],
  },
  Colors: {
    emoji: '🎨',
    desc: 'red · blue · green · more',
    words: [
      // ── Has emojis ──
      { text: 'red', pron: 'red' },                // 🔴
      { text: 'blue', pron: 'bloo' },              // 🔵
      { text: 'green', pron: 'green' },            // 🟢
      { text: 'yellow', pron: 'yel-oh' },          // 🟡
      { text: 'orange', pron: 'or-inj' },          // 🟠
      { text: 'purple', pron: 'pur-puhl' },        // 🟣
      { text: 'brown', pron: 'brown' },            // 🟤
      { text: 'white', pron: 'wyte' },             // ⚪
      { text: 'black', pron: 'blak' },             // ⚫

      // ── Need Flaticon SVGs ──
      { text: 'pink', pron: 'pink' },
      { text: 'gray', pron: 'gray' },
      { text: 'gold', pron: 'gohld' },
      { text: 'silver', pron: 'sil-vuhr' },
      { text: 'beige', pron: 'bayzh' },
      { text: 'navy', pron: 'nay-vee' },
      { text: 'teal', pron: 'teel' },
      { text: 'maroon', pron: 'muh-roon' },
      { text: 'lavender', pron: 'lav-en-duhr' },
      { text: 'lime', pron: 'lyme' },
      { text: 'turquoise', pron: 'tur-kwoyz' },
      { text: 'coral', pron: 'kor-uhl' },
      { text: 'indigo', pron: 'in-di-goh' },
      { text: 'violet', pron: 'vy-let' },
      { text: 'tan', pron: 'tan' },
      { text: 'cream', pron: 'kreem' },
      { text: 'burgundy', pron: 'bur-gun-dee' },
    ],
  },
  Shapes: {
    emoji: '🔵',
    desc: 'circle · square · triangle · more',
    words: [
      // ── Has emojis ──
      { text: 'circle', pron: 'sur-kuhl' },        // ⭕
      { text: 'square', pron: 'skwair' },          // 🟧
      { text: 'triangle', pron: 'try-ang-guhl' },  // 🔺

      // ── Need Flaticon SVGs ──
      { text: 'rectangle', pron: 'rek-tang-guhl' },
      { text: 'oval', pron: 'oh-vuhl' },
      { text: 'star', pron: 'star' },
      { text: 'heart', pron: 'hart' },
      { text: 'diamond', pron: 'dy-mund' },
      { text: 'pentagon', pron: 'pen-tuh-gon' },
      { text: 'hexagon', pron: 'hek-suh-gon' },
      { text: 'octagon', pron: 'ok-tuh-gon' },
      { text: 'cross', pron: 'kros' },
      { text: 'arrow', pron: 'air-oh' },
      { text: 'line', pron: 'lyne' },
      { text: 'curve', pron: 'kurv' },
      { text: 'sphere', pron: 'sfeer' },
      { text: 'cube', pron: 'kyoob' },
      { text: 'cone', pron: 'kohn' },
      { text: 'cylinder', pron: 'sil-in-duhr' },
    ],
  },
  Family: {
    emoji: '👨‍👩‍👧‍👦',
    desc: 'mother · father · sister · more',
    words: [
      // ── Has emojis ──
      { text: 'mother', pron: 'muth-uhr' },        // 👩
      { text: 'father', pron: 'fah-thuhr' },       // 👨
      { text: 'baby', pron: 'bay-bee' },           // 👶

      // ── Need Flaticon SVGs ──
      { text: 'sister', pron: 'sis-tuhr' },
      { text: 'brother', pron: 'bruth-uhr' },
      { text: 'daughter', pron: 'daw-tuhr' },
      { text: 'son', pron: 'sun' },
      { text: 'grandmother', pron: 'gran-muth-uhr' },
      { text: 'grandfather', pron: 'gran-fah-thuhr' },
      { text: 'aunt', pron: 'ant' },
      { text: 'uncle', pron: 'ung-kuhl' },
      { text: 'cousin', pron: 'kuz-in' },
      { text: 'niece', pron: 'neess' },
      { text: 'nephew', pron: 'nef-yoo' },
      { text: 'wife', pron: 'wyfe' },
      { text: 'husband', pron: 'huz-band' },
      { text: 'parent', pron: 'pair-ent' },
      { text: 'child', pron: 'chyld' },
      { text: 'twin', pron: 'twin' },
      { text: 'family', pron: 'fam-uh-lee' },
      { text: 'relative', pron: 'rel-uh-tiv' },
    ],
  },
  'City Places': {
    emoji: '🏙️',
    desc: 'hospital · bank · park · more',
    words: [
      // ── Has emojis ──
      { text: 'hospital', pron: 'hos-pi-tuhl' },   // 🏥
      { text: 'bank', pron: 'bank' },              // 🏦
      { text: 'school', pron: 'skool' },           // 🏫
      { text: 'library', pron: 'lye-brer-ee' },     // 📚
      { text: 'church', pron: 'church' },           // ⛪
      { text: 'park', pron: 'park' },              // 🏞️
      { text: 'stadium', pron: 'stay-dee-um' },    // 🏟️
      { text: 'museum', pron: 'myoo-zee-um' },     // 🏛️

      // ── Need Flaticon SVGs ──
      { text: 'post-office', pron: 'pohst-of-iss' },
      { text: 'police-station', pron: 'puh-lees-stay-shun' },
      { text: 'fire-station', pron: 'fire-stay-shun' },
      { text: 'pharmacy', pron: 'far-muh-see' },
      { text: 'grocery-store', pron: 'groh-suh-ree-stor' },
      { text: 'supermarket', pron: 'soo-per-mar-ket' },
      { text: 'gas-station', pron: 'gas-stay-shun' },
      { text: 'restaurant', pron: 'res-tuh-rant' },
      { text: 'cafe', pron: 'kaf-ay' },
      { text: 'hotel', pron: 'hoh-tel' },
      { text: 'airport', pron: 'air-port' },
      { text: 'train-station', pron: 'trayn-stay-shun' },
      { text: 'bus-stop', pron: 'bus-stop' },
      { text: 'theater', pron: 'thee-uh-tuhr' },
      { text: 'cinema', pron: 'sin-uh-muh' },
      { text: 'gym', pron: 'jim' },
      { text: 'swimming-pool', pron: 'swim-ing-pool' },
      { text: 'playground', pron: 'play-grownd' },
      { text: 'zoo', pron: 'zoo' },
      { text: 'city-hall', pron: 'sit-ee-hol' },
      { text: 'courthouse', pron: 'kort-hows' },
      { text: 'market', pron: 'mar-ket' },
    ],
  },
  Restaurant: {
    emoji: '🍽️',
    desc: 'menu · order · waiter · more',
    words: [
      // ── Has emojis ──
      { text: 'menu', pron: 'men-yoo' },           // 📋
      { text: 'waiter', pron: 'way-tuhr' },         // 🧑‍🍳

      // ── Need Flaticon SVGs ──
      { text: 'order', pron: 'or-duhr' },
      { text: 'reservation', pron: 'rez-uhr-vay-shun' },
      { text: 'appetizer', pron: 'ap-uh-ty-zuhr' },
      { text: 'main-course', pron: 'mayn-korss' },
      { text: 'dessert', pron: 'di-zurt' },
      { text: 'drink', pron: 'drink' },
      { text: 'bill', pron: 'bil' },
      { text: 'tip', pron: 'tip' },
      { text: 'table', pron: 'tay-buhl' },
      { text: 'seat', pron: 'seet' },
      { text: 'napkin', pron: 'nap-kin' },
      { text: 'fork', pron: 'fork' },
      { text: 'knife', pron: 'nyfe' },
      { text: 'spoon', pron: 'spoon' },
      { text: 'plate', pron: 'playt' },
      { text: 'glass', pron: 'glas' },
      { text: 'takeout', pron: 'tayk-owt' },
      { text: 'delivery', pron: 'di-liv-uh-ree' },
      { text: 'breakfast', pron: 'brek-fust' },
      { text: 'lunch', pron: 'lunch' },
      { text: 'dinner', pron: 'din-uhr' },
      { text: 'buffet', pron: 'buh-fay' },
      { text: 'specials', pron: 'spesh-uhlz' },
    ],
  },
  Health: {
    emoji: '🏥',
    desc: 'fever · medicine · bandage · more',
    words: [
      // ── Has emojis ──
      { text: 'fever', pron: 'fee-vuhr' },         // 🤒
      { text: 'medicine', pron: 'med-uh-sin' },    // 💊
      { text: 'bandage', pron: 'ban-dij' },        // 🩹

      // ── Need Flaticon SVGs ──
      { text: 'headache', pron: 'hed-ayk' },
      { text: 'surgery', pron: 'sur-juh-ree' },
      { text: 'patient', pron: 'pay-shunt' },
      { text: 'doctor', pron: 'dok-tuhr' },
      { text: 'nurse', pron: 'nurss' },
      { text: 'ambulance', pron: 'am-byoo-lanss' },
      { text: 'emergency', pron: 'ee-mur-jun-see' },
      { text: 'appointment', pron: 'uh-poynt-ment' },
      { text: 'prescription', pron: 'pri-skrip-shun' },
      { text: 'pill', pron: 'pil' },
      { text: 'syringe', pron: 'suh-rinj' },
      { text: 'stethoscope', pron: 'steth-uh-skohp' },
      { text: 'thermometer', pron: 'thuhr-mom-uh-tuhr' },
      { text: 'wheelchair', pron: 'weel-chair' },
      { text: 'crutches', pron: 'kruch-ez' },
      { text: 'xray', pron: 'eks-ray' },
      { text: 'blood-test', pron: 'blud-test' },
      { text: 'vaccine', pron: 'vak-seen' },
      { text: 'allergy', pron: 'al-uhr-jee' },
      { text: 'cough', pron: 'kof' },
      { text: 'symptom', pron: 'simp-tuhm' },
    ],
  },
  'Music & Instruments': {
    emoji: '🎵',
    desc: 'guitar · piano · drum · more',
    words: [
      // ── Has emojis ──
      { text: 'guitar', pron: 'gi-tar' },           // 🎸
      { text: 'piano', pron: 'pee-an-oh' },         // 🎹
      { text: 'drum', pron: 'drum' },               // 🥁
      { text: 'trumpet', pron: 'trum-pet' },        // 🎺
      { text: 'violin', pron: 'vy-uh-lin' },        // 🎻
      { text: 'saxophone', pron: 'sak-suh-fohn' },  // 🎷
      { text: 'microphone', pron: 'my-kruh-fohn' },  // 🎤
      { text: 'headphone', pron: 'hed-fohn' },       // 🎧

      // ── Need Flaticon SVGs ──
      { text: 'flute', pron: 'floot' },
      { text: 'clarinet', pron: 'klair-uh-net' },
      { text: 'cello', pron: 'chel-oh' },
      { text: 'harp', pron: 'harp' },
      { text: 'accordion', pron: 'uh-kor-dee-un' },
      { text: 'banjo', pron: 'ban-joh' },
      { text: 'ukulele', pron: 'yoo-kuh-lay-lee' },
      { text: 'harmonica', pron: 'har-mon-ik-uh' },
      { text: 'maracas', pron: 'muh-rak-uhz' },
      { text: 'tambourine', pron: 'tam-buh-reen' },
      { text: 'organ', pron: 'or-gun' },
      { text: 'recorder', pron: 'ri-kor-duhr' },
      { text: 'note', pron: 'noht' },
      { text: 'melody', pron: 'mel-uh-dee' },
      { text: 'rhythm', pron: 'rith-um' },
      { text: 'concert', pron: 'kon-surt' },
      { text: 'orchestra', pron: 'or-kes-truh' },
      { text: 'band', pron: 'band' },
    ],
  },
  'Money & Banking': {
    emoji: '💵',
    desc: 'dollar · coin · bank · more',
    words: [
      // ── Has emojis ──
      { text: 'dollar', pron: 'dol-uhr' },          // 💵
      { text: 'coin', pron: 'koyn' },               // 🪙
      { text: 'bank', pron: 'bank' },               // 🏦
      { text: 'credit-card', pron: 'kred-it-kard' }, // 💳
      { text: 'money', pron: 'mun-ee' },            // 💰

      // ── Need Flaticon SVGs ──
      { text: 'account', pron: 'uh-kownt' },
      { text: 'loan', pron: 'lohn' },
      { text: 'interest', pron: 'in-trist' },
      { text: 'savings', pron: 'say-vingz' },
      { text: 'check', pron: 'chek' },
      { text: 'cash', pron: 'kash' },
      { text: 'withdraw', pron: 'with-draw' },
      { text: 'deposit', pron: 'di-poz-it' },
      { text: 'transfer', pron: 'trans-fuhr' },
      { text: 'balance', pron: 'bal-uhns' },
      { text: 'currency', pron: 'kur-en-see' },
      { text: 'exchange-rate', pron: 'eks-chaynj-rayt' },
      { text: 'budget', pron: 'buj-et' },
      { text: 'payment', pron: 'pay-ment' },
      { text: 'receipt', pron: 'ri-seet' },
      { text: 'invoice', pron: 'in-voyss' },
      { text: 'salary', pron: 'sal-uh-ree' },
      { text: 'tax', pron: 'taks' },
      { text: 'wallet', pron: 'wol-et' },
      { text: 'piggy-bank', pron: 'pig-ee-bank' },
    ],
  },
  Directions: {
    emoji: '🧭',
    desc: 'left · right · straight · more',
    words: [
      // ── Has emojis ──
      { text: 'left', pron: 'left' },              // ⬅️
      { text: 'right', pron: 'ryte' },             // ➡️
      { text: 'up', pron: 'up' },                  // ⬆️
      { text: 'down', pron: 'down' },              // ⬇️
      { text: 'north', pron: 'north' },            // 🧭

      // ── Need Flaticon SVGs ──
      { text: 'south', pron: 'sowth' },
      { text: 'east', pron: 'eest' },
      { text: 'west', pron: 'west' },
      { text: 'straight', pron: 'strayt' },
      { text: 'forward', pron: 'for-wurd' },
      { text: 'backward', pron: 'bak-wurd' },
      { text: 'corner', pron: 'kor-nuhr' },
      { text: 'block', pron: 'blok' },
      { text: 'intersection', pron: 'in-tuhr-sek-shun' },
      { text: 'traffic-light', pron: 'traf-ik-lyte' },
      { text: 'crosswalk', pron: 'kros-wok' },
      { text: 'sidewalk', pron: 'syde-wok' },
      { text: 'road', pron: 'rohd' },
      { text: 'street', pron: 'street' },
      { text: 'alley', pron: 'al-ee' },
      { text: 'highway', pron: 'hy-way' },
      { text: 'bridge', pron: 'brij' },
      { text: 'tunnel', pron: 'tun-uhl' },
      { text: 'roundabout', pron: 'rownd-uh-bowt' },
    ],
  },
  'Holidays & Celebrations': {
    emoji: '🎉',
    desc: 'birthday · party · gift · more',
    words: [
      // ── Has emojis ──
      { text: 'birthday', pron: 'burth-day' },     // 🎂
      { text: 'party', pron: 'par-tee' },           // 🎉
      { text: 'gift', pron: 'gift' },               // 🎁
      { text: 'cake', pron: 'kayk' },               // 🎂
      { text: 'candle', pron: 'kan-dl' },           // 🕯️
      { text: 'balloon', pron: 'buh-loon' },        // 🎈
      { text: 'confetti', pron: 'kun-fet-ee' },     // 🎊
      { text: 'fireworks', pron: 'fire-wurks' },    // 🎆

      // ── Need Flaticon SVGs ──
      { text: 'invitation', pron: 'in-vi-tay-shun' },
      { text: 'decoration', pron: 'dek-uh-ray-shun' },
      { text: 'celebration', pron: 'sel-uh-bray-shun' },
      { text: 'tradition', pron: 'truh-dish-un' },
      { text: 'christmas', pron: 'kris-muss' },
      { text: 'new-year', pron: 'nyoo-yeer' },
      { text: 'easter', pron: 'ee-stuhr' },
      { text: 'halloween', pron: 'hal-oh-ween' },
      { text: 'thanksgiving', pron: 'thanks-giv-ing' },
      { text: 'valentine', pron: 'val-en-tyne' },
      { text: 'wedding', pron: 'wed-ing' },
      { text: 'anniversary', pron: 'an-uh-vur-suh-ree' },
      { text: 'graduation', pron: 'graj-oo-ay-shun' },
      { text: 'ceremony', pron: 'ser-uh-moh-nee' },
      { text: 'parade', pron: 'puh-rayd' },
      { text: 'ribbon', pron: 'rib-un' },
      { text: 'card', pron: 'kard' },
      { text: 'wrapping-paper', pron: 'rap-ing-pay-puhr' },
    ],
  },
} as const satisfies Record<string, { emoji: string; desc: string; words: VocabWord[] }>

export const WORD_THEMES = WORDS

export const GROUP_NODES = Object.entries(WORDS).map(([id, t]) => ({
  id,
  emoji: t.emoji,
  name: id,
  desc: t.desc,
  wordCount: t.words.length,
}))

/** Map of word text → pronunciation for quick lookup */
export const WORD_PRONUNCIATIONS: Record<string, string> = {}
for (const theme of Object.values(WORDS)) {
  for (const w of theme.words) {
    WORD_PRONUNCIATIONS[w.text.toLowerCase()] = w.pron
  }
}
