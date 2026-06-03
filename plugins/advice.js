const { fetchAnimeImage } = require('../lib/animeImage');

module.exports = {
  command: 'advice',
  aliases: ['tip','suggestion','adviceme'],
  category: 'fun',
  description: 'Get random advice or give advice to someone',
  usage: '.advice [@user]',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      const channelInfo = context.channelInfo || {};
      
      if (!chatId) return;
      
      const adviceList = [
        'Stay hydrated! 💧',
        'Get enough sleep! 😴',
        'Exercise regularly! 🏃',
        'Eat healthy! 🥗',
        'Be kind to others! 💖',
        'Take breaks! 🌅',
        'Stay positive! ✨',
        'Learn something new! 📚',
        'Help someone today! 🤝',
        'Smile more! 😊',
        'Follow your dreams! 🚀',
        'Be yourself! 🌟',
        'Listen more! 👂',
        'Take a walk! 🚶',
        'Meditate! 🧘'
      ];
      
      const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
      const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const byName = String(by).split('@')[0] || 'Someone';
      const caption = target
        ? `💡 Advice for @${String(target).split('@')[0]} from @${byName}: ${randomAdvice}`
        : `💡 Advice: ${randomAdvice}`;
      const link = await fetchAnimeImage('advice');

      if (link) {
        await sock.sendMessage(chatId, {
          image: { url: link },
          caption,
          mentions: target ? [target, by] : [by],
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: caption,
          mentions: target ? [target, by] : [by],
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in advice command:', e);
    }
  }
};
