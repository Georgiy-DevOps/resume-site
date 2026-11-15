# Деплой и nginx

## Что изменилось в отдаче сайта

| Было | Стало |
|---|---|
| `Server: nginx/1.28.3 (Ubuntu)` | `Server: nginx` (`server_tokens off`) |
| Нет HSTS, CSP и других security-заголовков | HSTS, CSP (`script-src 'self'`), nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP/CORP |
| Шрифты с Google Fonts (IP посетителей уходят третьей стороне) | Шрифты локально, внешних запросов 0 |
| Без JS страница пустая | `<noscript>`-фолбэк |
| Любой метод HTTP | Только GET/HEAD, остальное 405 |
| `deploy.sh` без `set -e`, merge-коммиты на сервере | `set -euo pipefail`, `git pull --ff-only`, копирование по белому списку |

Проверено в контейнере `nginx:1.28-alpine`: `nginx -t` проходит, заголовки отдаются, `/deploy.sh` и `/.git/config` → 404, POST → 405, TLS 1.1 отклоняется. В Chromium под этой CSP нет ни одной ошибки в консоли.

## Установка на сервер (один раз)

```bash
# 1. Сохранить текущий конфиг, чтобы можно было откатиться
sudo cp -a /etc/nginx/sites-available/ /root/nginx-backup-$(date +%F)/

# 2. Сверить пути к сертификатам с текущим конфигом
sudo grep -R "ssl_certificate" /etc/nginx/sites-enabled/

# 3. Поставить конфиг и сниппет
sudo install -m 644 deploy/nginx/snippets/security-headers.conf /etc/nginx/snippets/
sudo install -m 644 deploy/nginx/georgiy-devops.ru.conf /etc/nginx/sites-available/georgiy-devops.ru
sudo ln -sf /etc/nginx/sites-available/georgiy-devops.ru /etc/nginx/sites-enabled/georgiy-devops.ru
# удалить старый конфиг сайта из sites-enabled, если он назывался иначе

# 4. Проверить и применить
sudo nginx -t && sudo systemctl reload nginx

# 5. Задеплоить сайт
sudo /opt/resume-site/deploy.sh
```

Проверка снаружи: `curl -sI https://georgiy-devops.ru | grep -iE 'server|strict|content-security'` и [securityheaders.com](https://securityheaders.com/?q=georgiy-devops.ru).

Откат: вернуть файлы из `/root/nginx-backup-*`, затем `nginx -t && systemctl reload nginx`.
