const { EmbedBuilder } = require("discord.js");

const afkChannelId = "ID_CHANNEL_AFK"; // Ganti dengan channel AFK kamu
const afkUsers = new Map();
const thumbnails = [
  "https://i.imgur.com/1.png",
  "https://i.imgur.com/2.png",
  "https://i.imgur.com/3.png"
];

function formatAFKTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const yesterday = new Date(Date.now() - 86400000);
  const isToday = now.toDateString() === new Date().toDateString();
  const isYesterday = now.toDateString() === yesterday.toDateString();
  const day = isToday ? "Today" : isYesterday ? "Yesterday" : now.toLocaleDateString();
  return `${day} at ${hour12}:${minutes} ${ampm}`;
}

module.exports = function setupAFK(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const member = message.member;

    if (message.channel.id === afkChannelId) {
      const reason = message.content;
      const originalNick = member.nickname || member.user.username;
      await message.delete().catch(console.error);

      const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 16777215))
        .setAuthor({ name: member.user.username, iconURL: member.displayAvatarURL() })
        .setDescription(`\`\`\`\n${reason}\n\`\`\``)
        .setThumbnail(thumbnails[Math.floor(Math.random() * thumbnails.length)])
        .setFooter({
          text: `AFK Status | ${formatAFKTime()}`,
          iconURL: "https://i.imgur.com/your-icon.png"
        });

      await message.channel.send({ embeds: [embed] }).catch(console.error);
      await member.setNickname(`[AFK] ${originalNick}`.slice(0, 32)).catch(() => {});
      afkUsers.set(member.id, { reason, originalNick });
      return;
    }

    const mentioned = message.mentions.users.first();
    if (mentioned && afkUsers.has(mentioned.id)) {
      const afkInfo = afkUsers.get(mentioned.id);
      const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 16777215))
        .setDescription(`${mentioned.username} is now on AFK\nReason: \`\`\`${afkInfo.reason}\`\`\``);
      const reply = await message.reply({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 10000);
    }

    if (afkUsers.has(member.id)) {
      const afkInfo = afkUsers.get(member.id);
      await member.setNickname(afkInfo.originalNick).catch(() => {});
      afkUsers.delete(member.id);

      const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 16777215))
        .setDescription("Welcome back, I removed your AFK!");
      const reply = await message.reply({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  });
};
    
