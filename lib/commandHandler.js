const fs = require('fs');
const path = require('path');

const commands = new Map();
const aliases = new Map();
const categories = new Map();
const disabledCommands = new Set();
const usageStats = new Map();

function ensureCategory(category) {
  const key = (category || 'general').toLowerCase();
  if (!categories.has(key)) categories.set(key, []);
  return categories.get(key);
}

function addPluginCommand(plugin) {
  if (!plugin || !plugin.command) return;

  const commandName = plugin.command.toLowerCase();
  commands.set(commandName, plugin);

  if (Array.isArray(plugin.aliases)) {
    for (const alias of plugin.aliases) {
      if (!alias) continue;
      aliases.set(alias.toLowerCase(), commandName);
    }
  }

  const cat = (plugin.category || 'general').toLowerCase();
  const list = ensureCategory(cat);
  if (!list.includes(commandName)) list.push(commandName);
}

function clearCommands() {
  commands.clear();
  aliases.clear();
  categories.clear();
  disabledCommands.clear();
  usageStats.clear();
}

function loadCommands() {
  const pluginDir = path.join(__dirname, '..', 'plugins');
  if (!fs.existsSync(pluginDir)) return;

  const files = fs.readdirSync(pluginDir).filter((name) => name.endsWith('.js'));

  for (const file of files) {
    const pluginPath = path.join(pluginDir, file);

    try {
      delete require.cache[require.resolve(pluginPath)];
      const plugin = require(pluginPath);

      if (!plugin || !plugin.command) continue;
      addPluginCommand(plugin);
    } catch (err) {
      console.error(`Failed to load plugin ${file}:`, err.message);
    }
  }
}

function reloadCommands() {
  clearCommands();
  loadCommands();
}

function getCommandsByCategory(category) {
  if (!category) return [];
  const key = category.toLowerCase();
  return categories.has(key) ? [...categories.get(key)] : [];
}

function getDiagnostics() {
  return [...commands.keys()].map((command) => {
    const stats = usageStats.get(command) || { usage: 0, total: 0, average: 0 };
    return {
      command,
      usage: stats.usage,
      average: stats.average,
      average_speed: String(stats.average || 0)
    };
  });
}

function getSlowCommands(threshold = 500) {
  return getDiagnostics()
    .filter((item) => Number(item.average) >= threshold)
    .sort((a, b) => b.average - a.average);
}

function toggleCommand(commandName) {
  const key = commandName.toLowerCase();
  if (!commands.has(key)) return null;
  if (disabledCommands.has(key)) {
    disabledCommands.delete(key);
    return 'enabled';
  }
  disabledCommands.add(key);
  return 'disabled';
}

function recordUsage(commandName, durationMs = 0) {
  const key = (commandName || '').toLowerCase();
  if (!key || !commands.has(key)) return;

  const previous = usageStats.get(key) || { usage: 0, total: 0, average: 0 };
  previous.usage += 1;
  previous.total += Number(durationMs) || 0;
  previous.average = previous.usage ? previous.total / previous.usage : 0;
  usageStats.set(key, previous);
}

function findSuggestion(query) {
  if (!query) return null;
  const normalized = query.toLowerCase();

  if (commands.has(normalized)) return normalized;
  if (aliases.has(normalized)) return aliases.get(normalized);

  let best = null;
  let lowest = Infinity;
  for (const command of commands.keys()) {
    const distance = levenshtein(normalized, command);
    if (distance < lowest) {
      lowest = distance;
      best = command;
    }
  }

  return best;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

module.exports = {
  commands,
  aliases,
  categories,
  disabledCommands,
  loadCommands,
  reloadCommands,
  getCommandsByCategory,
  getDiagnostics,
  getSlowCommands,
  toggleCommand,
  findSuggestion,
  recordUsage
};
