#!/usr/bin/env bash
# Bootstrap chrono-local-network on macOS:
# installs git/node, clones the repo, builds and starts the server in the terminal.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Weqil/chrono-local-network.git}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/chrono-local-network}"
PORT="${PORT:-3000}"

log() { printf '\n==> %s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[[ "$(uname -s)" == "Darwin" ]] || fail "This script is for macOS only."

ensure_brew() {
  if command -v brew >/dev/null 2>&1; then
    return 0
  fi

  log "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Apple Silicon: brew lives under /opt/homebrew
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi

  command -v brew >/dev/null 2>&1 || fail "Homebrew installed but not found in PATH. Open a new terminal and re-run."
}

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    log "Git already installed: $(git --version)"
    return 0
  fi

  log "Installing Git..."
  ensure_brew
  brew install git
  command -v git >/dev/null 2>&1 || fail "Git installation failed."
}

ensure_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    log "Node already installed: $(node --version) / npm $(npm --version)"
    return 0
  fi

  log "Installing Node.js..."
  ensure_brew
  brew install node
  command -v node >/dev/null 2>&1 || fail "Node.js installation failed."
  command -v npm >/dev/null 2>&1 || fail "npm not found after Node install."
}

clone_repo() {
  if [[ -d "$INSTALL_DIR/.git" ]]; then
    log "Repo already exists at $INSTALL_DIR — pulling latest..."
    git -C "$INSTALL_DIR" pull --ff-only
    return 0
  fi

  if [[ -e "$INSTALL_DIR" ]]; then
    fail "Path $INSTALL_DIR exists but is not a git repo. Set INSTALL_DIR to another folder or remove it."
  fi

  log "Cloning $REPO_URL → $INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
}

setup_and_run() {
  cd "$INSTALL_DIR"

  if [[ ! -f .env ]]; then
    log "Creating .env from .env.example"
    cp .env.example .env
  fi

  mkdir -p data

  log "Installing npm dependencies..."
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  log "Building..."
  npm run build

  log "Starting server on port $PORT (Ctrl+C to stop)..."
  echo ""
  echo "  Local:   http://localhost:$PORT"
  echo "  Status:  http://localhost:$PORT/api/status"
  echo ""

  export PORT HOST="${HOST:-0.0.0.0}"
  export DATABASE_PATH="${DATABASE_PATH:-./data/chrono.sqlite}"
  exec npm run start:prod
}

ensure_git
ensure_node
clone_repo
setup_and_run
