const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antispam.json');
const recentSpamActivity = {};

const LEVEL_CONFIG = {
    veryfast: { label: 'Very Fast', count: 2, windowMs: 5000 },
    high: { label: 'High', count: 3, windowMs: 10000 },
    medium: { label: 'Medium', count: 5, windowMs: 15000 },
    low: { label: 'Low', count: 8, windowMs: 30000 }
};

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAntispamConfig(chatId) {
    const data = readData();
    if (!data[chatId]) {
        data[chatId] = { enabled: false, level: 'medium' };
        writeData(data);
    }
    return data[chatId];
}

function getSpamSignature(message, userMessage) {
    if (userMessage && userMessage.trim().length) {
        return userMessage.trim().toLowerCase();
    }

    const msg = message.message || {};
    if (msg.imageMessage) {
        return `image:${msg.imageMessage.fileLength || ''}:${msg.imageMessage.mimetype || ''}`;
    }
    if (msg.videoMessage) {
        return `video:${msg.videoMessage.fileLength || ''}:${msg.videoMessage.mimetype || ''}`;
    }
    if (msg.audioMessage) {
        return `audio:${msg.audioMessage.fileLength || ''}:${msg.audioMessage.mimetype || ''}`;
    }
    if (msg.documentMessage) {
        return `document:${msg.documentMessage.fileLength || ''}:${msg.documentMessage.mimetype || ''}`;
    }
    if (msg.stickerMessage) {
        return `sticker:${msg.stickerMessage.fileSha256 || msg.stickerMessage.mediaKey || ''}`;
    }
    return `${JSON.stringify(msg).slice(0, 100)}`;
}

async function handleAntispamCommand(sock, chatId, message, userMessage) {
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
        const level = args[0]?.toLowerCase();
        const action = args[1]?.toLowerCase();

        const data = readData();
        if (!data[chatId]) data[chatId] = { enabled: false, level: 'medium' };

        if (!level || level === 'help') {
            await sock.sendMessage(chatId, {
                text: '❗ Usage: .antispam <veryfast|high|medium|low> on | .antispam off | .antispam status'
            }, { quoted: message });
            return;
        }

        if (level === 'off') {
            data[chatId].enabled = false;
            writeData(data);
            await sock.sendMessage(chatId, { text: '✅ Anti-spam has been turned off.' }, { quoted: message });
            return;
        }

        if (level === 'status') {
            const current = getAntispamConfig(chatId);
            await sock.sendMessage(chatId, {
                text: `📊 Anti-spam status:
• Enabled: ${current.enabled ? 'Yes' : 'No'}
• Level: ${LEVEL_CONFIG[current.level]?.label || current.level}`
            }, { quoted: message });
            return;
        }

        if (!Object.keys(LEVEL_CONFIG).includes(level)) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid mode. Use veryfast, high, medium, or low.'
            }, { quoted: message });
            return;
        }

        if (action !== 'on') {
            await sock.sendMessage(chatId, {
                text: '❗ Usage: .antispam <veryfast|high|medium|low> on'
            }, { quoted: message });
            return;
        }

        data[chatId].enabled = true;
        data[chatId].level = level;
        writeData(data);

        await sock.sendMessage(chatId, {
            text: `✅ Anti-spam is now enabled at *${LEVEL_CONFIG[level].label}* level.`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antispam:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing anti-spam command' }, { quoted: message });
    }
}

async function handleAntispamMessage(sock, message, userMessage, chatId, senderId) {
    try {
        if (!chatId?.endsWith('@g.us')) return false;
        if (!userMessage || userMessage.startsWith('.')) return false;

        const config = getAntispamConfig(chatId);
        if (!config.enabled) return false;

        const adminStatus = await isAdmin(sock, chatId, senderId);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return false;

        const sudoStatus = await isSudo(senderId);
        if (sudoStatus) return false;

        const signature = getSpamSignature(message, userMessage);
        if (!signature || signature.startsWith('.')) return false;

        const level = LEVEL_CONFIG[config.level] ? config.level : 'medium';
        const { count, windowMs, label } = LEVEL_CONFIG[level];
        const now = Date.now();
        const trackingKey = `${chatId}|${senderId}|${signature}`;

        if (!recentSpamActivity[trackingKey]) {
            recentSpamActivity[trackingKey] = [];
        }

        recentSpamActivity[trackingKey] = recentSpamActivity[trackingKey].filter(timestamp => now - timestamp <= windowMs);
        recentSpamActivity[trackingKey].push(now);

        if (recentSpamActivity[trackingKey].length >= count) {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId }
            });

            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            recentSpamActivity[trackingKey] = [];

            await sock.sendMessage(chatId, {
                text: `⚠️ @${senderId.split('@')[0]} was removed for spam in *${label}* mode.`,
                mentions: [senderId]
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error handling antispam message:', error);
        return false;
    }
}

module.exports = {
    command: 'antispam',
    aliases: ['spam', 'spamfilter'],
    category: 'group',
    description: 'Toggle anti-spam protection',
    usage: '.antispam <veryfast|high|medium|low> on|off|status',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return handleAntispamCommand(sock, chatId, message, args.join(' '));
    },
    handleAntispamMessage
};
