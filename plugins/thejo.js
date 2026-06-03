const thejo = `NEGO-CLAN`
module.exports = {
  command: 'thejo',
  aliases: [],
  category: 'crash zone',
  description: 'Crash zone command',
  usage: '.thejo',
  async handler(sock, message, args, context = {}) {
    const chatId = (context && context.chatId) || message.key.remoteJid;
    await sock.sendMessage(chatId, { text: thejo }, { quoted: message });
  }
};
