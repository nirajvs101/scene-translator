// Languages the app supports. `altScript` names an extra set of accepted
// answers in another writing system (romanized Hindi), used for scoring and
// shown next to the main text.
const LANGUAGES = {
  en: { name: "English", speechLocale: "en-US" },
  es: { name: "Spanish", speechLocale: "es-ES" },
  fr: { name: "French", speechLocale: "fr-FR" },
  de: { name: "German", speechLocale: "de-DE" },
  it: { name: "Italian", speechLocale: "it-IT" },
  hi: { name: "Hindi", speechLocale: "hi-IN", altScript: "hiLatn" },
};

// A short built-in scene. Each line lists one or more acceptable translations
// per language; the first is the one shown.
const SCENE = {
  title: {
    en: "At the café",
    es: "En el café",
    fr: "Au café",
    de: "Im Café",
    it: "Al bar",
    hi: "कैफ़े में",
  },
  description: "Two friends order coffee and make weekend plans.",
  speakers: {
    lucia: { name: "Lucía", color: "#d9480f" },
    mateo: { name: "Mateo", color: "#1971c2" },
    waiter: { name: "Waiter", color: "#2f9e44" },
  },
  lines: [
    {
      speaker: "waiter",
      text: {
        en: ["Good morning. What can I get you?", "Good morning. What would you like?"],
        es: ["Buenos días. ¿Qué les pongo?"],
        fr: ["Bonjour. Qu'est-ce que je vous sers ?", "Bonjour. Que désirez-vous ?"],
        de: ["Guten Morgen. Was darf ich Ihnen bringen?", "Guten Morgen. Was möchten Sie?"],
        it: ["Buongiorno. Cosa vi porto?", "Buongiorno. Cosa prendete?"],
        hi: ["नमस्ते। आपके लिए क्या लाऊँ?", "नमस्ते। आप क्या लेंगे?"],
        hiLatn: ["Namaste. Aapke liye kya laaun?", "Namaste. Aap kya lenge?"],
      },
    },
    {
      speaker: "lucia",
      text: {
        en: ["For me, a coffee with milk, please.", "I'll have a latte, please."],
        es: ["Para mí, un café con leche, por favor."],
        fr: ["Pour moi, un café au lait, s'il vous plaît.", "Pour moi, un café crème, s'il vous plaît."],
        de: ["Für mich einen Milchkaffee, bitte.", "Ich hätte gern einen Kaffee mit Milch, bitte."],
        it: ["Per me, un caffellatte, per favore.", "Per me un caffè con latte, per favore."],
        hi: ["मेरे लिए एक दूध वाली कॉफ़ी, प्लीज़।", "मेरे लिए दूध वाली कॉफ़ी, कृपया।"],
        hiLatn: ["Mere liye ek doodh wali coffee, please.", "Mere liye doodh wali coffee, kripya."],
      },
    },
    {
      speaker: "mateo",
      text: {
        en: ["I want a green tea and a croissant.", "I'd like a green tea and a croissant."],
        es: ["Yo quiero un té verde y un croissant."],
        fr: ["Je voudrais un thé vert et un croissant.", "Moi, je veux un thé vert et un croissant."],
        de: ["Ich möchte einen grünen Tee und ein Croissant."],
        it: ["Io vorrei un tè verde e un cornetto.", "Io prendo un tè verde e un croissant."],
        hi: ["मुझे एक ग्रीन टी और एक क्रोसां चाहिए।"],
        hiLatn: ["Mujhe ek green tea aur ek croissant chahiye."],
      },
    },
    {
      speaker: "waiter",
      text: {
        en: ["Very good. I'll bring it to you right away.", "Very well. I'll bring it right now."],
        es: ["Muy bien. Ahora mismo se lo traigo."],
        fr: ["Très bien. Je vous apporte ça tout de suite."],
        de: ["Sehr gut. Ich bringe es Ihnen sofort.", "Sehr gern. Kommt sofort."],
        it: ["Benissimo. Ve lo porto subito.", "Va bene. Arriva subito."],
        hi: ["बहुत अच्छा। मैं अभी लेकर आता हूँ।"],
        hiLatn: ["Bahut accha. Main abhi lekar aata hoon."],
      },
    },
    {
      speaker: "lucia",
      text: {
        en: ["Hey, what are you going to do this weekend?", "Hey, what are you doing this weekend?"],
        es: ["Oye, ¿qué vas a hacer este fin de semana?"],
        fr: ["Dis, qu'est-ce que tu fais ce week-end ?", "Dis donc, tu fais quoi ce week-end ?"],
        de: ["Hey, was machst du dieses Wochenende?", "Sag mal, was hast du am Wochenende vor?"],
        it: ["Senti, cosa fai questo fine settimana?", "Ehi, cosa fai questo weekend?"],
        hi: ["अरे, इस वीकेंड तुम क्या करने वाले हो?", "सुनो, इस हफ़्ते के आख़िर में क्या कर रहे हो?"],
        hiLatn: ["Arre, is weekend tum kya karne wale ho?", "Suno, is hafte ke aakhir mein kya kar rahe ho?"],
      },
    },
    {
      speaker: "mateo",
      text: {
        en: ["I don't know yet. Maybe I'll go to the beach."],
        es: ["No sé todavía. Quizás vaya a la playa."],
        fr: ["Je ne sais pas encore. Peut-être que j'irai à la plage."],
        de: ["Ich weiß noch nicht. Vielleicht fahre ich an den Strand."],
        it: ["Non lo so ancora. Forse vado al mare.", "Non so ancora. Magari vado in spiaggia."],
        hi: ["अभी पता नहीं। शायद बीच पर जाऊँ।", "अभी पता नहीं। शायद समुद्र किनारे जाऊँगा।"],
        hiLatn: ["Abhi pata nahin. Shayad beach par jaaun.", "Abhi pata nahin. Shayad samudra kinare jaaunga."],
      },
    },
    {
      speaker: "lucia",
      text: {
        en: ["What a good idea! Can I go with you?", "What a great idea! Can I come with you?"],
        es: ["¡Qué buena idea! ¿Puedo ir contigo?"],
        fr: ["Quelle bonne idée ! Je peux venir avec toi ?", "Bonne idée ! Est-ce que je peux venir avec toi ?"],
        de: ["Was für eine gute Idee! Kann ich mitkommen?", "Gute Idee! Darf ich mitkommen?"],
        it: ["Che bella idea! Posso venire con te?"],
        hi: ["क्या बढ़िया आइडिया है! क्या मैं तुम्हारे साथ चल सकती हूँ?"],
        hiLatn: ["Kya badhiya idea hai! Kya main tumhare saath chal sakti hoon?"],
      },
    },
    {
      speaker: "mateo",
      text: {
        en: ["Of course. We leave early on Saturday.", "Of course. We'll leave early Saturday."],
        es: ["Claro que sí. Salimos el sábado temprano."],
        fr: ["Bien sûr. On part tôt samedi.", "Bien sûr. Nous partons samedi de bonne heure."],
        de: ["Na klar. Wir fahren am Samstag früh los."],
        it: ["Certo. Partiamo sabato mattina presto.", "Certo che sì. Partiamo presto sabato."],
        hi: ["बिल्कुल। हम शनिवार को सुबह जल्दी निकलेंगे।"],
        hiLatn: ["Bilkul. Hum shanivaar ko subah jaldi niklenge."],
      },
    },
    {
      speaker: "waiter",
      text: {
        en: ["Here you go. That's six euros in total.", "Here you are. It's six euros total."],
        es: ["Aquí tienen. Son seis euros en total."],
        fr: ["Voilà. Ça fait six euros en tout."],
        de: ["Bitte schön. Das macht insgesamt sechs Euro."],
        it: ["Ecco a voi. Sono sei euro in tutto."],
        hi: ["यह लीजिए। कुल मिलाकर छह यूरो हुए।"],
        hiLatn: ["Yeh lijiye. Kul milakar chhah euro hue."],
      },
    },
    {
      speaker: "lucia",
      text: {
        en: ["Thanks. Today it's on me.", "Thank you. My treat today."],
        es: ["Gracias. Hoy invito yo."],
        fr: ["Merci. Aujourd'hui, c'est moi qui invite.", "Merci. C'est pour moi aujourd'hui."],
        de: ["Danke. Heute lade ich ein.", "Danke. Heute geht's auf mich."],
        it: ["Grazie. Oggi offro io."],
        hi: ["शुक्रिया। आज मेरी तरफ़ से।", "धन्यवाद। आज का बिल मैं दूँगी।"],
        hiLatn: ["Shukriya. Aaj meri taraf se.", "Dhanyavaad. Aaj ka bill main doongi."],
      },
    },
  ],
};

// Every accepted answer for a line in a language, including any other script.
function acceptedAnswers(line, language) {
  const altScript = LANGUAGES[language].altScript;
  return altScript ? [...line.text[language], ...line.text[altScript]] : line.text[language];
}
