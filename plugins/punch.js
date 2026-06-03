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
      
      if (!chatId) return;
      
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!target) {
        return sock.sendMessage(chatId, { text: '❗ Mention someone to punch.' }, { quoted: message });
      }
      
      const byName = String(by).split('@')[0] || 'Someone';
      const targetName = String(target).split('@')[0] || 'Someone';
      
      await sock.sendMessage(chatId, {
        text: `🥊 @${byName} punches @${targetName} — it was just a joke!`,
        mentions: [by, target]
      }, { quoted: message });
    } catch (e) {
      console.error('Error in punch command:', e);
    }
  }
};
