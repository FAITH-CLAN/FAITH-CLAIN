const { isAdmin } = require('../lib');
const { isSudo } = require('../lib/index');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antibot.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAntibotConfig(chatId) {
    const data = readData();
    if (!data[chatId]) {
        data[chatId] = { enabled: false };
        writeData(data);
    }
    return data[chatId];
}

async function handleAntibotCommand(sock, chatId, message, userMessage) {
    try {
        const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);

        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' }, { quoted: message });
            return;
        }

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin!' }, { quoted: message });
            return;
        }

        const args = (userMessage || '').trim().split(/\s+/);
        const action = args[0]?.toLowerCase();

        const data = readData();
        if (!data[chatId]) data[chatId] = { enabled: false };

        if (!action || action === 'toggle') {
            data[chatId].enabled = !data[chatId].enabled;
        } else if (action === 'on') {
            data[chatId].enabled = true;
        } else if (action === 'off') {
            data[chatId].enabled = false;
        } else if (action === 'status') {
            const statusMessage = `📊 Anti-bot status: *${data[chatId].enabled ? 'enabled' : 'disabled'}*`;
            await sock.sendMessage(chatId, { text: statusMessage }, { quoted: message });
            return;
        } else {
            await sock.sendMessage(chatId, { text: '❗ Usage: .antibot on|off|status' }, { quoted: message });
            return;
        }

        writeData(data);
        await sock.sendMessage(chatId, { 
            text: `✅ Anti-bot is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*` 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antibot:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
}

function isLikelyBotJid(senderId) {
    const local = senderId.split('@')[0];
    return !/^[0-9]{10,15}$/.test(local);
}

function isBotLikeText(text) {
    if (!text) return false;
    const normalized = text.toLowerCase();
    const botRegex = /\b(?:auto(?:reply|response|respon(?:se)?)|automated|broadcast|join (?:our|my) channel|follow us|visit|verify|captcha|subscribe)\b|telegram\.me|t\.me\/|wa\.me\/|channel\//i;
    return botRegex.test(normalized);
}

async function handleAntibotMessage(sock, message, userMessage, chatId, senderId) {
    try {
        if (!chatId?.endsWith('@g.us')) return false;
        if (!userMessage || userMessage.startsWith('.')) return false;

        const config = getAntibotConfig(chatId);
        if (!config.enabled) return false;

        const adminStatus = await isAdmin(sock, chatId, senderId);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return false;

        if (await isSudo(senderId)) return false;

        const senderText = String(userMessage).trim();
        const isBotSender = isLikelyBotJid(senderId) || isBotLikeText(senderText);
        if (!isBotSender) return false;

        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                fromMe: false,
                id: message.key.id,
                participant: senderId
            }
        });

        await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await sock.sendMessage(chatId, {
            text: `⚠️ @${senderId.split('@')[0]} was removed by anti-bot filter.`, 
            mentions: [senderId]
        });

        return true;
    } catch (error) {
        console.error('Error handling antibot message:', error);
        return false;
    }
}

module.exports = {
    command: 'antibot',
    aliases: ['botblock', 'antibotfilter'],
    category: 'group',
    description: 'Toggle anti-bot protection in groups',
    usage: '.antibot on|off|status',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return handleAntibotCommand(sock, chatId, message, args.join(' '));
    },
    handleAntibotMessage
};
