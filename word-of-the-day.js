// Word of the day: one everyday word, the same one in every language on a
// given day, shown in the language being practiced with its meaning in the
// other. Words in a non-Latin script carry a romanized form, written as
// [native, romanized].

const DAILY_WORDS = [
  {
    en: "library", es: "biblioteca", fr: "bibliothèque", de: "Bibliothek", it: "biblioteca",
    hi: ["पुस्तकालय", "pustakalay"], zh: ["图书馆", "túshūguǎn"], ar: ["مكتبة", "maktaba"], pt: "biblioteca",
    ru: ["библиотека", "biblioteka"], ja: ["図書館", "toshokan"], ko: ["도서관", "doseogwan"],
    bn: ["গ্রন্থাগার", "granthagar"], ur: ["کتب خانہ", "kutub khana"], id: "perpustakaan", tr: "kütüphane",
    vi: "thư viện", nl: "bibliotheek", pl: "biblioteka", sw: "maktaba", ta: ["நூலகம்", "noolagam"],
    ml: ["ഗ്രന്ഥശാല", "granthashaala"], te: ["గ్రంథాలయం", "granthalayam"], kn: ["ಗ್ರಂಥಾಲಯ", "granthalaya"],
    gu: ["પુસ્તકાલય", "pustakalay"], fa: ["کتابخانه", "ketabkhaneh"], el: ["βιβλιοθήκη", "vivliothiki"],
    sv: "bibliotek", he: ["ספרייה", "sifriya"],
  },
  {
    en: "water", es: "agua", fr: "eau", de: "Wasser", it: "acqua",
    hi: ["पानी", "paani"], zh: ["水", "shuǐ"], ar: ["ماء", "maa"], pt: "água",
    ru: ["вода", "voda"], ja: ["水", "mizu"], ko: ["물", "mul"],
    bn: ["জল", "jol"], ur: ["پانی", "paani"], id: "air", tr: "su",
    vi: "nước", nl: "water", pl: "woda", sw: "maji", ta: ["தண்ணீர்", "thanneer"],
    ml: ["വെള്ളം", "vellam"], te: ["నీళ్ళు", "neellu"], kn: ["ನೀರು", "neeru"],
    gu: ["પાણી", "paani"], fa: ["آب", "aab"], el: ["νερό", "nero"],
    sv: "vatten", he: ["מים", "mayim"],
  },
  {
    en: "friend", es: "amigo", fr: "ami", de: "Freund", it: "amico",
    hi: ["दोस्त", "dost"], zh: ["朋友", "péngyou"], ar: ["صديق", "sadiq"], pt: "amigo",
    ru: ["друг", "drug"], ja: ["友達", "tomodachi"], ko: ["친구", "chingu"],
    bn: ["বন্ধু", "bondhu"], ur: ["دوست", "dost"], id: "teman", tr: "arkadaş",
    vi: "bạn", nl: "vriend", pl: "przyjaciel", sw: "rafiki", ta: ["நண்பன்", "nanban"],
    ml: ["സുഹൃത്ത്", "suhruthu"], te: ["స్నేహితుడు", "snehitudu"], kn: ["ಸ್ನೇಹಿತ", "snehita"],
    gu: ["મિત્ર", "mitra"], fa: ["دوست", "doost"], el: ["φίλος", "filos"],
    sv: "vän", he: ["חבר", "chaver"],
  },
  {
    en: "book", es: "libro", fr: "livre", de: "Buch", it: "libro",
    hi: ["किताब", "kitaab"], zh: ["书", "shū"], ar: ["كتاب", "kitaab"], pt: "livro",
    ru: ["книга", "kniga"], ja: ["本", "hon"], ko: ["책", "chaek"],
    bn: ["বই", "boi"], ur: ["کتاب", "kitaab"], id: "buku", tr: "kitap",
    vi: "sách", nl: "boek", pl: "książka", sw: "kitabu", ta: ["புத்தகம்", "puthagam"],
    ml: ["പുസ്തകം", "pusthakam"], te: ["పుస్తకం", "pustakam"], kn: ["ಪುಸ್ತಕ", "pustaka"],
    gu: ["પુસ્તક", "pustak"], fa: ["کتاب", "ketab"], el: ["βιβλίο", "vivlio"],
    sv: "bok", he: ["ספר", "sefer"],
  },
  {
    en: "house", es: "casa", fr: "maison", de: "Haus", it: "casa",
    hi: ["घर", "ghar"], zh: ["房子", "fángzi"], ar: ["بيت", "bayt"], pt: "casa",
    ru: ["дом", "dom"], ja: ["家", "ie"], ko: ["집", "jip"],
    bn: ["বাড়ি", "bari"], ur: ["گھر", "ghar"], id: "rumah", tr: "ev",
    vi: "nhà", nl: "huis", pl: "dom", sw: "nyumba", ta: ["வீடு", "veedu"],
    ml: ["വീട്", "veedu"], te: ["ఇల్లు", "illu"], kn: ["ಮನೆ", "mane"],
    gu: ["ઘર", "ghar"], fa: ["خانه", "khaneh"], el: ["σπίτι", "spiti"],
    sv: "hus", he: ["בית", "bayit"],
  },
  {
    en: "bread", es: "pan", fr: "pain", de: "Brot", it: "pane",
    hi: ["रोटी", "roti"], zh: ["面包", "miànbāo"], ar: ["خبز", "khubz"], pt: "pão",
    ru: ["хлеб", "khleb"], ja: ["パン", "pan"], ko: ["빵", "ppang"],
    bn: ["রুটি", "ruti"], ur: ["روٹی", "roti"], id: "roti", tr: "ekmek",
    vi: "bánh mì", nl: "brood", pl: "chleb", sw: "mkate", ta: ["ரொட்டி", "rotti"],
    ml: ["റൊട്ടി", "rotti"], te: ["రొట్టె", "rotte"], kn: ["ರೊಟ್ಟಿ", "rotti"],
    gu: ["રોટલી", "rotli"], fa: ["نان", "naan"], el: ["ψωμί", "psomi"],
    sv: "bröd", he: ["לחם", "lechem"],
  },
  {
    en: "family", es: "familia", fr: "famille", de: "Familie", it: "famiglia",
    hi: ["परिवार", "parivaar"], zh: ["家人", "jiārén"], ar: ["عائلة", "aaila"], pt: "família",
    ru: ["семья", "semya"], ja: ["家族", "kazoku"], ko: ["가족", "gajok"],
    bn: ["পরিবার", "poribar"], ur: ["خاندان", "khandaan"], id: "keluarga", tr: "aile",
    vi: "gia đình", nl: "familie", pl: "rodzina", sw: "familia", ta: ["குடும்பம்", "kudumbam"],
    ml: ["കുടുംബം", "kudumbam"], te: ["కుటుంబం", "kutumbam"], kn: ["ಕುಟುಂಬ", "kutumba"],
    gu: ["પરિવાર", "parivaar"], fa: ["خانواده", "khanevadeh"], el: ["οικογένεια", "oikogeneia"],
    sv: "familj", he: ["משפחה", "mishpacha"],
  },
  {
    en: "school", es: "escuela", fr: "école", de: "Schule", it: "scuola",
    hi: ["विद्यालय", "vidyalay"], zh: ["学校", "xuéxiào"], ar: ["مدرسة", "madrasa"], pt: "escola",
    ru: ["школа", "shkola"], ja: ["学校", "gakkou"], ko: ["학교", "hakgyo"],
    bn: ["বিদ্যালয়", "bidyaloy"], ur: ["اسکول", "iskool"], id: "sekolah", tr: "okul",
    vi: "trường học", nl: "school", pl: "szkoła", sw: "shule", ta: ["பள்ளி", "palli"],
    ml: ["വിദ്യാലയം", "vidyalayam"], te: ["పాఠశాల", "paathashaala"], kn: ["ಶಾಲೆ", "shaale"],
    gu: ["શાળા", "shaala"], fa: ["مدرسه", "madreseh"], el: ["σχολείο", "scholeio"],
    sv: "skola", he: ["בית ספר", "beit sefer"],
  },
  {
    en: "apple", es: "manzana", fr: "pomme", de: "Apfel", it: "mela",
    hi: ["सेब", "seb"], zh: ["苹果", "píngguǒ"], ar: ["تفاحة", "tuffaha"], pt: "maçã",
    ru: ["яблоко", "yabloko"], ja: ["りんご", "ringo"], ko: ["사과", "sagwa"],
    bn: ["আপেল", "apel"], ur: ["سیب", "seb"], id: "apel", tr: "elma",
    vi: "táo", nl: "appel", pl: "jabłko", sw: "tufaha", ta: ["ஆப்பிள்", "aappil"],
    ml: ["ആപ്പിൾ", "aappil"], te: ["ఆపిల్", "aapil"], kn: ["ಸೇಬು", "sebu"],
    gu: ["સફરજન", "safarjan"], fa: ["سیب", "sib"], el: ["μήλο", "milo"],
    sv: "äpple", he: ["תפוח", "tapuach"],
  },
  {
    en: "music", es: "música", fr: "musique", de: "Musik", it: "musica",
    hi: ["संगीत", "sangeet"], zh: ["音乐", "yīnyuè"], ar: ["موسيقى", "musiqa"], pt: "música",
    ru: ["музыка", "muzyka"], ja: ["音楽", "ongaku"], ko: ["음악", "eumak"],
    bn: ["সংগীত", "shongit"], ur: ["موسیقی", "mausiqi"], id: "musik", tr: "müzik",
    vi: "âm nhạc", nl: "muziek", pl: "muzyka", sw: "muziki", ta: ["இசை", "isai"],
    ml: ["സംഗീതം", "sangeetham"], te: ["సంగీతం", "sangeetam"], kn: ["ಸಂಗೀತ", "sangeeta"],
    gu: ["સંગીત", "sangeet"], fa: ["موسیقی", "musighi"], el: ["μουσική", "mousiki"],
    sv: "musik", he: ["מוזיקה", "muzika"],
  },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Counts days by the learner's own calendar, so the word changes at their
// midnight, not at midnight in London.
function dailyWordFor(date) {
  const localDay = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY,
  );
  return DAILY_WORDS[localDay % DAILY_WORDS.length];
}

// The language being practiced is the one that isn't English; with two
// non-English languages, it's the one being translated into.
function wordOfTheDayLanguages(from, to) {
  if (to !== "en") {
    return { wordLanguage: to, meaningLanguage: from };
  }
  return { wordLanguage: from, meaningLanguage: to };
}

function wordParts(entry, language) {
  const value = entry[language];
  return Array.isArray(value) ? { word: value[0], romanized: value[1] } : { word: value, romanized: "" };
}

// What 🔊 reads, matching the card: the word, then "means" and the meaning,
// each in its own language's voice. "means" is English, so when the meaning
// isn't English it's read by an English voice before the meaning.
function wordOfTheDayReading(from, to, date) {
  const entry = dailyWordFor(date);
  const { wordLanguage, meaningLanguage } = wordOfTheDayLanguages(from, to);
  const word = { text: wordParts(entry, wordLanguage).word, language: wordLanguage };
  const meaning = wordParts(entry, meaningLanguage).word;
  if (meaningLanguage === "en") {
    return [word, { text: `means ${meaning}`, language: "en" }];
  }
  return [word, { text: "means", language: "en" }, { text: meaning, language: meaningLanguage }];
}

// The day the card is showing, so 🔊 reads the same word even if the page
// stays open past midnight.
let shownWordDate = new Date();

function showWordOfTheDay(from, to, date = new Date()) {
  shownWordDate = date;
  const entry = dailyWordFor(date);
  const { wordLanguage, meaningLanguage } = wordOfTheDayLanguages(from, to);
  const { word, romanized } = wordParts(entry, wordLanguage);
  const meaning = wordParts(entry, meaningLanguage).word;

  const wordElement = document.getElementById("daily-word");
  wordElement.textContent = word;
  wordElement.lang = wordLanguage;
  document.getElementById("daily-word-romanized").textContent = romanized ? `(${romanized})` : "";
  const meaningElement = document.getElementById("daily-word-meaning");
  meaningElement.textContent = meaning;
  meaningElement.lang = meaningLanguage;
}
