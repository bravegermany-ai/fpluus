import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Session pro User
const sessions = {};

// Beispielbilder für Wien (du ersetzt die URLs durch echte Links)
const imagesWien = [
  { url: "https://i.imgur.com/example1.jpg" },
  { url: "https://i.imgur.com/example2.jpg" },
  { url: "https://i.imgur.com/example3.jpg" },
  { url: "https://i.imgur.com/example4.jpg" },
  { url: "https://i.imgur.com/example5.jpg" },
];

// Zufällige Namen & Alter
const germanNames = ["Anna","Laura","Sophie","Lea","Mia"];
const ages = [19,22,25];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Stadt Wien auswählen
bot.action("CITY_Wien", async (ctx) => {
  ctx.session = sessions[ctx.from.id] = sessions[ctx.from.id] || {};
  ctx.session.city = "Wien";
  ctx.session.index = 0;

  await sendRandomWienImage(ctx);
});

// Funktion: Zufälliges Bild + Name + Alter senden
async function sendRandomWienImage(ctx) {
  const session = sessions[ctx.from.id];
  const image = imagesWien[session.index];

  const name = getRandom(germanNames);
  const age = getRandom(ages);
  session.currentGirl = { name, age };

  await ctx.replyWithPhoto(image.url, {
    caption: `👩 Name: ${name}\n🎂 Alter: ${age}`,
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Zurück", "BACK_TO_CITY")],
      [Markup.button.callback("➡️ Nächstes", "NEXT_WIEN")],
      [Markup.button.callback("💌 Kontakt kaufen", "BUY_CONTACT")]
    ])
  });
}

// Nächstes Bild
bot.action("NEXT_WIEN", async (ctx) => {
  const session = sessions[ctx.from.id];
  session.index = (session.index + 1) % imagesWien.length;
  await sendRandomWienImage(ctx);
  await ctx.answerCbQuery();
});

// Zurück zur Stadtwahl
bot.action("BACK_TO_CITY", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("Bitte wähle deine Stadt:", Markup.inlineKeyboard([
    [Markup.button.callback("Wien", "CITY_Wien")],
    // weitere Städte hier
  ]));
});

// Kontakt kaufen
bot.action("BUY_CONTACT", async (ctx) => {
  const session = sessions[ctx.from.id];
  const girl = session.currentGirl;
  await ctx.answerCbQuery();
  await ctx.reply(`💌 Du willst den Kontakt von ${girl.name} (${girl.age}) kaufen? Kontaktiere den Admin!`);
});

bot.launch({ dropPendingUpdates: true });
console.log("Bot läuft…");
