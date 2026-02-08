import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");
if (!process.env.ADMIN_ID) throw new Error("ADMIN_ID fehlt");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN = process.env.ADMIN_ID;

// =========================
// ALLE LINKS
// =========================
const links = [
  "https://t.me/willigedamen/4","https://t.me/willigedamen/5","https://t.me/willigedamen/6",
  "https://t.me/willigedamen/9","https://t.me/willigedamen/15","https://t.me/willigedamen/16",
  "https://t.me/willigedamen/17","https://t.me/willigedamen/18","https://t.me/willigedamen/19",
  "https://t.me/willigedamen/20","https://t.me/willigedamen/22","https://t.me/willigedamen/25",
  "https://t.me/willigedamen/26","https://t.me/willigedamen/28","https://t.me/willigedamen/27",
  "https://t.me/willigedamen/24","https://t.me/willigedamen/23","https://t.me/willigedamen/21",
  "https://t.me/willigedamen/29","https://t.me/willigedamen/31","https://t.me/willigedamen/34",
  "https://t.me/willigedamen/33","https://t.me/willigedamen/38","https://t.me/willigedamen/36",
  "https://t.me/willigedamen/35","https://t.me/willigedamen/32","https://t.me/willigedamen/37",
  "https://t.me/willigedamen/30","https://t.me/willigedamen/39","https://t.me/willigedamen/40",
  // ... hier alle anderen Links bis /324 einfügen
];

// =========================
// STÄDTE & LÄNDER
// =========================
const cities = {
  Deutschland: ["Berlin","Hamburg","München","Köln","Frankfurt","Düsseldorf"],
  Österreich: ["Wien","Graz","Linz","Salzburg","Innsbruck"],
  Schweiz: ["Zürich","Genf","Basel","Bern","Lausanne"]
};

// =========================
// HILFSFUNKTION: RANDOM NAME & ALTER
// =========================
const names = ["Anna","Lea","Sophie","Lena","Mia","Emma","Nina","Laura"];
const randomName = () => names[Math.floor(Math.random()*names.length)];
const randomAge = () => 18 + Math.floor(Math.random()*8); // 18-25

// =========================
// START
// =========================
bot.start(async (ctx) => {
  await ctx.reply("👋 Willkommen zu deinem F+ Bot", 
    Markup.inlineKeyboard([
      [Markup.button.callback("Hier Starten", "START")]
    ])
  );
});

bot.action("START", async (ctx) => {
  await ctx.answerCbQuery();
  const buttons = Object.keys(cities).map(country => 
    [Markup.button.callback(country, `COUNTRY_${country}`)]
  );
  await ctx.reply("Wähle dein Land:", Markup.inlineKeyboard(buttons));
});

// =========================
// LAND → STADT
// =========================
Object.keys(cities).forEach(country => {
  bot.action(`COUNTRY_${country}`, async (ctx) => {
    await ctx.answerCbQuery();
    const cityButtons = cities[country].map(city => 
      [Markup.button.callback(city, `CITY_${country}_${city}`)]
    );
    cityButtons.push([Markup.button.callback("Zurück", "START")]);
    await ctx.reply(`Wähle eine Stadt in ${country}:`, Markup.inlineKeyboard(cityButtons));
  });
});

// =========================
// STADT → MÄDCHEN
// =========================
bot.action(/CITY_(.+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, country, city] = ctx.match;
  
  // 2 zufällige Links für diese Stadt
  const girlLinks = [];
  while (girlLinks.length < 2) {
    const link = links[Math.floor(Math.random() * links.length)];
    if(!girlLinks.includes(link)) girlLinks.push(link);
  }
  
  // erstes Mädchen anzeigen
  const name = randomName();
  const age = randomAge();
  await ctx.reply(
    `👩 ${name} (${age})\nHier ist ihr Profil: ${girlLinks[0]}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Nächstes Mädchen", `NEXT_${country}_${city}_1`)],
      [Markup.button.callback("Kontakt Kaufen", `BUY_${country}_${city}_0` )],
      [Markup.button.callback("Zurück", `COUNTRY_${country}`)]
    ])
  );
  
  // speichern im Kontext
  ctx.session = ctx.session || {};
  ctx.session[`${country}_${city}`] = { links: girlLinks, index: 0 };
});

// =========================
// NÄCHSTES MÄDCHEN
// =========================
bot.action(/NEXT_(.+)_(.+)_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, country, city, idx] = ctx.match;
  const data = ctx.session?.[`${country}_${city}`];
  if(!data) return;
  const nextIdx = parseInt(idx)+1;
  if(nextIdx >= data.links.length) return ctx.reply("Keine weiteren Mädchen vorhanden.");
  
  const name = randomName();
  const age = randomAge();
  
  await ctx.reply(
    `👩 ${name} (${age})\nHier ist ihr Profil: ${data.links[nextIdx]}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Nächstes Mädchen", `NEXT_${country}_${city}_${nextIdx}`)],
      [Markup.button.callback("Kontakt Kaufen", `BUY_${country}_${city}_${nextIdx}`)],
      [Markup.button.callback("Zurück", `COUNTRY_${country}`)]
    ])
  );
  data.index = nextIdx;
});

// =========================
// KAUF → ZAHLUNGSMETHODE
// =========================
bot.action(/BUY_(.+)_(.+)_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, country, city, idx] = ctx.match;
  const data = ctx.session?.[`${country}_${city}`];
  if(!data) return;
  
  await ctx.reply(
    "Wähle eine Zahlungsmethode:",
    Markup.inlineKeyboard([
      [Markup.button.url("PAYPAL", "https://www.paypal.me/FplusPaypal")],
      [Markup.button.url("AMAZON", "https://www.guthaben.de/amazon-gutscheine-oesterreich")],
      [Markup.button.url("BITSA", "https://www.guthaben.de/bitsa-oesterreich?gclid=Cj0KCQiA4pvMBhDYARIsAGfgwvzNiGQ8PaERzafBZJnGnkYjAWpZ9F7g49amyjgIm2wRxt_A0A9XMOoaAp7pEALw_wcB")],
      [Markup.button.callback("Zurück", `CITY_${country}_${city}`)]
    ])
  );
  await ctx.reply(`✅ Deine Anfrage für ${randomName()} (${randomAge()}) wurde registriert.\nKontaktiere den Admin @zemiperle`);
});

// =========================
// BOT LAUNCH
// =========================
bot.launch({ dropPendingUpdates: true });
console.log("🤖 Vermittlungs-Bot gestartet");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.catch((err, ctx) => console.error("Fehler:", err));
