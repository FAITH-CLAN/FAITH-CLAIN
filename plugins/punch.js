const { fetchAnimeImage } = require('../lib/animeImage');

module.exports = {
  command: 'punch',
  aliases: ['punchme'],
  category: 'fun',
  description: 'Punch someone (joking)',
  usage: '.punch @user',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      const channelInfo = context.channelInfo || {};
      
      if (!chatId) return;
      
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!target) {
        return sock.sendMessage(chatId, { text: '❗ Mention someone to punch.' }, { quoted: message });
      }
      
      const byName = String(by).split('@')[0] || 'Someone';
      const targetName = String(target).split('@')[0] || 'Someone';
      const caption = `🥊 @${byName} punches @${targetName} — it was just a joke!`;
      const link = await fetchAnimeImage('punch');

      if (link) {
        await sock.sendMessage(chatId, {
          image: { url: link },
          caption,
          mentions: [by, target],
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: caption,
          mentions: [by, target],
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in punch command:', e);
    }
  }
};
