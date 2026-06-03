# 🚀 Quick Start Guide - NEGO-TECH Bot Pairing

## ⚡ 30-Second Setup

### Step 1: Clone & Install
```bash
git clone https://github.com/Xnegotech1/NEGO-CLAN.git
cd NEGO-CLAN
npm install
```

### Step 2: Start Pairing

#### 🐧 Linux / 🍎 Mac
```bash
chmod +x setup-pairing.sh
./setup-pairing.sh 923051391005
```

#### 🪟 Windows
```bash
setup-pairing.bat 923051391005
```

#### 📱 Or Using npm
```bash
npm run start:pair
```

### Step 3: Use the Code
- Open **WhatsApp** → **Settings** → **Linked Devices**
- Click **"Link a Device"**
- Paste the pairing code from terminal
- **Done!** ✅

---

## 🎯 Find Your Phone Number

1. Open **WhatsApp**
2. Go to **Settings** → **Account**
3. Your phone number is displayed there
4. **Note**: Remove the + symbol when pasting

Examples:
- **Pakistan**: +92 305 1391005 → `923051391005`
- **Nigeria**: +234 812 3456789 → `2348123456789`
- **India**: +91 987 6543210 → `919876543210`

---

## 🎯 Different Ways to Start Pairing

### Method 1: Using Setup Script (Recommended)
```bash
# Linux/Mac
./setup-pairing.sh 923051391005

# Windows  
setup-pairing.bat 923051391005
```

### Method 2: Using npm
```bash
npm run start:pair
```

### Method 3: Using Environment Variable
```bash
# Linux/Mac
export PAIRING_NUMBER=923051391005
node index.js --pairing-code

# Windows (Command Prompt)
set PAIRING_NUMBER=923051391005
node index.js --pairing-code

# Windows (PowerShell)
$env:PAIRING_NUMBER="923051391005"
node index.js --pairing-code
```

### Method 4: Create .env File
1. Copy `sample.env` to `.env`
2. Add your phone number:
   ```
   PAIRING_NUMBER=923051391005
   ```
3. Run:
   ```bash
   npm run start:pair
   ```

---

## 📸 What to Expect

### Successful Output:
```
╔════════════════════════════════════════╗
║   NEGO-TECH Bot Pairing Code Setup      ║
╚════════════════════════════════════════╝

📱 Phone Number: +923051391005
[10:05:30] 🔌 CONNECTION Connecting to WhatsApp...
[10:05:32] ℹ️ INFO Requesting pairing code for: +923051391005
[10:05:33] ✅ SUCCESS ✅ Pairing code generated: 1234-5678-9101

╔════════════════════╗
║  1234-5678-9101    ║
║   Tap to copy      ║
╚════════════════════╝

[10:05:34] ℹ️ INFO Paste this code in WhatsApp Web > Linked Devices > Link a Device
[10:05:34] ℹ️ INFO The pairing code will expire in 30 seconds
```

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| **No pairing code appears** | Wait 5-10 seconds for connection |
| **"Invalid phone number"** | Remove +, spaces, and dashes |
| **"Failed to get pairing code"** | Check internet connection, try again |
| **"Max retries reached"** | Restart bot and retry |
| **Code expires** | Act within 30 seconds, or restart bot |

**Full troubleshooting guide**: See `PAIRING_CODE_GUIDE.md`

---

## 💡 Tips

✅ **Have WhatsApp ready** - Complete code pasting within 30 seconds  
✅ **Keep terminal open** - Pairing code displays in terminal  
✅ **Use personal account** - Not WhatsApp Business  
✅ **Check internet** - Strong connection needed for pairing  
✅ **Fresh restart** - If issues, delete `session` folder and retry  

---

## 🎮 After Successful Pairing

Once paired, you can:

```bash
# Run normally
npm start

# Or use optimized version
npm run start:optimized

# Test bot commands
# .menu - Show main menu
# .alive - Check bot status
# .help - Show help menu
```

---

## 🔄 Reset & Retry

If you need to start over:

```bash
# Delete old session
rm -rf session

# Delete temp files
rm -rf temp

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Restart pairing
npm run start:pair
```

---

## 📞 Support

- 📺 YouTube: [Xchristech](https://youtube.com/@xchristech)
- 💻 GitHub: [Xnegotech1/NEGO-CLAN](https://github.com/Xnegotech1/NEGO-CLAN)
- 🔗 WhatsApp: Check `settings.js` for channel link

---

**Version**: 5.3.0  
**Last Updated**: June 2, 2026
