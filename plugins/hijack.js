const settings = require('../settings');
let listenersAttached = false;

function getOwnerJids() {
  return String(settings.ownerNumber || '')
    .split(',')
    .map(o => o.replace(/[^0-9]/g, ''))
    .filter(Boolean)
    .map(o => `${o}@s.whatsapp.net`);
}

async function sendToOwners(sock, text) {
  const owners = getOwnerJids();
  if (owners.length === 0) return;

  for (const owner of owners) {
    await sock.sendMessage(owner, { text }).catch(() => {});
  }
}

async function hijackCommand(sock, chatId, message, args = []) {
  try {
    const action = args[0]?.toLowerCase();

    global.db = global.db || { data: { chats: {} } };
    const chat = global.db.data.chats[chatId] || (global.db.data.chats[chatId] = {});

    if (action === 'on') {
      chat.hijack = true;
      if (!listenersAttached) {
        attachListeners(sock);
        listenersAttached = true;
      }

      await sock.sendMessage(chatId, { text: '🚨 Hijack alerts enabled' }, { quoted: message });
    } else if (action === 'off') {
      chat.hijack = false;
      await sock.sendMessage(chatId, { text: '❌ Hijack alerts disabled' }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: 'Usage:\n.hijack on/off' }, { quoted: message });
    }
  } catch (error) {
    console.error('Error in hijackCommand:', error);
    await sock.sendMessage(chatId, { text: '❌ Error processing hijack command.' }, { quoted: message }).catch(console.error);
  }
}

function attachListeners(sock) {
  sock.ev.on('connection.update', async (update) => {
    try {
      const lastDisconnect = update.lastDisconnect;
      const isLoggedOut = !!(
        lastDisconnect?.error?.output?.statusCode === 401 ||
        String(lastDisconnect?.error?.message || '').toLowerCase().includes('loggedout')
      );

      if (update.connection === 'close' && isLoggedOut) {
        await sendToOwners(sock, '🚨 Possible bot hijack detected. The session was logged out unexpectedly. Please reauthenticate the bot immediately.');
      }
    } catch (error) {
      console.error('Hijack connection listener error:', error);
    }
  });

  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const chat = global.db?.data?.chats?.[anu.id];
      if (!chat?.hijack) return;
      if (!['demote', 'remove', 'promote'].includes(anu.action)) return;

      const executor = anu.author || 'unknown';
      const targets = Array.isArray(anu.participants) ? anu.participants : [];
      const mentionList = targets.filter(Boolean);

      await sock.sendMessage(anu.id, {
        text: `🚨 Hijack alert: detected ${anu.action} action by @${executor.split('@')[0]} on ${mentionList.map(u => `@${u.split('@')[0]}`).join(', ')}`,
        mentions: [executor, ...mentionList]
      }).catch(() => {});
    } catch (error) {
      console.error('Hijack group listener error:', error);
    }
  });
}

module.exports = {
  command: 'hijack',
  aliases: ['hijackprotect', 'hijackalert'],
  category: 'group',
  description: 'Enable hijack alerts and event tracking for the current group',
  usage: '.hijack on/off',
  async handler(sock, message, args = [], context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    return hijackCommand(sock, chatId, message, args);
  }
};
