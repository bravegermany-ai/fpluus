import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters
)

# -------- CONFIG --------
BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID"))

# Städte je Land
de_städte = ["Berlin", "Hamburg", "München", "Köln", "Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hannover","Nürnberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster"]
at_städte = ["Wien","Graz","Salzburg","Linz","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Steyr","Feldkirch","Bregenz","Leoben","Kapfenberg"]
ch_städte = ["Zürich","Genf","Basel","Bern","Lausanne","Winterthur","St. Gallen","Lugano","Biel","Thun","Köniz","La Chaux-de-Fonds","Schaffhausen","Fribourg","Chur"]

# -------- /start --------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("👉 Hier starten", callback_data="start_bot")]]
    await update.message.reply_text(
        "Willkommen zu deinem F+ Bot",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

# -------- BUTTON HANDLER --------
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Start → Länder
    if query.data == "start_bot":
        keyboard = [
            [InlineKeyboardButton("🇩🇪 Deutschland", callback_data="country_de")],
            [InlineKeyboardButton("🇦🇹 Österreich", callback_data="country_at")],
            [InlineKeyboardButton("🇨🇭 Schweiz", callback_data="country_ch")]
        ]
        await query.message.edit_text(
            "Bitte wähle dein Land:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    # Länder → Städte
    elif query.data.startswith("country_"):
        land = query.data.split("_")[1]
        if land == "de": städte = de_städte
        elif land == "at": städte = at_städte
        elif land == "ch": städte = ch_städte
        else: städte = []

        keyboard = [[InlineKeyboardButton(stadt, callback_data=f"city_{stadt}")] for stadt in städte]
        keyboard.append([InlineKeyboardButton("◀️ Zurück", callback_data="start_bot")])
        await query.message.edit_text(
            f"Bitte wähle deine Stadt in {land.upper()}:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    # Stadt → Alter eingeben
    elif query.data.startswith("city_"):
        stadt = query.data.split("_")[1]
        context.user_data["stadt"] = stadt
        context.user_data["step"] = "alter"
        await query.message.edit_text(f"✅ Du hast {stadt} ausgewählt!\nBitte gib dein Alter ein:")

    # Zahlungsart → an Admin senden
    elif query.data.startswith("pay_"):
        zahlungsart = query.data.split("_")[1]
        context.user_data["zahlung"] = zahlungsart

        stadt = context.user_data.get("stadt")
        alter = context.user_data.get("alter")
        msg = (
            "📨 Neue Vermittlungsanfrage\n\n"
            f"Stadt: {stadt}\n"
            f"Alter: {alter}\n"
            f"Zahlungsart: {zahlungsart}\n"
            f"User: @{update.effective_user.username}"
        )
        await context.bot.send_message(chat_id=ADMIN_ID, text=msg)
        await query.message.edit_text("✅ Deine Anfrage wurde an den Admin weitergeleitet.")
        context.user_data.clear()

# -------- TEXT HANDLER (Alter) --------
async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    step = context.user_data.get("step")
    if step == "alter":
        alter = update.message.text
        if not alter.isdigit():
            await update.message.reply_text("Bitte nur Zahlen eingeben.")
            return
        context.user_data["alter"] = alter
        context.user_data["step"] = "zahlung"

        keyboard = [
            [InlineKeyboardButton("💳 Kreditkarte", callback_data="pay_card")],
            [InlineKeyboardButton("💸 PayPal", callback_data="pay_paypal")],
            [InlineKeyboardButton("💰 Bar / Überweisung", callback_data="pay_cash")],
            [InlineKeyboardButton("◀️ Zurück", callback_data="city_back")]
        ]
        await update.message.reply_text(
            "Bitte wähle deine Zahlungsart:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

# -------- MAIN --------
def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    print("Bot läuft…")
    app.run_polling()

if __name__ == "__main__":
    main()
