#!/bin/bash
# ============================================================
#  ZenHR Hackathon 2026 — one-click starter
#
#  What this script does (in plain words):
#    1. Checks that the tools it needs are on your computer
#    2. Downloads everything the app needs to run (one-time)
#    3. Starts the app and tells you where to open it
#
#  How to run it:
#    Open the Terminal app, then type:
#        cd <the folder where this project lives>
#        ./start.sh
# ============================================================

set -e  # stop immediately if any step fails

APP_URL="http://localhost:4200"

say() { printf "\n\033[1;36m%s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31m%s\033[0m\n" "$1"; exit 1; }

say "👋 Welcome! Setting up the ZenHR Hackathon app..."

# ------------------------------------------------------------
# Step 1 — make sure Node.js is installed
# (Node.js is the engine that runs the app on your computer)
# ------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  fail "❌ Node.js is not installed.
   Please download and install the LTS version from https://nodejs.org
   then run this script again."
fi
say "✅ Node.js found ($(node --version))"

# ------------------------------------------------------------
# Step 2 — make sure Yarn is installed
# (Yarn is the tool that downloads the app's building blocks)
# ------------------------------------------------------------
if ! command -v yarn >/dev/null 2>&1; then
  say "📦 Yarn is not installed — installing it now..."
  npm install --global yarn || fail "❌ Could not install Yarn.
   Try running:  npm install --global yarn  yourself, then re-run this script."
fi
say "✅ Yarn found ($(yarn --version))"

# ------------------------------------------------------------
# Step 3 — download the app's dependencies (one-time, ~2-3 min)
# ------------------------------------------------------------
say "📥 Downloading everything the app needs... (this can take a few minutes the first time)"
yarn install

# ------------------------------------------------------------
# Step 4 — start the app
# ------------------------------------------------------------
say "🚀 Starting the app..."
say "   When it's ready, open this address in your browser:  $APP_URL"
say "   To stop the app later, come back here and press:  Ctrl + C"

yarn dev
