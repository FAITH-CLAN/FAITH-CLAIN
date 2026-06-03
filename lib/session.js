const fs = require('fs');
const path = require('path');

async function SaveCreds(txt) {
  const sessionDir = path.join(process.cwd(), 'session');
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const credsPath = path.join(sessionDir, 'creds.json');

  if (!txt) {
    throw new Error('No session data provided');
  }

  try {
    let creds = null;

    if (fs.existsSync(txt)) {
      creds = JSON.parse(fs.readFileSync(txt, 'utf8'));
    } else if (txt.trim().startsWith('{')) {
      creds = JSON.parse(txt);
    }

    if (!creds) {
      throw new Error('Unable to parse session credentials');
    }

    fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
    return true;
  } catch (err) {
    throw new Error(`Failed to save credentials: ${err.message}`);
  }
}

module.exports = SaveCreds;
