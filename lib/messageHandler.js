const settings = require('../settings');
const commandHandler = require('./commandHandler');

// Import proto from baileys for message handling
let proto;
try {
  proto = require('@whiskeysockets/baileys').proto;
} catch (err) {
  proto = null;
}

function getTextFromMessage(message) {
  if (!message) return '';
  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage && message.extendedTextMessage.text) return message.extendedTextMessage.text;
  if (message.imageMessage && message.imageMessage.caption) return message.imageMessage.caption;
  if (message.videoMessage && message.videoMessage.caption) return message.videoMessage.caption;
  if (message.stickerMessage && message.stickerMessage.caption) return message.stickerMessage.caption;
  if (message.buttonsResponseMessage && message.buttonsResponseMessage.selectedButtonId) return message.buttonsResponseMessage.selectedButtonId;
  if (message.listResponseMessage && message.listResponseMessage.singleSelectReply && message.listResponseMessage.singleSelectReply.selectedRowId) {
    return message.listResponseMessage.singleSelectReply.selectedRowId;
  }
  return '';
}

function parseCommand(text) {
  const prefixes = Array.isArray(settings.prefixes) ? settings.prefixes : ['.'];
  const trimmed = text.trim();
  if (!trimmed) return { command: null, args: [], prefix: null };

  const usedPrefix = prefixes.find((prefix) => trimmed.startsWith(prefix));
  if (usedPrefix) {
    const body = trimmed.slice(usedPrefix.length).trim();
    const [command, ...args] = body.split(/\s+/);
    return { command: command?.toLowerCase() || null, args, prefix: usedPrefix };
  }

  const [command, ...args] = trimmed.split(/\s+/);
  const lower = command.toLowerCase();
  if (commandHandler.commands.has(lower) || commandHandler.aliases.has(lower)) {
    return { command: lower, args, prefix: null };
  }

  return { command: null, args: [], prefix: null };
}

async function handleMessages(sock, chatUpdate) {
  try {
    const mek = chatUpdate.messages?.[0];
    if (!mek || !mek.message) return;

    const text = getTextFromMessage(mek.message);
    if (!text || text.length === 0) return;

    const { command, args, prefix } = parseCommand(text);
    if (!command) {
      console.log('📝 [DEBUG] No command detected. Text:', text.substring(0, 50));
      return;
    }
    console.log(`🔍 [DEBUG] Command: ${command}, Prefix: ${prefix}, Text: ${text.substring(0, 50)}`);

    const targetCommand = commandHandler.commands.has(command)
      ? command
      : commandHandler.aliases.get(command);
    if (!targetCommand) {
      console.log(`⚠️  [DEBUG] Target command not found for: ${command}`);
      return;
    }

    const plugin = commandHandler.commands.get(targetCommand);
    if (!plugin || typeof plugin.handler !== 'function') {
      console.log(`⚠️  [DEBUG] Plugin not found or no handler for: ${targetCommand}`);
      return;
    }
    console.log(`✅ [DEBUG] Found plugin: ${targetCommand}`);
    if (prefix === null && plugin.isPrefixless === false) {
      console.log(`⚠️  [DEBUG] Command requires prefix but none provided`);
      return;
    }

    const chatId = mek.key?.remoteJid || '';
    const sender = mek.key?.participant || mek.key?.remoteJid || '';
    const isGroup = chatId.endsWith('@g.us');

    if (!chatId || !sender) return;

    const start = Date.now();
    try {
      console.log(`⚙️  [DEBUG] Executing ${targetCommand} in ${isGroup ? 'group' : 'DM'}`);
      await plugin.handler(sock, mek, args, {
        chatId,
        sender,
        isGroup,
        command: targetCommand,
        body: text
      });
      console.log(`✅ [DEBUG] ${targetCommand} executed successfully (${Date.now() - start}ms`);
    } catch (err) {
      console.error(`Error executing plugin ${targetCommand}:`, err.message);
      try {
        await sock.sendMessage(chatId, { 
          text: `❌ Error executing command: ${err.message}`
        }, { quoted: mek });
      } catch (e) {
        console.error('Failed to send error message:', e.message);
      }
    } finally {
      commandHandler.recordUsage(targetCommand, Date.now() - start);
    }
  } catch (err) {
    console.error('Fatal error in handleMessages:', err.message);
  }
}

async function handleGroupParticipantUpdate() {
  return;
}

async function handleStatus() {
  return;
}

async function handleCall() {
  return;
}

module.exports = {
  handleMessages,
  handleGroupParticipantUpdate,
  handleStatus,
  handleCall
};
