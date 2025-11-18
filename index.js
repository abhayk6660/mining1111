const mineflayer = require("mineflayer");

// Block is on RIGHT side → confirmed by screenshot
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

    bot.once("spawn", () => {
        console.log("✔ Spawned!");

        // Auto login
        setTimeout(() => bot.chat("/login 86259233"), 1500);

        // Auto warp
        setTimeout(() => bot.chat("/is warp abhay6660 mining"), 3500);

        // Start mining after warp is done
        setTimeout(() => safeStartMining(bot), 9000);
    });

    bot.on("kicked", r => console.log("❌ Kicked:", r));
    bot.on("error", e => console.log("⚠ Error:", e));

    bot.on("end", () => {
        console.log("🔁 Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });
}

// Wait until bot.entity exists → prevents ERR_ASSERTION
function safeStartMining(bot) {
    if (!bot.entity) {
        console.log("⏳ Bot not ready, retrying mining start...");
        return setTimeout(() => safeStartMining(bot), 1000);
    }
    console.log("⛏ Mining started — HOLD CLICK + NO ROTATION ACTIVE");
    startMining(bot);
}

// ===============================
// REAL HOLD-LEFT-CLICK MINING + NO ROTATION
// ===============================
function startMining(bot) {

    // Lock rotation where bot spawned
    const lockedYaw = bot.entity.yaw;
    const lockedPitch = bot.entity.pitch;

    // Freeze rotation permanently
    setInterval(() => {
        bot.entity.yaw = lockedYaw;
        bot.entity.pitch = lockedPitch;
    }, 40);

    // Hold LEFT-CLICK forever (real mining simulation)
    function attackLoop() {
        try {
            bot.setControlState("attack", true);  // HOLD LEFT-CLICK
        } catch {}

        setTimeout(attackLoop, 50); // NEVER RELEASE ATTACK
    }

    // Optional: ensure we always face generator direction
    // But NO rotation happens because yaw/pitch is locked

    function faceBlockLoop() {
        const pos = bot.entity.position.offset(
            TARGET_OFFSET.x,
            TARGET_OFFSET.y,
            TARGET_OFFSET.z
        );
        bot.lookAt(pos, true).catch(() => {});
        setTimeout(faceBlockLoop, 150);
    }

    // Comment this out if you don't want ANY look movement:
    // faceBlockLoop();

    attackLoop(); // Start mining
}

createBot();

