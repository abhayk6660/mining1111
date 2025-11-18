const mineflayer = require("mineflayer");
const Vec3 = require('vec3');

// CONFIG: adjust if needed
const SERVER = "mc.leftypvp.net";
const PORT = 25565;
const USERNAME = "antkind";
const PASSWORD = "86259233";
const WARP_CMD = "/is warp abhay6660 mining";

// BLOCK TARGET relative to bot when it is in the exact desired standing position
// For "in front" use {x:0,y:0,z:1}. You previously chose front => default is front.
const TARGET_OFFSET = { x: 0, y: 0, z: 1 };

// Interval times (ms)
const START_DIG_INTERVAL = 80;   // how often we send the "start destroy" packet
const LOOK_INTERVAL = 140;       // how often to retarget camera
const LOCK_ROTATION_INTERVAL = 50; // how often to re-lock body rotation

function createBot() {
  const bot = mineflayer.createBot({
    host: SERVER,
    port: PORT,
    username: USERNAME,
    auth: "offline",
    version: "1.21.1"
  });

  bot.once("login", () => console.log("✔ Logged in"));
  bot.once("spawn", () => {
    console.log("✔ Spawned — sending login & warp");
    setTimeout(() => bot.chat(`/login ${PASSWORD}`), 1200);
    setTimeout(() => bot.chat(WARP_CMD), 3200);

    // start after warp/time to load
    setTimeout(() => safeStart(bot), 9000);
  });

  bot.on("kicked", r => console.log("❌ Kicked:", r));
  bot.on("error", e => console.log("⚠ Error:", e && e.message ? e.message : e));
  bot.on("end", () => {
    console.log("🔁 Disconnected — reconnecting in 5s");
    setTimeout(createBot, 5000);
  });
}

function safeStart(bot) {
  if (!bot.entity) {
    console.log("Bot entity not ready, retrying...");
    return setTimeout(() => safeStart(bot), 800);
  }
  console.log("⛏ Entering accurate hold-dig mode (no movement, locked body rotation).");
  startHoldDig(bot);
}

function startHoldDig(bot) {
  // compute the absolute target position from the bot current position
  const targetPos = bot.entity.position.offset(TARGET_OFFSET.x, TARGET_OFFSET.y, TARGET_OFFSET.z).floored();

  console.log("Target block pos (expected):", targetPos);

  // Lock body rotation (so bot body never rotates)
  const lockedYaw = bot.entity.yaw;
  const lockedPitch = bot.entity.pitch;
  const lockTimer = setInterval(() => {
    try {
      bot.entity.yaw = lockedYaw;
      bot.entity.pitch = lockedPitch;
    } catch (e) {}
  }, LOCK_ROTATION_INTERVAL);

  // Camera-only aiming (does not change body rotation). Use true to preserve body.
  const lookTimer = setInterval(async () => {
    try {
      const block = bot.blockAt(targetPos);
      if (block) {
        // lookAt with `true` (cameraOnly) avoids changing body yaw/pitch
        await bot.lookAt(block.position.offset(0.5, 0.5, 0.5), true).catch(() => {});
      }
    } catch (e) {}
  }, LOOK_INTERVAL);

  // Re-equip best pickaxe if possible (optional, harmless)
  async function equipBestPickaxe() {
    try {
      const items = bot.inventory.items();
      const order = ["netherite_pickaxe","diamond_pickaxe","iron_pickaxe","stone_pickaxe","wooden_pickaxe","golden_pickaxe"];
      for (const name of order) {
        const it = items.find(i => i && i.name === name);
        if (it) {
          await bot.equip(it, "hand").catch(()=>{});
          return true;
        }
      }
    } catch (e) {}
    return false;
  }
  equipBestPickaxe();

  // Low-level: repeatedly send START_DESTROY (and occasional STOP) packets to emulate hold-click.
  // We try a few packet names for compatibility.
  const sendStartDestroy = (pos, face) => {
    const location = { x: pos.x, y: pos.y, z: pos.z };
    // try common packet names
    try {
      // Modern name used by many versions
      bot._client.write && bot._client.write('player_block_dig', { status: 0, location, face });
      return;
    } catch (e) {}
    try {
      // alternative name used previously
      bot._client.write && bot._client.write('block_dig', { status: 0, location, face });
      return;
    } catch (e) {}
    try {
      // some protocol wrappers use this
      bot._client.write && bot._client.write('player_action', { action: 0, location, face });
      return;
    } catch (e) {}
    // If all fail, fallback to bot.dig as last resort
    // (bot.dig may restart progress, but keep it as backup)
    try {
      const block = bot.blockAt(pos);
      if (block) bot.dig(block).catch(()=>{});
    } catch (e) {}
  };

  // Need a face value: choose UP (1) or the face facing the bot. We'll default to 1 (top)
  // If digging front block, face value doesn't usually break things.
  const face = 1;

  const startTimer = setInterval(() => {
    try {
      // check block is present and not air
      const block = bot.blockAt(targetPos);
      if (!block || block.type === 0) {
        // nothing to dig (air) -> do nothing
        return;
      }
      // ensure pickaxe equipped if possible
      if (!bot.heldItem || !bot.heldItem.name || !bot.heldItem.name.toLowerCase().includes('pick')) {
        equipBestPickaxe();
      }
      // send start destroy repeatedly to hold damage progress
      sendStartDestroy(targetPos, face);
    } catch (err) {
      // log minimally but don't crash
      console.log("Mining error:", (err && err.message) ? err.message : err);
    }
  }, START_DIG_INTERVAL);

  // Optionally send periodic STOP packet and then START again to keep server happy:
  const refreshTimer = setInterval(() => {
    try {
      const block = bot.blockAt(targetPos);
      if (!block) return;
      // send abort then start (to avoid some server timeouts)
      try { bot._client.write && bot._client.write('player_block_dig', { status: 1, location: {x:targetPos.x,y:targetPos.y,z:targetPos.z}, face }); } catch (_) {}
      try { bot._client.write && bot._client.write('player_block_dig', { status: 0, location: {x:targetPos.x,y:targetPos.y,z:targetPos.z}, face }); } catch (_) {}
    } catch (e) {}
  }, 4000);

  // Clean-up if bot ends
  bot.once('end', () => {
    clearInterval(lockTimer);
    clearInterval(lookTimer);
    clearInterval(startTimer);
    clearInterval(refreshTimer);
  });

  // Console confirmation
  console.log("Started hold-dig loop at", targetPos.toString());
}

createBot();
