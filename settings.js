require('dotenv').config();

const settings = {
  // Array fallback: splits string by comma, or uses default array
  prefixes: process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['.', '!', '/', '#'],
  
  packname: process.env.PACKNAME || 'NEGO-CLAN',
  author: process.env.AUTHOR || 'Nego',
  timeZone: process.env.TIMEZONE || 'Africa/Dar es salaam',
  botName: process.env.BOT_NAME || "NEGO-CLAN",
  botOwner: process.env.BOT_OWNER || 'Nego',
  ownerNumber: process.env.OWNER_NUMBER || '255691927494,255628294159',
  giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: process.env.COMMAND_MODE || "public",
  // Command execution behaviour
  commandTimeoutMs: Number(process.env.COMMAND_TIMEOUT_MS) || 1000,
  processingAck: process.env.PROCESSING_ACK !== 'false',
  processingAckText: process.env.PROCESSING_ACK_TEXT || '⏳ Processing your command...',
  
  maxStoreMessages: Number(process.env.MAX_STORE_MESSAGES) || 20,
  tempCleanupInterval: Number(process.env.CLEANUP_INTERVAL) || 1 * 60 * 60 * 1000,
  storeWriteInterval: Number(process.env.STORE_WRITE_INTERVAL) || 10000,
  
  description: process.env.DESCRIPTION || "This is a bot for managing group commands and automating tasks.",
  version: "5.2.0",
  updateZipUrl: process.env.UPDATE_URL || "https://github.com/Xnegotech1/NEGO-TECH/archive/refs/heads/main.zip",
  channelLink: process.env.CHANNEL_LINK || "https://whatsapp.com/channel/0029VbBvGgyFsn0alyIDjw0z",
  ytch: process.env.YT_CHANNEL || "Xchristech"
};

module.exports = settings;
