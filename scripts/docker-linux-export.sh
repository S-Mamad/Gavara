#!/usr/bin/env bash
set -euo pipefail

rm -rf /work
mkdir -p /work /out

tar -C /src \
  --exclude=node_modules \
  --exclude=.next \
  --exclude='*.zip' \
  --exclude=.env \
  --exclude=.env.local \
  --exclude=_linux_build_out \
  --exclude=_host_pack \
  --exclude=_remote_backup \
  --exclude=_hajiasal_host_stage \
  -cf - . | tar -C /work -xf -

cd /work
unset NODE_ENV || true
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://gavara.ir}"

echo "[linux-build] node=$(node -v) npm=$(npm -v) SITE=$NEXT_PUBLIC_SITE_URL"
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
ok=0
for i in 1 2 3; do
  echo "[linux-build] npm install attempt $i"
  if npm install --include=dev --no-audit --no-fund; then
    ok=1
    break
  fi
  sleep 8
done
test "$ok" = "1"
npm install --save-dev @types/three@0.185.4 --no-audit --no-fund || true
# Ambient fallback if types install fails
mkdir -p src/types
printf 'declare module "three";\n' > src/types/three-shim.d.ts
export NODE_ENV=production
npm run build

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public

# Export host runtime package into /out
find /out -mindepth 1 -maxdepth 1 -exec rm -rf {} +
mkdir -p /out/.next /out/tmp /out/data /out/public

# Prefer standalone tree as the deploy root (cPanel app.js expects this layout)
if [ -f .next/standalone/server.js ]; then
  cp -a .next/standalone/. /out/
elif [ -d .next/standalone ]; then
  # nested project folder name
  nested=$(find .next/standalone -maxdepth 2 -type f -name server.js | head -n1)
  cp -a "$(dirname "$nested")"/. /out/
fi

mkdir -p /out/.next
cp -a .next/static /out/.next/static
cp -a public/. /out/public/
cp -a data/. /out/data/ 2>/dev/null || true
cp -a server.js /out/ 2>/dev/null || true
cp -a scripts/host-app.js /out/app.js 2>/dev/null || true
cp -a package.json /out/
printf 'ok\n' > /out/tmp/.gitkeep

# Preserve helper entry if host uses app.js
if [ ! -f /out/app.js ] && [ -f /src/scripts/host-app.js ]; then
  cp -a /src/scripts/host-app.js /out/app.js
fi
if [ ! -f /out/server.js ] && [ -f /src/_host_pack/server.js ]; then
  cp -a /src/_host_pack/server.js /out/server.js
fi

echo "[linux-build] exported"
ls -la /out | head
test -f /out/server.js -o -f /out/app.js
echo "[linux-build] OK"
