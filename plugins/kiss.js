const owners = require('../data/owner.json');
const { fetchAnimeImage } = require('../lib/animeImage');

module.exports = {
  command: 'kiss',
  aliases: [],
  category: 'fun',
  description: 'Send a kiss animation to someone',
  usage: '.kiss @user (or reply)',

  async handler(sock, message, args, context = {}) {
    const { chatId } = context;
    const channelInfo = context.channelInfo || {};
    const ownerJids = (owners || []).map(n => n.includes('@') ? n : `${n}@s.whatsapp.net`);
    const sender = message.key.participant || message.key.remoteJid;

    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    let target = null;

    if (mentioned && mentioned.length) target = mentioned[0];
    else if (quotedParticipant) target = quotedParticipant;

    if (!target) {
      await sock.sendMessage(chatId, { text: '❌ Please mention someone or reply to their message to kiss them!' }, { quoted: message });
      return;
    }

    if (target === sender) {
      await sock.sendMessage(chatId, { text: '❌ You cannot kiss yourself.' }, { quoted: message });
      return;
    }

    if (ownerJids.includes(target)) {
      await sock.sendMessage(chatId, { text: '❌ You cannot perform this action on the bot owner.' }, { quoted: message });
      return;
    }

    try {
      const link = await fetchAnimeImage('kiss');
      if (link) {
        const caption = `@${sender.split('@')[0]} kisses @${target.split('@')[0]} 💋`;
        await sock.sendMessage(chatId, {
          image: { url: link },
          caption,
          mentions: [sender, target],
          ...channelInfo
        }, { quoted: message });
      } else {
        throw new Error('no image link');
      }
    } catch (err) {
      console.error('Error in kiss command:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch a kiss animation. Try again later!' }, { quoted: message });
    }
  }
};
