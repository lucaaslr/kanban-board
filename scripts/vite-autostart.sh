#!/usr/bin/env bash
# vite-autostart.sh — register a Vite project as a systemd user service
# Usage: ./vite-autostart.sh [project-dir] [--port PORT] [--uninstall]

set -euo pipefail

# ── helpers ──────────────────────────────────────────────────────────────────

die()  { echo "error: $*" >&2; exit 1; }
info() { echo "  $*"; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [project-dir] [--port PORT] [--uninstall]

  project-dir   Path to the Vite project (default: current directory)
  --port PORT   Port for vite preview (default: 4173)
  --uninstall   Stop and remove the service instead of installing it

The script creates a systemd user service that serves the project's dist/
directory via 'vite preview' and starts it automatically on every login.

EOF
  exit 0
}

# ── argument parsing ──────────────────────────────────────────────────────────

PROJECT_DIR=""
PORT=4173
UNINSTALL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h) usage ;;
    --port)    PORT="${2:?--port requires a value}"; shift 2 ;;
    --uninstall) UNINSTALL=true; shift ;;
    -*) die "unknown option: $1" ;;
    *)  [[ -z "$PROJECT_DIR" ]] || die "unexpected argument: $1"
        PROJECT_DIR="$1"; shift ;;
  esac
done

PROJECT_DIR="$(realpath "${PROJECT_DIR:-.}")"

# ── validate environment ──────────────────────────────────────────────────────

[[ -d "$PROJECT_DIR" ]] || die "directory not found: $PROJECT_DIR"

PKG="$PROJECT_DIR/package.json"
[[ -f "$PKG" ]] || die "no package.json found in $PROJECT_DIR"

# derive a service name from the package name or directory name
SERVICE_NAME="$(python3 -c "import json,sys; d=json.load(open('$PKG')); print(d.get('name',''))" 2>/dev/null)"
[[ -z "$SERVICE_NAME" ]] && SERVICE_NAME="$(basename "$PROJECT_DIR")"
# sanitize: keep only alphanumeric and hyphens
SERVICE_NAME="$(echo "$SERVICE_NAME" | tr -cs '[:alnum:]-' '-' | sed 's/^-//;s/-$//')"

SYSTEMD_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="$SYSTEMD_DIR/${SERVICE_NAME}.service"

# ── uninstall path ────────────────────────────────────────────────────────────

if $UNINSTALL; then
  echo "Removing service: $SERVICE_NAME"
  systemctl --user stop    "$SERVICE_NAME" 2>/dev/null && info "stopped" || info "was not running"
  systemctl --user disable "$SERVICE_NAME" 2>/dev/null && info "disabled" || true
  rm -f "$SERVICE_FILE"
  systemctl --user daemon-reload
  info "service removed"
  exit 0
fi

# ── pre-install checks ────────────────────────────────────────────────────────

# confirm it's a Vite project
if ! grep -q '"vite"' "$PKG"; then
  die "vite not found in package.json — is this a Vite project?"
fi

# check for npx
command -v npx >/dev/null || die "npx not found — install Node.js first"

# warn if dist/ is missing
if [[ ! -d "$PROJECT_DIR/dist" ]]; then
  echo "warning: dist/ not found. Run 'npm run build' before the service can serve files."
  echo "         The service will be registered but will fail until you build."
  echo ""
fi

# check if port is already in use (not a hard stop, just a warning)
if command -v ss >/dev/null && ss -tlnp 2>/dev/null | grep -q ":${PORT}\b"; then
  echo "warning: port $PORT appears to be in use. Use --port to choose another."
fi

# ── install ───────────────────────────────────────────────────────────────────

echo "Installing service: $SERVICE_NAME"
info "project : $PROJECT_DIR"
info "port    : $PORT"
info "service : $SERVICE_FILE"
echo ""

mkdir -p "$SYSTEMD_DIR"

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=${SERVICE_NAME} (vite preview)
After=network.target

[Service]
Type=simple
WorkingDirectory=${PROJECT_DIR}
ExecStart=npx vite preview --host 127.0.0.1 --port ${PORT}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME"
systemctl --user restart "$SERVICE_NAME"

# wait briefly and check status
sleep 2
if systemctl --user is-active --quiet "$SERVICE_NAME"; then
  echo "Service is running."
  echo ""
  echo "  URL: http://127.0.0.1:${PORT}"
  echo ""
  echo "Useful commands:"
  echo "  systemctl --user status  ${SERVICE_NAME}"
  echo "  systemctl --user restart ${SERVICE_NAME}   # after a new build"
  echo "  systemctl --user stop    ${SERVICE_NAME}"
  echo "  $(basename "$0") $PROJECT_DIR --uninstall"
else
  echo "Service registered but did not start cleanly."
  echo "Check logs with: journalctl --user -u ${SERVICE_NAME} -n 30"
  exit 1
fi
