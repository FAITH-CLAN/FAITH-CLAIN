let listenersAttached = false;

async function antihijackaiCommand(sock, chatId, message, userMessage) {
  try {
    const args = (userMessage || '').trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    let chat = global.db?.data?.chats?.[chatId];
    if (!chat) {
      global.db = global.db || { data: { chats: {} } };
      chat = global.db.data.chats[chatId] = {};
    }

    if (action === 'on') {
      chat.antihijack = true;
      chat.ai = true;
      if (!listenersAttached) {
        attachListeners(sock);
        listenersAttached = true;
      }
      await sock.sendMessage(chatId, { text: '🤖 AI Anti-Hijack Activated' }, { quoted: message });
    } else if (action === 'off') {
      chat.antihijack = false;
      chat.ai = false;
      await sock.sendMessage(chatId, { text: '❌ AI Anti-Hijack OFF' }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: 'Usage:\n.antihijack on/off' }, { quoted: message });
    }
  } catch (error) {
    console.error('Error in antihijackaiCommand:', error);
    await sock.sendMessage(chatId, { text: '❌ Error processing antihijack-ai command.' }, { quoted: message }).catch(console.error);
  }
}

let userProfile = {}; // behavior tracking

function getProfile(user) {
  if (!userProfile[user]) {
    userProfile[user] = {
      kicks: 0,
      promotes: 0,
      deletes: 0,
      joins: 0,
      score: 0
    };
  }
  return userProfile[user];
}

function updateScore(profile) {
  profile.score =
    (profile.kicks * 3) +
    (profile.promotes * 2) +
    (profile.deletes * 2) +
    (profile.joins * 1);

  return profile.score;
}

function attachListeners(sock) {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      let chat = global.db?.data?.chats?.[anu.id];
      if (!chat?.antihijack || !chat?.ai) return;

      let meta = await sock.groupMetadata(anu.id);
      let admins = meta.participants.filter(v => v.admin).map(v => v.id);

      let owner = (global.owner || '').toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      let whitelist = chat.whitelist || [owner];

      for (let user of anu.participants) {
        let executor = anu.author || user;
        let profile = getProfile(executor);

        if (anu.action === 'remove') profile.kicks++;
        if (anu.action === 'promote') profile.promotes++;
        if (anu.action === 'add') profile.joins++;

        let score = updateScore(profile);

        if (score >= 10 && !whitelist.includes(executor)) {
          await sock.groupParticipantsUpdate(anu.id, [executor], 'remove');
          await sock.sendMessage(anu.id, {
            text: `🤖 AI: Suspicious user removed
Score: ${score}`,
            mentions: [executor]
          });
          continue;
        }

        if (anu.action === 'remove' && admins.includes(user)) {
          await sock.groupParticipantsUpdate(anu.id, [user], 'add');
          await sock.sendMessage(anu.id, {
            text: '🤖 AI: Admin restored'
          });
        }

        if (score >= 15) {
          await sock.groupSettingUpdate(anu.id, 'announcement');
          await sock.sendMessage(anu.id, {
            text: '🚨 AI: Group locked due to threat'
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });

  sock.ev.on('messages.upsert', async (msg) => {
    try {
      let m = msg.messages[0];
      if (!m.key.remoteJid?.endsWith('@g.us')) return;

      let chat = global.db?.data?.chats?.[m.key.remoteJid];
      if (!chat?.antihijack || !chat?.ai) return;

      let sender = m.key.participant || m.key.remoteJid;
      let profile = getProfile(sender);

      let text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

      if (text.includes('http') || text.includes('chat.whatsapp.com')) {
        profile.score += 2;
      }

      if (text.length > 500) {
        profile.score += 1;
      }

      if (profile.score >= 12) {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
        await sock.sendMessage(m.key.remoteJid, {
          text: '🤖 AI: Spam/attack detected',
          mentions: [sender]
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
}

module.exports = {
  command: 'antihijack',
  aliases: ['antihijack-ai', 'hijackprotect'],
  category: 'group',
  description: 'AI anti-hijack protection for groups',
  usage: '.antihijack on|off',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    return antihijackaiCommand(sock, chatId, message, args.join(' '));
  }
};
