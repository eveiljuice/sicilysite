# Запуск локального сервера

## Быстрый запуск

### Вариант 1: http-server (рекомендуется)
```bash
npx http-server . -p 8080
```
Затем откройте: http://localhost:8080

### Вариант 2: Python
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### Вариант 3: PHP
```bash
php -S localhost:8080
```

### Вариант 4: VS Code Live Server
1. Установите расширение "Live Server"
2. Правый клик на `index.html` → "Open with Live Server"

## Почему нужен сервер?

ES Modules (import/export) не работают при открытии файла напрямую через `file://` протокол из-за политики безопасности браузера (CORS). Требуется HTTP-сервер.

## Автоматический запуск (Windows)

Создайте файл `start.bat`:
```batch
@echo off
echo Starting Sicily Live Map server...
start http://localhost:8080
npx http-server . -p 8080
```

Затем просто запустите `start.bat` двойным кликом.

