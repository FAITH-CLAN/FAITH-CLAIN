const { isAdmin } = require('../lib');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/antichannel.json');

function readData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function handleChannelDetection(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return; // Only for groups

        const data = readData();
        if (!data[chatId]?.enabled) return;

        const sender = message.key.participant || message.key.remoteJid;
        
        // Check if sender is admin
        const adminStatus = await isAdmin(sock, chatId, sender);
        if (adminStatus.isSenderAdmin || message.key.fromMe) return;

        const msg = message.message;
        const contextInfo = msg?.contextInfo || msg?.extendedTextMessage?.contextInfo;
        
        // Check for various types of channel messages
        let isChannelMessage = false;
        
        // Check for channel/newsletter forwarded messages
        if (contextInfo?.isForwarded && contextInfo?.forwardedNewsletterMessageInfo) {
            isChannelMessage = true;
        }
        
        // Check if message is from a channel (newsletter)
        if (msg?.viewOnceMessage?.message?.stickerMessage?.fileSha256 === 'newsletter') {
            isChannelMessage = true;
        }
        
        // Check for forwarded messages from channel sources
        if (contextInfo?.isForwarded && contextInfo?.remoteJid?.includes('channel')) {
            isChannelMessage = true;
        }
        
        // Check for newsletter/channel URL patterns in text
        const messageText = (
            msg?.conversation ||
            msg?.extendedTextMessage?.text ||
            msg?.imageMessage?.caption ||
            msg?.videoMessage?.caption ||
            ''
        ).toLowerCase();
        
        if (messageText.includes('channel') || messageText.includes('newsletter') || messageText.includes('wa.me/channel')) {
            isChannelMessage = true;
        }

        if (isChannelMessage) {
            // Delete the message
            try {
                await sock.sendMessage(chatId, { delete: message.key });
            } catch (delError) {
                console.warn('Could not delete channel message:', delError.message);
            }
            
            // Send warning
            await sock.sendMessage(chatId, { 
                text: `⚠️ @${sender.split('@')[0]} channel/newsletter messages are not allowed here!`,
                mentions: [sender]
            });
        }
    } catch (error) {
        console.error('Error in handleChannelDetection:', error);
    }
}

const handler = async (sock, chatId, message, userMessage) => {
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

        const args = userMessage.split(' ').slice(1);
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
            text: `✅ Anti-channel is now *${data[chatId].enabled ? 'enabled' : 'disabled'}*\n\n_Auto-removes channel and newsletter messages from the group_` 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antichannel:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
};;

module.exports = {
  command: 'antichannel',
  aliases: [],
  category: 'group',
  description: 'Group management command',
  usage: '.antichannel',
  handler
};

module.exports.handleChannelDetection = handleChannelDetection;
