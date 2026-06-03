const CommandHandler = require('../lib/commandHandler');
const settings = require("../settings");
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'menu',
  aliases: ['m', 'help', 'start'],
  category: 'general',
  description: 'Display the main menu with bot image',
  usage: '.menu',
  isPrefixless: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      // Load bot image - this will be displayed first
      const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
      let imageBuffer = null;

      if (fs.existsSync(imagePath)) {
        imageBuffer = fs.readFileSync(imagePath);
      }

      // Create main menu text
      let menuText = `╔════════════════════════════════╗\n`;
      menuText += `║ 🤖 *${settings.botName || 'NEGO-CLAN'} BOT* 🤖\n`;
      menuText += `╚════════════════════════════════╝\n\n`;
      
      menuText += `✨ *Welcome to ${settings.botName || 'NEGO-CLAN'} Bot!* ✨\n\n`;
      
      menuText += `📋 *BOT INFORMATION*\n`;
      menuText += `┌─────────────────────────────────\n`;
      menuText += `│ 📱 Name: ${settings.botName}\n`;
      menuText += `│ 👤 Owner: ${settings.botOwner}\n`;
      menuText += `│ 🔖 Version: ${settings.version}\n`;
      menuText += `│ ⏰ Created: 2024\n`;
      menuText += `│ 🌐 Status: 🟢 Online\n`;
      menuText += `└─────────────────────────────────\n\n`;

      menuText += `🎯 *ALL COMMANDS*\n`;
      menuText += `┌─────────────────────────────────\n`;

      const categories = Array.from(CommandHandler.categories.keys()).sort();
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const commands = CommandHandler.getCommandsByCategory(cat).slice().sort();
        const count = commands.length;
        const isLast = i === categories.length - 1;
        
        const prefix = isLast ? '└' : '├';
        const emoji = getRandomEmoji(getCategoryEmojis(cat));
        
        menuText += `${prefix} ${emoji} *${cat.toUpperCase()}* (${count} commands)\n`;
        for (const cmdName of commands) {
          menuText += `│   ${settings.prefixes[0] || '.'}${cmdName}\n`;
        }
        if (!isLast) menuText += `│\n`;
      }

      menuText += `\n📝 *HOW TO USE*\n`;
      menuText += `┌─────────────────────────────────\n`;
      menuText += `│ Use: ${settings.prefixes[0] || '.'}<command>\n`;
      menuText += `│ Example: ${settings.prefixes[0] || '.'} alive\n`;
      menuText += `│ Type: ${settings.prefixes[0] || '.'} smenu - For detailed menu\n`;
      menuText += `└─────────────────────────────────\n\n`;

      menuText += `🔗 *LINKS & INFO*\n`;
      menuText += `┌─────────────────────────────────\n`;
      if (settings.channelLink) {
        menuText += `│ 📱 Channel: ${settings.channelLink}\n`;
      }
      if (settings.ytch) {
        menuText += `│ 📺 YouTube: ${settings.ytch}\n`;
      }
      menuText += `│ 📧 Total Commands: ${CommandHandler.commands.size}\n`;
      menuText += `└─────────────────────────────────\n\n`;

      menuText += `💡 *TIPS*\n`;
      menuText += `• Type ${settings.prefixes[0] || '.'} smenu for advanced menu\n`;
      menuText += `• Type ${settings.prefixes[0] || '.'} list for command list\n`;
      menuText += `• Type ${settings.prefixes[0] || '.'} alive to check bot status\n\n`;

      menuText += `🌟 Made with ❤️ by ${settings.botOwner}`;

      // Send message with image when the menu is small enough to fit a caption
      const useImage = imageBuffer && menuText.length <= 800;
      if (useImage) {
        await sock.sendMessage(chatId, {
          image: imageBuffer,
          caption: menuText
        }, { quoted: message });
      } else {
        // Fallback or large menu: send plain text to ensure full command list is delivered
        await sock.sendMessage(chatId, {
          text: menuText
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Menu Error:', error);
      await sock.sendMessage(chatId, { 
        text: `❌ *Menu Error*\n\n${error.message}`
      }, { quoted: message });
    }
  }
};

function getRandomEmoji(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCategoryEmojis(category) {
  const categoryEmojis = {
    general: ['📱', '🔧', '⚙️', '🛠️'],
    owner: ['👑', '🔱', '💎', '🎖️'],
    admin: ['🛡️', '⚔️', '🔐', '👮'],
    group: ['👥', '👫', '🧑‍🤝‍🧑', '👨‍👩‍👧‍👦'],
    download: ['📥', '⬇️', '💾', '📦'],
    ai: ['🤖', '🧠', '💭', '🎯'],
    search: ['🔍', '🔎', '🕵️', '📡'],
    apks: ['📲', '📦', '💿', '🗂️'],
    info: ['ℹ️', '📋', '📊', '📄'],
    fun: ['🎮', '🎲', '🎰', '🎪'],
    stalk: ['👀', '🔭', '🕵️', '🎯'],
    games: ['🎮', '🕹️', '🎯', '🏆'],
    images: ['🖼️', '📸', '🎨', '🌄'],
    menu: ['📜', '📋', '📑', '📚'],
    tools: ['🔨', '🔧', '⚡', '🛠️'],
    stickers: ['🎭', '😀', '🎨', '🖼️'],
    quotes: ['💬', '📖', '✍️', '💭'],
    music: ['🎵', '🎶', '🎧', '🎤'],
    utility: ['📂', '🔧', '⚙️', '🛠️']
  };
  return categoryEmojis[category.toLowerCase()] || ['📂', '📁', '🗂️', '📋'];
}
