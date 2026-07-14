#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/release/macos"
ARCH="$(uname -m)"

echo "==> Building TypeScript..."
cd "$ROOT"
npm run build

echo "==> Preparing release folder..."
rm -rf "$OUT"
mkdir -p "$OUT"

cp package.json package-lock.json "$OUT/"
cp -r dist "$OUT/"
cp .env.example "$OUT/"

echo "==> Installing production dependencies ($ARCH)..."
cd "$OUT"
npm ci --omit=dev

cat > "$OUT/chrono-server" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

mkdir -p "$(dirname "${DATABASE_PATH:-./data/chrono.sqlite}")"

export NODE_ENV=production
node dist/src/main.js
EOF

chmod +x "$OUT/chrono-server"

cd "$ROOT/release"
rm -f "chrono-local-network-macos-$ARCH.zip"
zip -rq "chrono-local-network-macos-$ARCH.zip" macos

echo ""
echo "Done."
echo "  Folder: $OUT"
echo "  Zip:    $ROOT/release/chrono-local-network-macos-$ARCH.zip"
echo ""
echo "Run locally:"
echo "  cd $OUT && ./chrono-server"
