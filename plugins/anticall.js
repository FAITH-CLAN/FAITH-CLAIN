const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ANTICALL_PATH = path.join(DATA_DIR, 'anticall.json');

function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
        const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { enabled: !!data.enabled };
    } catch {
        return { enabled: false };
    }
}

function writeState(enabled) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    } catch (error) {
        console.error('Anticall write error:', error);
    }
}

async function anticallCommand(sock, chatId, message, userMessage) {
    const state = readState();
    const sub = (userMessage || '').trim().toLowerCase();

    if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
        await sock.sendMessage(chatId, { text: `*ANTICALL*\n\n.anticall on  - Enable auto-block on incoming calls\n.anticall off - Disable anticall\n.anticall status - Show current status` }, { quoted: message });
        return;
    }

    if (sub === 'status') {
        await sock.sendMessage(chatId, { text: `Anticall is currently *${state.enabled ? 'ON' : 'OFF'}*.` }, { quoted: message });
        return;
    }

    const enable = sub === 'on';
    writeState(enable);
    await sock.sendMessage(chatId, { text: `Anticall is now *${enable ? 'ENABLED' : 'DISABLED'}*.` }, { quoted: message });
}

module.exports = {
    command: 'anticall',
    aliases: ['callblock', 'blockcall'],
    category: 'group',
    description: 'Toggle incoming call protection',
    usage: '.anticall on|off|status',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return anticallCommand(sock, chatId, message, args.join(' '));
    },
    readState
};
