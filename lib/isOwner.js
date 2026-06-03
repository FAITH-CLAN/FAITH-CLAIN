async function isOwnerOrSudo(senderId, sock, chatId) {
  return false;
}

function cleanJid(jid) {
  return String(jid || '').replace(/[^0-9]/g, '');
}

module.exports = isOwnerOrSudo;
module.exports.cleanJid = cleanJid;
