import { Telegraf, Markup } from "telegraf";

// ----------------- CONFIG -----------------
if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN fehlt");

// Admin-ID optional setzen, sonst Warnung und Bot läuft weiter
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;
if (!ADMIN_ID) console.warn("⚠️ WARNUNG: ADMIN_ID nicht gesetzt! Anfragen können nicht weitergeleitet werden.");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ----------------- STÄDTE -----------------
const STÄDTE = {
  DE: ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hannover","Nürnberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster"],
  AT: ["Wien","Graz","Salzburg","Linz","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Steyr","Feldkirch","Bregenz","Leoben","Kapfenberg"],
  CH: ["Zürich","Genf","Basel","Bern","Lausanne","Winterthur","St. Gallen","Lugano","Biel","Thun","Köniz","La Chaux-de-Fonds","Schaffhausen","Fribourg","Chur"]
};

// ----------------- START -----------------
const showMainMenu = async (ctx) => {
  await ctx.reply(
    "👋 Willkommen zu deinem F+ Bot",
    Markup.inlineKeyboard([[Markup.button.callback("👉 Hier starten", "START_FLOW")]])
  );
};

bot.start((ctx) => showMainMenu(ctx));

// ----------------- BUTTON HANDLER -----------------
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
  ctx.session = ctx.session || {};
  ctx.session.land = land;

  const buttons = STÄDTE[land].map(stadt => [Markup.button.callback(stadt, `CITY_${stadt}`)]);
  buttons.push([Markup.button.callback("◀️ Zurück", "START_FLOW")]);

  await ctx.editMessageText(`Bitte wähle deine Stadt in ${land}:`, Markup.inlineKeyboard(buttons));
});

// Stadt auswählen → Alter eingeben
bot.action(/CITY_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const stadt = ctx.match[1];
  ctx.session = ctx.session || {};
  ctx.session.stadt = stadt;
  ctx.session.step = "ALTER";

  await ctx.editMessageText(`✅ Du hast ${stadt} ausgewählt!\nBitte gib dein Alter ein:`);
});

// Alter eingeben → Kontaktart
bot.on("text", async (ctx) => {
  ctx.session = ctx.session || {};
  if (ctx.session.step === "ALTER") {
    const alter = ctx.message.text;
    if (!/^\d+$/.test(alter)) return ctx.reply("Bitte gib nur Zahlen ein.");
    ctx.session.alter = alter;
    ctx.session.step = "KONTAKTART";

    await ctx.reply(
      "Bitte wähle deine Kontaktart:",
      Markup.inlineKeyboard([
        [Markup.button.callback("Telegram", "CONTACT_TELEGRAM")],
        [Markup.button.callback("WhatsApp", "CONTACT_WHATSAPP")],
        [Markup.button.callback("◀️ Zurück", `CITY_${ctx.session.stadt}`)]
      ])
    );
  }
});

// Kontaktart → Nachricht an Admin
bot.action(/CONTACT_(TELEGRAM|WHATSAPP)/, async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.contact = ctx.match[1];

  if (ADMIN_ID) {
    const msg = `📨 Neue Vermittlungsanfrage
User: @${ctx.from.username || ctx.from.first_name}
Land: ${ctx.session.land}
Stadt: ${ctx.session.stadt}
Alter: ${ctx.session.alter}
Kontaktart: ${ctx.session.contact}`;

    await ctx.telegram.sendMessage(ADMIN_ID, msg);
    await ctx.editMessageText("✅ Deine Anfrage wurde an den Admin weitergeleitet.");
  } else {
    await ctx.editMessageText("⚠️ Admin ist nicht gesetzt. Deine Anfrage kann nicht weitergeleitet werden.");
  }

  ctx.session = {}; // reset
});

// ----------------- LAUNCH -----------------
bot.launch({ dropPendingUpdates: true });
console.log("🤖 Vermittlungs-Bot gestartet");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Fehler-Handler
bot.catch((err, ctx) => {
  console.error(`Fehler bei UpdateType ${ctx.updateType}:`, err);
});
