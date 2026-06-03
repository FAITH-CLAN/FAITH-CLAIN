const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../lib/isAdmin');

const DATA_FILE = path.join(__dirname, '../data/antigroupmention.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || {};
  } catch (error) {
    console.error('Error reading anti-group-mention config:', error.message || error);
    return {};
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing anti-group-mention config:', error.message || error);
  }
}

function extractMentionedJids(message) {
  if (!message || !message.message) return [];
  const msg = message.message;
  const possibleContexts = [
    msg.extendedTextMessage?.contextInfo,
    msg.imageMessage?.contextInfo,
    msg.videoMessage?.contextInfo,
    msg.documentMessage?.contextInfo,
    msg.stickerMessage?.contextInfo,
    msg.buttonsResponseMessage?.contextInfo,
    msg.listResponseMessage?.contextInfo
  ].filter(Boolean);

  const mentions = new Set();

  for (const context of possibleContexts) {
    if (Array.isArray(context.mentionedJid)) {
      context.mentionedJid.forEach(jid => mentions.add(jid));
    }
  }

  if (Array.isArray(msg.mentionedJid)) {
    msg.mentionedJid.forEach(jid => mentions.add(jid));
  }

  if (Array.isArray(msg.extendedTextMessage?.mentionedJid)) {
    msg.extendedTextMessage.mentionedJid.forEach(jid => mentions.add(jid));
  }

  return Array.from(mentions);
}

async function handleGroupMentionDetection(sock, message) {
  try {
    const chatId = message.key.remoteJid;
    if (!chatId?.endsWith('@g.us')) return false;
    const data = readData();
    if (!data[chatId]?.enabled) return false;
    if (message.key.fromMe) return false;

    const sender = message.key.participant || message.key.remoteJid;
    const adminStatus = await isAdmin(sock, chatId, sender);
    if (adminStatus.isSenderAdmin) return false;

    const mentionedJids = extractMentionedJids(message);
    if (!mentionedJids.length) return false;

    await sock.sendMessage(chatId, { delete: message.key });
    await sock.sendMessage(chatId, {
      text: '🚫 Anti-Group Mention is active. Mentions are blocked in this group.',
      mentions: [sender]
    });

    return true;
  } catch (error) {
    console.error('Error in anti-group-mention detection:', error.message || error);
    return false;
  }
}

module.exports = async (sock, message, args, context = {}) => {
  try {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    if (!chatId?.endsWith('@g.us')) {
      return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: message });
    }

    const adminStatus = await isAdmin(sock, chatId, sender);
    if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
      return await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: message });
    }

    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off', 'toggle', 'status'].includes(action)) {
      return await sock.sendMessage(chatId, {
        text: '❌ Usage: .antigroupmention on|off|toggle|status'
      }, { quoted: message });
    }

    const data = readData();
    if (!data[chatId]) data[chatId] = { enabled: false };

    if (action === 'status') {
      return await sock.sendMessage(chatId, {
        text: `📌 Anti-Group Mention is currently *${data[chatId].enabled ? 'enabled' : 'disabled'}* in this group.`
      }, { quoted: message });
    }

    if (action === 'toggle') {
      data[chatId].enabled = !data[chatId].enabled;
    } else {
      data[chatId].enabled = action === 'on';
    }

    writeData(data);
    await sock.sendMessage(chatId, {
      text: `✅ Anti-Group Mention has been *${data[chatId].enabled ? 'enabled' : 'disabled'}*.`
    }, { quoted: message });
  } catch (error) {
    console.error('Anti-Group Mention command error:', error.message || error);
    await sock.sendMessage(context.chatId || message.key.remoteJid, { text: '❌ Error processing command.' }, { quoted: message });
  }
};

module.exports.command = 'antigroupmention';
module.exports.aliases = ['groupmention', 'antimention', 'nomention'];
module.exports.category = 'group';
module.exports.description = 'Toggle anti-group mention protection in groups.';
module.exports.usage = '.antigroupmention on|off|toggle|status';
module.exports.handleGroupMentionDetection = handleGroupMentionDetection;
