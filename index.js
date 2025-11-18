const mineflayer = require("mineflayer");

const TARGET_OFFSET = { x: 0, y: 0, z: 1 }; // FRONT mining

function createBot() {
    const bot = mineflayer.createBot({
        host: "mc.leftypvp.net",
        port: 25565,
        username: "antkind",
        auth: "offline",
        version: "1.21.1"
    });

    bot.once("spawn", () => {
        setTimeout(() => bot.chat("/login 86259233"), 1500);
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);
        setTimeout(() => safeStartMining(bot), 9000);
    });

    bot.on("end", () => setTimeout(createBot, 5000));
}

function safeStartMining(bot) {
    if (!bot.entity) return setTimeout(() => safeStartMining(bot), 1000);
    console.log("⛏ Starting targeted block mining...");
    startAccurateMining(bot);
}

//
// 🔥 REAL FIX: RAYTRACE + CAMERA ONLY AIM + HOLD CLICK
//
function startAccurateMining(bot) {
    // Lock body rotation
    const lockYaw = bot.entity.yaw;
    const lockPitch = bot.entity.pitch;
    setInterval(() => {
        bot.entity.yaw = lockYaw;
        bot.entity.pitch = lockPitch;
    }, 30);

    // Mining loop
    async function mineLoop() {
        try {
            const blockPos = bot.entity.position.offset(
                TARGET_OFFSET.x,
                TARGET_OFFSET.y,
                TARGET_OFFSET.z
            );

            const block = bot.blockAt(blockPos);
            if (!block || block.type === 0) {
                return setTimeout(mineLoop, 80);
            }

            // AIM AT BLOCK using camera ONLY (NOT rotation)
            await bot.lookAt(block.position.offset(0.5, 0.5, 0.5), true);

            // HOLD LEFT CLICK
            bot.setControlState("attack", true);

        } catch (err) {
            console.log("Mining error:", err.message);
        }

        setTimeout(mineLoop, 60);
    }

    mineLoop();
}

createBot();
