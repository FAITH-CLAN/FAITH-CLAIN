const { isAdmin } = require('../lib');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/autojoke.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = async (sock, chatId, message, userMessage) => {
    try {
        const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);
        
        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' }, { quoted: message });
            return;
        }

        const args = userMessage.split(' ').slice(1);
        const action = args[0]?.toLowerCase();
        const interval = parseInt(args[1]) || 3600;

        let data = readData();
        if (!data[chatId]) data[chatId] = { enabled: false, interval: 3600 };

        if (!action || action === 'toggle') {
            data[chatId].enabled = !data[chatId].enabled;
        } else if (action === 'on') {
            data[chatId].enabled = true;
            data[chatId].interval = interval;
        } else if (action === 'off') {
            data[chatId].enabled = false;
        }

        writeData(data);
        await sock.sendMessage(chatId, { 
            text: `✅ Auto-joke is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*${data[chatId].enabled ? `\nInterval: ${data[chatId].interval}s` : ''}` 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in autojoke:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
};
