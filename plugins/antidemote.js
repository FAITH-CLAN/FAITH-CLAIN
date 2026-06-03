let listenersAttached = false;

async function antidemoteCommand(sock, chatId, message, args = []) {
  try {
    const action = args[0]?.toLowerCase();

    global.db = global.db || { data: { chats: {} } };
    const chat = global.db.data.chats[chatId] || (global.db.data.chats[chatId] = {});

    if (action === 'on') {
      chat.antidemote = true;
      if (!listenersAttached) {
        attachListeners(sock);
        listenersAttached = true;
      }

      await sock.sendMessage(chatId, { text: '🛡️ Anti-Demote Activated' }, { quoted: message });
    } else if (action === 'off') {
      chat.antidemote = false;
      await sock.sendMessage(chatId, { text: '❌ Anti-Demote OFF' }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: 'Usage:\n.antidemote on/off' }, { quoted: message });
    }
  } catch (error) {
    console.error('Error in antidemoteCommand:', error);
    await sock.sendMessage(chatId, { text: '❌ Error processing antidemote command.' }, { quoted: message }).catch(console.error);
  }
}

function attachListeners(sock) {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const chat = global.db?.data?.chats?.[anu.id];
      if (!chat?.antidemote) return;
      if (anu.action !== 'demote') return;

      const demoted = Array.isArray(anu.participants) ? anu.participants : [];
      if (demoted.length === 0) return;

      const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const executor = anu.author || 'unknown';
      const participantsToRestore = demoted.filter(jid => jid !== botJid);
      if (participantsToRestore.length === 0) return;

      await sock.groupParticipantsUpdate(anu.id, participantsToRestore, 'promote').catch(() => {});
      await sock.sendMessage(anu.id, {
        text: `🛡️ Anti-Demote: restored ${participantsToRestore.map(u => `@${u.split('@')[0]}`).join(', ')}`,
        mentions: participantsToRestore
      }).catch(() => {});
    } catch (error) {
      console.error('Anti-Demote listener error:', error);
    }
  });
}

module.exports = {
  command: 'antidemote',
  aliases: ['demoteprotect', 'demoteguard'],
  category: 'group',
  description: 'Protect admins from being demoted in the group',
  usage: '.antidemote on/off',
  async handler(sock, message, args = [], context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    return antidemoteCommand(sock, chatId, message, args);
  }
};
