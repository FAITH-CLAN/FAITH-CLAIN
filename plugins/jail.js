module.exports = {
  command: 'jail',
  aliases: ['gaol'],
  category: 'fun',
  description: 'Put someone in (roleplay) jail for fun',
  usage: '.jail @user',
  async handler(sock, message, args = [], context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const by = message.key.participant || message.key.remoteJid;
    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      || message.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❗ Mention someone to send to jail.' }, { quoted: message });
    await sock.sendMessage(chatId, {
      text: `🚓 @${target.split('@')[0]} is jailed by @${by.split('@')[0]} for being mischievous (roleplay).`,
      mentions: [target, by]
    }, { quoted: message });
  }
};
