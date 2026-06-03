const { fetchAnimeImage } = require('../lib/animeImage');

module.exports = {
  command: 'kill',
  aliases: ['frag'],
  category: 'fun',
  description: 'Pretend-kill someone (non-graphic, playful)',
  usage: '.kill @user',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      const channelInfo = context.channelInfo || {};
      
      if (!chatId) return;
      
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!target) {
        return sock.sendMessage(chatId, { text: '❗ Mention someone to pretend-kill.' }, { quoted: message });
      }
      
      const byName = String(by).split('@')[0] || 'Someone';
      const targetName = String(target).split('@')[0] || 'Someone';
      const caption = `💀 @${byName} has vanquished @${targetName}! (playfight, no harm)`;
      const link = await fetchAnimeImage('kill');

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
      console.error('Error in kill command:', e);
    }
  }
};
