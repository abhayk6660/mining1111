const mineflayer = require("mineflayer");
const Vec3 = require("vec3");

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

        setTimeout(() => bot.chat("/login 86259233"), 1500);
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        setTimeout(() => startTrueMining(bot), 7000);
    });

    bot.on("end", () => setTimeout(createBot, 5000));
    bot.on("error", err => console.log("⚠", err));
}

// THIS IS REAL MINING. NOT ATTACK.
function sendMinePacket(bot, action, pos) {
    try {
        bot._client.write("player_block_dig", {
            status: action,   // 0 = start, 1 = cancel, 2 = stop 
            location: { x: pos.x, y: pos.y, z: pos.z },
            face: 1
        });
    } catch (e) {
        console.log("Packet error:", e.message);
    }
}

function startTrueMining(bot) {
    console.log("⛏ TRUE BLOCK MINING ENABLED");

    // Position of block directly in front
    const pos = bot.entity.position.offset(0, 0, 1).floored();

    console.log("Target block:", pos);

    // Lock rotation
    const yaw = bot.entity.yaw;
    const pitch = bot.entity.pitch;

    setInterval(() => {
        bot.entity.yaw = yaw;
        bot.entity.pitch = pitch;
    }, 40);

    // Always aim camera only
    setInterval(() => {
        bot.lookAt(pos.offset(0.5, 0.5, 0.5), true).catch(() => {});
    }, 120);

    // MAIN MINING LOOP (uses REAL mining packets)
    setInterval(() => {
        const block = bot.blockAt(pos);
        if (!block || block.type === 0) return; // no block yet

        // START mining packet
        sendMinePacket(bot, 0, pos);

        // HOLD mining by spamming START
        sendMinePacket(bot, 0, pos);

        // SERVER WILL BREAK BLOCK automatically when damage completes
    }, 80);

    // RESET packet every few seconds (to avoid being ignored)
    setInterval(() => {
        sendMinePacket(bot, 1, pos); // cancel
        sendMinePacket(bot, 0, pos); // restart
    }, 4000);
}

createBot();
