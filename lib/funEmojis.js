function getSuccessWord() {
  return '✅';
}

function getActionEmoji(action = '') {
  const map = {
    kick: '👢',
    warn: '⚠️',
    reject: '⛔',
    hug: '🤗',
    welcome: '👋'
  };
  return map[String(action).toLowerCase()] || '✨';
}

function getGreeting() {
  return '👋';
}

function getEnabledWord() {
  return '✅ Enabled';
}

function getDisabledWord() {
  return '❌ Disabled';
}

function getErrorWord() {
  return '❌';
}

module.exports = {
  getSuccessWord,
  getActionEmoji,
  getGreeting,
  getEnabledWord,
  getDisabledWord,
  getErrorWord
};
