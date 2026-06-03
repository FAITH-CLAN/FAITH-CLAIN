const { isAdmin } = require('../lib');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antisticker.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function handleStickerDetection(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId?.endsWith('@g.us')) return;

        const data = readData();
        if (!data[chatId]?.enabled) return;

        const sender = message.key.participant || message.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, sender);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return;

        if (message.message?.stickerMessage) {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.sendMessage(chatId, {
                text: `⚠️ @${sender.split('@')[0]} sticker messages are not allowed here!`,
                mentions: [sender]
            });
        }
    } catch (error) {
        console.error('Error in handleStickerDetection:', error);
    }
}

async function antistickerCommand(sock, chatId, message, userMessage) {
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
        }

        writeData(data);
        await sock.sendMessage(chatId, {
            text: `✅ Anti-sticker is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antisticker:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
}

module.exports = {
    command: 'antisticker',
    aliases: ['stickerblock', 'nosticker'],
    category: 'group',
    description: 'Toggle anti-sticker mode',
    usage: '.antisticker on|off|toggle',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return antistickerCommand(sock, chatId, message, args.join(' '));
    },
    handleStickerDetection
};
