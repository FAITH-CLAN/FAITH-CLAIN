module.exports = {
  command: 'marry',
  aliases: ['proposal'],
  category: 'fun',
  description: 'Propose marriage to someone (playful)',
  usage: '.marry @user',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      
      if (!chatId) return;
      
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!target) {
        return sock.sendMessage(chatId, { text: '❗ Mention someone to propose to.' }, { quoted: message });
      }

      const byName = String(by).split('@')[0] || 'Someone';
      const targetName = String(target).split('@')[0] || 'Someone';
      
      // playful random acceptance
      const accepted = Math.random() < 0.5;
      if (accepted) {
        await sock.sendMessage(chatId, { 
          text: `💍 Congrats! @${targetName} accepted @${byName}'s proposal!`, 
          mentions: [target, by] 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `😅 @${targetName} politely declined @${byName}.`, 
          mentions: [target, by] 
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in marry command:', e);
    }
  }
};
