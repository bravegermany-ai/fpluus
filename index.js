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

// Start → Länder / Stadt (hier nur Wien)
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
      [Markup.button.callback("PayPal", "PAY_PAYPAL")],
      [Markup.button.callback("Amazon", "PAY_AMAZON")],
      [Markup.button.callback("Bitsa", "PAY_BITSA")]
    ])
  );
});

// Zahlungsoption → Admin kontaktieren
["PAY_PAYPAL","PAY_AMAZON","PAY_BITSA"].forEach(method => {
  bot.action(method, async (ctx) => {
    await ctx.answerCbQuery();
    const session = sessions[ctx.from.id];
    const girl = girlData[session.city];
    const zahlungsmethode = method.replace("PAY_","");

    // Nachricht an Admin
    if (ADMIN_ID) {
      await ctx.telegram.sendMessage(
        ADMIN_ID, 
        `Neue Vermittlungsanfrage von @${ctx.from.username || ctx.from.first_name}\n`+
        `Stadt: ${session.city}\nName: ${girl.name}\nAlter: ${girl.age}\n`+
        `Link: ${girl.link}\nZahlungsmethode: ${zahlungsmethode}`
      );
    }

    // Bestätigung an User
    await ctx.editMessageText(
      `✅ Deine Anfrage für ${girl.name} (${girl.age}) wurde registriert.\nZahlungsmethode: ${zahlungsmethode}\nKontaktiere den Admin @zemiperle`
    );

    sessions[ctx.from.id] = {}; // reset
  });
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
