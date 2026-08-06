# Развёртывание chrono-local-network на Raspberry Pi

Локальный сервер хронометража в Docker. База данных — SQLite (`/app/data/chrono.sqlite`).

> **Важно:** без Docker volume база живёт внутри контейнера и **пропадает** при пересоздании (в том числе при автообновлении через Watchtower).

---

## 1. Требования

- Raspberry Pi 4/5 (рекомендуется 64-bit OS)
- Raspberry Pi OS (Bookworm или новее)
- Доступ по SSH
- Интернет (для первого `docker pull`)
- Свободный порт `3000`

Образ: `weqil/chrono-local-network:latest`  
Платформы: `linux/arm64`, `linux/amd64`

---

## 2. Установка Docker

Подключитесь по SSH:

```bash
ssh USER@IP_RASPBERRY
```

Установите Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Выйдите из SSH и зайдите снова, затем проверьте:

```bash
docker version
docker compose version
```

---

## 3. Развёртывание (рекомендуемый способ)

### 3.1. Создать volume для БД

```bash
docker volume create chrono-data
```

### 3.2. Запустить контейнер

```bash
docker run -d \
  --name chrono-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_PATH=/app/data/chrono.sqlite \
  -v chrono-data:/app/data \
  --restart unless-stopped \
  weqil/chrono-local-network:latest
```

Опционально — защита API секретом:

```bash
  -e API_SECRET=your-secret \
```

### 3.3. Проверить, что сервис жив

```bash
docker ps
curl http://127.0.0.1:3000/api/status
```

Ожидаемый ответ примерно:

```json
{"status":"ok",...}
```

С другого устройства в сети:

```bash
curl http://IP_RASPBERRY:3000/api/status
```

### 3.4. Проверить, что volume примонтирован

```bash
docker inspect chrono-app --format '{{range .Mounts}}{{.Name}} {{.Source}} -> {{.Destination}}{{println}}{{end}}'
```

Должно быть:

```text
chrono-data /var/lib/docker/volumes/chrono-data/_data -> /app/data
```

Если вывод пустой — volume **не** подключён, данные при recreate пропадут.

---

## 4. Альтернатива: docker compose

Если на Raspberry есть репозиторий проекта:

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd chrono-local-network
docker compose up -d
```

В `docker-compose.yml` уже указаны:

- образ `weqil/chrono-local-network:latest`
- volume `chrono-data:/app/data`
- порт `3000`
- `restart: unless-stopped`

Проверка:

```bash
docker compose ps
curl http://127.0.0.1:3000/api/status
```

> Имя контейнера в compose по умолчанию — `chrono-local-network`.  
> В инструкции выше используется имя `chrono-app` (как на боевом стенде). Подставляйте своё имя в команды.

---

## 5. Переменные окружения

| Переменная       | По умолчанию                 | Описание                          |
|------------------|------------------------------|-----------------------------------|
| `PORT`           | `3000`                       | HTTP-порт                         |
| `HOST`           | `0.0.0.0`                    | Адрес прослушивания               |
| `DATABASE_PATH`  | `/app/data/chrono.sqlite`    | Путь к SQLite внутри контейнера   |
| `API_SECRET`     | не задан                     | Секрет для API (если нужен)       |

---

## 6. Обновление образа

### Вручную

```bash
docker pull weqil/chrono-local-network:latest

docker stop chrono-app
docker rm chrono-app

docker run -d \
  --name chrono-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_PATH=/app/data/chrono.sqlite \
  -v chrono-data:/app/data \
  --restart unless-stopped \
  weqil/chrono-local-network:latest
```

Volume `chrono-data` **не** удаляйте — в нём лежит база.

### Через Watchtower (опционально)

Watchtower сам пересоздаёт контейнер при новом `latest`.  
Если volume уже примонтирован к `chrono-app`, Watchtower его сохранит — отдельно настраивать mounts не нужно.

Пример запуска Watchtower:

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  containrrr/watchtower \
  --interval 300 \
  --cleanup
```

Рекомендации:

- всегда держите `-v chrono-data:/app/data` на `chrono-app`;
- лучше использовать фиксированный тег (`:v1.2.3`), а не только `latest`;
- `--cleanup` удаляет старые **образы**, не volumes;
- **не** используйте `--remove-volumes`.

Проверка логов Watchtower:

```bash
docker logs watchtower --tail 200
```

Признаки recreate:

```text
Found new weqil/chrono-local-network:latest image
Stopping /chrono-app
Creating /chrono-app
```

---

## 7. Проверка, что данные переживают recreate

Симуляция обновления (как у Watchtower):

```bash
# до
docker exec chrono-app node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/chrono.sqlite', { readonly: true });
console.table(db.prepare('SELECT sync_id, name FROM sync_races').all());
"

docker stop chrono-app
docker rm chrono-app

docker run -d \
  --name chrono-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_PATH=/app/data/chrono.sqlite \
  -v chrono-data:/app/data \
  --restart unless-stopped \
  weqil/chrono-local-network:latest

# после — гонки должны остаться
docker exec chrono-app node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/chrono.sqlite', { readonly: true });
console.table(db.prepare('SELECT sync_id, name FROM sync_races').all());
"
```

---

## 8. Работа с базой SQLite

На Raspberry обычно нет `sqlite3`. Удобнее смотреть БД через Node внутри контейнера.

### Список таблиц

```bash
docker exec -it chrono-app node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/chrono.sqlite', { readonly: true });
console.log(db.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all());
"
```

### Все гонки

```bash
docker exec -it chrono-app node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/chrono.sqlite', { readonly: true });
console.table(db.prepare('SELECT * FROM sync_races').all());
"
```

### Через временный контейнер sqlite3

```bash
docker run --rm -it \
  -v chrono-data:/data \
  keinos/sqlite3 \
  sqlite3 /data/chrono.sqlite ".tables"
```

Основные таблицы:

- `sync_races`
- `sync_race_users`
- `sync_arrivals`
- `sync_arrival_results`
- `sync_arrival_result_laps`
- `arrivals`
- `arrival_results`
- `arrival_result_laps`
- `live_result_snapshots`

---

## 9. Бэкап и восстановление

### Бэкап

```bash
mkdir -p ~/backups
docker cp chrono-app:/app/data/chrono.sqlite \
  ~/backups/chrono-$(date +%Y%m%d-%H%M%S).sqlite
```

Или напрямую из volume:

```bash
sudo cp /var/lib/docker/volumes/chrono-data/_data/chrono.sqlite \
  ~/backups/chrono-$(date +%Y%m%d-%H%M%S).sqlite
```

### Восстановление

```bash
docker cp ~/backups/chrono-YYYYMMDD-HHMMSS.sqlite \
  chrono-app:/app/data/chrono.sqlite
docker restart chrono-app
```

### Простой cron (раз в день в 03:00)

```bash
crontab -e
```

Добавить:

```cron
0 3 * * * docker cp chrono-app:/app/data/chrono.sqlite /home/USER/backups/chrono-$(date +\%Y\%m\%d).sqlite
```

---

## 10. Полезные команды

```bash
# статус
docker ps -a --filter name=chrono-app
docker logs chrono-app --tail 100 -f

# рестарт без потери данных
docker restart chrono-app

# IP Raspberry в локальной сети
hostname -I

# volumes
docker volume ls
docker volume inspect chrono-data
```

---

## 11. Частые проблемы

### База «очистилась» после обновления

Причина: контейнер был без `-v chrono-data:/app/data`, а Watchtower/ручной recreate создал новый контейнер.

Проверка:

```bash
docker inspect chrono-app --format '{{range .Mounts}}{{.Name}} -> {{.Destination}}{{println}}{{end}}'
```

Если пусто — пересоздайте с volume (раздел 3).

### `sqlite3: not found`

Это нормально. Используйте `node` + `better-sqlite3` внутри контейнера (раздел 8).

### Порт 3000 занят

```bash
sudo ss -ltnp | grep 3000
```

Остановите конфликтующий процесс или смените проброс порта, например `-p 3001:3000`.

### Watchtower не может скачать образ (timeout DNS/registry)

В логах будут `i/o timeout` к `registry-1.docker.io` / `index.docker.io`.  
Проверьте интернет и DNS на Raspberry; обновление произойдёт при следующей успешной проверке.

### Старые данные уже потеряны

Если старого контейнера и `chrono.sqlite` в `/var/lib/docker` нет — восстановить нельзя.  
Ищите бэкапы или поднимайте сервис заново с volume.

```bash
docker ps -a | grep -i chrono
docker volume ls
sudo find /var/lib/docker -name 'chrono.sqlite' 2>/dev/null
```

---

## 12. Чеклист после установки

- [ ] `curl http://IP:3000/api/status` отвечает ok
- [ ] `docker inspect` показывает `chrono-data -> /app/data`
- [ ] после `docker rm` + `docker run` с тем же volume гонки на месте
- [ ] настроен бэкап SQLite
- [ ] Watchtower (если есть) без `--remove-volumes`

---

## 13. Краткий one-liner для чистой установки

```bash
docker volume create chrono-data && \
docker run -d \
  --name chrono-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_PATH=/app/data/chrono.sqlite \
  -v chrono-data:/app/data \
  --restart unless-stopped \
  weqil/chrono-local-network:latest && \
curl -s http://127.0.0.1:3000/api/status
```
