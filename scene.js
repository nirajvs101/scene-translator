// A short built-in scene. Each line has the Spanish original and one or more
// acceptable English translations; the first English entry is shown as the
// reference. When translating English→Spanish, the roles flip.
const SCENE = {
  title: "En el café",
  description: "Two friends order coffee and make weekend plans.",
  speakers: {
    lucia: { name: "Lucía", color: "#d9480f" },
    mateo: { name: "Mateo", color: "#1971c2" },
    waiter: { name: "Camarero", color: "#2f9e44" },
  },
  lines: [
    {
      speaker: "waiter",
      es: ["Buenos días. ¿Qué les pongo?"],
      en: ["Good morning. What can I get you?", "Good morning. What would you like?"],
    },
    {
      speaker: "lucia",
      es: ["Para mí, un café con leche, por favor."],
      en: ["For me, a coffee with milk, please.", "I'll have a latte, please."],
    },
    {
      speaker: "mateo",
      es: ["Yo quiero un té verde y un croissant."],
      en: ["I want a green tea and a croissant.", "I'd like a green tea and a croissant."],
    },
    {
      speaker: "waiter",
      es: ["Muy bien. Ahora mismo se lo traigo."],
      en: ["Very good. I'll bring it to you right away.", "Very well. I'll bring it right now."],
    },
    {
      speaker: "lucia",
      es: ["Oye, ¿qué vas a hacer este fin de semana?"],
      en: ["Hey, what are you going to do this weekend?", "Hey, what are you doing this weekend?"],
    },
    {
      speaker: "mateo",
      es: ["No sé todavía. Quizás vaya a la playa."],
      en: ["I don't know yet. Maybe I'll go to the beach."],
    },
    {
      speaker: "lucia",
      es: ["¡Qué buena idea! ¿Puedo ir contigo?"],
      en: ["What a good idea! Can I go with you?", "What a great idea! Can I come with you?"],
    },
    {
      speaker: "mateo",
      es: ["Claro que sí. Salimos el sábado temprano."],
      en: ["Of course. We leave early on Saturday.", "Of course. We'll leave early Saturday."],
    },
    {
      speaker: "waiter",
      es: ["Aquí tienen. Son seis euros en total."],
      en: ["Here you go. That's six euros in total.", "Here you are. It's six euros total."],
    },
    {
      speaker: "lucia",
      es: ["Gracias. Hoy invito yo."],
      en: ["Thanks. Today it's on me.", "Thank you. My treat today."],
    },
  ],
};
