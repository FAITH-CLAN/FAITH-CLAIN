const { fetchAnimeImage } = require('../lib/animeImage');

module.exports = {
  command: 'slap',
  aliases: ['hit'],
  category: 'fun',
  description: 'Playfully slap someone by mentioning them',
  usage: '.slap @user',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      const channelInfo = context.channelInfo || {};
      
      if (!chatId) return;
      
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!target) {
        return sock.sendMessage(chatId, { text: '❗ Please mention someone to slap.' }, { quoted: message });
      }
      
      const byName = String(by).split('@')[0] || 'Someone';
      const targetName = String(target).split('@')[0] || 'Someone';
      const caption = `🤚 @${byName} slaps @${targetName} playfully!`;
      const link = await fetchAnimeImage('slap');

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
      console.error('Error in slap command:', e);
    }
  }
};
