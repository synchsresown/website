#!/usr/bin/env bash
# Copy images from your Obsidian vault into the website repo so they load on the site.
# Run from the website repo root, or set VAULT_ROOT.
#
# Usage: bash scripts/sync-vault-images.sh
# Or from ABWeb: bash website/scripts/sync-vault-images.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMG_DEST="$WEBSITE_ROOT/src/site/img/user"

# Default: vault is the parent of website (e.g. ABWeb/ contains both vault and website/)
VAULT_ROOT="${VAULT_ROOT:-$(cd "$WEBSITE_ROOT/../.." && pwd)}"

echo "Vault root: $VAULT_ROOT"
echo "Website img destination: $IMG_DEST"
mkdir -p "$IMG_DEST"

# Copy Objects/Image (and any other folders you add below)
if [ -d "$VAULT_ROOT/Objects/Image" ]; then
  mkdir -p "$IMG_DEST/Objects/Image"
  for f in "$VAULT_ROOT/Objects/Image"/*; do
    [ -f "$f" ] && cp -n "$f" "$IMG_DEST/Objects/Image/" 2>/dev/null || true
  done
  echo "Synced Objects/Image"
fi

# Add more vault paths if you keep images elsewhere, e.g.:
# if [ -d "$VAULT_ROOT/Assets/Images" ]; then
#   mkdir -p "$IMG_DEST/Assets/Images"
#   cp -n "$VAULT_ROOT/Assets/Images"/*.* "$IMG_DEST/Assets/Images/" 2>/dev/null || true
# fi

echo "Done. Commit and push if you want the site to show new/updated images."
echo "In notes, reference images as: /img/user/Objects/Image/filename.png"
