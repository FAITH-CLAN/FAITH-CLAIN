async function isAdmin(sock, chatId, participant) {
  return { isSenderAdmin: false, isBotAdmin: false };
}

module.exports = { isAdmin };
