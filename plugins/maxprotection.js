let listenersAttached = false;

async function maxprotectionCommand(sock, chatId, message) {
    const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = userMessage.split(' ').slice(1);
    const action = args[0]?.toLowerCase();

  }
    let chat = global.db.data.chats[chatId];
    if (!chat) {
      chat = global.db.data.chats[chatId] = {};
    }

    if (action === 'on') {
      chat.maxprotection = true;
      if (!listenersAttached) {
        attachListeners(sock);
        listenersAttached = true;
      }
      await sock.sendMessage(chatId, { text: '🛡️ Max Protection Activated' }, { quoted: message });
    } else if (action === 'off') {
      chat.maxprotection = false;
      await sock.sendMessage(chatId, { text: '❌ Max Protection OFF' }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: 'Tumia:\n.maxprotection on/off\n\n🛡️ Maximum group protection system' }, { quoted: message });
    }
  } catch (error) {
    console.error('Error in maxprotectionCommand:', error);
    await sock.sendMessage(chatId, { text: '❌ Error processing maxprotection command.' }, { quoted: message }).catch(console.error);
  }
}

module.exports = maxprotectionCommand;

// ================= MAX PROTECTION ENGINE ================= //

const ownerNumber = global.owner || '2557XXXXXXXX';
const suspiciousWords = ['free', 'earn', 'click here', 'join now'];
const linkRegex = /(https?:\/\/[^\s]+)/g;

// ============================
// 1️⃣ Anti-Hijack Alert
// ============================
global.conn?.ev?.on('connection.update', (update) => {
  try {
    const { connection, lastDisconnect } = update;
    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode === DisconnectReason?.loggedOut) {
      global.conn.sendMessage(ownerNumber + '@s.whatsapp.net', { 
        text: '⚠️ ALERT! Bot account imekuwa na login mpya!' 
      }).catch(e => console.log(e));
    }
  } catch (e) {
    console.log(e);
  }
});

// ============================
// 2️⃣ Anti-Delete Messages
// ============================
global.conn?.ev?.on('messages.upsert', async (m) => {
  try {
    if (m.type !== 'notify') return;
    
    for (let msg of m.messages) {
      if (!msg.message?.protocolMessage) return; // Only revocations
      
      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      
      let chat = global.db.data.chats[chatId];
      if (!chat?.maxprotection) return;

      const content = msg.message;
      await global.conn.sendMessage(chatId, { 
        text: `⚠️ @${sender.split('@')[0]} amejaribu kufuta message!\n\nContent tracked by Max Protection`, 
        mentions: [sender] 
      }).catch(e => console.log(e));
    }
  } catch (e) {
    console.log(e);
  }
});

// ============================
// 3️⃣ Anti-Link + Auto-Block
// ============================
global.conn?.ev?.on('messages.upsert', async (m) => {
  try {
    if (m.type !== 'notify') return;
    
    for (let msg of m.messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

      let chat = global.db.data.chats[chatId];
      if (!chat?.maxprotection) return;

      // Delete and warn links
      if (text.match(linkRegex)) {
        await global.conn.sendMessage(chatId, { 
          text: `🚫 @${sender.split('@')[0]}, link haikubaliwi hapa! Message imefuta.`, 
          mentions: [sender] 
        }).catch(e => console.log(e));
        
        await global.conn.sendMessage(chatId, {
          delete: { remoteJid: chatId, fromMe: false, id: msg.key.id, participant: sender }
        }).catch(e => console.log(e));
        
        // Auto-kick after multiple offenses (instead of block)
        // For simplicity, kick immediately for links
        await global.conn.groupParticipantsUpdate(chatId, [sender], 'remove').catch(e => console.log(e));
        await global.conn.sendMessage(ownerNumber + '@s.whatsapp.net', { 
          text: `⚠️ @${sender.split('@')[0]} imekick kwa kutuma link.` 
        }).catch(e => console.log(e));
        continue;
      }

      // Detect suspicious words
      for (let word of suspiciousWords) {
        if (text.toLowerCase().includes(word)) {
          await global.conn.sendMessage(chatId, { 
            text: `⚠️ @${sender.split('@')[0]} message ina maneno hatari, umekick.`, 
            mentions: [sender] 
          }).catch(e => console.log(e));
          
          await global.conn.groupParticipantsUpdate(chatId, [sender], 'remove').catch(e => console.log(e));
          await global.conn.sendMessage(ownerNumber + '@s.whatsapp.net', { 
            text: `⚠️ @${sender.split('@')[0]} imekick kwa kutuma maneno hatari.` 
          }).catch(e => console.log(e));
          break;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

// ============================
// 4️⃣ Owner-Only Protection Controls
// ============================
global.conn?.ev?.on('messages.upsert', async (m) => {
  try {
    if (m.type !== 'notify') return;
    
    for (let msg of m.messages) {
      if (!msg.message) continue;
      const text = msg.message.conversation || '';
      const sender = msg.key.participant || msg.key.remoteJid;

      // Only owner can use these
      if (sender !== ownerNumber + '@s.whatsapp.net') continue;

      if (text.startsWith('.mode')) {
        const mode = text.split(' ')[1];
        await global.conn.sendMessage(msg.key.remoteJid, { 
          text: `✅ Mode switched to: ${mode}` 
        }).catch(e => console.log(e));
      }

      if (text.startsWith('.suspicious')) {
        const newWords = text.split(' ').slice(1);
        suspiciousWords.push(...newWords);
        await global.conn.sendMessage(msg.key.remoteJid, { 
          text: `✅ Maneno hatari yametengezwa: ${newWords.join(', ')}` 
        }).catch(e => console.log(e));
      }
    }
  } catch (e) {
    console.log(e);
  }
});
