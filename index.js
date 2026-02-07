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
const ALL_LINKS = [
  "https://t.me/willigedamen/4","https://t.me/willigedamen/5","https://t.me/willigedamen/6","https://t.me/willigedamen/9",
  "https://t.me/willigedamen/15","https://t.me/willigedamen/16","https://t.me/willigedamen/17","https://t.me/willigedamen/18",
  "https://t.me/willigedamen/19","https://t.me/willigedamen/20","https://t.me/willigedamen/22","https://t.me/willigedamen/25",
  "https://t.me/willigedamen/26","https://t.me/willigedamen/28","https://t.me/willigedamen/27","https://t.me/willigedamen/24",
  "https://t.me/willigedamen/23","https://t.me/willigedamen/21","https://t.me/willigedamen/29","https://t.me/willigedamen/31",
  "https://t.me/willigedamen/34","https://t.me/willigedamen/33","https://t.me/willigedamen/38","https://t.me/willigedamen/36",
  "https://t.me/willigedamen/35","https://t.me/willigedamen/32","https://t.me/willigedamen/37","https://t.me/willigedamen/30",
  "https://t.me/willigedamen/39","https://t.me/willigedamen/40","https://t.me/willigedamen/44","https://t.me/willigedamen/41",
  "https://t.me/willigedamen/47","https://t.me/willigedamen/42","https://t.me/willigedamen/48","https://t.me/willigedamen/46",
  "https://t.me/willigedamen/43","https://t.me/willigedamen/45","https://t.me/willigedamen/50","https://t.me/willigedamen/53",
  "https://t.me/willigedamen/51","https://t.me/willigedamen/52","https://t.me/willigedamen/58","https://t.me/willigedamen/55",
  "https://t.me/willigedamen/54","https://t.me/willigedamen/57","https://t.me/willigedamen/49","https://t.me/willigedamen/56",
  "https://t.me/willigedamen/59","https://t.me/willigedamen/60","https://t.me/willigedamen/62","https://t.me/willigedamen/65",
  "https://t.me/willigedamen/61","https://t.me/willigedamen/64","https://t.me/willigedamen/68","https://t.me/willigedamen/63",
  "https://t.me/willigedamen/69","https://t.me/willigedamen/67","https://t.me/willigedamen/71","https://t.me/willigedamen/70",
  "https://t.me/willigedamen/78","https://t.me/willigedamen/77","https://t.me/willigedamen/75","https://t.me/willigedamen/74",
  "https://t.me/willigedamen/76","https://t.me/willigedamen/72","https://t.me/willigedamen/73","https://t.me/willigedamen/79",
  "https://t.me/willigedamen/81","https://t.me/willigedamen/80","https://t.me/willigedamen/83","https://t.me/willigedamen/82",
  "https://t.me/willigedamen/89","https://t.me/willigedamen/85","https://t.me/willigedamen/88","https://t.me/willigedamen/84",
  "https://t.me/willigedamen/87","https://t.me/willigedamen/86","https://t.me/willigedamen/91","https://t.me/willigedamen/90",
  "https://t.me/willigedamen/93","https://t.me/willigedamen/95","https://t.me/willigedamen/94","https://t.me/willigedamen/92",
  "https://t.me/willigedamen/98","https://t.me/willigedamen/97","https://t.me/willigedamen/96","https://t.me/willigedamen/99",
  "https://t.me/willigedamen/100","https://t.me/willigedamen/104","https://t.me/willigedamen/101","https://t.me/willigedamen/103",
  "https://t.me/willigedamen/108","https://t.me/willigedamen/102","https://t.me/willigedamen/107","https://t.me/willigedamen/106",
  "https://t.me/willigedamen/105","https://t.me/willigedamen/109","https://t.me/willigedamen/110","https://t.me/willigedamen/112",
  "https://t.me/willigedamen/111","https://t.me/willigedamen/113","https://t.me/willigedamen/114"
];

// ---------------- ERZEUGT 2 GIRLS PRO STADT ----------------
const GIRLS_PER_CITY = {};
let linkIndex = 0;
Object.entries(STÄDTE).forEach(([country, cities])=>{
  cities.forEach(city=>{
    GIRLS_PER_CITY[city] = [];
    for(let i=0;i<2;i++){
      if(linkIndex >= ALL_LINKS.length) linkIndex = 0; // falls Links ausgehen, wieder von vorne
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

// ---------------- RANDOM GIRL ANZEIGEN ----------------
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
      [Markup.button.callback("➡️ Nächstes","NEXT")],
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
  await ctx.editMessageText(
    "💳 Zahlungsmethode wählen:",
    Markup.inlineKeyboard([
      [Markup.button.callback("PayPal","PAY_PAYPAL")],
      [Markup.button.callback("Amazon","PAY_AMAZON")],
      [Markup.button.callback("Bitsa","PAY_BITSA")],
      [Markup.button.callback("◀️ Zurück","NEXT")]
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
