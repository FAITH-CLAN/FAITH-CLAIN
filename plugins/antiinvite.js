const { isAdmin } = require('../lib');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antiinvite.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function handleInviteDetection(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId?.endsWith('@g.us')) return false;

        const data = readData();
        if (!data[chatId]?.enabled) return false;

        const sender = message.key.participant || message.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, sender);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return false;

        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const inviteRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?[A-Za-z0-9]{22}/i;
        if (inviteRegex.test(messageText)) {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.sendMessage(chatId, {
                text: `⚠️ @${sender.split('@')[0]} group invite links are not allowed here!`,
                mentions: [sender]
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error in handleInviteDetection:', error);
        return false;
    }
}

async function antiinviteCommand(sock, chatId, message, userMessage) {
    try {
        const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);

        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' }, { quoted: message });
            return;
        }

        const args = (userMessage || '').trim().split(/\s+/);
        const action = args[0]?.toLowerCase();

        let data = readData();
        if (!data[chatId]) data[chatId] = { enabled: false };

        if (!action || action === 'toggle') {
            data[chatId].enabled = !data[chatId].enabled;
        } else if (action === 'on') {
            data[chatId].enabled = true;
        } else if (action === 'off') {
            data[chatId].enabled = false;
        } else if (action === 'status') {
            await sock.sendMessage(chatId, { text: `📌 Anti-invite is currently *${data[chatId].enabled ? 'enabled' : 'disabled'}* in this group.` }, { quoted: message });
            return;
        }

        writeData(data);
        await sock.sendMessage(chatId, { text: `✅ Anti-invite is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*` }, { quoted: message });
    } catch (error) {
        console.error('Error in antiinvite:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
}

module.exports = {
    command: 'antiinvite',
    aliases: ['inviteblock', 'noinvite'],
    category: 'group',
    description: 'Toggle anti-invite link protection',
    usage: '.antiinvite on|off|toggle|status',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return antiinviteCommand(sock, chatId, message, args.join(' '));
    },
    handleInviteDetection
};
