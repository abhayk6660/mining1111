const mineflayer = require("mineflayer");

// Right-side block mining
const TARGET_OFFSET = { x: 1, y: 0, z: 0 };

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

    bot.once("spawn", async () => {
        console.log("✔ Spawned!");

        setTimeout(() => bot.chat("/login 86259233"), 1500);
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        // DELAY START OF MINING TO FIX ERR_ASSERTION
        setTimeout(() => safeStartMining(bot), 9000);
    });

    bot.on("kicked", (r) => console.log("❌ Kicked:", r));
    bot.on("error", (e) => console.log("⚠ Error:", e));

    bot.on("end", () => {
        console.log("🔁 Reconnecting in 5 sec...");
        setTimeout(createBot, 5000);
    });
}

// SAFE mining start (prevents ERR_ASSERTION)
function safeStartMining(bot) {
    if (!bot.entity) {
        console.log("⚠ Bot not fully loaded yet, retrying mining start...");
        return setTimeout(() => safeStartMining(bot), 1000);
    }

    console.log("⛏ Starting safe HOLD-CLICK mining...");
    startMining(bot);
}

// HOLD CLICK mining
function startMining(bot) {

    // look loop
    async function lookLoop() {
        try {
            const pos = bot.entity.position.offset(
                TARGET_OFFSET.x, TARGET_OFFSET.y, TARGET_OFFSET.z
            );
            const block = bot.blockAt(pos);

            if (block) {
                await bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
            }
        } catch {}

        setTimeout(lookLoop, 150);
    }

    // ATTACK LOOP — now SAFE because bot is fully spawned
    function attackLoop() {
        try {
            bot.setControlState("attack", true);
        } catch (err) {
            console.log("⚠ attackLoop error, retrying:", err.message);
        }
        setTimeout(attackLoop, 80);
    }

    lookLoop();
    attackLoop();
}

createBot();
