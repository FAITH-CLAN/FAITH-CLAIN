const { isAdmin } = require('../lib');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antiimage.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function handleImageDetection(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId?.endsWith('@g.us')) return;

        const data = readData();
        if (!data[chatId]?.enabled) return;

        const sender = message.key.participant || message.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, sender);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return;

        if (message.message?.imageMessage) {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.sendMessage(chatId, {
                text: `⚠️ @${sender.split('@')[0]} image messages are not allowed here!`,
                mentions: [sender]
            });
        }
    } catch (error) {
        console.error('Error in handleImageDetection:', error);
    }
}

async function antiimageCommand(sock, chatId, message, userMessage) {
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
            text: `✅ Anti-image is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antiimage:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
}

module.exports = {
    command: 'antiimage',
    aliases: ['imageblock', 'noimage'],
    category: 'group',
    description: 'Toggle anti-image protection',
    usage: '.antiimage on|off|toggle',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return antiimageCommand(sock, chatId, message, args.join(' '));
    },
    handleImageDetection
};
