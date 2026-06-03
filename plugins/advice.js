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
      
      if (target) {
        const targetName = String(target).split('@')[0] || 'Someone';
        await sock.sendMessage(chatId, { 
          text: `💡 Advice for @${targetName} from @${byName}: ${randomAdvice}`, 
          mentions: [target, by] 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `💡 Advice: ${randomAdvice}`, 
          mentions: [by] 
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in advice command:', e);
    }
  }
};
