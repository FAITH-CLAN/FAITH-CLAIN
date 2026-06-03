const handler = require('../lib/commandHandler');

// Load plugins
handler.loadCommands();

const threshold = Number(process.argv[2]) || 500; // ms
const slow = handler.getSlowCommands(threshold);

console.log(`Slow commands (avg >= ${threshold} ms):\n`);
if (!slow.length) console.log('None');
for (const c of slow) {
  console.log(`${c.command} — avg: ${c.average} ms — usage: ${c.usage}`);
}
