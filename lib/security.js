function verifyRestartAuth(senderId, providedPin) {
  return false;
}

function logSecurityEvent(eventType, senderId, message, status) {
  console.log(`[SECURITY] ${eventType} ${senderId} ${status}: ${message}`);
}

module.exports = {
  verifyRestartAuth,
  logSecurityEvent
};
