// Word of the day: one everyday word, the same one in every language on a
// given day, shown in the language being practiced with its meaning in the
// other. On US holidays a word that goes with the day replaces the usual one.
// The words and the rules share this file so a page can never load one
// without the other.

// The words, in every language the app offers. A word in a non-Latin script
// is written as [native, romanized].

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
  {
    en: "coffee", es: "café", fr: "café", de: "Kaffee", it: "caffè",
    hi: ["कॉफ़ी", "kofi"], zh: ["咖啡", "kāfēi"], ar: ["قهوة", "qahwa"], pt: "café",
    ru: ["кофе", "kofe"], ja: ["コーヒー", "kōhī"], ko: ["커피", "keopi"],
    bn: ["কফি", "kofi"], ur: ["کافی", "kaafi"], id: "kopi", tr: "kahve",
    vi: "cà phê", nl: "koffie", pl: "kawa", sw: "kahawa", ta: ["காபி", "kaapi"],
    ml: ["കാപ്പി", "kaappi"], te: ["కాఫీ", "kaafi"], kn: ["ಕಾಫಿ", "kaafi"],
    gu: ["કોફી", "kofi"], fa: ["قهوه", "ghahveh"], el: ["καφές", "kafes"],
    sv: "kaffe", he: ["קפה", "kafe"],
  },
  {
    en: "tea", es: "té", fr: "thé", de: "Tee", it: "tè",
    hi: ["चाय", "chaay"], zh: ["茶", "chá"], ar: ["شاي", "shaay"], pt: "chá",
    ru: ["чай", "chay"], ja: ["お茶", "ocha"], ko: ["차", "cha"],
    bn: ["চা", "cha"], ur: ["چائے", "chaaye"], id: "teh", tr: "çay",
    vi: "trà", nl: "thee", pl: "herbata", sw: "chai", ta: ["தேநீர்", "theneer"],
    ml: ["ചായ", "chaaya"], te: ["టీ", "tee"], kn: ["ಚಹಾ", "chahaa"],
    gu: ["ચા", "chaa"], fa: ["چای", "chaay"], el: ["τσάι", "tsai"],
    sv: "te", he: ["תה", "te"],
  },
  {
    en: "milk", es: "leche", fr: "lait", de: "Milch", it: "latte",
    hi: ["दूध", "doodh"], zh: ["牛奶", "niúnǎi"], ar: ["حليب", "haleeb"], pt: "leite",
    ru: ["молоко", "moloko"], ja: ["牛乳", "gyūnyū"], ko: ["우유", "uyu"],
    bn: ["দুধ", "dudh"], ur: ["دودھ", "doodh"], id: "susu", tr: "süt",
    vi: "sữa", nl: "melk", pl: "mleko", sw: "maziwa", ta: ["பால்", "paal"],
    ml: ["പാൽ", "paal"], te: ["పాలు", "paalu"], kn: ["ಹಾಲು", "haalu"],
    gu: ["દૂધ", "doodh"], fa: ["شیر", "shir"], el: ["γάλα", "gala"],
    sv: "mjölk", he: ["חלב", "chalav"],
  },
  {
    en: "rice", es: "arroz", fr: "riz", de: "Reis", it: "riso",
    hi: ["चावल", "chaaval"], zh: ["米饭", "mǐfàn"], ar: ["أرز", "aruzz"], pt: "arroz",
    ru: ["рис", "ris"], ja: ["ご飯", "gohan"], ko: ["밥", "bap"],
    bn: ["ভাত", "bhaat"], ur: ["چاول", "chaawal"], id: "nasi", tr: "pirinç",
    vi: "cơm", nl: "rijst", pl: "ryż", sw: "wali", ta: ["சாதம்", "saadham"],
    ml: ["ചോറ്", "choru"], te: ["అన్నం", "annam"], kn: ["ಅನ್ನ", "anna"],
    gu: ["ભાત", "bhaat"], fa: ["برنج", "berenj"], el: ["ρύζι", "rizi"],
    sv: "ris", he: ["אורז", "orez"],
  },
  {
    en: "cheese", es: "queso", fr: "fromage", de: "Käse", it: "formaggio",
    hi: ["चीज़", "cheez"], zh: ["奶酪", "nǎilào"], ar: ["جبن", "jubn"], pt: "queijo",
    ru: ["сыр", "syr"], ja: ["チーズ", "chīzu"], ko: ["치즈", "chijeu"],
    bn: ["পনির", "ponir"], ur: ["پنیر", "paneer"], id: "keju", tr: "peynir",
    vi: "phô mai", nl: "kaas", pl: "ser", sw: "jibini", ta: ["பாலாடைக்கட்டி", "paalaadaikatti"],
    ml: ["ചീസ്", "cheese"], te: ["జున్ను", "junnu"], kn: ["ಗಿಣ್ಣು", "ginnu"],
    gu: ["પનીર", "paneer"], fa: ["پنیر", "panir"], el: ["τυρί", "tyri"],
    sv: "ost", he: ["גבינה", "gvina"],
  },
  {
    en: "fish", es: "pez", fr: "poisson", de: "Fisch", it: "pesce",
    hi: ["मछली", "machhli"], zh: ["鱼", "yú"], ar: ["سمك", "samak"], pt: "peixe",
    ru: ["рыба", "ryba"], ja: ["魚", "sakana"], ko: ["물고기", "mulgogi"],
    bn: ["মাছ", "maachh"], ur: ["مچھلی", "machhli"], id: "ikan", tr: "balık",
    vi: "cá", nl: "vis", pl: "ryba", sw: "samaki", ta: ["மீன்", "meen"],
    ml: ["മീൻ", "meen"], te: ["చేప", "chepa"], kn: ["ಮೀನು", "meenu"],
    gu: ["માછલી", "maachhli"], fa: ["ماهی", "maahi"], el: ["ψάρι", "psari"],
    sv: "fisk", he: ["דג", "dag"],
  },
  {
    en: "soup", es: "sopa", fr: "soupe", de: "Suppe", it: "zuppa",
    hi: ["सूप", "soop"], zh: ["汤", "tāng"], ar: ["حساء", "hasaa"], pt: "sopa",
    ru: ["суп", "sup"], ja: ["スープ", "sūpu"], ko: ["수프", "supeu"],
    bn: ["স্যুপ", "syup"], ur: ["سوپ", "soop"], id: "sup", tr: "çorba",
    vi: "súp", nl: "soep", pl: "zupa", sw: "supu", ta: ["சூப்", "soop"],
    ml: ["സൂപ്പ്", "sooppu"], te: ["సూప్", "soop"], kn: ["ಸೂಪ್", "soop"],
    gu: ["સૂપ", "soop"], fa: ["سوپ", "sup"], el: ["σούπα", "soupa"],
    sv: "soppa", he: ["מרק", "marak"],
  },
  {
    en: "salt", es: "sal", fr: "sel", de: "Salz", it: "sale",
    hi: ["नमक", "namak"], zh: ["盐", "yán"], ar: ["ملح", "milh"], pt: "sal",
    ru: ["соль", "sol"], ja: ["塩", "shio"], ko: ["소금", "sogeum"],
    bn: ["লবণ", "lobon"], ur: ["نمک", "namak"], id: "garam", tr: "tuz",
    vi: "muối", nl: "zout", pl: "sól", sw: "chumvi", ta: ["உப்பு", "uppu"],
    ml: ["ഉപ്പ്", "uppu"], te: ["ఉప్పు", "uppu"], kn: ["ಉಪ್ಪು", "uppu"],
    gu: ["મીઠું", "mithu"], fa: ["نمک", "namak"], el: ["αλάτι", "alati"],
    sv: "salt", he: ["מלח", "melach"],
  },
  {
    en: "sugar", es: "azúcar", fr: "sucre", de: "Zucker", it: "zucchero",
    hi: ["चीनी", "cheeni"], zh: ["糖", "táng"], ar: ["سكر", "sukkar"], pt: "açúcar",
    ru: ["сахар", "sakhar"], ja: ["砂糖", "satō"], ko: ["설탕", "seoltang"],
    bn: ["চিনি", "chini"], ur: ["چینی", "cheeni"], id: "gula", tr: "şeker",
    vi: "đường", nl: "suiker", pl: "cukier", sw: "sukari", ta: ["சர்க்கரை", "sarkkarai"],
    ml: ["പഞ്ചസാര", "panchasaara"], te: ["చక్కెర", "chakkera"], kn: ["ಸಕ್ಕರೆ", "sakkare"],
    gu: ["ખાંડ", "khaand"], fa: ["شکر", "shekar"], el: ["ζάχαρη", "zachari"],
    sv: "socker", he: ["סוכר", "sukar"],
  },
  {
    en: "fruit", es: "fruta", fr: "fruit", de: "Obst", it: "frutta",
    hi: ["फल", "phal"], zh: ["水果", "shuǐguǒ"], ar: ["فاكهة", "faakiha"], pt: "fruta",
    ru: ["фрукт", "frukt"], ja: ["果物", "kudamono"], ko: ["과일", "gwail"],
    bn: ["ফল", "fol"], ur: ["پھل", "phal"], id: "buah", tr: "meyve",
    vi: "trái cây", nl: "fruit", pl: "owoc", sw: "tunda", ta: ["பழம்", "pazham"],
    ml: ["പഴം", "pazham"], te: ["పండు", "pandu"], kn: ["ಹಣ್ಣು", "hannu"],
    gu: ["ફળ", "phal"], fa: ["میوه", "miveh"], el: ["φρούτο", "frouto"],
    sv: "frukt", he: ["פרי", "pri"],
  },
  {
    en: "banana", es: "plátano", fr: "banane", de: "Banane", it: "banana",
    hi: ["केला", "kela"], zh: ["香蕉", "xiāngjiāo"], ar: ["موز", "mawz"], pt: "banana",
    ru: ["банан", "banan"], ja: ["バナナ", "banana"], ko: ["바나나", "banana"],
    bn: ["কলা", "kola"], ur: ["کیلا", "kela"], id: "pisang", tr: "muz",
    vi: "chuối", nl: "banaan", pl: "banan", sw: "ndizi", ta: ["வாழைப்பழம்", "vaazhaippazham"],
    ml: ["വാഴപ്പഴം", "vaazhappazham"], te: ["అరటిపండు", "aratipandu"], kn: ["ಬಾಳೆಹಣ್ಣು", "baalehannu"],
    gu: ["કેળું", "kelu"], fa: ["موز", "moz"], el: ["μπανάνα", "banana"],
    sv: "banan", he: ["בננה", "banana"],
  },
  {
    en: "tomato", es: "tomate", fr: "tomate", de: "Tomate", it: "pomodoro",
    hi: ["टमाटर", "tamaatar"], zh: ["西红柿", "xīhóngshì"], ar: ["طماطم", "tamaatim"], pt: "tomate",
    ru: ["помидор", "pomidor"], ja: ["トマト", "tomato"], ko: ["토마토", "tomato"],
    bn: ["টমেটো", "tometo"], ur: ["ٹماٹر", "tamaatar"], id: "tomat", tr: "domates",
    vi: "cà chua", nl: "tomaat", pl: "pomidor", sw: "nyanya", ta: ["தக்காளி", "thakkaali"],
    ml: ["തക്കാളി", "thakkaali"], te: ["టమాటా", "tamaataa"], kn: ["ಟೊಮೇಟೊ", "tomeyto"],
    gu: ["ટામેટું", "taametu"], fa: ["گوجه‌فرنگی", "gojeh farangi"], el: ["ντομάτα", "domata"],
    sv: "tomat", he: ["עגבנייה", "agvaniya"],
  },
  {
    en: "potato", es: "patata", fr: "pomme de terre", de: "Kartoffel", it: "patata",
    hi: ["आलू", "aaloo"], zh: ["土豆", "tǔdòu"], ar: ["بطاطس", "bataatis"], pt: "batata",
    ru: ["картошка", "kartoshka"], ja: ["じゃがいも", "jagaimo"], ko: ["감자", "gamja"],
    bn: ["আলু", "aalu"], ur: ["آلو", "aaloo"], id: "kentang", tr: "patates",
    vi: "khoai tây", nl: "aardappel", pl: "ziemniak", sw: "kiazi", ta: ["உருளைக்கிழங்கு", "urulaikkizhangu"],
    ml: ["ഉരുളക്കിഴങ്ങ്", "urulakkizhangu"], te: ["బంగాళాదుంప", "bangaaladumpa"], kn: ["ಆಲೂಗಡ್ಡೆ", "aalugadde"],
    gu: ["બટાકા", "bataaka"], fa: ["سیب‌زمینی", "sib zamini"], el: ["πατάτα", "patata"],
    sv: "potatis", he: ["תפוח אדמה", "tapuach adama"],
  },
  {
    en: "city", es: "ciudad", fr: "ville", de: "Stadt", it: "città",
    hi: ["शहर", "shahar"], zh: ["城市", "chéngshì"], ar: ["مدينة", "madeena"], pt: "cidade",
    ru: ["город", "gorod"], ja: ["都市", "toshi"], ko: ["도시", "dosi"],
    bn: ["শহর", "shohor"], ur: ["شہر", "shehar"], id: "kota", tr: "şehir",
    vi: "thành phố", nl: "stad", pl: "miasto", sw: "mji", ta: ["நகரம்", "nagaram"],
    ml: ["നഗരം", "nagaram"], te: ["నగరం", "nagaram"], kn: ["ನಗರ", "nagara"],
    gu: ["શહેર", "shaher"], fa: ["شهر", "shahr"], el: ["πόλη", "poli"],
    sv: "stad", he: ["עיר", "ir"],
  },
  {
    en: "street", es: "calle", fr: "rue", de: "Straße", it: "strada",
    hi: ["सड़क", "sadak"], zh: ["街道", "jiēdào"], ar: ["شارع", "shaari"], pt: "rua",
    ru: ["улица", "ulitsa"], ja: ["通り", "tōri"], ko: ["거리", "geori"],
    bn: ["রাস্তা", "raasta"], ur: ["سڑک", "sarak"], id: "jalan", tr: "sokak",
    vi: "đường phố", nl: "straat", pl: "ulica", sw: "mtaa", ta: ["தெரு", "theru"],
    ml: ["തെരുവ്", "theruvu"], te: ["వీధి", "veedhi"], kn: ["ಬೀದಿ", "beedi"],
    gu: ["શેરી", "sheri"], fa: ["خیابان", "khiyaban"], el: ["δρόμος", "dromos"],
    sv: "gata", he: ["רחוב", "rechov"],
  },
  {
    en: "market", es: "mercado", fr: "marché", de: "Markt", it: "mercato",
    hi: ["बाज़ार", "baazaar"], zh: ["市场", "shìchǎng"], ar: ["سوق", "sooq"], pt: "mercado",
    ru: ["рынок", "rynok"], ja: ["市場", "ichiba"], ko: ["시장", "sijang"],
    bn: ["বাজার", "bajar"], ur: ["بازار", "baazaar"], id: "pasar", tr: "pazar",
    vi: "chợ", nl: "markt", pl: "targ", sw: "soko", ta: ["சந்தை", "sandhai"],
    ml: ["ചന്ത", "chantha"], te: ["సంత", "santa"], kn: ["ಮಾರುಕಟ್ಟೆ", "maarukatte"],
    gu: ["બજાર", "bajaar"], fa: ["بازار", "baazaar"], el: ["αγορά", "agora"],
    sv: "marknad", he: ["שוק", "shuk"],
  },
  {
    en: "hospital", es: "hospital", fr: "hôpital", de: "Krankenhaus", it: "ospedale",
    hi: ["अस्पताल", "aspataal"], zh: ["医院", "yīyuàn"], ar: ["مستشفى", "mustashfa"], pt: "hospital",
    ru: ["больница", "bolnitsa"], ja: ["病院", "byōin"], ko: ["병원", "byeongwon"],
    bn: ["হাসপাতাল", "haspatal"], ur: ["ہسپتال", "haspataal"], id: "rumah sakit", tr: "hastane",
    vi: "bệnh viện", nl: "ziekenhuis", pl: "szpital", sw: "hospitali", ta: ["மருத்துவமனை", "maruthuvamanai"],
    ml: ["ആശുപത്രി", "aashupathri"], te: ["ఆసుపత్రి", "aasupatri"], kn: ["ಆಸ್ಪತ್ರೆ", "aaspatre"],
    gu: ["હોસ્પિટલ", "hospital"], fa: ["بیمارستان", "bimarestan"], el: ["νοσοκομείο", "nosokomeio"],
    sv: "sjukhus", he: ["בית חולים", "beit cholim"],
  },
  {
    en: "airport", es: "aeropuerto", fr: "aéroport", de: "Flughafen", it: "aeroporto",
    hi: ["हवाई अड्डा", "havaai adda"], zh: ["机场", "jīchǎng"], ar: ["مطار", "mataar"], pt: "aeroporto",
    ru: ["аэропорт", "aeroport"], ja: ["空港", "kūkō"], ko: ["공항", "gonghang"],
    bn: ["বিমানবন্দর", "bimanbondor"], ur: ["ہوائی اڈا", "hawaai adda"], id: "bandara", tr: "havalimanı",
    vi: "sân bay", nl: "vliegveld", pl: "lotnisko", sw: "uwanja wa ndege", ta: ["விமான நிலையம்", "vimaana nilaiyam"],
    ml: ["വിമാനത്താവളം", "vimaanathaavalam"], te: ["విమానాశ్రయం", "vimaanaashrayam"], kn: ["ವಿಮಾನ ನಿಲ್ದಾಣ", "vimaana nildaana"],
    gu: ["હવાઈ મથક", "havaai mathak"], fa: ["فرودگاه", "forudgah"], el: ["αεροδρόμιο", "aerodromio"],
    sv: "flygplats", he: ["שדה תעופה", "sde teufa"],
  },
  {
    en: "beach", es: "playa", fr: "plage", de: "Strand", it: "spiaggia",
    hi: ["समुद्र तट", "samudra tat"], zh: ["海滩", "hǎitān"], ar: ["شاطئ", "shaati"], pt: "praia",
    ru: ["пляж", "plyazh"], ja: ["浜辺", "hamabe"], ko: ["해변", "haebyeon"],
    bn: ["সৈকত", "soikot"], ur: ["ساحل", "saahil"], id: "pantai", tr: "plaj",
    vi: "bãi biển", nl: "strand", pl: "plaża", sw: "ufukwe", ta: ["கடற்கரை", "kadarkarai"],
    ml: ["കടപ്പുറം", "kadappuram"], te: ["సముద్ర తీరం", "samudra teeram"], kn: ["ಕಡಲತೀರ", "kadalateera"],
    gu: ["દરિયાકિનારો", "dariyakinaaro"], fa: ["ساحل", "saahel"], el: ["παραλία", "paralia"],
    sv: "strand", he: ["חוף", "chof"],
  },
  {
    en: "museum", es: "museo", fr: "musée", de: "Museum", it: "museo",
    hi: ["संग्रहालय", "sangrahaalay"], zh: ["博物馆", "bówùguǎn"], ar: ["متحف", "mathaf"], pt: "museu",
    ru: ["музей", "muzey"], ja: ["博物館", "hakubutsukan"], ko: ["박물관", "bangmulgwan"],
    bn: ["জাদুঘর", "jadughor"], ur: ["عجائب گھر", "ajaib ghar"], id: "museum", tr: "müze",
    vi: "bảo tàng", nl: "museum", pl: "muzeum", sw: "makumbusho", ta: ["அருங்காட்சியகம்", "arungaatchiyagam"],
    ml: ["മ്യൂസിയം", "myoosiyam"], te: ["ప్రదర్శనశాల", "pradarshanashaala"], kn: ["ವಸ್ತುಸಂಗ್ರಹಾಲಯ", "vastusangrahaalaya"],
    gu: ["સંગ્રહાલય", "sangrahaalay"], fa: ["موزه", "muzeh"], el: ["μουσείο", "mouseio"],
    sv: "museum", he: ["מוזיאון", "muzeon"],
  },
  {
    en: "restaurant", es: "restaurante", fr: "restaurant", de: "Restaurant", it: "ristorante",
    hi: ["रेस्टोरेंट", "restorent"], zh: ["餐厅", "cāntīng"], ar: ["مطعم", "mataam"], pt: "restaurante",
    ru: ["ресторан", "restoran"], ja: ["レストラン", "resutoran"], ko: ["식당", "sikdang"],
    bn: ["রেস্তোরাঁ", "restoran"], ur: ["ریسٹورنٹ", "restorant"], id: "restoran", tr: "restoran",
    vi: "nhà hàng", nl: "restaurant", pl: "restauracja", sw: "mgahawa", ta: ["உணவகம்", "unavagam"],
    ml: ["ഭക്ഷണശാല", "bhakshanashaala"], te: ["హోటల్", "hotal"], kn: ["ಹೋಟೆಲ್", "hotel"],
    gu: ["રેસ્ટોરન્ટ", "restorant"], fa: ["رستوران", "restoran"], el: ["εστιατόριο", "estiatorio"],
    sv: "restaurang", he: ["מסעדה", "misada"],
  },
  {
    en: "kitchen", es: "cocina", fr: "cuisine", de: "Küche", it: "cucina",
    hi: ["रसोई", "rasoi"], zh: ["厨房", "chúfáng"], ar: ["مطبخ", "matbakh"], pt: "cozinha",
    ru: ["кухня", "kukhnya"], ja: ["台所", "daidokoro"], ko: ["부엌", "bueok"],
    bn: ["রান্নাঘর", "rannaghor"], ur: ["باورچی خانہ", "baawarchi khaana"], id: "dapur", tr: "mutfak",
    vi: "nhà bếp", nl: "keuken", pl: "kuchnia", sw: "jiko", ta: ["சமையலறை", "samaiyalarai"],
    ml: ["അടുക്കള", "adukkala"], te: ["వంటగది", "vantagadi"], kn: ["ಅಡುಗೆಮನೆ", "adugemane"],
    gu: ["રસોડું", "rasodu"], fa: ["آشپزخانه", "aashpazkhaneh"], el: ["κουζίνα", "kouzina"],
    sv: "kök", he: ["מטבח", "mitbach"],
  },
  {
    en: "garden", es: "jardín", fr: "jardin", de: "Garten", it: "giardino",
    hi: ["बगीचा", "bageecha"], zh: ["花园", "huāyuán"], ar: ["حديقة", "hadeeqa"], pt: "jardim",
    ru: ["сад", "sad"], ja: ["庭", "niwa"], ko: ["정원", "jeongwon"],
    bn: ["বাগান", "bagan"], ur: ["باغ", "baagh"], id: "kebun", tr: "bahçe",
    vi: "khu vườn", nl: "tuin", pl: "ogród", sw: "bustani", ta: ["தோட்டம்", "thottam"],
    ml: ["പൂന്തോട്ടം", "poonthottam"], te: ["తోట", "thota"], kn: ["ತೋಟ", "thota"],
    gu: ["બગીચો", "bagicho"], fa: ["باغ", "baagh"], el: ["κήπος", "kipos"],
    sv: "trädgård", he: ["גן", "gan"],
  },
  {
    en: "bridge", es: "puente", fr: "pont", de: "Brücke", it: "ponte",
    hi: ["पुल", "pul"], zh: ["桥", "qiáo"], ar: ["جسر", "jisr"], pt: "ponte",
    ru: ["мост", "most"], ja: ["橋", "hashi"], ko: ["다리", "dari"],
    bn: ["সেতু", "setu"], ur: ["پل", "pul"], id: "jembatan", tr: "köprü",
    vi: "cây cầu", nl: "brug", pl: "most", sw: "daraja", ta: ["பாலம்", "paalam"],
    ml: ["പാലം", "paalam"], te: ["వంతెన", "vantena"], kn: ["ಸೇತುವೆ", "setuve"],
    gu: ["પુલ", "pul"], fa: ["پل", "pol"], el: ["γέφυρα", "gefyra"],
    sv: "bro", he: ["גשר", "gesher"],
  },
  {
    en: "office", es: "oficina", fr: "bureau", de: "Büro", it: "ufficio",
    hi: ["दफ़्तर", "daftar"], zh: ["办公室", "bàngōngshì"], ar: ["مكتب", "maktab"], pt: "escritório",
    ru: ["офис", "ofis"], ja: ["事務所", "jimusho"], ko: ["사무실", "samusil"],
    bn: ["অফিস", "ophis"], ur: ["دفتر", "daftar"], id: "kantor", tr: "ofis",
    vi: "văn phòng", nl: "kantoor", pl: "biuro", sw: "ofisi", ta: ["அலுவலகம்", "aluvalagam"],
    ml: ["ഓഫീസ്", "offees"], te: ["కార్యాలయం", "kaaryaalayam"], kn: ["ಕಚೇರಿ", "kacheri"],
    gu: ["ઓફિસ", "ophis"], fa: ["دفتر", "daftar"], el: ["γραφείο", "grafeio"],
    sv: "kontor", he: ["משרד", "misrad"],
  },
  {
    en: "station", es: "estación", fr: "gare", de: "Bahnhof", it: "stazione",
    hi: ["स्टेशन", "steshan"], zh: ["车站", "chēzhàn"], ar: ["محطة", "mahatta"], pt: "estação",
    ru: ["вокзал", "vokzal"], ja: ["駅", "eki"], ko: ["역", "yeok"],
    bn: ["স্টেশন", "steshon"], ur: ["اسٹیشن", "isteshan"], id: "stasiun", tr: "istasyon",
    vi: "nhà ga", nl: "station", pl: "dworzec", sw: "stesheni", ta: ["நிலையம்", "nilaiyam"],
    ml: ["സ്റ്റേഷൻ", "steshan"], te: ["స్టేషన్", "steshan"], kn: ["ನಿಲ್ದಾಣ", "nildaana"],
    gu: ["સ્ટેશન", "steshan"], fa: ["ایستگاه", "istgah"], el: ["σταθμός", "stathmos"],
    sv: "station", he: ["תחנה", "tachana"],
  },
  {
    en: "shop", es: "tienda", fr: "magasin", de: "Laden", it: "negozio",
    hi: ["दुकान", "dukaan"], zh: ["商店", "shāngdiàn"], ar: ["متجر", "matjar"], pt: "loja",
    ru: ["магазин", "magazin"], ja: ["店", "mise"], ko: ["가게", "gage"],
    bn: ["দোকান", "dokan"], ur: ["دکان", "dukaan"], id: "toko", tr: "dükkan",
    vi: "cửa hàng", nl: "winkel", pl: "sklep", sw: "duka", ta: ["கடை", "kadai"],
    ml: ["കട", "kada"], te: ["దుకాణం", "dukaanam"], kn: ["ಅಂಗಡಿ", "angadi"],
    gu: ["દુકાન", "dukaan"], fa: ["مغازه", "maghazeh"], el: ["μαγαζί", "magazi"],
    sv: "affär", he: ["חנות", "chanut"],
  },
  {
    en: "sun", es: "sol", fr: "soleil", de: "Sonne", it: "sole",
    hi: ["सूरज", "sooraj"], zh: ["太阳", "tàiyáng"], ar: ["شمس", "shams"], pt: "sol",
    ru: ["солнце", "solntse"], ja: ["太陽", "taiyō"], ko: ["태양", "taeyang"],
    bn: ["সূর্য", "surjo"], ur: ["سورج", "sooraj"], id: "matahari", tr: "güneş",
    vi: "mặt trời", nl: "zon", pl: "słońce", sw: "jua", ta: ["சூரியன்", "sooriyan"],
    ml: ["സൂര്യൻ", "sooryan"], te: ["సూర్యుడు", "sooryudu"], kn: ["ಸೂರ್ಯ", "soorya"],
    gu: ["સૂરજ", "sooraj"], fa: ["خورشید", "khorshid"], el: ["ήλιος", "ilios"],
    sv: "sol", he: ["שמש", "shemesh"],
  },
  {
    en: "moon", es: "luna", fr: "lune", de: "Mond", it: "luna",
    hi: ["चाँद", "chaand"], zh: ["月亮", "yuèliang"], ar: ["قمر", "qamar"], pt: "lua",
    ru: ["луна", "luna"], ja: ["月", "tsuki"], ko: ["달", "dal"],
    bn: ["চাঁদ", "chaand"], ur: ["چاند", "chaand"], id: "bulan", tr: "ay",
    vi: "mặt trăng", nl: "maan", pl: "księżyc", sw: "mwezi", ta: ["நிலா", "nilaa"],
    ml: ["ചന്ദ്രൻ", "chandran"], te: ["చంద్రుడు", "chandrudu"], kn: ["ಚಂದ್ರ", "chandra"],
    gu: ["ચાંદ", "chaand"], fa: ["ماه", "maah"], el: ["φεγγάρι", "fengari"],
    sv: "måne", he: ["ירח", "yareach"],
  },
  {
    en: "star", es: "estrella", fr: "étoile", de: "Stern", it: "stella",
    hi: ["तारा", "taara"], zh: ["星星", "xīngxing"], ar: ["نجمة", "najma"], pt: "estrela",
    ru: ["звезда", "zvezda"], ja: ["星", "hoshi"], ko: ["별", "byeol"],
    bn: ["তারা", "tara"], ur: ["ستارہ", "sitaara"], id: "bintang", tr: "yıldız",
    vi: "ngôi sao", nl: "ster", pl: "gwiazda", sw: "nyota", ta: ["நட்சத்திரம்", "natchathiram"],
    ml: ["നക്ഷത്രം", "nakshathram"], te: ["నక్షత్రం", "nakshatram"], kn: ["ನಕ್ಷತ್ರ", "nakshatra"],
    gu: ["તારો", "taaro"], fa: ["ستاره", "setareh"], el: ["αστέρι", "asteri"],
    sv: "stjärna", he: ["כוכב", "kochav"],
  },
  {
    en: "rain", es: "lluvia", fr: "pluie", de: "Regen", it: "pioggia",
    hi: ["बारिश", "baarish"], zh: ["雨", "yǔ"], ar: ["مطر", "matar"], pt: "chuva",
    ru: ["дождь", "dozhd"], ja: ["雨", "ame"], ko: ["비", "bi"],
    bn: ["বৃষ্টি", "brishti"], ur: ["بارش", "baarish"], id: "hujan", tr: "yağmur",
    vi: "mưa", nl: "regen", pl: "deszcz", sw: "mvua", ta: ["மழை", "mazhai"],
    ml: ["മഴ", "mazha"], te: ["వర్షం", "varsham"], kn: ["ಮಳೆ", "male"],
    gu: ["વરસાદ", "varsaad"], fa: ["باران", "baaraan"], el: ["βροχή", "vrochi"],
    sv: "regn", he: ["גשם", "geshem"],
  },
  {
    en: "wind", es: "viento", fr: "vent", de: "Wind", it: "vento",
    hi: ["हवा", "hava"], zh: ["风", "fēng"], ar: ["ريح", "reeh"], pt: "vento",
    ru: ["ветер", "veter"], ja: ["風", "kaze"], ko: ["바람", "baram"],
    bn: ["বাতাস", "batash"], ur: ["ہوا", "hawa"], id: "angin", tr: "rüzgar",
    vi: "gió", nl: "wind", pl: "wiatr", sw: "upepo", ta: ["காற்று", "kaatru"],
    ml: ["കാറ്റ്", "kaattu"], te: ["గాలి", "gaali"], kn: ["ಗಾಳಿ", "gaali"],
    gu: ["પવન", "pavan"], fa: ["باد", "baad"], el: ["άνεμος", "anemos"],
    sv: "vind", he: ["רוח", "ruach"],
  },
  {
    en: "tree", es: "árbol", fr: "arbre", de: "Baum", it: "albero",
    hi: ["पेड़", "ped"], zh: ["树", "shù"], ar: ["شجرة", "shajara"], pt: "árvore",
    ru: ["дерево", "derevo"], ja: ["木", "ki"], ko: ["나무", "namu"],
    bn: ["গাছ", "gaachh"], ur: ["درخت", "darakht"], id: "pohon", tr: "ağaç",
    vi: "cây", nl: "boom", pl: "drzewo", sw: "mti", ta: ["மரம்", "maram"],
    ml: ["മരം", "maram"], te: ["చెట్టు", "chettu"], kn: ["ಮರ", "mara"],
    gu: ["ઝાડ", "jhaad"], fa: ["درخت", "derakht"], el: ["δέντρο", "dentro"],
    sv: "träd", he: ["עץ", "etz"],
  },
  {
    en: "flower", es: "flor", fr: "fleur", de: "Blume", it: "fiore",
    hi: ["फूल", "phool"], zh: ["花", "huā"], ar: ["زهرة", "zahra"], pt: "flor",
    ru: ["цветок", "tsvetok"], ja: ["花", "hana"], ko: ["꽃", "kkot"],
    bn: ["ফুল", "phul"], ur: ["پھول", "phool"], id: "bunga", tr: "çiçek",
    vi: "hoa", nl: "bloem", pl: "kwiat", sw: "ua", ta: ["பூ", "poo"],
    ml: ["പൂവ്", "poovu"], te: ["పువ్వు", "puvvu"], kn: ["ಹೂವು", "hoovu"],
    gu: ["ફૂલ", "phool"], fa: ["گل", "gol"], el: ["λουλούδι", "louloudi"],
    sv: "blomma", he: ["פרח", "perach"],
  },
  {
    en: "river", es: "río", fr: "rivière", de: "Fluss", it: "fiume",
    hi: ["नदी", "nadi"], zh: ["河", "hé"], ar: ["نهر", "nahr"], pt: "rio",
    ru: ["река", "reka"], ja: ["川", "kawa"], ko: ["강", "gang"],
    bn: ["নদী", "nodi"], ur: ["دریا", "darya"], id: "sungai", tr: "nehir",
    vi: "sông", nl: "rivier", pl: "rzeka", sw: "mto", ta: ["ஆறு", "aaru"],
    ml: ["പുഴ", "puzha"], te: ["నది", "nadi"], kn: ["ನದಿ", "nadi"],
    gu: ["નદી", "nadi"], fa: ["رودخانه", "rudkhaneh"], el: ["ποτάμι", "potami"],
    sv: "flod", he: ["נהר", "nahar"],
  },
  {
    en: "mountain", es: "montaña", fr: "montagne", de: "Berg", it: "montagna",
    hi: ["पहाड़", "pahaad"], zh: ["山", "shān"], ar: ["جبل", "jabal"], pt: "montanha",
    ru: ["гора", "gora"], ja: ["山", "yama"], ko: ["산", "san"],
    bn: ["পাহাড়", "pahar"], ur: ["پہاڑ", "pahaar"], id: "gunung", tr: "dağ",
    vi: "núi", nl: "berg", pl: "góra", sw: "mlima", ta: ["மலை", "malai"],
    ml: ["മല", "mala"], te: ["కొండ", "konda"], kn: ["ಬೆಟ್ಟ", "betta"],
    gu: ["પર્વત", "parvat"], fa: ["کوه", "kuh"], el: ["βουνό", "vouno"],
    sv: "berg", he: ["הר", "har"],
  },
  {
    en: "sea", es: "mar", fr: "mer", de: "Meer", it: "mare",
    hi: ["समुद्र", "samudra"], zh: ["海", "hǎi"], ar: ["بحر", "bahr"], pt: "mar",
    ru: ["море", "more"], ja: ["海", "umi"], ko: ["바다", "bada"],
    bn: ["সমুদ্র", "somudro"], ur: ["سمندر", "samandar"], id: "laut", tr: "deniz",
    vi: "biển", nl: "zee", pl: "morze", sw: "bahari", ta: ["கடல்", "kadal"],
    ml: ["കടൽ", "kadal"], te: ["సముద్రం", "samudram"], kn: ["ಸಮುದ್ರ", "samudra"],
    gu: ["દરિયો", "dariyo"], fa: ["دریا", "daryaa"], el: ["θάλασσα", "thalassa"],
    sv: "hav", he: ["ים", "yam"],
  },
  {
    en: "sky", es: "cielo", fr: "ciel", de: "Himmel", it: "cielo",
    hi: ["आसमान", "aasmaan"], zh: ["天空", "tiānkōng"], ar: ["سماء", "samaa"], pt: "céu",
    ru: ["небо", "nebo"], ja: ["空", "sora"], ko: ["하늘", "haneul"],
    bn: ["আকাশ", "akash"], ur: ["آسمان", "aasmaan"], id: "langit", tr: "gökyüzü",
    vi: "bầu trời", nl: "lucht", pl: "niebo", sw: "anga", ta: ["வானம்", "vaanam"],
    ml: ["ആകാശം", "aakaasham"], te: ["ఆకాశం", "aakaasham"], kn: ["ಆಕಾಶ", "aakaasha"],
    gu: ["આકાશ", "aakaash"], fa: ["آسمان", "aasemaan"], el: ["ουρανός", "ouranos"],
    sv: "himmel", he: ["שמיים", "shamayim"],
  },
  {
    en: "cloud", es: "nube", fr: "nuage", de: "Wolke", it: "nuvola",
    hi: ["बादल", "baadal"], zh: ["云", "yún"], ar: ["سحابة", "sahaaba"], pt: "nuvem",
    ru: ["облако", "oblako"], ja: ["雲", "kumo"], ko: ["구름", "gureum"],
    bn: ["মেঘ", "megh"], ur: ["بادل", "baadal"], id: "awan", tr: "bulut",
    vi: "mây", nl: "wolk", pl: "chmura", sw: "wingu", ta: ["மேகம்", "megam"],
    ml: ["മേഘം", "megham"], te: ["మేఘం", "megham"], kn: ["ಮೋಡ", "moda"],
    gu: ["વાદળ", "vaadal"], fa: ["ابر", "abr"], el: ["σύννεφο", "synnefo"],
    sv: "moln", he: ["ענן", "anan"],
  },
  {
    en: "dog", es: "perro", fr: "chien", de: "Hund", it: "cane",
    hi: ["कुत्ता", "kutta"], zh: ["狗", "gǒu"], ar: ["كلب", "kalb"], pt: "cachorro",
    ru: ["собака", "sobaka"], ja: ["犬", "inu"], ko: ["개", "gae"],
    bn: ["কুকুর", "kukur"], ur: ["کتا", "kutta"], id: "anjing", tr: "köpek",
    vi: "con chó", nl: "hond", pl: "pies", sw: "mbwa", ta: ["நாய்", "naai"],
    ml: ["നായ", "naaya"], te: ["కుక్క", "kukka"], kn: ["ನಾಯಿ", "naayi"],
    gu: ["કૂતરો", "kootro"], fa: ["سگ", "sag"], el: ["σκύλος", "skylos"],
    sv: "hund", he: ["כלב", "kelev"],
  },
  {
    en: "cat", es: "gato", fr: "chat", de: "Katze", it: "gatto",
    hi: ["बिल्ली", "billi"], zh: ["猫", "māo"], ar: ["قطة", "qitta"], pt: "gato",
    ru: ["кошка", "koshka"], ja: ["猫", "neko"], ko: ["고양이", "goyangi"],
    bn: ["বিড়াল", "biral"], ur: ["بلی", "billi"], id: "kucing", tr: "kedi",
    vi: "con mèo", nl: "kat", pl: "kot", sw: "paka", ta: ["பூனை", "poonai"],
    ml: ["പൂച്ച", "poocha"], te: ["పిల్లి", "pilli"], kn: ["ಬೆಕ್ಕು", "bekku"],
    gu: ["બિલાડી", "bilaadi"], fa: ["گربه", "gorbeh"], el: ["γάτα", "gata"],
    sv: "katt", he: ["חתול", "chatul"],
  },
  {
    en: "bird", es: "pájaro", fr: "oiseau", de: "Vogel", it: "uccello",
    hi: ["चिड़िया", "chidiya"], zh: ["鸟", "niǎo"], ar: ["طائر", "taair"], pt: "pássaro",
    ru: ["птица", "ptitsa"], ja: ["鳥", "tori"], ko: ["새", "sae"],
    bn: ["পাখি", "pakhi"], ur: ["پرندہ", "parinda"], id: "burung", tr: "kuş",
    vi: "con chim", nl: "vogel", pl: "ptak", sw: "ndege", ta: ["பறவை", "paravai"],
    ml: ["പക്ഷി", "pakshi"], te: ["పక్షి", "pakshi"], kn: ["ಹಕ್ಕಿ", "hakki"],
    gu: ["પક્ષી", "pakshi"], fa: ["پرنده", "parandeh"], el: ["πουλί", "pouli"],
    sv: "fågel", he: ["ציפור", "tsipor"],
  },
  {
    en: "horse", es: "caballo", fr: "cheval", de: "Pferd", it: "cavallo",
    hi: ["घोड़ा", "ghoda"], zh: ["马", "mǎ"], ar: ["حصان", "hisaan"], pt: "cavalo",
    ru: ["лошадь", "loshad"], ja: ["馬", "uma"], ko: ["말", "mal"],
    bn: ["ঘোড়া", "ghora"], ur: ["گھوڑا", "ghora"], id: "kuda", tr: "at",
    vi: "con ngựa", nl: "paard", pl: "koń", sw: "farasi", ta: ["குதிரை", "kudhirai"],
    ml: ["കുതിര", "kuthira"], te: ["గుర్రం", "gurram"], kn: ["ಕುದುರೆ", "kudure"],
    gu: ["ઘોડો", "ghodo"], fa: ["اسب", "asb"], el: ["άλογο", "alogo"],
    sv: "häst", he: ["סוס", "sus"],
  },
  {
    en: "cow", es: "vaca", fr: "vache", de: "Kuh", it: "mucca",
    hi: ["गाय", "gaay"], zh: ["牛", "niú"], ar: ["بقرة", "baqara"], pt: "vaca",
    ru: ["корова", "korova"], ja: ["牛", "ushi"], ko: ["소", "so"],
    bn: ["গরু", "goru"], ur: ["گائے", "gaaye"], id: "sapi", tr: "inek",
    vi: "con bò", nl: "koe", pl: "krowa", sw: "ng'ombe", ta: ["பசு", "pasu"],
    ml: ["പശു", "pashu"], te: ["ఆవు", "aavu"], kn: ["ಹಸು", "hasu"],
    gu: ["ગાય", "gaay"], fa: ["گاو", "gaav"], el: ["αγελάδα", "agelada"],
    sv: "ko", he: ["פרה", "para"],
  },
  {
    en: "hand", es: "mano", fr: "main", de: "Hand", it: "mano",
    hi: ["हाथ", "haath"], zh: ["手", "shǒu"], ar: ["يد", "yad"], pt: "mão",
    ru: ["рука", "ruka"], ja: ["手", "te"], ko: ["손", "son"],
    bn: ["হাত", "haat"], ur: ["ہاتھ", "haath"], id: "tangan", tr: "el",
    vi: "bàn tay", nl: "hand", pl: "ręka", sw: "mkono", ta: ["கை", "kai"],
    ml: ["കൈ", "kai"], te: ["చేయి", "cheyi"], kn: ["ಕೈ", "kai"],
    gu: ["હાથ", "haath"], fa: ["دست", "dast"], el: ["χέρι", "cheri"],
    sv: "hand", he: ["יד", "yad"],
  },
  {
    en: "eye", es: "ojo", fr: "œil", de: "Auge", it: "occhio",
    hi: ["आँख", "aankh"], zh: ["眼睛", "yǎnjing"], ar: ["عين", "ayn"], pt: "olho",
    ru: ["глаз", "glaz"], ja: ["目", "me"], ko: ["눈", "nun"],
    bn: ["চোখ", "chokh"], ur: ["آنکھ", "aankh"], id: "mata", tr: "göz",
    vi: "mắt", nl: "oog", pl: "oko", sw: "jicho", ta: ["கண்", "kan"],
    ml: ["കണ്ണ്", "kannu"], te: ["కన్ను", "kannu"], kn: ["ಕಣ್ಣು", "kannu"],
    gu: ["આંખ", "aankh"], fa: ["چشم", "cheshm"], el: ["μάτι", "mati"],
    sv: "öga", he: ["עין", "ayin"],
  },
  {
    en: "heart", es: "corazón", fr: "cœur", de: "Herz", it: "cuore",
    hi: ["दिल", "dil"], zh: ["心", "xīn"], ar: ["قلب", "qalb"], pt: "coração",
    ru: ["сердце", "serdtse"], ja: ["心臓", "shinzō"], ko: ["심장", "simjang"],
    bn: ["হৃদয়", "hridoy"], ur: ["دل", "dil"], id: "jantung", tr: "kalp",
    vi: "trái tim", nl: "hart", pl: "serce", sw: "moyo", ta: ["இதயம்", "idhayam"],
    ml: ["ഹൃദയം", "hrudayam"], te: ["గుండె", "gunde"], kn: ["ಹೃದಯ", "hrudaya"],
    gu: ["હૃદય", "hruday"], fa: ["قلب", "ghalb"], el: ["καρδιά", "kardia"],
    sv: "hjärta", he: ["לב", "lev"],
  },
  {
    en: "head", es: "cabeza", fr: "tête", de: "Kopf", it: "testa",
    hi: ["सिर", "sir"], zh: ["头", "tóu"], ar: ["رأس", "raas"], pt: "cabeça",
    ru: ["голова", "golova"], ja: ["頭", "atama"], ko: ["머리", "meori"],
    bn: ["মাথা", "matha"], ur: ["سر", "sar"], id: "kepala", tr: "baş",
    vi: "cái đầu", nl: "hoofd", pl: "głowa", sw: "kichwa", ta: ["தலை", "thalai"],
    ml: ["തല", "thala"], te: ["తల", "tala"], kn: ["ತಲೆ", "tale"],
    gu: ["માથું", "maathu"], fa: ["سر", "sar"], el: ["κεφάλι", "kefali"],
    sv: "huvud", he: ["ראש", "rosh"],
  },
  {
    en: "morning", es: "mañana", fr: "matin", de: "Morgen", it: "mattina",
    hi: ["सुबह", "subah"], zh: ["早上", "zǎoshang"], ar: ["صباح", "sabaah"], pt: "manhã",
    ru: ["утро", "utro"], ja: ["朝", "asa"], ko: ["아침", "achim"],
    bn: ["সকাল", "sokal"], ur: ["صبح", "subah"], id: "pagi", tr: "sabah",
    vi: "buổi sáng", nl: "ochtend", pl: "rano", sw: "asubuhi", ta: ["காலை", "kaalai"],
    ml: ["രാവിലെ", "raavile"], te: ["ఉదయం", "udayam"], kn: ["ಬೆಳಿಗ್ಗೆ", "beligge"],
    gu: ["સવાર", "savaar"], fa: ["صبح", "sobh"], el: ["πρωί", "proi"],
    sv: "morgon", he: ["בוקר", "boker"],
  },
  {
    en: "night", es: "noche", fr: "nuit", de: "Nacht", it: "notte",
    hi: ["रात", "raat"], zh: ["晚上", "wǎnshang"], ar: ["ليل", "layl"], pt: "noite",
    ru: ["ночь", "noch"], ja: ["夜", "yoru"], ko: ["밤", "bam"],
    bn: ["রাত", "raat"], ur: ["رات", "raat"], id: "malam", tr: "gece",
    vi: "ban đêm", nl: "nacht", pl: "noc", sw: "usiku", ta: ["இரவு", "iravu"],
    ml: ["രാത്രി", "raathri"], te: ["రాత్రి", "raatri"], kn: ["ರಾತ್ರಿ", "raatri"],
    gu: ["રાત", "raat"], fa: ["شب", "shab"], el: ["νύχτα", "nychta"],
    sv: "natt", he: ["לילה", "layla"],
  },
  {
    en: "week", es: "semana", fr: "semaine", de: "Woche", it: "settimana",
    hi: ["हफ़्ता", "hafta"], zh: ["星期", "xīngqī"], ar: ["أسبوع", "usbu"], pt: "semana",
    ru: ["неделя", "nedelya"], ja: ["週", "shū"], ko: ["일주일", "iljuil"],
    bn: ["সপ্তাহ", "soptaho"], ur: ["ہفتہ", "hafta"], id: "minggu", tr: "hafta",
    vi: "tuần", nl: "week", pl: "tydzień", sw: "wiki", ta: ["வாரம்", "vaaram"],
    ml: ["ആഴ്ച", "aazhcha"], te: ["వారం", "vaaram"], kn: ["ವಾರ", "vaara"],
    gu: ["અઠવાડિયું", "athvaadiyu"], fa: ["هفته", "hafteh"], el: ["εβδομάδα", "evdomada"],
    sv: "vecka", he: ["שבוע", "shavua"],
  },
  {
    en: "table", es: "mesa", fr: "table", de: "Tisch", it: "tavolo",
    hi: ["मेज़", "mez"], zh: ["桌子", "zhuōzi"], ar: ["طاولة", "taawila"], pt: "mesa",
    ru: ["стол", "stol"], ja: ["テーブル", "tēburu"], ko: ["탁자", "takja"],
    bn: ["টেবিল", "tebil"], ur: ["میز", "mez"], id: "meja", tr: "masa",
    vi: "cái bàn", nl: "tafel", pl: "stół", sw: "meza", ta: ["மேசை", "mesai"],
    ml: ["മേശ", "mesha"], te: ["బల్ల", "balla"], kn: ["ಮೇಜು", "meju"],
    gu: ["ટેબલ", "tebal"], fa: ["میز", "miz"], el: ["τραπέζι", "trapezi"],
    sv: "bord", he: ["שולחן", "shulchan"],
  },
  {
    en: "chair", es: "silla", fr: "chaise", de: "Stuhl", it: "sedia",
    hi: ["कुर्सी", "kursi"], zh: ["椅子", "yǐzi"], ar: ["كرسي", "kursi"], pt: "cadeira",
    ru: ["стул", "stul"], ja: ["椅子", "isu"], ko: ["의자", "uija"],
    bn: ["চেয়ার", "cheyar"], ur: ["کرسی", "kursi"], id: "kursi", tr: "sandalye",
    vi: "cái ghế", nl: "stoel", pl: "krzesło", sw: "kiti", ta: ["நாற்காலி", "naarkaali"],
    ml: ["കസേര", "kasera"], te: ["కుర్చీ", "kurchi"], kn: ["ಕುರ್ಚಿ", "kurchi"],
    gu: ["ખુરશી", "khurshi"], fa: ["صندلی", "sandali"], el: ["καρέκλα", "karekla"],
    sv: "stol", he: ["כיסא", "kise"],
  },
  {
    en: "door", es: "puerta", fr: "porte", de: "Tür", it: "porta",
    hi: ["दरवाज़ा", "darvaaza"], zh: ["门", "mén"], ar: ["باب", "baab"], pt: "porta",
    ru: ["дверь", "dver"], ja: ["ドア", "doa"], ko: ["문", "mun"],
    bn: ["দরজা", "dorja"], ur: ["دروازہ", "darwaaza"], id: "pintu", tr: "kapı",
    vi: "cửa", nl: "deur", pl: "drzwi", sw: "mlango", ta: ["கதவு", "kadhavu"],
    ml: ["വാതിൽ", "vaathil"], te: ["తలుపు", "talupu"], kn: ["ಬಾಗಿಲು", "baagilu"],
    gu: ["દરવાજો", "darvaajo"], fa: ["در", "dar"], el: ["πόρτα", "porta"],
    sv: "dörr", he: ["דלת", "delet"],
  },
  {
    en: "window", es: "ventana", fr: "fenêtre", de: "Fenster", it: "finestra",
    hi: ["खिड़की", "khidki"], zh: ["窗户", "chuānghu"], ar: ["نافذة", "naafidha"], pt: "janela",
    ru: ["окно", "okno"], ja: ["窓", "mado"], ko: ["창문", "changmun"],
    bn: ["জানালা", "janala"], ur: ["کھڑکی", "khirki"], id: "jendela", tr: "pencere",
    vi: "cửa sổ", nl: "raam", pl: "okno", sw: "dirisha", ta: ["ஜன்னல்", "jannal"],
    ml: ["ജനൽ", "janal"], te: ["కిటికీ", "kitiki"], kn: ["ಕಿಟಕಿ", "kitaki"],
    gu: ["બારી", "baari"], fa: ["پنجره", "panjereh"], el: ["παράθυρο", "parathyro"],
    sv: "fönster", he: ["חלון", "chalon"],
  },
  {
    en: "key", es: "llave", fr: "clé", de: "Schlüssel", it: "chiave",
    hi: ["चाबी", "chaabi"], zh: ["钥匙", "yàoshi"], ar: ["مفتاح", "miftaah"], pt: "chave",
    ru: ["ключ", "klyuch"], ja: ["鍵", "kagi"], ko: ["열쇠", "yeolsoe"],
    bn: ["চাবি", "chabi"], ur: ["چابی", "chaabi"], id: "kunci", tr: "anahtar",
    vi: "chìa khóa", nl: "sleutel", pl: "klucz", sw: "ufunguo", ta: ["சாவி", "saavi"],
    ml: ["താക്കോൽ", "thaakkol"], te: ["తాళం చెవి", "taalam chevi"], kn: ["ಬೀಗದ ಕೈ", "beegada kai"],
    gu: ["ચાવી", "chaavi"], fa: ["کلید", "kelid"], el: ["κλειδί", "kleidi"],
    sv: "nyckel", he: ["מפתח", "mafteach"],
  },
  {
    en: "phone", es: "teléfono", fr: "téléphone", de: "Telefon", it: "telefono",
    hi: ["फ़ोन", "phon"], zh: ["电话", "diànhuà"], ar: ["هاتف", "haatif"], pt: "telefone",
    ru: ["телефон", "telefon"], ja: ["電話", "denwa"], ko: ["전화", "jeonhwa"],
    bn: ["ফোন", "phon"], ur: ["فون", "fon"], id: "telepon", tr: "telefon",
    vi: "điện thoại", nl: "telefoon", pl: "telefon", sw: "simu", ta: ["தொலைபேசி", "tholaipesi"],
    ml: ["ഫോൺ", "phon"], te: ["ఫోన్", "phon"], kn: ["ಫೋನ್", "phon"],
    gu: ["ફોન", "phon"], fa: ["تلفن", "telefon"], el: ["τηλέφωνο", "tilefono"],
    sv: "telefon", he: ["טלפון", "telefon"],
  },
  {
    en: "car", es: "coche", fr: "voiture", de: "Auto", it: "macchina",
    hi: ["गाड़ी", "gaadi"], zh: ["汽车", "qìchē"], ar: ["سيارة", "sayyaara"], pt: "carro",
    ru: ["машина", "mashina"], ja: ["車", "kuruma"], ko: ["자동차", "jadongcha"],
    bn: ["গাড়ি", "gari"], ur: ["گاڑی", "gaari"], id: "mobil", tr: "araba",
    vi: "xe hơi", nl: "auto", pl: "samochód", sw: "gari", ta: ["கார்", "kaar"],
    ml: ["കാർ", "kaar"], te: ["కారు", "kaaru"], kn: ["ಕಾರು", "kaaru"],
    gu: ["ગાડી", "gaadi"], fa: ["ماشین", "maashin"], el: ["αυτοκίνητο", "aftokinito"],
    sv: "bil", he: ["מכונית", "mechonit"],
  },
  {
    en: "bicycle", es: "bicicleta", fr: "vélo", de: "Fahrrad", it: "bicicletta",
    hi: ["साइकिल", "saikil"], zh: ["自行车", "zìxíngchē"], ar: ["دراجة", "darraaja"], pt: "bicicleta",
    ru: ["велосипед", "velosiped"], ja: ["自転車", "jitensha"], ko: ["자전거", "jajeongeo"],
    bn: ["সাইকেল", "saikel"], ur: ["سائیکل", "saikal"], id: "sepeda", tr: "bisiklet",
    vi: "xe đạp", nl: "fiets", pl: "rower", sw: "baiskeli", ta: ["மிதிவண்டி", "mithivandi"],
    ml: ["സൈക്കിൾ", "saikkil"], te: ["సైకిల్", "saikil"], kn: ["ಸೈಕಲ್", "saikal"],
    gu: ["સાયકલ", "saaykal"], fa: ["دوچرخه", "docharkheh"], el: ["ποδήλατο", "podilato"],
    sv: "cykel", he: ["אופניים", "ofanayim"],
  },
  {
    en: "train", es: "tren", fr: "train", de: "Zug", it: "treno",
    hi: ["रेलगाड़ी", "relgaadi"], zh: ["火车", "huǒchē"], ar: ["قطار", "qitaar"], pt: "trem",
    ru: ["поезд", "poyezd"], ja: ["電車", "densha"], ko: ["기차", "gicha"],
    bn: ["ট্রেন", "tren"], ur: ["ریل گاڑی", "rail gaari"], id: "kereta", tr: "tren",
    vi: "tàu hỏa", nl: "trein", pl: "pociąg", sw: "treni", ta: ["ரயில்", "rayil"],
    ml: ["തീവണ്ടി", "theevandi"], te: ["రైలు", "railu"], kn: ["ರೈಲು", "railu"],
    gu: ["ટ્રેન", "tren"], fa: ["قطار", "ghataar"], el: ["τρένο", "treno"],
    sv: "tåg", he: ["רכבת", "rakevet"],
  },
  {
    en: "money", es: "dinero", fr: "argent", de: "Geld", it: "soldi",
    hi: ["पैसा", "paisa"], zh: ["钱", "qián"], ar: ["مال", "maal"], pt: "dinheiro",
    ru: ["деньги", "dengi"], ja: ["お金", "okane"], ko: ["돈", "don"],
    bn: ["টাকা", "taka"], ur: ["پیسہ", "paisa"], id: "uang", tr: "para",
    vi: "tiền", nl: "geld", pl: "pieniądze", sw: "pesa", ta: ["பணம்", "panam"],
    ml: ["പണം", "panam"], te: ["డబ్బు", "dabbu"], kn: ["ಹಣ", "hana"],
    gu: ["પૈસા", "paisa"], fa: ["پول", "pul"], el: ["χρήματα", "chrimata"],
    sv: "pengar", he: ["כסף", "kesef"],
  },
  {
    en: "clock", es: "reloj", fr: "horloge", de: "Uhr", it: "orologio",
    hi: ["घड़ी", "ghadi"], zh: ["钟", "zhōng"], ar: ["ساعة", "saa'a"], pt: "relógio",
    ru: ["часы", "chasy"], ja: ["時計", "tokei"], ko: ["시계", "sigye"],
    bn: ["ঘড়ি", "ghori"], ur: ["گھڑی", "ghari"], id: "jam", tr: "saat",
    vi: "đồng hồ", nl: "klok", pl: "zegar", sw: "saa", ta: ["கடிகாரம்", "kadigaaram"],
    ml: ["ഘടികാരം", "ghadikaaram"], te: ["గడియారం", "gadiyaaram"], kn: ["ಗಡಿಯಾರ", "gadiyaara"],
    gu: ["ઘડિયાળ", "ghadiyaal"], fa: ["ساعت", "saa'at"], el: ["ρολόι", "roloi"],
    sv: "klocka", he: ["שעון", "shaon"],
  },
  {
    en: "bed", es: "cama", fr: "lit", de: "Bett", it: "letto",
    hi: ["बिस्तर", "bistar"], zh: ["床", "chuáng"], ar: ["سرير", "sareer"], pt: "cama",
    ru: ["кровать", "krovat"], ja: ["ベッド", "beddo"], ko: ["침대", "chimdae"],
    bn: ["বিছানা", "bichhana"], ur: ["بستر", "bistar"], id: "tempat tidur", tr: "yatak",
    vi: "giường", nl: "bed", pl: "łóżko", sw: "kitanda", ta: ["படுக்கை", "padukkai"],
    ml: ["കിടക്ക", "kidakka"], te: ["మంచం", "mancham"], kn: ["ಹಾಸಿಗೆ", "haasige"],
    gu: ["પલંગ", "palang"], fa: ["تخت", "takht"], el: ["κρεβάτι", "krevati"],
    sv: "säng", he: ["מיטה", "mita"],
  },
  {
    en: "shoe", es: "zapato", fr: "chaussure", de: "Schuh", it: "scarpa",
    hi: ["जूता", "joota"], zh: ["鞋", "xié"], ar: ["حذاء", "hidhaa"], pt: "sapato",
    ru: ["ботинок", "botinok"], ja: ["靴", "kutsu"], ko: ["신발", "sinbal"],
    bn: ["জুতা", "juta"], ur: ["جوتا", "joota"], id: "sepatu", tr: "ayakkabı",
    vi: "giày", nl: "schoen", pl: "but", sw: "kiatu", ta: ["காலணி", "kaalani"],
    ml: ["ചെരുപ്പ്", "cheruppu"], te: ["చెప్పు", "cheppu"], kn: ["ಚಪ್ಪಲಿ", "chappali"],
    gu: ["જૂતું", "jootu"], fa: ["کفش", "kafsh"], el: ["παπούτσι", "papoutsi"],
    sv: "sko", he: ["נעל", "naal"],
  },
  {
    en: "shirt", es: "camisa", fr: "chemise", de: "Hemd", it: "camicia",
    hi: ["कमीज़", "kameez"], zh: ["衬衫", "chènshān"], ar: ["قميص", "qamees"], pt: "camisa",
    ru: ["рубашка", "rubashka"], ja: ["シャツ", "shatsu"], ko: ["셔츠", "syeocheu"],
    bn: ["জামা", "jama"], ur: ["قمیض", "qameez"], id: "kemeja", tr: "gömlek",
    vi: "áo sơ mi", nl: "overhemd", pl: "koszula", sw: "shati", ta: ["சட்டை", "sattai"],
    ml: ["ഷർട്ട്", "shart"], te: ["చొక్కా", "chokkaa"], kn: ["ಅಂಗಿ", "angi"],
    gu: ["ખમીસ", "khamees"], fa: ["پیراهن", "pirahan"], el: ["πουκάμισο", "poukamiso"],
    sv: "skjorta", he: ["חולצה", "chultsa"],
  },
  {
    en: "umbrella", es: "paraguas", fr: "parapluie", de: "Regenschirm", it: "ombrello",
    hi: ["छाता", "chhaata"], zh: ["雨伞", "yǔsǎn"], ar: ["مظلة", "mithalla"], pt: "guarda-chuva",
    ru: ["зонт", "zont"], ja: ["傘", "kasa"], ko: ["우산", "usan"],
    bn: ["ছাতা", "chhata"], ur: ["چھتری", "chhatri"], id: "payung", tr: "şemsiye",
    vi: "cái ô", nl: "paraplu", pl: "parasol", sw: "mwavuli", ta: ["குடை", "kudai"],
    ml: ["കുട", "kuda"], te: ["గొడుగు", "godugu"], kn: ["ಕೊಡೆ", "kode"],
    gu: ["છત્રી", "chhatri"], fa: ["چتر", "chatr"], el: ["ομπρέλα", "omprela"],
    sv: "paraply", he: ["מטרייה", "mitriya"],
  },
  {
    en: "newspaper", es: "periódico", fr: "journal", de: "Zeitung", it: "giornale",
    hi: ["अख़बार", "akhbaar"], zh: ["报纸", "bàozhǐ"], ar: ["جريدة", "jareeda"], pt: "jornal",
    ru: ["газета", "gazeta"], ja: ["新聞", "shinbun"], ko: ["신문", "sinmun"],
    bn: ["খবরের কাগজ", "khoborer kagoj"], ur: ["اخبار", "akhbaar"], id: "koran", tr: "gazete",
    vi: "tờ báo", nl: "krant", pl: "gazeta", sw: "gazeti", ta: ["செய்தித்தாள்", "seydhithaal"],
    ml: ["പത്രം", "pathram"], te: ["వార్తాపత్రిక", "vaartaapatrika"], kn: ["ಪತ್ರಿಕೆ", "patrike"],
    gu: ["છાપું", "chhaapu"], fa: ["روزنامه", "ruznameh"], el: ["εφημερίδα", "efimerida"],
    sv: "tidning", he: ["עיתון", "iton"],
  },
  {
    en: "ticket", es: "billete", fr: "billet", de: "Ticket", it: "biglietto",
    hi: ["टिकट", "tikat"], zh: ["票", "piào"], ar: ["تذكرة", "tadhkira"], pt: "bilhete",
    ru: ["билет", "bilet"], ja: ["切符", "kippu"], ko: ["표", "pyo"],
    bn: ["টিকিট", "tikit"], ur: ["ٹکٹ", "tikat"], id: "tiket", tr: "bilet",
    vi: "vé", nl: "kaartje", pl: "bilet", sw: "tiketi", ta: ["சீட்டு", "seettu"],
    ml: ["ടിക്കറ്റ്", "tikkattu"], te: ["టికెట్", "tiket"], kn: ["ಟಿಕೆಟ್", "tiket"],
    gu: ["ટિકિટ", "tikit"], fa: ["بلیت", "belit"], el: ["εισιτήριο", "eisitirio"],
    sv: "biljett", he: ["כרטיס", "kartis"],
  },
  {
    en: "bag", es: "bolsa", fr: "sac", de: "Tasche", it: "borsa",
    hi: ["थैला", "thaila"], zh: ["包", "bāo"], ar: ["حقيبة", "haqeeba"], pt: "bolsa",
    ru: ["сумка", "sumka"], ja: ["かばん", "kaban"], ko: ["가방", "gabang"],
    bn: ["ব্যাগ", "byag"], ur: ["تھیلا", "thaila"], id: "tas", tr: "çanta",
    vi: "cái túi", nl: "tas", pl: "torba", sw: "mfuko", ta: ["பை", "pai"],
    ml: ["സഞ്ചി", "sanchi"], te: ["సంచి", "sanchi"], kn: ["ಚೀಲ", "cheela"],
    gu: ["થેલી", "theli"], fa: ["کیف", "kif"], el: ["τσάντα", "tsanta"],
    sv: "väska", he: ["תיק", "tik"],
  },
  {
    en: "pen", es: "bolígrafo", fr: "stylo", de: "Stift", it: "penna",
    hi: ["कलम", "kalam"], zh: ["笔", "bǐ"], ar: ["قلم", "qalam"], pt: "caneta",
    ru: ["ручка", "ruchka"], ja: ["ペン", "pen"], ko: ["펜", "pen"],
    bn: ["কলম", "kolom"], ur: ["قلم", "qalam"], id: "pena", tr: "kalem",
    vi: "cây bút", nl: "pen", pl: "długopis", sw: "kalamu", ta: ["பேனா", "penaa"],
    ml: ["പേന", "pena"], te: ["కలం", "kalam"], kn: ["ಲೇಖನಿ", "lekhani"],
    gu: ["પેન", "pen"], fa: ["خودکار", "khodkar"], el: ["στυλό", "stylo"],
    sv: "penna", he: ["עט", "et"],
  },
  {
    en: "cup", es: "taza", fr: "tasse", de: "Tasse", it: "tazza",
    hi: ["कप", "kap"], zh: ["杯子", "bēizi"], ar: ["كوب", "koob"], pt: "xícara",
    ru: ["чашка", "chashka"], ja: ["カップ", "kappu"], ko: ["컵", "keop"],
    bn: ["কাপ", "kap"], ur: ["پیالی", "pyaali"], id: "cangkir", tr: "fincan",
    vi: "cái cốc", nl: "kopje", pl: "filiżanka", sw: "kikombe", ta: ["கோப்பை", "koppai"],
    ml: ["കപ്പ്", "kappu"], te: ["కప్పు", "kappu"], kn: ["ಲೋಟ", "lota"],
    gu: ["કપ", "kap"], fa: ["فنجان", "fenjaan"], el: ["φλιτζάνι", "flitzani"],
    sv: "kopp", he: ["כוס", "kos"],
  },
  {
    en: "teacher", es: "profesor", fr: "professeur", de: "Lehrer", it: "insegnante",
    hi: ["शिक्षक", "shikshak"], zh: ["老师", "lǎoshī"], ar: ["معلم", "muallim"], pt: "professor",
    ru: ["учитель", "uchitel"], ja: ["先生", "sensei"], ko: ["선생님", "seonsaengnim"],
    bn: ["শিক্ষক", "shikkhok"], ur: ["استاد", "ustaad"], id: "guru", tr: "öğretmen",
    vi: "giáo viên", nl: "leraar", pl: "nauczyciel", sw: "mwalimu", ta: ["ஆசிரியர்", "aasiriyar"],
    ml: ["അധ്യാപകൻ", "adhyaapakan"], te: ["ఉపాధ్యాయుడు", "upaadhyaayudu"], kn: ["ಶಿಕ್ಷಕ", "shikshaka"],
    gu: ["શિક્ષક", "shikshak"], fa: ["معلم", "moallem"], el: ["δάσκαλος", "daskalos"],
    sv: "lärare", he: ["מורה", "more"],
  },
  {
    en: "doctor", es: "médico", fr: "médecin", de: "Arzt", it: "medico",
    hi: ["डॉक्टर", "doktar"], zh: ["医生", "yīshēng"], ar: ["طبيب", "tabeeb"], pt: "médico",
    ru: ["врач", "vrach"], ja: ["医者", "isha"], ko: ["의사", "uisa"],
    bn: ["ডাক্তার", "daktar"], ur: ["ڈاکٹر", "daaktar"], id: "dokter", tr: "doktor",
    vi: "bác sĩ", nl: "dokter", pl: "lekarz", sw: "daktari", ta: ["மருத்துவர்", "maruthuvar"],
    ml: ["ഡോക്ടർ", "doktar"], te: ["వైద్యుడు", "vaidyudu"], kn: ["ವೈದ್ಯ", "vaidya"],
    gu: ["ડૉક્ટર", "doktar"], fa: ["دکتر", "doktor"], el: ["γιατρός", "giatros"],
    sv: "läkare", he: ["רופא", "rofe"],
  },
  {
    en: "child", es: "niño", fr: "enfant", de: "Kind", it: "bambino",
    hi: ["बच्चा", "bachcha"], zh: ["孩子", "háizi"], ar: ["طفل", "tifl"], pt: "criança",
    ru: ["ребёнок", "rebyonok"], ja: ["子供", "kodomo"], ko: ["아이", "ai"],
    bn: ["শিশু", "shishu"], ur: ["بچہ", "bachcha"], id: "anak", tr: "çocuk",
    vi: "đứa trẻ", nl: "kind", pl: "dziecko", sw: "mtoto", ta: ["குழந்தை", "kuzhandhai"],
    ml: ["കുട്ടി", "kutti"], te: ["పిల్లవాడు", "pillavaadu"], kn: ["ಮಗು", "magu"],
    gu: ["બાળક", "baalak"], fa: ["بچه", "bacheh"], el: ["παιδί", "paidi"],
    sv: "barn", he: ["ילד", "yeled"],
  },
  {
    en: "brother", es: "hermano", fr: "frère", de: "Bruder", it: "fratello",
    hi: ["भाई", "bhaai"], zh: ["兄弟", "xiōngdì"], ar: ["أخ", "akh"], pt: "irmão",
    ru: ["брат", "brat"], ja: ["兄弟", "kyōdai"], ko: ["형제", "hyeongje"],
    bn: ["ভাই", "bhai"], ur: ["بھائی", "bhaai"], id: "saudara laki-laki", tr: "erkek kardeş",
    vi: "anh trai", nl: "broer", pl: "brat", sw: "kaka", ta: ["சகோதரன்", "sagodharan"],
    ml: ["സഹോദരൻ", "sahodaran"], te: ["సోదరుడు", "sodarudu"], kn: ["ಸಹೋದರ", "sahodara"],
    gu: ["ભાઈ", "bhaai"], fa: ["برادر", "baraadar"], el: ["αδελφός", "adelfos"],
    sv: "bror", he: ["אח", "ach"],
  },
  {
    en: "sister", es: "hermana", fr: "sœur", de: "Schwester", it: "sorella",
    hi: ["बहन", "bahan"], zh: ["姐妹", "jiěmèi"], ar: ["أخت", "ukht"], pt: "irmã",
    ru: ["сестра", "sestra"], ja: ["姉妹", "shimai"], ko: ["자매", "jamae"],
    bn: ["বোন", "bon"], ur: ["بہن", "behan"], id: "saudara perempuan", tr: "kız kardeş",
    vi: "chị gái", nl: "zus", pl: "siostra", sw: "dada", ta: ["சகோதரி", "sagodhari"],
    ml: ["സഹോദരി", "sahodari"], te: ["సోదరి", "sodari"], kn: ["ಸಹೋದರಿ", "sahodari"],
    gu: ["બહેન", "bahen"], fa: ["خواهر", "khaahar"], el: ["αδελφή", "adelfi"],
    sv: "syster", he: ["אחות", "achot"],
  },
  {
    en: "neighbor", es: "vecino", fr: "voisin", de: "Nachbar", it: "vicino",
    hi: ["पड़ोसी", "padosi"], zh: ["邻居", "línjū"], ar: ["جار", "jaar"], pt: "vizinho",
    ru: ["сосед", "sosed"], ja: ["隣人", "rinjin"], ko: ["이웃", "iut"],
    bn: ["প্রতিবেশী", "protibeshi"], ur: ["پڑوسی", "parosi"], id: "tetangga", tr: "komşu",
    vi: "hàng xóm", nl: "buurman", pl: "sąsiad", sw: "jirani", ta: ["அண்டை வீட்டார்", "andai veettaar"],
    ml: ["അയൽക്കാരൻ", "ayalkkaaran"], te: ["పొరుగువాడు", "poruguvaadu"], kn: ["ನೆರೆಯವನು", "nereyavanu"],
    gu: ["પાડોશી", "paadoshi"], fa: ["همسایه", "hamsaayeh"], el: ["γείτονας", "geitonas"],
    sv: "granne", he: ["שכן", "shachen"],
  },
  {
    en: "student", es: "estudiante", fr: "étudiant", de: "Student", it: "studente",
    hi: ["छात्र", "chhaatra"], zh: ["学生", "xuésheng"], ar: ["طالب", "taalib"], pt: "estudante",
    ru: ["студент", "student"], ja: ["学生", "gakusei"], ko: ["학생", "haksaeng"],
    bn: ["ছাত্র", "chhatro"], ur: ["طالب علم", "taalib-e-ilm"], id: "siswa", tr: "öğrenci",
    vi: "học sinh", nl: "student", pl: "student", sw: "mwanafunzi", ta: ["மாணவர்", "maanavar"],
    ml: ["വിദ്യാർത്ഥി", "vidyaarthi"], te: ["విద్యార్థి", "vidyaarthi"], kn: ["ವಿದ್ಯಾರ್ಥಿ", "vidyaarthi"],
    gu: ["વિદ્યાર્થી", "vidyaarthi"], fa: ["دانشجو", "daneshju"], el: ["μαθητής", "mathitis"],
    sv: "elev", he: ["תלמיד", "talmid"],
  },
  {
    en: "island", es: "isla", fr: "île", de: "Insel", it: "isola",
    hi: ["द्वीप", "dweep"], zh: ["岛", "dǎo"], ar: ["جزيرة", "jazeera"], pt: "ilha",
    ru: ["остров", "ostrov"], ja: ["島", "shima"], ko: ["섬", "seom"],
    bn: ["দ্বীপ", "dweep"], ur: ["جزیرہ", "jazeera"], id: "pulau", tr: "ada",
    vi: "hòn đảo", nl: "eiland", pl: "wyspa", sw: "kisiwa", ta: ["தீவு", "theevu"],
    ml: ["ദ്വീപ്", "dweep"], te: ["ద్వీపం", "dweepam"], kn: ["ದ್ವೀಪ", "dweepa"],
    gu: ["ટાપુ", "taapu"], fa: ["جزیره", "jazireh"], el: ["νησί", "nisi"],
    sv: "ö", he: ["אי", "i"],
  },
  {
    en: "forest", es: "bosque", fr: "forêt", de: "Wald", it: "foresta",
    hi: ["जंगल", "jangal"], zh: ["森林", "sēnlín"], ar: ["غابة", "ghaaba"], pt: "floresta",
    ru: ["лес", "les"], ja: ["森", "mori"], ko: ["숲", "sup"],
    bn: ["বন", "bon"], ur: ["جنگل", "jangal"], id: "hutan", tr: "orman",
    vi: "rừng", nl: "bos", pl: "las", sw: "msitu", ta: ["காடு", "kaadu"],
    ml: ["കാട്", "kaadu"], te: ["అడవి", "adavi"], kn: ["ಕಾಡು", "kaadu"],
    gu: ["જંગલ", "jangal"], fa: ["جنگل", "jangal"], el: ["δάσος", "dasos"],
    sv: "skog", he: ["יער", "yaar"],
  },
  {
    en: "lake", es: "lago", fr: "lac", de: "See", it: "lago",
    hi: ["झील", "jheel"], zh: ["湖", "hú"], ar: ["بحيرة", "buhayra"], pt: "lago",
    ru: ["озеро", "ozero"], ja: ["湖", "mizuumi"], ko: ["호수", "hosu"],
    bn: ["হ্রদ", "hrod"], ur: ["جھیل", "jheel"], id: "danau", tr: "göl",
    vi: "hồ", nl: "meer", pl: "jezioro", sw: "ziwa", ta: ["ஏரி", "eri"],
    ml: ["തടാകം", "thadaakam"], te: ["సరస్సు", "sarassu"], kn: ["ಸರೋವರ", "sarovara"],
    gu: ["તળાવ", "talaav"], fa: ["دریاچه", "daryaacheh"], el: ["λίμνη", "limni"],
    sv: "sjö", he: ["אגם", "agam"],
  },
  {
    en: "butter", es: "mantequilla", fr: "beurre", de: "Butter", it: "burro",
    hi: ["मक्खन", "makkhan"], zh: ["黄油", "huángyóu"], ar: ["زبدة", "zubda"], pt: "manteiga",
    ru: ["масло", "maslo"], ja: ["バター", "batā"], ko: ["버터", "beoteo"],
    bn: ["মাখন", "makhon"], ur: ["مکھن", "makkhan"], id: "mentega", tr: "tereyağı",
    vi: "bơ", nl: "boter", pl: "masło", sw: "siagi", ta: ["வெண்ணெய்", "vennai"],
    ml: ["വെണ്ണ", "venna"], te: ["వెన్న", "venna"], kn: ["ಬೆಣ್ಣೆ", "benne"],
    gu: ["માખણ", "maakhan"], fa: ["کره", "kareh"], el: ["βούτυρο", "voutyro"],
    sv: "smör", he: ["חמאה", "chem'a"],
  },
  {
    en: "honey", es: "miel", fr: "miel", de: "Honig", it: "miele",
    hi: ["शहद", "shahad"], zh: ["蜂蜜", "fēngmì"], ar: ["عسل", "asal"], pt: "mel",
    ru: ["мёд", "myod"], ja: ["蜂蜜", "hachimitsu"], ko: ["꿀", "kkul"],
    bn: ["মধু", "modhu"], ur: ["شہد", "shahad"], id: "madu", tr: "bal",
    vi: "mật ong", nl: "honing", pl: "miód", sw: "asali", ta: ["தேன்", "then"],
    ml: ["തേൻ", "then"], te: ["తేనె", "tene"], kn: ["ಜೇನು", "jenu"],
    gu: ["મધ", "madh"], fa: ["عسل", "asal"], el: ["μέλι", "meli"],
    sv: "honung", he: ["דבש", "dvash"],
  },
  {
    en: "chocolate", es: "chocolate", fr: "chocolat", de: "Schokolade", it: "cioccolato",
    hi: ["चॉकलेट", "chaaklet"], zh: ["巧克力", "qiǎokèlì"], ar: ["شوكولاتة", "shokolaata"], pt: "chocolate",
    ru: ["шоколад", "shokolad"], ja: ["チョコレート", "chokorēto"], ko: ["초콜릿", "chokollit"],
    bn: ["চকলেট", "chokolet"], ur: ["چاکلیٹ", "chaaklet"], id: "cokelat", tr: "çikolata",
    vi: "sô cô la", nl: "chocolade", pl: "czekolada", sw: "chokoleti", ta: ["சாக்லேட்", "chaaklet"],
    ml: ["ചോക്ലേറ്റ്", "chokkalettu"], te: ["చాక్లెట్", "chaaklet"], kn: ["ಚಾಕೊಲೇಟ್", "chaakolet"],
    gu: ["ચોકલેટ", "choklet"], fa: ["شکلات", "shokolaat"], el: ["σοκολάτα", "sokolata"],
    sv: "choklad", he: ["שוקולד", "shokolad"],
  },
  {
    en: "ice cream", es: "helado", fr: "glace", de: "Eis", it: "gelato",
    hi: ["आइसक्रीम", "aaiskreem"], zh: ["冰淇淋", "bīngqílín"], ar: ["آيس كريم", "ays kreem"], pt: "sorvete",
    ru: ["мороженое", "morozhenoye"], ja: ["アイスクリーム", "aisukurīmu"], ko: ["아이스크림", "aiseukeurim"],
    bn: ["আইসক্রিম", "aiskrim"], ur: ["آئس کریم", "aais kreem"], id: "es krim", tr: "dondurma",
    vi: "kem", nl: "ijs", pl: "lody", sw: "aiskrimu", ta: ["பனிக்கூழ்", "panikkoozh"],
    ml: ["ഐസ്ക്രീം", "aiskreem"], te: ["ఐస్ క్రీమ్", "ais kreem"], kn: ["ಐಸ್ ಕ್ರೀಮ್", "ais kreem"],
    gu: ["આઈસ્ક્રીમ", "aaiskreem"], fa: ["بستنی", "bastani"], el: ["παγωτό", "pagoto"],
    sv: "glass", he: ["גלידה", "glida"],
  },
  {
    en: "game", es: "juego", fr: "jeu", de: "Spiel", it: "gioco",
    hi: ["खेल", "khel"], zh: ["游戏", "yóuxì"], ar: ["لعبة", "luba"], pt: "jogo",
    ru: ["игра", "igra"], ja: ["ゲーム", "gēmu"], ko: ["게임", "geim"],
    bn: ["খেলা", "khela"], ur: ["کھیل", "khel"], id: "permainan", tr: "oyun",
    vi: "trò chơi", nl: "spel", pl: "gra", sw: "mchezo", ta: ["விளையாட்டு", "vilaiyaattu"],
    ml: ["കളി", "kali"], te: ["ఆట", "aata"], kn: ["ಆಟ", "aata"],
    gu: ["રમત", "ramat"], fa: ["بازی", "baazi"], el: ["παιχνίδι", "paichnidi"],
    sv: "spel", he: ["משחק", "mischak"],
  },
  {
    en: "song", es: "canción", fr: "chanson", de: "Lied", it: "canzone",
    hi: ["गाना", "gaana"], zh: ["歌", "gē"], ar: ["أغنية", "ughniya"], pt: "canção",
    ru: ["песня", "pesnya"], ja: ["歌", "uta"], ko: ["노래", "norae"],
    bn: ["গান", "gaan"], ur: ["گانا", "gaana"], id: "lagu", tr: "şarkı",
    vi: "bài hát", nl: "lied", pl: "piosenka", sw: "wimbo", ta: ["பாடல்", "paadal"],
    ml: ["പാട്ട്", "paattu"], te: ["పాట", "paata"], kn: ["ಹಾಡು", "haadu"],
    gu: ["ગીત", "geet"], fa: ["آهنگ", "aahang"], el: ["τραγούδι", "tragoudi"],
    sv: "sång", he: ["שיר", "shir"],
  },
  {
    en: "language", es: "idioma", fr: "langue", de: "Sprache", it: "lingua",
    hi: ["भाषा", "bhaasha"], zh: ["语言", "yǔyán"], ar: ["لغة", "lugha"], pt: "língua",
    ru: ["язык", "yazyk"], ja: ["言語", "gengo"], ko: ["언어", "eoneo"],
    bn: ["ভাষা", "bhasha"], ur: ["زبان", "zabaan"], id: "bahasa", tr: "dil",
    vi: "ngôn ngữ", nl: "taal", pl: "język", sw: "lugha", ta: ["மொழி", "mozhi"],
    ml: ["ഭാഷ", "bhaasha"], te: ["భాష", "bhaasha"], kn: ["ಭಾಷೆ", "bhaashe"],
    gu: ["ભાષા", "bhaasha"], fa: ["زبان", "zabaan"], el: ["γλώσσα", "glossa"],
    sv: "språk", he: ["שפה", "safa"],
  },
  {
    en: "gift", es: "regalo", fr: "cadeau", de: "Geschenk", it: "regalo",
    hi: ["उपहार", "upahaar"], zh: ["礼物", "lǐwù"], ar: ["هدية", "hadiyya"], pt: "presente",
    ru: ["подарок", "podarok"], ja: ["贈り物", "okurimono"], ko: ["선물", "seonmul"],
    bn: ["উপহার", "upohar"], ur: ["تحفہ", "tohfa"], id: "hadiah", tr: "hediye",
    vi: "món quà", nl: "cadeau", pl: "prezent", sw: "zawadi", ta: ["பரிசு", "parisu"],
    ml: ["സമ്മാനം", "sammaanam"], te: ["బహుమతి", "bahumati"], kn: ["ಉಡುಗೊರೆ", "udugore"],
    gu: ["ભેટ", "bhet"], fa: ["هدیه", "hedyeh"], el: ["δώρο", "doro"],
    sv: "present", he: ["מתנה", "matana"],
  },
  {
    en: "photo", es: "foto", fr: "photo", de: "Foto", it: "foto",
    hi: ["तस्वीर", "tasveer"], zh: ["照片", "zhàopiàn"], ar: ["صورة", "soora"], pt: "foto",
    ru: ["фотография", "fotografiya"], ja: ["写真", "shashin"], ko: ["사진", "sajin"],
    bn: ["ছবি", "chhobi"], ur: ["تصویر", "tasveer"], id: "foto", tr: "fotoğraf",
    vi: "bức ảnh", nl: "foto", pl: "zdjęcie", sw: "picha", ta: ["புகைப்படம்", "pugaippadam"],
    ml: ["ഫോട്ടോ", "photo"], te: ["ఫోటో", "photo"], kn: ["ಫೋಟೋ", "photo"],
    gu: ["ફોટો", "photo"], fa: ["عکس", "aks"], el: ["φωτογραφία", "fotografia"],
    sv: "foto", he: ["תמונה", "tmuna"],
  },
  {
    en: "lamp", es: "lámpara", fr: "lampe", de: "Lampe", it: "lampada",
    hi: ["लैंप", "laimp"], zh: ["灯", "dēng"], ar: ["مصباح", "misbaah"], pt: "luminária",
    ru: ["лампа", "lampa"], ja: ["ランプ", "ranpu"], ko: ["램프", "laempeu"],
    bn: ["বাতি", "baati"], ur: ["چراغ", "chiraagh"], id: "lampu", tr: "lamba",
    vi: "cái đèn", nl: "lamp", pl: "lampa", sw: "taa", ta: ["விளக்கு", "vilakku"],
    ml: ["വിളക്ക്", "vilakku"], te: ["దీపం", "deepam"], kn: ["ದೀಪ", "deepa"],
    gu: ["દીવો", "deevo"], fa: ["چراغ", "cheraagh"], el: ["λάμπα", "lampa"],
    sv: "lampa", he: ["מנורה", "menora"],
  },
];

const HOLIDAY_WORDS = {
  calendar: {
    en: "calendar", es: "calendario", fr: "calendrier", de: "Kalender", it: "calendario",
    hi: ["कैलेंडर", "kailendar"], zh: ["日历", "rìlì"], ar: ["تقويم", "taqweem"], pt: "calendário",
    ru: ["календарь", "kalendar"], ja: ["カレンダー", "karendā"], ko: ["달력", "dallyeok"],
    bn: ["ক্যালেন্ডার", "kyalendar"], ur: ["کیلنڈر", "kailendar"], id: "kalender", tr: "takvim",
    vi: "lịch", nl: "kalender", pl: "kalendarz", sw: "kalenda", ta: ["நாள்காட்டி", "naalkaatti"],
    ml: ["കലണ്ടർ", "kalandar"], te: ["క్యాలెండర్", "kyaalendar"], kn: ["ಕ್ಯಾಲೆಂಡರ್", "kyaalendar"],
    gu: ["કૅલેન્ડર", "kailendar"], fa: ["تقویم", "taghvim"], el: ["ημερολόγιο", "imerologio"],
    sv: "kalender", he: ["לוח שנה", "luach shana"],
  },
  dream: {
    en: "dream", es: "sueño", fr: "rêve", de: "Traum", it: "sogno",
    hi: ["सपना", "sapna"], zh: ["梦想", "mèngxiǎng"], ar: ["حلم", "hulm"], pt: "sonho",
    ru: ["мечта", "mechta"], ja: ["夢", "yume"], ko: ["꿈", "kkum"],
    bn: ["স্বপ্ন", "shopno"], ur: ["خواب", "khwaab"], id: "mimpi", tr: "hayal",
    vi: "giấc mơ", nl: "droom", pl: "marzenie", sw: "ndoto", ta: ["கனவு", "kanavu"],
    ml: ["സ്വപ്നം", "swapnam"], te: ["కల", "kala"], kn: ["ಕನಸು", "kanasu"],
    gu: ["સપનું", "sapnu"], fa: ["رویا", "roya"], el: ["όνειρο", "oneiro"],
    sv: "dröm", he: ["חלום", "chalom"],
  },
  love: {
    en: "love", es: "amor", fr: "amour", de: "Liebe", it: "amore",
    hi: ["प्यार", "pyaar"], zh: ["爱", "ài"], ar: ["حب", "hubb"], pt: "amor",
    ru: ["любовь", "lyubov"], ja: ["愛", "ai"], ko: ["사랑", "sarang"],
    bn: ["ভালোবাসা", "bhalobasha"], ur: ["محبت", "mohabbat"], id: "cinta", tr: "aşk",
    vi: "tình yêu", nl: "liefde", pl: "miłość", sw: "upendo", ta: ["அன்பு", "anbu"],
    ml: ["സ്നേഹം", "sneham"], te: ["ప్రేమ", "prema"], kn: ["ಪ್ರೀತಿ", "preeti"],
    gu: ["પ્રેમ", "prem"], fa: ["عشق", "eshgh"], el: ["αγάπη", "agapi"],
    sv: "kärlek", he: ["אהבה", "ahava"],
  },
  leader: {
    en: "leader", es: "líder", fr: "dirigeant", de: "Anführer", it: "leader",
    hi: ["नेता", "neta"], zh: ["领导人", "lǐngdǎorén"], ar: ["قائد", "qaaid"], pt: "líder",
    ru: ["лидер", "lider"], ja: ["指導者", "shidōsha"], ko: ["지도자", "jidoja"],
    bn: ["নেতা", "neta"], ur: ["رہنما", "rehnuma"], id: "pemimpin", tr: "lider",
    vi: "nhà lãnh đạo", nl: "leider", pl: "przywódca", sw: "kiongozi", ta: ["தலைவர்", "thalaivar"],
    ml: ["നേതാവ്", "nethaavu"], te: ["నాయకుడు", "naayakudu"], kn: ["ನಾಯಕ", "naayaka"],
    gu: ["નેતા", "netaa"], fa: ["رهبر", "rahbar"], el: ["ηγέτης", "igetis"],
    sv: "ledare", he: ["מנהיג", "manhig"],
  },
  egg: {
    en: "egg", es: "huevo", fr: "œuf", de: "Ei", it: "uovo",
    hi: ["अंडा", "anda"], zh: ["鸡蛋", "jīdàn"], ar: ["بيضة", "bayda"], pt: "ovo",
    ru: ["яйцо", "yaytso"], ja: ["卵", "tamago"], ko: ["달걀", "dalgyal"],
    bn: ["ডিম", "dim"], ur: ["انڈا", "anda"], id: "telur", tr: "yumurta",
    vi: "quả trứng", nl: "ei", pl: "jajko", sw: "yai", ta: ["முட்டை", "muttai"],
    ml: ["മുട്ട", "mutta"], te: ["గుడ్డు", "guddu"], kn: ["ಮೊಟ್ಟೆ", "motte"],
    gu: ["ઈંડું", "indu"], fa: ["تخم‌مرغ", "tokhm-e morgh"], el: ["αυγό", "avgo"],
    sv: "ägg", he: ["ביצה", "beitsa"],
  },
  hug: {
    en: "hug", es: "abrazo", fr: "câlin", de: "Umarmung", it: "abbraccio",
    hi: ["झप्पी", "jhappi"], zh: ["拥抱", "yōngbào"], ar: ["عناق", "inaaq"], pt: "abraço",
    ru: ["объятие", "obyatiye"], ja: ["ハグ", "hagu"], ko: ["포옹", "poong"],
    bn: ["আলিঙ্গন", "alingon"], ur: ["جھپی", "jhappi"], id: "pelukan", tr: "sarılma",
    vi: "cái ôm", nl: "knuffel", pl: "uścisk", sw: "kumbatio", ta: ["அணைப்பு", "anaippu"],
    ml: ["ആലിംഗനം", "aalinganam"], te: ["కౌగిలి", "kaugili"], kn: ["ಅಪ್ಪುಗೆ", "appuge"],
    gu: ["આલિંગન", "aalingan"], fa: ["آغوش", "aaghush"], el: ["αγκαλιά", "agkalia"],
    sv: "kram", he: ["חיבוק", "chibuk"],
  },
  flag: {
    en: "flag", es: "bandera", fr: "drapeau", de: "Flagge", it: "bandiera",
    hi: ["झंडा", "jhanda"], zh: ["旗帜", "qízhì"], ar: ["علم", "alam"], pt: "bandeira",
    ru: ["флаг", "flag"], ja: ["旗", "hata"], ko: ["깃발", "gitbal"],
    bn: ["পতাকা", "potaka"], ur: ["جھنڈا", "jhanda"], id: "bendera", tr: "bayrak",
    vi: "lá cờ", nl: "vlag", pl: "flaga", sw: "bendera", ta: ["கொடி", "kodi"],
    ml: ["പതാക", "pathaaka"], te: ["జెండా", "jendaa"], kn: ["ಧ್ವಜ", "dhwaja"],
    gu: ["ધ્વજ", "dhwaj"], fa: ["پرچم", "parcham"], el: ["σημαία", "simaia"],
    sv: "flagga", he: ["דגל", "degel"],
  },
  barbecue: {
    en: "barbecue", es: "barbacoa", fr: "barbecue", de: "Grillfest", it: "grigliata",
    hi: ["बारबेक्यू", "baarbekyoo"], zh: ["烧烤", "shāokǎo"], ar: ["شواء", "shiwaa"], pt: "churrasco",
    ru: ["барбекю", "barbekyu"], ja: ["バーベキュー", "bābekyū"], ko: ["바비큐", "babikyu"],
    bn: ["বারবিকিউ", "barbikiu"], ur: ["باربی کیو", "baarbi kyu"], id: "barbeku", tr: "mangal",
    vi: "tiệc nướng", nl: "barbecue", pl: "grill", sw: "nyama choma", ta: ["பார்பிக்யூ", "baarbikyoo"],
    ml: ["ബാർബിക്യൂ", "baarbikyoo"], te: ["బార్బెక్యూ", "baarbekyoo"], kn: ["ಬಾರ್ಬೆಕ್ಯೂ", "baarbekyoo"],
    gu: ["બાર્બેક્યુ", "baarbekyu"], fa: ["کباب", "kabaab"], el: ["ψησταριά", "psistaria"],
    sv: "grillfest", he: ["מנגל", "mangal"],
  },
  freedom: {
    en: "freedom", es: "libertad", fr: "liberté", de: "Freiheit", it: "libertà",
    hi: ["आज़ादी", "aazaadi"], zh: ["自由", "zìyóu"], ar: ["حرية", "hurriyya"], pt: "liberdade",
    ru: ["свобода", "svoboda"], ja: ["自由", "jiyū"], ko: ["자유", "jayu"],
    bn: ["স্বাধীনতা", "shadhinota"], ur: ["آزادی", "aazaadi"], id: "kebebasan", tr: "özgürlük",
    vi: "tự do", nl: "vrijheid", pl: "wolność", sw: "uhuru", ta: ["சுதந்திரம்", "sudhandhiram"],
    ml: ["സ്വാതന്ത്ര്യം", "swaathanthryam"], te: ["స్వేచ్ఛ", "swechha"], kn: ["ಸ್ವಾತಂತ್ರ್ಯ", "swaatantrya"],
    gu: ["આઝાદી", "aazaadi"], fa: ["آزادی", "aazaadi"], el: ["ελευθερία", "eleftheria"],
    sv: "frihet", he: ["חופש", "chofesh"],
  },
  fireworks: {
    en: "fireworks", es: "fuegos artificiales", fr: "feux d'artifice", de: "Feuerwerk", it: "fuochi d'artificio",
    hi: ["आतिशबाज़ी", "aatishbaazi"], zh: ["烟花", "yānhuā"], ar: ["ألعاب نارية", "alaab naariya"], pt: "fogos de artifício",
    ru: ["фейерверк", "feyerverk"], ja: ["花火", "hanabi"], ko: ["불꽃놀이", "bulkkonnori"],
    bn: ["আতশবাজি", "atoshbaji"], ur: ["آتش بازی", "aatish baazi"], id: "kembang api", tr: "havai fişek",
    vi: "pháo hoa", nl: "vuurwerk", pl: "fajerwerki", sw: "fataki", ta: ["வாணவேடிக்கை", "vaanavedikkai"],
    ml: ["കരിമരുന്ന്", "karimarunnu"], te: ["బాణసంచా", "baanasanchaa"], kn: ["ಪಟಾಕಿ", "pataaki"],
    gu: ["ફટાકડા", "phataakdaa"], fa: ["آتش‌بازی", "aatash-baazi"], el: ["πυροτεχνήματα", "pyrotechnimata"],
    sv: "fyrverkeri", he: ["זיקוקים", "zikukim"],
  },
  picnic: {
    en: "picnic", es: "pícnic", fr: "pique-nique", de: "Picknick", it: "picnic",
    hi: ["पिकनिक", "piknik"], zh: ["野餐", "yěcān"], ar: ["نزهة", "nuzha"], pt: "piquenique",
    ru: ["пикник", "piknik"], ja: ["ピクニック", "pikunikku"], ko: ["소풍", "sopung"],
    bn: ["পিকনিক", "piknik"], ur: ["پکنک", "piknik"], id: "piknik", tr: "piknik",
    vi: "dã ngoại", nl: "picknick", pl: "piknik", sw: "pikiniki", ta: ["பிக்னிக்", "piknik"],
    ml: ["പിക്നിക്", "piknik"], te: ["విహారయాత్ర", "vihaarayaatra"], kn: ["ವಿಹಾರ", "vihaara"],
    gu: ["પિકનિક", "piknik"], fa: ["پیک‌نیک", "pik-nik"], el: ["πικνίκ", "piknik"],
    sv: "picknick", he: ["פיקניק", "piknik"],
  },
  pumpkin: {
    en: "pumpkin", es: "calabaza", fr: "citrouille", de: "Kürbis", it: "zucca",
    hi: ["कद्दू", "kaddu"], zh: ["南瓜", "nánguā"], ar: ["يقطين", "yaqteen"], pt: "abóbora",
    ru: ["тыква", "tykva"], ja: ["かぼちゃ", "kabocha"], ko: ["호박", "hobak"],
    bn: ["কুমড়া", "kumra"], ur: ["کدو", "kaddu"], id: "labu", tr: "balkabağı",
    vi: "bí ngô", nl: "pompoen", pl: "dynia", sw: "boga", ta: ["பூசணிக்காய்", "poosanikkaai"],
    ml: ["മത്തങ്ങ", "mathanga"], te: ["గుమ్మడికాయ", "gummadikaaya"], kn: ["ಕುಂಬಳಕಾಯಿ", "kumbalakaayi"],
    gu: ["કોળું", "kolu"], fa: ["کدو حلوایی", "kadu halvaai"], el: ["κολοκύθα", "kolokytha"],
    sv: "pumpa", he: ["דלעת", "dla'at"],
  },
  soldier: {
    en: "soldier", es: "soldado", fr: "soldat", de: "Soldat", it: "soldato",
    hi: ["सैनिक", "sainik"], zh: ["士兵", "shìbīng"], ar: ["جندي", "jundi"], pt: "soldado",
    ru: ["солдат", "soldat"], ja: ["兵士", "heishi"], ko: ["군인", "gunin"],
    bn: ["সৈনিক", "soinik"], ur: ["سپاہی", "sipaahi"], id: "tentara", tr: "asker",
    vi: "người lính", nl: "soldaat", pl: "żołnierz", sw: "askari", ta: ["படைவீரர்", "padaiveerar"],
    ml: ["പട്ടാളക്കാരൻ", "pattaalakkaaran"], te: ["సైనికుడు", "sainikudu"], kn: ["ಸೈನಿಕ", "sainika"],
    gu: ["સૈનિક", "sainik"], fa: ["سرباز", "sarbaaz"], el: ["στρατιώτης", "stratiotis"],
    sv: "soldat", he: ["חייל", "chayal"],
  },
  harvest: {
    en: "harvest", es: "cosecha", fr: "récolte", de: "Ernte", it: "raccolto",
    hi: ["फ़सल", "fasal"], zh: ["丰收", "fēngshōu"], ar: ["حصاد", "hasaad"], pt: "colheita",
    ru: ["урожай", "urozhay"], ja: ["収穫", "shūkaku"], ko: ["수확", "suhwak"],
    bn: ["ফসল", "fosol"], ur: ["فصل", "fasal"], id: "panen", tr: "hasat",
    vi: "mùa gặt", nl: "oogst", pl: "żniwa", sw: "mavuno", ta: ["அறுவடை", "aruvadai"],
    ml: ["വിളവെടുപ്പ്", "vilaveduppu"], te: ["పంట", "panta"], kn: ["ಸುಗ್ಗಿ", "suggi"],
    gu: ["લણણી", "lanni"], fa: ["برداشت", "bardaasht"], el: ["συγκομιδή", "sygkomidi"],
    sv: "skörd", he: ["קציר", "katsir"],
  },
  snow: {
    en: "snow", es: "nieve", fr: "neige", de: "Schnee", it: "neve",
    hi: ["बर्फ़", "barf"], zh: ["雪", "xuě"], ar: ["ثلج", "thalj"], pt: "neve",
    ru: ["снег", "sneg"], ja: ["雪", "yuki"], ko: ["눈", "nun"],
    bn: ["তুষার", "tushar"], ur: ["برف", "barf"], id: "salju", tr: "kar",
    vi: "tuyết", nl: "sneeuw", pl: "śnieg", sw: "theluji", ta: ["பனி", "pani"],
    ml: ["മഞ്ഞ്", "manju"], te: ["మంచు", "manchu"], kn: ["ಹಿಮ", "hima"],
    gu: ["બરફ", "baraf"], fa: ["برف", "barf"], el: ["χιόνι", "chioni"],
    sv: "snö", he: ["שלג", "sheleg"],
  },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const [SUNDAY, MONDAY, THURSDAY] = [0, 1, 4];

// The day of the month of the nth weekday (n = 1 for the first, -1 for the
// last) in a month, where month 0 is January.
function nthWeekdayOfMonth(year, month, weekday, n) {
  if (n > 0) {
    const firstWeekday = new Date(year, month, 1).getDay();
    return 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  }
  const lastDay = new Date(year, month + 1, 0).getDate();
  const lastWeekday = new Date(year, month, lastDay).getDay();
  return lastDay - ((lastWeekday - weekday + 7) % 7);
}

// Easter Sunday, from the standard Gregorian calculation ("anonymous
// Gregorian algorithm"), as [month, day] with month 0 for January.
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return [month - 1, day];
}

// Major US holidays and a word that goes with each. Each rule gives that
// year's [month, day]; moving holidays are worked out, so no yearly list.
const HOLIDAYS = [
  { name: "New Year's Day", word: "calendar", date: () => [0, 1] },
  { name: "Martin Luther King Jr. Day", word: "dream", date: (y) => [0, nthWeekdayOfMonth(y, 0, MONDAY, 3)] },
  { name: "Valentine's Day", word: "love", date: () => [1, 14] },
  { name: "Presidents' Day", word: "leader", date: (y) => [1, nthWeekdayOfMonth(y, 1, MONDAY, 3)] },
  { name: "Easter", word: "egg", date: easterDate },
  { name: "Mother's Day", word: "hug", date: (y) => [4, nthWeekdayOfMonth(y, 4, SUNDAY, 2)] },
  { name: "Memorial Day", word: "flag", date: (y) => [4, nthWeekdayOfMonth(y, 4, MONDAY, -1)] },
  { name: "Juneteenth", word: "freedom", date: () => [5, 19] },
  { name: "Father's Day", word: "barbecue", date: (y) => [5, nthWeekdayOfMonth(y, 5, SUNDAY, 3)] },
  { name: "Independence Day", word: "fireworks", date: () => [6, 4] },
  { name: "Labor Day", word: "picnic", date: (y) => [8, nthWeekdayOfMonth(y, 8, MONDAY, 1)] },
  { name: "Halloween", word: "pumpkin", date: () => [9, 31] },
  { name: "Veterans Day", word: "soldier", date: () => [10, 11] },
  { name: "Thanksgiving", word: "harvest", date: (y) => [10, nthWeekdayOfMonth(y, 10, THURSDAY, 4)] },
  { name: "Christmas", word: "snow", date: () => [11, 25] },
];

// The holiday on this date, if any.
function holidayOn(date) {
  return HOLIDAYS.find((holiday) => {
    const [month, day] = holiday.date(date.getFullYear());
    return month === date.getMonth() && day === date.getDate();
  });
}

// The everyday words in a fixed shuffled order, so a run of days mixes topics
// and each word comes back only after every other word has had its day.
const DAILY_WORD_ORDER = (() => {
  const order = DAILY_WORDS.map((_, index) => index);
  let seed = 124;
  for (let index = order.length - 1; index > 0; index--) {
    seed = (seed * 9301 + 49297) % 233280;
    const swapWith = Math.floor((seed / 233280) * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  return order;
})();

// Counts days by the learner's own calendar, so the word changes at their
// midnight, not at midnight in London.
function localDayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

function dailyWordFor(date) {
  const holiday = holidayOn(date);
  if (holiday) {
    return HOLIDAY_WORDS[holiday.word];
  }
  return DAILY_WORDS[DAILY_WORD_ORDER[localDayNumber(date) % DAILY_WORDS.length]];
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

function msUntilNextMidnight(now) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
}

function isSameLocalDay(first, second) {
  return localDayNumber(first) === localDayNumber(second);
}

// The day and languages the card is showing, so 🔊 reads the same word even
// if the page stays open past midnight, and the card can be redrawn then.
let shownWordDate = new Date();
let shownWordLanguages = null;
let midnightTimer = null;

// Redraws the card when the date has changed: at midnight while the page is
// open, and on coming back to a tab that slept through it (timers pause then).
function refreshWordIfNewDay() {
  if (shownWordLanguages && !isSameLocalDay(shownWordDate, new Date())) {
    showWordOfTheDay(...shownWordLanguages);
  }
}

function scheduleMidnightRefresh() {
  clearTimeout(midnightTimer);
  midnightTimer = setTimeout(() => {
    refreshWordIfNewDay();
    scheduleMidnightRefresh();
  }, msUntilNextMidnight(new Date()) + 1000);
}

function showWordOfTheDay(from, to, date = new Date()) {
  if (!shownWordLanguages) {
    scheduleMidnightRefresh();
    document.addEventListener("visibilitychange", refreshWordIfNewDay);
  }
  shownWordDate = date;
  shownWordLanguages = [from, to];
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
