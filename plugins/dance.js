module.exports = {
  command: 'dance',
  aliases: ['boogie','danceparty'],
  category: 'fun',
  description: 'Make someone dance or start a dance party',
  usage: '.dance [@user]',
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
          text: `🕺 @${targetName} is dancing thanks to @${byName}!`, 
          mentions: [target, by] 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `🪩 Dance party started by @${byName}! Everyone dance!`, 
          mentions: [by] 
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Error in dance command:', e);
    }
  }
};
