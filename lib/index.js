const antilinkSettings = new Map();
const sudoList = new Set();
const welcomeSettings = new Map();
const goodbyeSettings = new Map();

async function isAdmin(sock, chatId, participant) {
  return { isSenderAdmin: false, isBotAdmin: false };
}

function isSudo(userId) {
  return sudoList.has(String(userId || ''));
}

function addSudo(userId) {
  if (!userId) return false;
  sudoList.add(String(userId));
  return true;
}

function removeSudo(userId) {
  if (!userId) return false;
  sudoList.delete(String(userId));
  return true;
}

function getSudoList() {
  return [...sudoList];
}

function isWelcomeOn(chatId) {
  return false;
}

function getWelcome(chatId) {
  return '';
}

function isGoodByeOn(chatId) {
  return false;
}

function getGoodbye(chatId) {
  return '';
}

function setAntilink(chatId, mode = 'off', action = 'delete') {
  if (!chatId) return false;
  antilinkSettings.set(String(chatId), { enabled: String(mode).toLowerCase() === 'on', action });
  return true;
}

function getAntilink(chatId) {
  return antilinkSettings.get(String(chatId)) || { enabled: false, action: 'delete' };
}

function removeAntilink(chatId) {
  if (!chatId) return false;
  antilinkSettings.delete(String(chatId));
  return true;
}

function getAntilinkSetting(chatId) {
  const config = getAntilink(chatId);
  return config.enabled ? config.action : 'off';
}

module.exports = {
  isAdmin,
  isSudo,
  addSudo,
  removeSudo,
  getSudoList,
  isWelcomeOn,
  getWelcome,
  isGoodByeOn,
  getGoodbye,
  setAntilink,
  getAntilink,
  removeAntilink,
  getAntilinkSetting
};
