const mineflayer = require("mineflayer");

function createBot() {
    const bot = mineflayer.createBot({
        host: "mc.leftypvp.net",
        port: 25565,
        username: "antkind",
        auth: "offline",
        version: "1.21.1"
    });

    bot.once("spawn", () => {
        console.log("✔ Spawned");

        // login
        setTimeout(() => bot.chat("/login 86259233"), 1500);

        // warp
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        // start attack loop
        setTimeout(() => startSimpleAttack(bot), 8000);
    });

    bot.on("kicked", r => console.log("❌ Kicked:", r));
    bot.on("error", e => console.log("⚠ Error:", e));
    bot.on("end", () => {
        console.log("🔁 Reconnecting...");
        setTimeout(createBot, 5000);
    });
}

// ⭐ SUPER SIMPLE: HOLD LEFT CLICK FOREVER ⭐
function startSimpleAttack(bot) {
    console.log("⛏ SIMPLE ATTACK MINING ENABLED");

    // Lock rotation (never rotate)
    const yaw = bot.entity.yaw;
    const pitch = bot.entity.pitch;
    setInterval(() => {
        bot.entity.yaw = yaw;
        bot.entity.pitch = pitch;
    }, 50);

    // Hold left click every tick
    setInterval(() => {
        try {
            bot.setControlState("attack", true); // HOLD ATTACK
        } catch {}
    }, 30);

    console.log("🔥 Bot is now PERMANENTLY ATTACKING in front");
}

createBot();
