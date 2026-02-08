import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");

const ADMIN_USERNAME = "@zemiperle";
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- SESSION ----------------
const sessions = {};

// ---------------- NAMEN + ALTER ----------------
const NAMES = ["Anna","Laura","Lisa","Mia","Lena","Sophie","Nina","Emily","Lea","Sarah","Julia","Vanessa","Alina","Marie","Katharina","Aylin","Yasmin","Elena","Ivana","Olga","Nadia"];
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
// Alle 324 Links
const ALL_LINKS = [
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
  "https://t.me/willigedamen/44","https://t.me/willigedamen/41","https://t.me/willigedamen/47",
  "https://t.me/willigedamen/42","https://t.me/willigedamen/48","https://t.me/willigedamen/46",
  "https://t.me/willigedamen/43","https://t.me/willigedamen/45","https://t.me/willigedamen/50",
  "https://t.me/willigedamen/53","https://t.me/willigedamen/51","https://t.me/willigedamen/52",
  "https://t.me/willigedamen/58","https://t.me/willigedamen/55","https://t.me/willigedamen/54",
  "https://t.me/willigedamen/57","https://t.me/willigedamen/49","https://t.me/willigedamen/56",
  "https://t.me/willigedamen/59","https://t.me/willigedamen/60","https://t.me/willigedamen/62",
  "https://t.me/willigedamen/65","https://t.me/willigedamen/61","https://t.me/willigedamen/64",
  "https://t.me/willigedamen/68","https://t.me/willigedamen/63","https://t.me/willigedamen/69",
  "https://t.me/willigedamen/67","https://t.me/willigedamen/71","https://t.me/willigedamen/70",
  "https://t.me/willigedamen/78","https://t.me/willigedamen/77","https://t.me/willigedamen/75",
  "https://t.me/willigedamen/74","https://t.me/willigedamen/76","https://t.me/willigedamen/72",
  "https://t.me/willigedamen/73","https://t.me/willigedamen/79","https://t.me/willigedamen/81",
  "https://t.me/willigedamen/80","https://t.me/willigedamen/83","https://t.me/willigedamen/82",
  "https://t.me/willigedamen/89","https://t.me/willigedamen/85","https://t.me/willigedamen/88",
  "https://t.me/willigedamen/84","https://t.me/willigedamen/87","https://t.me/willigedamen/86",
  "https://t.me/willigedamen/91","https://t.me/willigedamen/90","https://t.me/willigedamen/93",
  "https://t.me/willigedamen/95","https://t.me/willigedamen/94","https://t.me/willigedamen/92",
  "https://t.me/willigedamen/98","https://t.me/willigedamen/97","https://t.me/willigedamen/96",
  "https://t.me/willigedamen/99","https://t.me/willigedamen/100","https://t.me/willigedamen/104",
  "https://t.me/willigedamen/101","https://t.me/willigedamen/103","https://t.me/willigedamen/108",
  "https://t.me/willigedamen/102","https://t.me/willigedamen/107","https://t.me/willigedamen/106",
  "https://t.me/willigedamen/105","https://t.me/willigedamen/109","https://t.me/willigedamen/110",
  "https://t.me/willigedamen/112","https://t.me/willigedamen/111","https://t.me/willigedamen/113",
  "https://t.me/willigedamen/114","https://t.me/willigedamen/115","https://t.me/willigedamen/116",
  "https://t.me/willigedamen/117","https://t.me/willigedamen/118","https://t.me/willigedamen/119",
  "https://t.me/willigedamen/120","https://t.me/willigedamen/121","https://t.me/willigedamen/122",
  "https://t.me/willigedamen/123","https://t.me/willigedamen/124","https://t.me/willigedamen/125",
  "https://t.me/willigedamen/126","https://t.me/willigedamen/127","https://t.me/willigedamen/128",
  "https://t.me/willigedamen/129","https://t.me/willigedamen/130","https://t.me/willigedamen/131",
  "https://t.me/willigedamen/132","https://t.me/willigedamen/133","https://t.me/willigedamen/134",
  "https://t.me/willigedamen/135","https://t.me/willigedamen/136","https://t.me/willigedamen/137",
  "https://t.me/willigedamen/138","https://t.me/willigedamen/139","https://t.me/willigedamen/140",
  "https://t.me/willigedamen/141","https://t.me/willigedamen/142","https://t.me/willigedamen/143",
  "https://t.me/willigedamen/144","https://t.me/willigedamen/145","https://t.me/willigedamen/146",
  "https://t.me/willigedamen/147","https://t.me/willigedamen/148","https://t.me/willigedamen/149",
  "https://t.me/willigedamen/150","https://t.me/willigedamen/151","https://t.me/willigedamen/152",
  "https://t.me/willigedamen/153","https://t.me/willigedamen/154","https://t.me/willigedamen/155",
  "https://t.me/willigedamen/156","https://t.me/willigedamen/157","https://t.me/willigedamen/158",
  "https://t.me/willigedamen/159","https://t.me/willigedamen/160","https://t.me/willigedamen/161",
  "https://t.me/willigedamen/181","https://t.me/willigedamen/182","https://t.me/willigedamen/183",
  "https://t.me/willigedamen/184","https://t.me/willigedamen/185","https://t.me/willigedamen/186",
  "https://t.me/willigedamen/187","https://t.me/willigedamen/188","https://t.me/willigedamen/189",
  "https://t.me/willigedamen/190","https://t.me/willigedamen/191","https://t.me/willigedamen/192",
  "https://t.me/willigedamen/193","https://t.me/willigedamen/194","https://t.me/willigedamen/195",
  "https://t.me/willigedamen/196","https://t.me/willigedamen/197","https://t.me/willigedamen/198",
  "https://t.me/willigedamen/199","https://t.me/willigedamen/200","https://t.me/willigedamen/201",
  "https://t.me/willigedamen/202","https://t.me/willigedamen/203","https://t.me/willigedamen/204",
  "https://t.me/willigedamen/205","https://t.me/willigedamen/206","https://t.me/willigedamen/207",
  "https://t.me/willigedamen/208","https://t.me/willigedamen/209","https://t.me/willigedamen/210",
  "https://t.me/willigedamen/211","https://t.me/willigedamen/212","https://t.me/willigedamen/213",
  "https://t.me/willigedamen/214","https://t.me/willigedamen/215","https://t.me/willigedamen/216",
  "https://t.me/willigedamen/217","https://t.me/willigedamen/218","https://t.me/willigedamen/219",
  "https://t.me/willigedamen/220","https://t.me/willigedamen/221","https://t.me/willigedamen/222",
  "https://t.me/willigedamen/223","https://t.me/willigedamen/224","https://t.me/willigedamen/225",
  "https://t.me/willigedamen/226","https://t.me/willigedamen/227","https://t.me/willigedamen/228",
  "https://t.me/willigedamen/229","https://t.me/willigedamen/230","https://t.me/willigedamen/231",
  "https://t.me/willigedamen/232","https://t.me/willigedamen/233","https://t.me/willigedamen/234",
  "https://t.me/willigedamen/235","https://t.me/willigedamen/236","https://t.me/willigedamen/237",
  "https://t.me/willigedamen/238","https://t.me/willigedamen/239","https://t.me/willigedamen/240",
  "https://t.me/willigedamen/241","https://t.me/willigedamen/242","https://t.me/willigedamen/243",
  "https://t.me/willigedamen/244","https://t.me/willigedamen/245","https://t.me/willigedamen/246",
  "https://t.me/willigedamen/247","https://t.me/willigedamen/248","https://t.me/willigedamen/249",
  "https://t.me/willigedamen/250","https://t.me/willigedamen/251","https://t.me/willigedamen/252",
  "https://t.me/willigedamen/253","https://t.me/willigedamen/254","https://t.me/willigedamen/255",
  "https://t.me/willigedamen/256","https://t.me/willigedamen/257","https://t.me/willigedamen/258",
  "https://t.me/willigedamen/259","https://t.me/willigedamen/270","https://t.me/willigedamen/271",
  "https://t.me/willigedamen/272","https://t.me/willigedamen/273","https://t.me/willigedamen/274",
  "https://t.me/willigedamen/275","https://t.me/willigedamen/276","https://t.me/willigedamen/277",
  "https://t.me/willigedamen/278","https://t.me/willigedamen/279","https://t.me/willigedamen/280",
  "https://t.me/willigedamen/281","https://t.me/willigedamen/282","https://t.me/willigedamen/283",
  "https://t.me/willigedamen/284","https://t.me/willigedamen/285","https://t.me/willigedamen/286",
  "https://t.me/willigedamen/287","https://t.me/willigedamen/288","https://t.me/willigedamen/289",
  "https://t.me/willigedamen/290","https://t.me/willigedamen/291","https://t.me/willigedamen/292",
  "https://t.me/willigedamen/293","https://t.me/willigedamen/294","https://t.me/willigedamen/295",
  "https://t.me/willigedamen/296","https://t.me/willigedamen/297","https://t.me/willigedamen/298",
  "https://t.me/willigedamen/299","https://t.me/willigedamen/300","https://t.me/willigedamen/301",
  "https://t.me/willigedamen/302","https://t.me/willigedamen/303","https://t.me/willigedamen/304",
  "https://t.me/willigedamen/305","https://t.me/willigedamen/306","https://t.me/willigedamen/307",
  "https://t.me/willigedamen/308","https://t.me/willigedamen/309","https://t.me/willigedamen/310",
  "https://t.me/willigedamen/311","https://t.me/willigedamen/312","https://t.me/willigedamen/313",
  "https://t.me/willigedamen/314","https://t.me/willigedamen/315","https://t.me/willigedamen/316",
  "https://t.me/willigedamen/317","https://t.me/willigedamen/318","https://t.me/willigedamen/319",
  "https://t.me/willigedamen/320","https://t.me/willigedamen/321","https://t.me/willigedamen/322",
  "https://t.me/willigedamen/323","https://t.me/willigedamen/324"
];

// ---------------- GIRLS PER CITY ----------------
const GIRLS_PER_CITY = {};
let linkIndex = 0;
Object.entries(STÄDTE).forEach(([country, cities])=>{
  cities.forEach(city=>{
    GIRLS_PER_CITY[city] = [];
    const girlsCount = Math.floor(Math.random()*3)+2; // 2–4 Mädchen pro Stadt
    for(let i=0;i<girlsCount;i++){
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
  do { index = Math.floor(Math.random()*girls.length); } while(index===s.lastIndex && girls.length>1);
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
      `Kontaktiere den Admin ${ADMIN_USERNAME}`,
      Markup.inlineKeyboard([
        [Markup.button.callback("◀️ Zurück","NEXT")]
      ])
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
