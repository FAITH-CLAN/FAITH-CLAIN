#!/bin/bash

# NEGO-CLAN Bot Pairing Setup Script
# This script helps you pair your bot with WhatsApp using a pairing code

echo "╔════════════════════════════════════════╗"
echo "║   NEGO-TECH Bot Pairing Code Setup      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if phone number is provided
if [ -z "$1" ]; then
    echo "❌ Error: Phone number required"
    echo ""
    echo "Usage: ./setup-pairing.sh <phone_number>"
    echo ""
    echo "Examples:"
    echo "  ./setup-pairing.sh 923051391005    (for +92 country code)"
    echo "  ./setup-pairing.sh 2348123456789   (for +234 country code)"
    echo "  ./setup-pairing.sh 919876543210    (for +91 country code)"
    echo ""
    echo "📋 Format: Enter phone number WITHOUT + symbol"
    exit 1
fi

PHONE_NUMBER=$1

# Validate phone number (should be 10-15 digits)
if ! [[ "$PHONE_NUMBER" =~ ^[0-9]{10,15}$ ]]; then
    echo "❌ Error: Invalid phone number format"
    echo "   Phone number should contain 10-15 digits without + or spaces"
    exit 1
fi

echo "📱 Phone Number: +${PHONE_NUMBER}"
echo ""
echo "Starting bot with pairing code mode..."
echo ""

# Export environment variables for pairing
export PAIRING_NUMBER=$PHONE_NUMBER
export NODE_ENV=production

# Start the bot
node index.js --pairing-code

# Exit handler
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Bot failed to start"
    exit 1
fi
