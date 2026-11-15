#!/bin/bash
# Pusht lokale commits van de weekronde naar GitHub. Draai dit in een gewone terminal
# of via launchd op de HUB (niet in Cowork: daar is git push geblokkeerd).
set -e
cd "$(dirname "$0")/.."
git fetch origin main -q
ahead=$(git rev-list --count origin/main..main)
if [ "$ahead" -eq 0 ]; then echo "Niets te publiceren."; exit 0; fi
git push origin main
echo "Gepubliceerd: $ahead commit(s)."
