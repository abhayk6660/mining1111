const mineflayer = require("mineflayer");

// RIGHT-SIDE generator block mining with HOLD-CLICK
const TARGET_OFFSET = { x: 1, y: 0, z: 0 }; // Block on the RIGHT side

function createBot() {
    const bot = mineflayer.createBot({
        host: "mc.leftypvp.net",
        port: 25565,
        username: "antkind",
        auth: "offline",
        version: "1.21.1"
    });

    bot.on("login", () => {
        console.log("✔ Logged in!");
    });

    bot.on("spawn", async () => {
        console.log("✔ Spawned, sending login + warp");

        // /login
        setTimeout(() => bot.chat("/login 86259233"), 1500);

        // /is warp
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        // Start mining
        setTimeout(() => startMining(bot), 7000);
    });

    bot.on("kicked", (reason) => console.log("❌ Kicked:", reason));
    bot.on("error", (err) => console.log("⚠ Error:", err));

    bot.on("end", () => {
        console.log("🔁 Bot disconnected — reconnecting in 5 sec");
        setTimeout(createBot, 5000);
    });
}

// HOLD-CLICK MINING (works on all skyblock gens)
function startMining(bot) {
    console.log("⛏ HOLD-CLICK mining started (right side)");

    // Look at the block continuously
    async function lookLoop() {
        try {
            const pos = bot.entity.position.offset(
                TARGET_OFFSET.x,
                TARGET_OFFSET.y,
                TARGET_OFFSET.z
            );

            const block = bot.blockAt(pos);

            if (block) {
                await bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
            }
        } catch (e) {}

        setTimeout(lookLoop, 120);
    }

    // Hold left click forever
    function attackLoop() {
        bot.setControlState("attack", true); // hold left click
        setTimeout(attackLoop, 50);
    }

    lookLoop();
    attackLoop();
}

createBot();
