const express = require("express");
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
app.get("/", (req, res) => res.send("Bot is online!"));
app.listen(3000, () => console.log("✅ Web server running"));

setInterval(() => {
  require("node-fetch")("https://your-railway-subdomain.up.railway.app/");
}, 4 * 60 * 1000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

try {
  const setupAFK = require("./features/afk");
  setupAFK(client);
} catch (e) {
  console.log("❗ AFK system not found or failed to load");
}

// BUMP DETECTOR
const DISBOARD_ID = "302050872383242240";
let lastEmbed;

client.on("messageCreate", async (message) => {
  if (
    message.author.id === DISBOARD_ID &&
    message.embeds.length &&
    message.embeds[0].description?.includes("Bump done!")
  ) {
    message.react("👍").catch(() => {});

    if (lastEmbed) {
      try {
        await lastEmbed.delete();
      } catch {}
    }

    const embed = new EmbedBuilder()
      .setDescription("Next bump available in 2 hours")
      .setColor(Math.floor(Math.random() * 16777215));
    lastEmbed = await message.channel.send({ embeds: [embed] });

    setTimeout(async () => {
      try {
        await lastEmbed.delete();
      } catch {}
      const updated = new EmbedBuilder()
        .setDescription(`Bump was available <t:${Math.floor(Date.now() / 1000)}:R>`)
        .setColor(Math.floor(Math.random() * 16777215));
      lastEmbed = await message.channel.send({ embeds: [updated] });
    }, 2 * 60 * 60 * 1000);
  }
});

client.login(process.env.TOKEN);
    
