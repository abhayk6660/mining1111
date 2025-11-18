const mineflayer = require("mineflayer");

// Block is directly in FRONT → offset (0,0,1)
const TARGET_OFFSET = { x: 0, y: 0, z: 1 };

function createBot() {
    const bot = mineflayer.createBot({
        host: "mc.leftypvp.net",
        port: 25565,
        username: "antkind",
        auth: "offline",
        version: "1.21.1"
    });

    bot.once("login", () => {
        console.log("✔ Logged in!");
    });

    bot.once("spawn", () => {
        console.log("✔ Spawned!");

        setTimeout(() => bot.chat("/login 86259233"), 1500);
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        // Wait before mining (prevents assertion errors)
        setTimeout(() => safeStartMining(bot), 9000);
    });

    bot.on("kicked", r => console.log("❌ Kicked:", r));
    bot.on("error", e => console.log("⚠ Error:", e));

    bot.on("end", () => {
        console.log("🔁 Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });
}

function safeStartMining(bot) {
    if (!bot.entity) {
        console.log("⏳ Bot not ready, retrying...");
        return setTimeout(() => safeStartMining(bot), 1000);
    }

    console.log("⛏ Mining started — HOLD CLICK + NO ROTATION");
    startMining(bot);
}

// NO ROTATION + HOLD-CLICK MINING
function startMining(bot) {
    // Lock bot rotation at spawn
    const yawLocked = bot.entity.yaw;
    const pitchLocked = bot.entity.pitch;

    // Freeze rotation forever
    setInterval(() => {
        bot.entity.yaw = yawLocked;
        bot.entity.pitch = pitchLocked;
    }, 40);

    // Hold left click
    function attackLoop() {
        try {
            bot.setControlState("attack", true);
        } catch {}
        setTimeout(attackLoop, 50);
    }

    attackLoop();
}

createBot();
