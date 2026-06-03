module.exports = {
  command: 'cry',
  aliases: ['tears','sadcry'],
  category: 'fun',
  description: 'Cry or make someone cry (playful)',
  usage: '.cry [@user]',
  async handler(sock, message, args = [], context = {}) {
    try {
      const chatId = context.chatId || message?.key?.remoteJid;
      const by = message?.key?.participant || message?.key?.remoteJid || 'Someone';
      
      if (!chatId) return;
      
      const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      
      const byName = String(by).split('@')[0] || 'Someone';
      
      if (target) {
        const targetName = String(target).split('@')[0] || 'Someone';
        await sock.sendMessage(chatId, { 
          text: `😭 @${targetName} made @${byName} cry! (jk)`, 
          mentions: [target, by] 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `😭 @${byName} is crying... who hurt you?`, 
          mentions: [by] 
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in cry command:', e);
    }
  }
};
