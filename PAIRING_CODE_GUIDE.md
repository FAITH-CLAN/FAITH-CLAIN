# ⚙️ WhatsApp Pairing Code Troubleshooting Guide

## Quick Setup - 3 Steps

### 1️⃣ Using Pairing Code (Recommended)

#### On Linux/Mac:
```bash
chmod +x setup-pairing.sh
./setup-pairing.sh 923051391005
```

#### On Windows:
```bash
npm start -- --pairing-code
```

#### Manual Setup:
```bash
PAIRING_NUMBER=923051391005 node index.js --pairing-code
```

### 2️⃣ What You'll See
```
[TIME] 🔌 CONNECTION Connecting to WhatsApp...
[TIME] ℹ️ INFO Requesting pairing code for: +923051391005
[TIME] ✅ SUCCESS ✅ Pairing code generated: 1234-5678-9101
       ╔════════════════════╗
       ║  1234-5678-9101    ║
       ║   Tap to copy      ║
       ╚════════════════════╝
[TIME] ℹ️ INFO Paste this code in WhatsApp Web > Linked Devices > Link a Device
[TIME] ℹ️ INFO The pairing code will expire in 30 seconds
```

### 3️⃣ Use the Code in WhatsApp
- Open **WhatsApp**
- Tap **Settings** → **Linked Devices** → **Link a Device**
- Paste the pairing code
- **Done!** ✅

---

## 🆘 Common Issues & Solutions

### ❌ Issue: "Failed to get pairing code"

**Cause**: Connection not established or server issues

**Solutions**:
1. **Ensure internet connection** - Check your WiFi/data connection
2. **Wait for connection** - Bot takes 5-10 seconds to connect to WhatsApp
3. **Try again** - The bot will retry automatically 3 times
4. **Use correct format** - Ensure phone number is valid (10-15 digits)

```bash
# Example: Pakistan (+92)
./setup-pairing.sh 923051391005

# Example: Nigeria (+234)
./setup-pairing.sh 2348123456789

# Example: India (+91)
./setup-pairing.sh 919876543210
```

---

### ❌ Issue: "Invalid phone number format"

**Cause**: Phone number format is incorrect

**Solutions**:
- ✅ **Correct**: `923051391005` (digits only)
- ❌ **Wrong**: `+923051391005` (has + symbol)
- ❌ **Wrong**: `92-305-139-1005` (has dashes)
- ❌ **Wrong**: `(0)92 305 1391 005` (has spaces/parentheses)

**Get your number**:
1. Open WhatsApp
2. Tap Settings → About
3. Look for your phone number
4. **Remove the + symbol and spaces**

---

### ❌ Issue: "Max retries reached"

**Cause**: Unable to connect after 3 attempts

**Solutions**:
1. **Check internet** - Restart WiFi/data connection
2. **Restart bot** - Kill the process and start again
3. **Clear session** - Delete `session` folder and retry
4. **Check firewall** - Ensure firewall isn't blocking WhatsApp connection

```bash
# Clear session and retry
rm -rf session
./setup-pairing.sh 923051391005
```

---

### ❌ Issue: "QR Code appears instead of pairing code"

**Cause**: Using old connection method

**Solutions**:
- Kill the bot and restart with pairing flag
- Use the setup script: `./setup-pairing.sh YOUR_NUMBER`
- Ensure `--pairing-code` flag is present

---

### ❌ Issue: "Pairing code expires before I use it"

**Cause**: Took too long to paste code in WhatsApp

**Solutions**:
1. **Act quickly** - Have WhatsApp ready before starting bot
2. **Keep terminal visible** - Code expires in 30 seconds
3. **Restart if missed** - Simply run the setup script again

---

### ❌ Issue: Bot connects but no pairing code shows

**Cause**: Connection issue or display problem

**Solutions**:
1. **Check terminal output** - Look for "Pairing code generated"
2. **Scroll up** - Code might be above visible area
3. **Clear terminal** - Run `clear` and restart bot
4. **Check logs** - Look for error messages above code

```bash
# Start with verbose output
DEBUG=* ./setup-pairing.sh 923051391005
```

---

### ❌ Issue: Bot keeps asking for phone number

**Cause**: Environment variable not set properly

**Solutions**:
1. **Use setup script** - Recommended method
2. **Set environment variable** - Before starting bot
3. **Pass as argument** - Use command line flag

```bash
# Method 1: Setup script (Best)
./setup-pairing.sh 923051391005

# Method 2: Environment variable
export PAIRING_NUMBER=923051391005
node index.js --pairing-code

# Method 3: In .env file
# Create .env file with:
# PAIRING_NUMBER=923051391005
# Then run:
node index.js --pairing-code
```

---

### ❌ Issue: "Cannot use pairing code with mobile api"

**Cause**: Conflicting flags

**Solutions**:
- **Remove `--mobile` flag** - Only use `--pairing-code`
- **Run**: `node index.js --pairing-code`
- **Not**: `node index.js --pairing-code --mobile`

---

### ❌ Issue: Error loading owner.json

**Cause**: Missing data directory or file

**Solutions**:
- **Bot auto-creates** it on first run
- **Manual creation** if needed:

```bash
# Create directory
mkdir -p data

# Create owner.json
echo '{"number": "0"}' > data/owner.json
```

---

## 🔧 Advanced Troubleshooting

### Check Connection Status
```bash
# In new terminal while bot is running
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 45.2,
  "memory": {...},
  "timestamp": "2026-06-02T10:30:00Z"
}
```

---

### View Detailed Logs
```bash
# Run with detailed logging
DEBUG=whiskeysockets:* node index.js --pairing-code
```

---

### Verify Phone Number Validity
```bash
# Test phone number format
node -e "const pn = require('awesome-phonenumber'); console.log(pn('+923051391005').isValid());"
# Output: true (valid) or false (invalid)
```

---

### Kill Stuck Processes
```bash
# Find bot process
ps aux | grep "node index.js"

# Kill process
kill -9 <PID>

# Or kill all node processes
killall node
```

---

### Reset Everything
```bash
# Complete reset
rm -rf session
rm -rf node_modules
npm install
./setup-pairing.sh 923051391005
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Internet connection is working
- [ ] Phone number is correct (without + symbol)
- [ ] WhatsApp app is installed on phone
- [ ] You're using personal WhatsApp account (not Business)
- [ ] No other WhatsApp Web session is active
- [ ] Firewall not blocking connection
- [ ] Node.js version is 16 or higher
- [ ] All npm dependencies installed

```bash
# Check Node.js version
node --version
# Should be v16.0.0 or higher

# Verify dependencies
npm list
```

---

## 🆘 Still Having Issues?

1. **Check logs carefully** - Error messages contain clues
2. **Check internet** - Most issues are connection-related
3. **Restart bot** - Kill and restart fresh
4. **Clear session** - Remove session folder
5. **Use default phone** - Test with simple number first

### Sample Working Setup:
```bash
# 1. Clear everything
rm -rf session
rm -rf temp

# 2. Install fresh
npm install

# 3. Run with pairing
./setup-pairing.sh 923051391005

# 4. Follow the prompts
```

---

## 📞 Support Resources

- **YouTube**: Xchristech
- **GitHub**: Xnegotech1/NEGO-CLAN
- **WhatsApp Channel**: Check settings.js for link

---

**Last Updated**: June 2, 2026  
**Bot Version**: 5.2.0  
**Baileys Version**: Latest @whiskeysockets/baileys
