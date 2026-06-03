const chalk = require('chalk');

function printLog(type, message) {
  const colorMap = {
    info: chalk.cyan,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    connection: chalk.magenta
  };
  const color = colorMap[type] || chalk.white;
  console.log(color(`[${type.toUpperCase()}] ${message}`));
}

module.exports = { printLog };
