#!/usr/bin/env bash
# Деплой сайта-резюме из git в webroot nginx.
# Копируются только файлы из белого списка: .git, deploy/ и сам скрипт в webroot не попадут.
set -euo pipefail

REPO_DIR=/opt/resume-site
WEBROOT=/var/www/resume
LOG=/var/log/resume-deploy.log

cd "$REPO_DIR"
# --ff-only: не создавать merge-коммиты на сервере и не деплоить разошедшуюся историю
git pull --ff-only origin main

install -d -m 755 "$WEBROOT" "$WEBROOT/fonts"
for f in index.html app.js fonts.css photo.webp og-image.svg og-image.png robots.txt sitemap.xml; do
  install -m 644 "$f" "$WEBROOT/$f"
done
install -m 644 fonts/*.woff2 "$WEBROOT/fonts/"

# Проверка конфига nginx перед reload: битый конфиг не уронит работающий сайт
if [[ -f deploy/nginx/georgiy-devops.ru.conf ]] && nginx -t -q 2>/dev/null; then
  systemctl reload nginx
fi

echo "$(date -Is): deployed $(git rev-parse --short HEAD)" >> "$LOG"
