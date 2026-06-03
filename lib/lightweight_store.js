const fs = require('fs');
const path = require('path');

const storePath = path.join(process.cwd(), 'data', 'store.json');
const data = { settings: {}, messages: {}, contacts: {} };

function readFromFile() {
  try {
    if (!fs.existsSync(storePath)) return;
    const raw = fs.readFileSync(storePath, 'utf8');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(data, parsed);
  } catch (err) {
    console.error('Failed to read store file:', err.message);
  }
}

function writeToFile() {
  try {
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write store file:', err.message);
  }
}

async function getSetting(scope, key) {
  if (!scope || !key) return null;
  const section = data.settings?.[scope] || {};
  return section[key] ?? null;
}

async function saveSetting(scope, key, value) {
  if (!scope || !key) return;
  data.settings = data.settings || {};
  data.settings[scope] = data.settings[scope] || {};
  data.settings[scope][key] = value;
}

async function loadMessage(jid, messageId) {
  if (!jid || !messageId) return null;
  return data.messages?.[jid]?.[messageId] || null;
}

async function saveMessage(jid, messageId, value) {
  if (!jid || !messageId) return;
  data.messages = data.messages || {};
  data.messages[jid] = data.messages[jid] || {};
  data.messages[jid][messageId] = value;
}

function bind() {
  // Placeholder for event binding. No-op for minimal setup.
}

function getStats() {
  try {
    return {
      backend: 'local',
      storedMessages: Object.keys(data.messages || {}).length,
      contacts: Object.keys(data.contacts || {}).length
    };
  } catch (err) {
    return { backend: 'local', storedMessages: 0, contacts: 0 };
  }
}

module.exports = {
  readFromFile,
  writeToFile,
  getSetting,
  saveSetting,
  loadMessage,
  saveMessage,
  bind,
  getStats,
  contacts: data.contacts
};
