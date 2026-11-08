<div align="center">

# spmod
### Native Ad-Free Playback • Lossless Offline Downloader • Smart Proxy Fallback

[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)](https://github.com)
[![Spotify](https://img.shields.io/badge/spotify-v1.2.x%20--%201.3.x%2B-1ed760?style=flat-square&logo=spotify&logoColor=white)](https://spotify.com)
[![Architecture](https://img.shields.io/badge/architecture-x64-lightgrey?style=flat-square)](https://github.com)
[![Zero-Dependency](https://img.shields.io/badge/dependencies-none%20(self--contained)-success?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-purple?style=flat-square)](LICENSE)

*Модификация и локальная подсистема загрузки для официального десктопного клиента Spotify на Windows. Устраняет аудио- и баннерную рекламу на уровне движка, встраивает нативное скачивание треков и плейлистов в высоком качестве и автоматически адаптируется к сетевым условиям.*

---

</div>

## 📑 Содержание
- [Архитектура](#-архитектура)
- [Быстрая установка](#-быстрая-установка)
  - [Способ 1: PowerShell (Рекомендуемый)](#способ-1-powershell-рекомендуемый)
  - [Способ 2: Двойным кликом (Install.bat)](#способ-2-двойным-кликом-installbat)
- [Как это устроено](#-как-это-устроено)
  - [1. Блокировка рекламы на уровне ядра](#1-блокировка-рекламы-на-уровне-ядра)
  - [2. Подсистема офлайн-скачивания](#2-подсистема-офлайн-скачивания)
  - [3. Автодетект и отказоустойчивость локальных прокси](#3-автодетект-и-отказоустойчивость-локальных-прокси)
  - [4. Исправление прав доступа и Crashpad](#4-исправление-прав-доступа-и-crashpad)
- [Конфигурация](#-конфигурация)
- [Удаление мода](#-удаление-мода)
- [Диагностика](#-диагностика)

---

## 🏛 Архитектура

`spmod` состоит из двух компонентов: **клиентского хука** внутри интерфейса Spotify (CEF) и **фонового микросервиса** (Companion Daemon).

```
┌───────────────────────────────────────────────────────────┐
│                    Spotify Desktop (CEF)                  │
│                                                           │
│   ┌─────────────────────┐       ┌─────────────────────┐   │
│   │   Core Patches      │       │     spmod Bundle    │   │
│   │   (xpui.js)         │       │     (bundle.js)     │   │
│   │                     │       │                     │   │
│   │ • productStateApi   │       │ • Encore UI Buttons │   │
│   │ • Audio ads bypass  │       │ • Settings Modal    │   │
│   │ • Banner stripping  │       │ • Audio Player Hook │   │
│   └─────────────────────┘       └──────────┬──────────┘   │
└────────────────────────────────────────────┼──────────────┘
                                             │ HTTP IPC (127.0.0.1:43821)
                                             ▼
┌───────────────────────────────────────────────────────────┐
│                 spmod Companion Daemon                    │
│                                                           │
│  ┌───────────────────────┐     ┌───────────────────────┐  │
│  │  Smart Proxy Prober   │     │  Multi-Tier Resolver  │  │
│  │                       │     │                       │  │
│  │ • 10808 (v2ray/Xray)  │     │ 1. SoundCloud (M4A)   │  │
│  │ • 7890 (Clash/Mihomo) │     │ 2. YouTube (Fallback) │  │
│  │ • 2080 (sing-box)     │     │ 3. Direct Streaming   │  │
│  │ • Zero-Hang Fallback  │     │                       │  │
│  └───────────────────────┘     └───────────┬───────────┘  │
└────────────────────────────────────────────┼──────────────┘
                                             │ Auto-tag & Save
                                             ▼
                                ┌─────────────────────────┐
                                │ %USERPROFILE%\Music\    │
                                │ └── Spotify Downloads\  │
                                └─────────────────────────┘
```

1. **Client Injection:** Бандл `bundle.js` внедряется напрямую в контейнер `xpui.spa`. Интерфейс строго соблюдает дизайн-систему Spotify Encore: кнопки загрузки интегрируются в шапку плейлистов и панель воспроизведения.
2. **Фоновый микросервис:** Сетевые задачи и загрузка файлов вынесены в изолированный локальный сервис на `127.0.0.1:43821`. Он не нагружает процесс рендерера Spotify и работает полностью независимо.

---

## 🚀 Быстрая установка

Для работы `spmod` **не нужно** устанавливать Node.js, Python, Git или сторонние компиляторы — скрипт полностью автономен.

### Способ 1: PowerShell (Рекомендуемый)

Откройте **PowerShell** (`Win + X` ➔ *Терминал* или *Windows PowerShell*) и выполните:

```powershell
irm https://raw.githubusercontent.com/S1gmaSoso-Zv/spmod/main/install.ps1 | iex
```

*Скрипт автоматически найдет Spotify (или установит официальный Win32, если клиент отсутствует), настроит права доступа, пропишет службу в автозагрузку и запустит клиент за 15 секунд.*

### Способ 2: Двойным кликом (Install.bat)

1. Скачайте архив релиза со страницы [**Releases**](https://github.com/S1gmaSoso-Zv/spmod/releases).
2. Распакуйте архив в любую папку.
3. Запустите `Install.bat` двойным кликом.

---

## ⚙️ Как это устроено

### 1. Блокировка рекламы на уровне ядра

В актуальных версиях Spotify аудиопоток декодируется внутренним нативным аудиодвижком CEF в обход JS DOM. Из-за этого поверхностные методы глушения через тег `<audio>` или перехват `fetch` приводят к зависаниям или 30-секундным паузам тишины.

В `spmod` блокировка работает через переопределение `productStateApi`:
- Параметры `ads: '0'`, `catalogue: 'premium'`, `product: 'premium'`, `type: 'premium'` и `unrestricted: '1'` инжектируются в состояние сессии до инициализации сетевого стека Cosmos.
- Сервер Spotify отдает треки как для аккаунта с подпиской Premium: спонсорские рекламные вставки физически исключаются из очереди воспроизведения на уровне бэкенда.
- Баннерные заглушки и апселл-подсказки отсекаются MutationObserver без задевания контекстных меню приложения.

### 2. Подсистема офлайн-скачивания

Скачивание защищенного потока Spotify напрямую с CDN невозможно из-за шифрования Widevine DRM L3. В `spmod` эта задача решена через локальный микросервис:
- При клике на кнопку скачивания клиент считывает метаданные (исполнитель, название, альбом, ISRC, хронометраж).
- Запрос уходит на локальный REST API (`http://127.0.0.1:43821/download-playlist`).
- **Двухуровневый резолвер:**
  1. **SoundCloud API (`scsearch1:`):** Основной источник. Отдает чистый аудиопоток AAC/M4A без пережатия YouTube и **без троттлинга со стороны провайдеров/DPI**.
  2. **YouTube Audio (`ytsearch1:`):** Резервный источник для редких или специфических треков.
- Загруженные файлы размечаются ID3-тегами, обложками и сохраняются в `%USERPROFILE%\Music\Spotify Downloads\`.
- Путь папки автоматически регистрируется в конфигурации Spotify (`prefs` ➔ `storage.local_files_sources`), делая треки сразу доступными в «Локальных файлах».

### 3. Автодетект и отказоустойчивость локальных прокси

Если прокси жестко задан в настройках, но программа выключена — загрузчик зависнет по таймауту соединения (`ECONNREFUSED`).

В `spmod` реализован **Zero-Hang Probing**:
1. При запуске и перед каждой загрузкой демон проводит быстрый TCP-опрос (таймаут 350 мс) локальных портов:
   - `10808` / `10809` — v2rayN, Xray, sing-box
   - `7890` / `7891` / `7897` — Clash, Clash Verge Rev, Mihomo
   - `2080` / `2081` — NekoBox, NekoRay
   - `40000` — Cloudflare WARP
   - `1080` — Shadowsocks, Outline
   - Системный прокси из реестра Windows
2. Если активный порт найден — трафик направляется через него.
3. Если локальный клиент выключен — сервис **не выдает ошибку**, а моментально переключается на прямое соединение (Direct).

### 4. Исправление прав доступа и Crashpad

Распространенная причина «серого экрана» и моментального вылета Spotify после модификации — служба сбора краш-дампов Google Crashpad:
- Если каталог `%LOCALAPPDATA%\Spotify\User Data\Crashpad` имеет поврежденные дескрипторы безопасности или недоступный `settings.dat`, вызов `TransactNamedPipe` внутри CEF завершается с кодом `0x6D` (`ERROR_BROKEN_PIPE`), вызывая аварийный `exit(1)`.
- Инсталлятор автоматически захватывает владение (`takeown`), выдает полные права доступа текущему пользователю (`icacls ... /grant :F`), создает валидный буфер `settings.dat` (4096 байт) и структуры `new`, `pending`, `completed`.

---

## 🛠 Конфигурация

Файл параметров службы расположен по адресу:
`%APPDATA%\spmod\companion\config.json`

```json
{
  "proxyEnabled": true,
  "proxyUrl": "socks5://127.0.0.1:10808",
  "downloadDir": "C:\\Users\\username\\Music\\Spotify Downloads",
  "activePreset": "direct",
  "autoBypass": true
}
```

- `proxyEnabled` *(boolean)*: Принудительное включение прокси (при `false` работает автодетект).
- `proxyUrl` *(string)*: Адрес локального прокси (`socks5://127.0.0.1:10808` или `http://127.0.0.1:7890`).
- `downloadDir` *(string)*: Директория для сохранения загруженной музыки.

---

## 🔄 Удаление мода

Чтобы полностью удалить `spmod` и вернуть Spotify в исходное состояние:

```powershell
& "$env:APPDATA\spmod\uninstall.ps1"
```

Скрипт восстанавливает оригинальный `xpui.spa` из бэкапа `xpui.spa.bak`, останавливает демон и удаляет ярлык из автозагрузки Windows.

---

## 🔍 Диагностика

<details>
<summary><b>Spotify закрывается через пару секунд после старта</b></summary>

Проверьте доступ к базе Crashpad. Выполните в PowerShell:
```powershell
icacls "$env:LOCALAPPDATA\Spotify\User Data\Crashpad" /grant "${env:USERNAME}:(OI)(CI)F" /t
```
</details>

<details>
<summary><b>Кнопка скачивания сообщает, что Companion не отвечает</b></summary>

Проверьте пинг микросервиса:
```powershell
curl.exe http://127.0.0.1:43821/ping
```
Если ответа нет, перезапустите службу:
```powershell
powershell -ExecutionPolicy Bypass -File "$env:APPDATA\spmod\companion\start.ps1" -Restart
```
</details>

<details>
<summary><b>Установлена версия из Microsoft Store</b></summary>

Версия из Windows Store изолирована в системном контейнере `WindowsApps` и блокирует изменение файлов. Инсталлятор предупредит об этом. Рекомендуется удалить версию из Store и позволить `install.ps1` установить официальный Win32-клиент.
</details>

---

<div align="center">

Distributed under the MIT License. See `LICENSE` for more information.

</div>
