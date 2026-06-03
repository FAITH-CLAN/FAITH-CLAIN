const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const { getAntilinkSetting } = require('../lib/antilinkHelper');
const isAdmin = require('../lib/isAdmin');

const linkViolations = new Map();

async function handleAntilinkCommand(sock, chatId, message, userMessage) {
    try {
        if (!chatId?.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ Antilink can only be configured in groups.' }, { quoted: message });
            return;
        }

        const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);
        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ For Group Admins Only!' }, { quoted: message });
            return;
        }

        const args = (userMessage || '').trim().split(/\s+/);
        const sub = args[0]?.toLowerCase();

        if (!sub || sub === 'help') {
            const usage = `\`\`\`ANTILINK SETUP

${prefix}antilink on
${prefix}antilink set delete | kick | warn
${prefix}antilink off
${prefix}antilink status
\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        if (sub === 'on') {
            const result = await setAntilink(chatId, 'on', 'delete');
            await sock.sendMessage(chatId, { text: result ? '*_Antilink has been turned ON_*' : '*_Failed to turn on Antilink_*' }, { quoted: message });
            return;
        }

        if (sub === 'off') {
            await removeAntilink(chatId);
            await sock.sendMessage(chatId, { text: '*_Antilink has been turned OFF_*' }, { quoted: message });
            return;
        }

        if (sub === 'set') {
            const setAction = args[1]?.toLowerCase();
            if (!setAction) {
                await sock.sendMessage(chatId, { text: `*_Please specify an action: ${prefix}antilink set delete | kick | warn_*` }, { quoted: message });
                return;
            }
            const normalizedAction = setAction === 'kickout' ? 'kick' : setAction;
            if (!['delete', 'kick', 'warn'].includes(normalizedAction)) {
                await sock.sendMessage(chatId, { text: '*_Invalid action. Choose delete, kick, or warn._*' }, { quoted: message });
                return;
            }
            const setResult = await setAntilink(chatId, 'on', normalizedAction);
            await sock.sendMessage(chatId, { text: setResult ? `*_Antilink action set to ${normalizedAction}_*` : '*_Failed to set Antilink action_*' }, { quoted: message });
            return;
        }

        if (sub === 'status') {
            const statusConfig = getAntilink(chatId, 'on');
            await sock.sendMessage(chatId, { text: `*_Antilink Configuration:_*
Status: ${statusConfig.enabled ? 'ON' : 'OFF'}
Action: ${statusConfig.action || 'delete'}` }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { text: `*_Use ${prefix}antilink for usage._*` });
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antilink command_*' });
    }
}

function isLinkMessage(userMessage, message) {
    if (!userMessage) return false;
    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
        telegram: /t\.me\/[A-Za-z0-9_]+/i,
        allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i
    };

    const action = getAntilinkSetting(message.key.remoteJid);
    if (action === 'whatsappGroup') return linkPatterns.whatsappGroup.test(userMessage);
    if (action === 'whatsappChannel') return linkPatterns.whatsappChannel.test(userMessage);
    if (action === 'telegram') return linkPatterns.telegram.test(userMessage);
    return linkPatterns.allLinks.test(userMessage);
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkSetting = getAntilinkSetting(chatId);
    if (antilinkSetting === 'off') return false;
    if (!userMessage) return false;

    const msgText = userMessage || '';
    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
        telegram: /t\.me\/[A-Za-z0-9_]+/i,
        allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i
    };

    let detected = false;
    switch (antilinkSetting) {
        case 'whatsappGroup':
            detected = linkPatterns.whatsappGroup.test(msgText);
            break;
        case 'whatsappChannel':
            detected = linkPatterns.whatsappChannel.test(msgText);
            break;
        case 'telegram':
            detected = linkPatterns.telegram.test(msgText);
            break;
        default:
            detected = linkPatterns.allLinks.test(msgText);
            break;
    }

    if (!detected) return false;

    const violationKey = `${chatId}|${senderId}`;
    const currentCount = Number(linkViolations.get(violationKey) || 0) + 1;
    linkViolations.set(violationKey, currentCount);

    const shouldDelete = antilinkSetting !== 'warn';
    if (shouldDelete) {
        await sock.sendMessage(chatId, {
            delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId }
        });
    }

    if (antilinkSetting === 'kick') {
        if (currentCount >= 3) {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            linkViolations.delete(violationKey);
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} has been removed after 3 link violations.`,
                mentions: [senderId]
            });
            return true;
        }
        await sock.sendMessage(chatId, {
            text: `⚠️ @${senderId.split('@')[0]} violation ${currentCount}/3 for posting links. Next offense = kickout.`,
            mentions: [senderId]
        });
        return true;
    }

    await sock.sendMessage(chatId, {
        text: `⚠️ @${senderId.split('@')[0]} posting links is not allowed.`,
        mentions: [senderId]
    });

    return true;
}

module.exports = {
    command: 'antilink',
    aliases: ['linkfilter', 'antilink'],
    category: 'group',
    description: 'Toggle anti-link protection',
    usage: '.antilink on|off|set delete|kick|warn|status',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        return handleAntilinkCommand(sock, chatId, message, args.join(' '));
    },
    handleLinkDetection
};
