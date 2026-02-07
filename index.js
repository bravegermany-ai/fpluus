import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");

const ADMIN_USERNAME = "@zemiperle";
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {};

// ---------------- NAMEN + ALTER ----------------
const NAMES = ["Anna","Laura","Lisa","Mia","Lena","Sophie","Nina","Emily","Lea","Sarah","Julia","Vanessa","Alina","Marie","Katharina"];
const randomName = () => NAMES[Math.floor(Math.random()*NAMES.length)];
const randomAge = () => Math.floor(Math.random()*(25-18+1))+18;

// ---------------- ZAHLUNG ----------------
const PAYMENT_LINKS = {
  PAYPAL: "https://www.paypal.me/FplusPaypal",
  AMAZON: "https://www.guthaben.de/amazon-gutscheine-oesterreich",
  BITSA: "https://www.guthaben.de/bitsa-oesterreich"
};

// ---------------- ALLE STÄDTE ----------------
const STÄDTE = {
  DE:["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hannover","Nürnberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Mannheim","Karlsruhe","Wiesbaden","Münster","Augsburg","Gelsenkirchen","Mönchengladbach","Braunschweig","Chemnitz","Kiel","Magdeburg","Freiburg","Krefeld","Lübeck","Oberhausen","Erfurt","Mainz","Rostock","Kassel","Hagen","Hamm","Saarbrücken","Mülheim","Potsdam","Ludwigshafen","Oldenburg","Leverkusen","Osnabrück","Solingen"],
  AT:["Wien","Graz","Salzburg","Innsbruck","Linz","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Steyr","Feldkirch","Bregenz","Leonding","Krems an der Donau","Traun","Amstetten","Kapfenberg","Wolfsberg","Leoben"],
  CH:["Zürich","Genf","Basel","Bern","Lausanne","Winterthur","St. Gallen","Lugano","Biel/Bienne","Thun","Köniz","La Chaux-de-Fonds","Schaffhausen","Fribourg","Chur","Neuchâtel","Vernier","Uster","Sion","Lancy"]
};

// ---------------- LINKS ----------------
// Hier müssen alle deine Links rein, aktuell nur Beispiel
const ALL_LINKS = [
  "https://t.me/willigedamen/4","https://t.me/willigedamen/5","https://t.me/willigedamen/6",
  "https://t.me/willigedamen/9","https://t.me/willigedamen/15","https://t.me/willigedamen/16",
  "https://t.me/willigedamen/17","https://t.me/willigedamen/18","https://t.me/willigedamen/19",
  "https://t.me/willigedamen/20","https://t.me/willigedamen/22","https://t.me/willigedamen/25",
  "https://t.me/willigedamen/26","https://t.me/willigedamen/28","https://t.me/willigedamen/27",
  "https://t.me/willigedamen/24","https://t.me/willigedamen/23","https://t.me/willigedamen/21"
];

// ---------------- GIRLS PER CITY ----------------
const GIRLS_PER_CITY = {};
let linkIndex = 0;
Object.entries(STÄDTE).forEach(([country, cities])=>{
  cities.forEach(city=>{
    GIRLS_PER_CITY[city] = [];
    for(let i=0;i<2;i++){ // pro Stadt 2 Mädchen
      if(linkIndex >= ALL_LINKS.length) linkIndex = 0; // Links rotieren
      GIRLS_PER_CITY[city].push({
        link: ALL_LINKS[linkIndex],
        name: randomName(),
        age: randomAge()
      });
      linkIndex++;
    }
  });
});

// ---------------- START ----------------
bot.start(ctx=>{
  sessions[ctx.from.id] = {};
  ctx.reply("👋 Willkommen zu deinem F+ Bot",
    Markup.inlineKeyboard([[Markup.button.callback("👉 Hier starten","START")]])
  );
});

// ---------------- LAND ----------------
bot.action("START", async ctx=>{
  await ctx.answerCbQuery();
  await ctx.editMessageText("🌍 Wähle dein Land:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇩🇪 Deutschland","LAND_DE")],
      [Markup.button.callback("🇦🇹 Österreich","LAND_AT")],
      [Markup.button.callback("🇨🇭 Schweiz","LAND_CH")]
    ])
  );
});

// ---------------- STADT ----------------
bot.action(/LAND_(DE|AT|CH)/, async ctx=>{
  await ctx.answerCbQuery();
  const land = ctx.match[1];
  sessions[ctx.from.id].land = land;
  const buttons = STÄDTE[land].map(city=>[Markup.button.callback(city, `CITY_${city}`)]);
  buttons.push([Markup.button.callback("◀️ Zurück","START")]);
  await ctx.editMessageText("🏙️ Wähle deine Stadt:", Markup.inlineKeyboard(buttons));
});

// ---------------- RANDOM GIRL ----------------
function sendRandomGirl(ctx){
  const s = sessions[ctx.from.id];
  const girls = GIRLS_PER_CITY[s.city];
  let index;
  do { index = Math.floor(Math.random()*girls.length); } while(index===s.lastIndex);
  s.lastIndex = index;
  s.currentGirl = girls[index];

  return ctx.editMessageText(
    `👩 Name: ${s.currentGirl.name}\n🎂 Alter: ${s.currentGirl.age}\n🔗 ${s.currentGirl.link}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("💌 Kontakt kaufen","BUY")],
      [Markup.button.callback("➡️ Nächstes Mädchen","NEXT")],
      [Markup.button.callback("◀️ Zurück",`LAND_${s.land}`)]
    ])
  );
}

// ---------------- CITY ----------------
bot.action(/CITY_(.+)/, async ctx=>{
  await ctx.answerCbQuery();
  sessions[ctx.from.id].city = ctx.match[1];
  await sendRandomGirl(ctx);
});

// ---------------- NEXT ----------------
bot.action("NEXT", async ctx=>{
  await ctx.answerCbQuery();
  await sendRandomGirl(ctx);
});

// ---------------- BUY ----------------
bot.action("BUY", async ctx=>{
  await ctx.answerCbQuery();
  const s = sessions[ctx.from.id];
  await ctx.editMessageText(
    "💳 Zahlungsmethode wählen:",
    Markup.inlineKeyboard([
      [Markup.button.callback("PayPal","PAY_PAYPAL")],
      [Markup.button.callback("Amazon","PAY_AMAZON")],
      [Markup.button.callback("Bitsa","PAY_BITSA")],
      [Markup.button.callback("◀️ Zurück","NEXT")] // zurück zum Mädchen
    ])
  );
});

// ---------------- ZAHLUNG ----------------
["PAY_PAYPAL","PAY_AMAZON","PAY_BITSA"].forEach(p=>{
  bot.action(p, async ctx=>{
    await ctx.answerCbQuery();
    const method = p.replace("PAY_","");
    const s = sessions[ctx.from.id];

    await ctx.editMessageText(
      `✅ Deine Anfrage für ${s.currentGirl.name} (${s.currentGirl.age}) wurde registriert.\n`+
      `Zahlungsmethode: ${method}\n`+
      `Hier kannst du bezahlen: ${PAYMENT_LINKS[method]}\n`+
      `Kontaktiere den Admin ${ADMIN_USERNAME}`
    );

    if(ADMIN_ID){
      ctx.telegram.sendMessage(
        ADMIN_ID,
        `Neue Anfrage\nLand: ${s.land}\nStadt: ${s.city}\nName: ${s.currentGirl.name}\nAlter: ${s.currentGirl.age}\nZahlungsmethode: ${method}`
      );
    }

    sessions[ctx.from.id] = {};
  });
});

// ---------------- LAUNCH ----------------
bot.launch();
console.log("🤖 Vermittlungs-Bot läuft");
