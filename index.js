import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;
if (!ADMIN_ID) console.warn("⚠️ Admin-ID nicht gesetzt! Kontaktanfragen können nicht weitergeleitet werden.");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {};

// ---------------- STÄDTE ----------------
const STÄDTE = ["Wien"]; // wir bauen erstmal nur Wien

// ---------------- BEISPIEL LINK + NAME + ALTER ----------------
const girlData = {
  Wien: { 
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
    "👋 Willkommen zu deinem F+ Bot",
    Markup.inlineKeyboard([
      [Markup.button.callback("👉 Hier starten", "START_FLOW")]
    ])
  );
});

// ---------------- FLOW ----------------

// Start → Stadtwahl
bot.action("START_FLOW", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "Bitte wähle deine Stadt:",
    Markup.inlineKeyboard(
      STÄDTE.map(stadt => [Markup.button.callback(stadt, `CITY_${stadt}`)])
    )
  );
});

// Stadt auswählen → Link + Name + Alter + Kontakt kaufen
bot.action(/CITY_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const stadt = ctx.match[1];
  sessions[ctx.from.id].city = stadt;
  const girl = girlData[stadt];

  await ctx.editMessageText(
    `👩 Name: ${girl.name}\n🎂 Alter: ${girl.age}\n🔗 Link: ${girl.link}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("💌 Kontakt kaufen", "BUY_CONTACT")]
    ])
  );
});

// Kontakt kaufen → Zahlungsmethode
bot.action("BUY_CONTACT", async (ctx) => {
  await ctx.answerCbQuery();
  sessions[ctx.from.id].step = "PAYMENT";

  await ctx.editMessageText(
    "Wähle deine Zahlungsmethode:",
    Markup.inlineKeyboard([
      [Markup.button.url("PayPal", paymentLinks.PAYPAL)],
      [Markup.button.url("Amazon", paymentLinks.AMAZON)],
      [Markup.button.url("Bitsa", paymentLinks.BITSA)]
    ])
  );

  // Nachricht an Admin sofort, dass jemand die Kaufoption gestartet hat
  const session = sessions[ctx.from.id];
  const girl = girlData[session.city];
  if (ADMIN_ID) {
    ctx.telegram.sendMessage(
      ADMIN_ID,
      `Neue Kontaktanfrage von @${ctx.from.username || ctx.from.first_name}\n` +
      `Stadt: ${session.city}\nName: ${girl.name}\nAlter: ${girl.age}`
    );
  }

  // Session zurücksetzen
  sessions[ctx.from.id] = {};
});

// ---------------- LAUNCH ----------------
bot.launch({ dropPendingUpdates: true });
console.log("🤖 Vermittlungs-Bot gestartet");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Fehler-Handler
bot.catch((err, ctx) => {
  console.error(`Fehler bei UpdateType ${ctx.updateType}:`, err);
});
