import { Telegraf, Markup } from "telegraf";

// ---------------- CONFIG ----------------
if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;
if (!ADMIN_ID) console.warn("⚠️ Admin-ID nicht gesetzt! Kontaktanfragen können nicht weitergeleitet werden.");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {}; // user session

// ---------------- STÄDTE ----------------
const STÄDTE = {
  DE: ["Berlin","Hamburg","München"],
  AT: ["Wien","Graz","Salzburg"],
  CH: ["Zürich","Genf","Basel"]
};

// ---------------- BILDER PRO STADT ----------------
const BILDER = {
  Wien: [
    { url: "https://i.imgur.com/example1.jpg" },
    { url: "https://i.imgur.com/example2.jpg" },
    { url: "https://i.imgur.com/example3.jpg" },
    { url: "https://i.imgur.com/example4.jpg" },
    { url: "https://i.imgur.com/example5.jpg" }
  ],
  Berlin: [
    { url: "https://i.imgur.com/berlin1.jpg" },
    { url: "https://i.imgur.com/berlin2.jpg" },
    { url: "https://i.imgur.com/berlin3.jpg" },
    { url: "https://i.imgur.com/berlin4.jpg" },
    { url: "https://i.imgur.com/berlin5.jpg" }
  ],
  Hamburg: [
    { url: "https://i.imgur.com/hamburg1.jpg" },
    { url: "https://i.imgur.com/hamburg2.jpg" },
    { url: "https://i.imgur.com/hamburg3.jpg" },
    { url: "https://i.imgur.com/hamburg4.jpg" },
    { url: "https://i.imgur.com/hamburg5.jpg" }
  ],
  // Weitere Städte kannst du analog ergänzen
};

// ---------------- RANDOM NAME + ALTER ----------------
const germanNames = ["Anna","Laura","Sophie","Lea","Mia"];
const ages = [19,22,25];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------- START ----------------
const showMainMenu = async (ctx) => {
  await ctx.reply(
    "👋 Willkommen zu deinem F+ Bot",
    Markup.inlineKeyboard([[Markup.button.callback("👉 Hier starten", "START_FLOW")]])
  );
};

bot.start((ctx) => showMainMenu(ctx));

// ---------------- FLOW ----------------

// Start → Länder
bot.action("START_FLOW", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "Bitte wähle dein Land:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇩🇪 Deutschland", "COUNTRY_DE")],
      [Markup.button.callback("🇦🇹 Österreich", "COUNTRY_AT")],
      [Markup.button.callback("🇨🇭 Schweiz", "COUNTRY_CH")]
    ])
  );
});

// Länder → Städte
bot.action(/COUNTRY_(DE|AT|CH)/, async (ctx) => {
  await ctx.answerCbQuery();
  const land = ctx.match[1];
  sessions[ctx.from.id] = sessions[ctx.from.id] || {};
  sessions[ctx.from.id].land = land;

  const buttons = STÄDTE[land].map(stadt => [Markup.button.callback(stadt, `CITY_${stadt}`)]);
  buttons.push([Markup.button.callback("◀️ Zurück", "START_FLOW")]);

  await ctx.editMessageText("Bitte wähle deine Stadt:", Markup.inlineKeyboard(buttons));
});

// Stadt → Zufälliges Bild + Name + Alter
bot.action(/CITY_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const stadt = ctx.match[1];
  const session = sessions[ctx.from.id];
  session.city = stadt;
  session.index = 0;

  await sendRandomImage(ctx);
});

// Funktion: Zufälliges Bild + Name + Alter senden
async function sendRandomImage(ctx) {
  const session = sessions[ctx.from.id];
  const bilder = BILDER[session.city];
  if (!bilder || bilder.length === 0) return ctx.reply("Keine Bilder verfügbar.");

  const image = bilder[session.index];
  const name = getRandom(germanNames);
  const age = getRandom(ages);
  session.currentGirl = { name, age };

  await ctx.replyWithPhoto(image.url, {
    caption: `👩 Name: ${name}\n🎂 Alter: ${age}`,
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Zurück", "BACK_TO_CITY")],
      [Markup.button.callback("➡️ Nächstes", "NEXT_IMAGE")],
      [Markup.button.callback("💌 Kontakt kaufen", "BUY_CONTACT")]
    ])
  });
}

// Nächstes Bild
bot.action("NEXT_IMAGE", async (ctx) => {
  const session = sessions[ctx.from.id];
  session.index = (session.index + 1) % BILDER[session.city].length;
  await sendRandomImage(ctx);
  await ctx.answerCbQuery();
});

// Zurück zur Stadtwahl
bot.action("BACK_TO_CITY", async (ctx) => {
  const session = sessions[ctx.from.id];
  await ctx.answerCbQuery();
  const buttons = STÄDTE[session.land].map(stadt => [Markup.button.callback(stadt, `CITY_${stadt}`)]);
  buttons.push([Markup.button.callback("◀️ Zurück", "START_FLOW")]);

  await ctx.editMessageText("Bitte wähle deine Stadt:", Markup.inlineKeyboard(buttons));
});

// Kontakt kaufen
bot.action("BUY_CONTACT", async (ctx) => {
  const session = sessions[ctx.from.id];
  const girl = session.currentGirl;

  if (ADMIN_ID) {
    await ctx.reply(`💌 Du willst den Kontakt von ${girl.name} (${girl.age}) kaufen? Kontaktiere den Admin!`);
    await ctx.telegram.sendMessage(ADMIN_ID, `Neue Anfrage von @${ctx.from.username || ctx.from.first_name}\nStadt: ${session.city}\nName: ${girl.name}\nAlter: ${girl.age}`);
  } else {
    await ctx.reply(`⚠️ Admin nicht gesetzt. Kontaktanfrage für ${girl.name} (${girl.age}) kann nicht weitergeleitet werden.`);
  }
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
