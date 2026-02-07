import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");

const ADMIN_USERNAME = "@zemiperle";
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {};

// ---------------- NAMEN + ALTER ----------------
const NAMES = [
  "Anna","Laura","Lisa","Mia","Lena","Sophie","Nina","Emily",
  "Lea","Sarah","Julia","Vanessa","Alina","Marie","Katharina"
];

const randomAge = () => Math.floor(Math.random() * (25 - 18 + 1)) + 18;
const randomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

// ---------------- LINKS (für ALLE Städte gleich) ----------------
const GIRL_LINKS = [
  "https://t.me/willigedamen/4","https://t.me/willigedamen/5","https://t.me/willigedamen/6",
  "https://t.me/willigedamen/9","https://t.me/willigedamen/15","https://t.me/willigedamen/16",
  "https://t.me/willigedamen/17","https://t.me/willigedamen/18","https://t.me/willigedamen/19",
  "https://t.me/willigedamen/20","https://t.me/willigedamen/21","https://t.me/willigedamen/22",
  "https://t.me/willigedamen/23","https://t.me/willigedamen/24","https://t.me/willigedamen/25",
  "https://t.me/willigedamen/26","https://t.me/willigedamen/27","https://t.me/willigedamen/28",
  "https://t.me/willigedamen/29","https://t.me/willigedamen/30"
];

// ---------------- ZAHLUNG ----------------
const PAYMENT_LINKS = {
  PAYPAL: "https://www.paypal.me/FplusPaypal",
  AMAZON: "https://www.guthaben.de/amazon-gutscheine-oesterreich",
  BITSA: "https://www.guthaben.de/bitsa-oesterreich"
};

// ---------------- STÄDTE ----------------
const STÄDTE = {
  DE: ["Berlin","Hamburg","München","Köln","Frankfurt"],
  AT: ["Wien","Graz","Salzburg","Linz","Innsbruck"],
  CH: ["Zürich","Bern","Basel","Genf","Luzern"]
};

// ---------------- START ----------------
bot.start(ctx => {
  sessions[ctx.from.id] = {};
  ctx.reply(
    "👋 Willkommen zu deinem F+ Bot",
    Markup.inlineKeyboard([[Markup.button.callback("👉 Hier starten", "START")]])
  );
});

// ---------------- LAND ----------------
bot.action("START", async ctx => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "🌍 Wähle dein Land:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇩🇪 Deutschland", "LAND_DE")],
      [Markup.button.callback("🇦🇹 Österreich", "LAND_AT")],
      [Markup.button.callback("🇨🇭 Schweiz", "LAND_CH")]
    ])
  );
});

// ---------------- STADT ----------------
bot.action(/LAND_(DE|AT|CH)/, async ctx => {
  await ctx.answerCbQuery();
  const land = ctx.match[1];
  sessions[ctx.from.id].land = land;

  const buttons = STÄDTE[land].map(s =>
    [Markup.button.callback(s, `CITY_${s}`)]
  );

  buttons.push([Markup.button.callback("◀️ Zurück", "START")]);

  await ctx.editMessageText("🏙️ Wähle deine Stadt:", Markup.inlineKeyboard(buttons));
});

// ---------------- PROFIL ANZEIGEN ----------------
function sendRandomGirl(ctx) {
  const session = sessions[ctx.from.id];
  let index;

  do {
    index = Math.floor(Math.random() * GIRL_LINKS.length);
  } while (index === session.lastIndex);

  session.lastIndex = index;

  session.girl = {
    name: randomName(),
    age: randomAge(),
    link: GIRL_LINKS[index]
  };

  return ctx.editMessageText(
    `👩 Name: ${session.girl.name}\n🎂 Alter: ${session.girl.age}\n🔗 ${session.girl.link}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("💌 Kontakt kaufen", "BUY")],
      [Markup.button.callback("➡️ Nächstes", "NEXT")],
      [Markup.button.callback("◀️ Zurück", `LAND_${session.land}`)]
    ])
  );
}

bot.action(/CITY_(.+)/, async ctx => {
  await ctx.answerCbQuery();
  sessions[ctx.from.id].city = ctx.match[1];
  await sendRandomGirl(ctx);
});

bot.action("NEXT", async ctx => {
  await ctx.answerCbQuery();
  await sendRandomGirl(ctx);
});

// ---------------- ZAHLUNG ----------------
bot.action("BUY", async ctx => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "💳 Zahlungsmethode wählen:",
    Markup.inlineKeyboard([
      [Markup.button.callback("PayPal", "PAY_PAYPAL")],
      [Markup.button.callback("Amazon", "PAY_AMAZON")],
      [Markup.button.callback("Bitsa", "PAY_BITSA")],
      [Markup.button.callback("◀️ Zurück", "NEXT")]
    ])
  );
});

["PAY_PAYPAL","PAY_AMAZON","PAY_BITSA"].forEach(p => {
  bot.action(p, async ctx => {
    await ctx.answerCbQuery();
    const method = p.replace("PAY_","");
    const s = sessions[ctx.from.id];

    await ctx.editMessageText(
      `✅ Deine Anfrage für ${s.girl.name} (${s.girl.age}) wurde registriert.\n` +
      `Zahlungsmethode: ${method}\n` +
      `Hier kannst du bezahlen: ${PAYMENT_LINKS[method]}\n` +
      `Kontaktiere den Admin ${ADMIN_USERNAME}`
    );

    if (ADMIN_ID) {
      ctx.telegram.sendMessage(
        ADMIN_ID,
        `Neue Anfrage\nStadt: ${s.city}\nName: ${s.girl.name}\nAlter: ${s.girl.age}\nZahlung: ${method}`
      );
    }

    sessions[ctx.from.id] = {};
  });
});

// ---------------- START ----------------
bot.launch();
console.log("🤖 Bot läuft");
