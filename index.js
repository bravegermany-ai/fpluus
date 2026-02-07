import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");
const ADMIN_USERNAME = "@zemiperle";
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {};

// ---------------- ALLE STÄDTE ----------------
const STÄDTE = {
  DE: [
    "Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig",
    "Bremen","Dresden","Hannover","Nürnberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Mannheim",
    "Karlsruhe","Wiesbaden","Münster","Augsburg","Gelsenkirchen","Mönchengladbach","Braunschweig","Chemnitz",
    "Kiel","Magdeburg","Freiburg","Krefeld","Lübeck","Oberhausen","Erfurt","Mainz","Rostock","Kassel",
    "Hagen","Hamm","Saarbrücken","Mülheim","Potsdam","Ludwigshafen","Oldenburg","Leverkusen","Osnabrück","Solingen"
  ],
  AT: [
    "Wien","Graz","Salzburg","Innsbruck","Linz","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn",
    "Steyr","Feldkirch","Bregenz","Leonding","Krems an der Donau","Traun","Amstetten","Kapfenberg","Wolfsberg","Leoben"
  ],
  CH: [
    "Zürich","Genf","Basel","Bern","Lausanne","Winterthur","St. Gallen","Lugano","Biel/Bienne","Thun",
    "Köniz","La Chaux-de-Fonds","Schaffhausen","Fribourg","Chur","Neuchâtel","Vernier","Uster","Sion","Lancy"
  ]
};

// ---------------- LINK + NAME + ALTER ----------------
const girlData = {
  default: {
    link: "https://t.me/willigedamen/10",
    name: "Anna",
    age: 22
  }
};

// ---------------- ZAHLUNGSLINKS ----------------
const paymentLinks = {
  PAYPAL: "https://www.paypal.me/FplusPaypal",
  AMAZON: "https://www.guthaben.de/amazon-gutscheine-oesterreich",
  BITSA: "https://www.guthaben.de/bitsa-oesterreich?gclsrc=aw.ds&gad_source=1&gad_campaignid=12449738630&gbraid=0AAAAADtO4m0pUohETYz4_wl28FEuglDwZ&gclid=Cj0KCQiA4pvMBhDYARIsAGfgwvzNiGQ8PaERzafBZJnGnkYjAWpZ9F7g49amyjgIm2wRxt_A0A9XMOoaAp7pEALw_wcB"
};

// ---------------- START ----------------
bot.start((ctx) => {
  sessions[ctx.from.id] = {};
  ctx.reply(
    "👋 Willkommen zu deinem F+ Bot\n\nHier kannst du den Kontakt zu ausgewählten Damen erwerben.",
    Markup.inlineKeyboard([[Markup.button.callback("👉 Hier starten", "START_FLOW")]])
  );
});

// ---------------- START_FLOW → Länder ----------------
bot.action("START_FLOW", async (ctx) => {
  await ctx.answerCbQuery();
  sessions[ctx.from.id] = {};
  await ctx.editMessageText(
    "Bitte wähle dein Land:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇩🇪 Deutschland", "COUNTRY_DE")],
      [Markup.button.callback("🇦🇹 Österreich", "COUNTRY_AT")],
      [Markup.button.callback("🇨🇭 Schweiz", "COUNTRY_CH")]
    ])
  );
});

// ---------------- Länder → Städte ----------------
bot.action(/COUNTRY_(DE|AT|CH)/, async (ctx) => {
  await ctx.answerCbQuery();
  const land = ctx.match[1];
  sessions[ctx.from.id].land = land;

  const buttons = STÄDTE[land].map(stadt => [Markup.button.callback(stadt, `CITY_${stadt}`)]);
  buttons.push([Markup.button.callback("◀️ Zurück", "START_FLOW")]);

  await ctx.editMessageText("Bitte wähle deine Stadt:", Markup.inlineKeyboard(buttons));
});

// ---------------- Stadt → Kontakt kaufen ----------------
bot.action(/CITY_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const stadt = ctx.match[1];
  sessions[ctx.from.id].city = stadt;
  const girl = girlData.default;

  const messageText = `👩 Name: ${girl.name}\n🎂 Alter: ${girl.age}\n🔗 Telegram-Link: ${girl.link}\n\n` +
                      `Wenn du den Kontakt kaufen möchtest, klicke unten.`;

  await ctx.editMessageText(
    messageText,
    Markup.inlineKeyboard([[Markup.button.callback("💌 Kontakt kaufen", "BUY_CONTACT")]])
  );
});

// ---------------- Kontakt kaufen → Zahlungsmethode ----------------
bot.action("BUY_CONTACT", async (ctx) => {
  await ctx.answerCbQuery();
  const girl = girlData.default;

  await ctx.editMessageText(
    `Wähle die Zahlungsmethode für ${girl.name} (${girl.age}):`,
    Markup.inlineKeyboard([
      [Markup.button.callback("PayPal", "PAY_PAYPAL")],
      [Markup.button.callback("Amazon", "PAY_AMAZON")],
      [Markup.button.callback("Bitsa", "PAY_BITSA")]
    ])
  );
});

// ---------------- Zahlungsmethode → Bestätigung + Admin ----------------
["PAY_PAYPAL","PAY_AMAZON","PAY_BITSA"].forEach(method => {
  bot.action(method, async (ctx) => {
    await ctx.answerCbQuery();
    const session = sessions[ctx.from.id];
    const girl = girlData.default;

    let zahlungsmethode = "", link = "";
    if(method === "PAY_PAYPAL") { zahlungsmethode="PayPal"; link=paymentLinks.PAYPAL; }
    if(method === "PAY_AMAZON") { zahlungsmethode="Amazon"; link=paymentLinks.AMAZON; }
    if(method === "PAY_BITSA") { zahlungsmethode="Bitsa"; link=paymentLinks.BITSA; }

    // Nachricht an User
    await ctx.editMessageText(
      `✅ Deine Anfrage für ${girl.name} (${girl.age}) wurde registriert.\n`+
      `Zahlungsmethode: ${zahlungsmethode}\n`+
      `Hier kannst du bezahlen: ${link}\n`+
      `Kontaktiere den Admin ${ADMIN_USERNAME}`
    );

    // Nachricht an Admin
    if (ADMIN_ID) {
      await ctx.telegram.sendMessage(
        ADMIN_ID,
        `Neue Anfrage von @${ctx.from.username || ctx.from.first_name}\n`+
        `Land: ${session.land}\nStadt: ${session.city}\nName: ${girl.name}\nAlter: ${girl.age}\nZahlungsmethode: ${zahlungsmethode}`
      );
    }

    // Session zurücksetzen
    sessions[ctx.from.id] = {};
  });
});

// ---------------- LAUNCH ----------------
bot.launch({ dropPendingUpdates: true });
console.log("🤖 Vermittlungs-Bot gestartet");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.catch((err, ctx) => {
  console.error(`Fehler bei UpdateType ${ctx.updateType}:`, err);
});
