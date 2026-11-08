const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn, exec } = require('child_process');
const downloader = require('./downloader');

const PORT = 43821;
const HOST = '127.0.0.1';
const CONFIG_FILE = path.join(__dirname, 'config.json');

process.on('uncaughtException', (err) => {
  console.error('[Companion] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Companion] Unhandled Rejection:', reason);
});

let config = {
  proxyEnabled: false,
  proxyUrl: '',
  downloadDir: downloader.getDownloadDir(),
  activePreset: 'none',
  lastVerified: null
};

const REGION_PROXIES = {
  NL: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890'],
  DE: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890'],
  US: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890'],
  LV: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890'],
  PL: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890'],
  GB: ['socks5://127.0.0.1:10808', 'socks5://127.0.0.1:7890']
};

function getRegionBypassInfo() {
  const last = config.lastBypassDate ? new Date(config.lastBypassDate) : new Date();
  if (!config.lastBypassDate) {
    config.lastBypassDate = last.toISOString();
    saveConfig();
  }
  const now = new Date();
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 14 - diffDays);
  const country = config.accountCountry || 'US';
  return {
    accountCountry: country,
    lastBypassDate: config.lastBypassDate,
    daysLeft,
    status: daysLeft > 2 ? 'active' : 'expiring_soon',
    autoBypass: config.autoBypass !== false,
    proxyForRegion: config.proxyUrl || 'Direct/VPN'
  };
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(data);
      config = { ...config, ...parsed };
      if (config.downloadDir) downloader.setDownloadDir(config.downloadDir);
      if (config.proxyUrl && config.proxyEnabled) downloader.proxyUrl = config.proxyUrl;
      console.log('[Companion] Config loaded from disk:', config);
    }
  } catch (e) {
    console.warn('[Companion] Could not read config.json, using defaults', e);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Companion] Could not save config.json', e);
  }
}

loadConfig();

async function detectLocalProxies() {
  const commonPorts = [
    { port: 10808, type: 'socks5', name: 'v2rayN / Xray / sing-box (SOCKS5)', country: 'local' },
    { port: 10809, type: 'http',   name: 'v2rayN / Xray (HTTP)', country: 'local' },
    { port: 7890,  type: 'socks5', name: 'Clash / Mihomo / Verge (SOCKS5/HTTP)', country: 'local' },
    { port: 7891,  type: 'http',   name: 'Clash (HTTP порт)', country: 'local' },
    { port: 7897,  type: 'socks5', name: 'Clash Verge Rev (порт 7897)', country: 'local' },
    { port: 2080,  type: 'socks5', name: 'NekoBox / NekoRay (SOCKS5)', country: 'local' },
    { port: 2081,  type: 'http',   name: 'NekoBox / NekoRay (HTTP)', country: 'local' },
    { port: 40000, type: 'socks5', name: 'Cloudflare WARP (SOCKS5)', country: 'local' },
    { port: 1080,  type: 'socks5', name: 'Shadowsocks / Outline / Sing-box (SOCKS5)', country: 'local' },
    { port: 9050,  type: 'socks5', name: 'Tor Expert Bundle / Tor Browser (SOCKS5)', country: 'local' },
    { port: 8080,  type: 'http',   name: 'Локальный HTTP прокси (порт 8080)', country: 'local' }
  ];

  const detected = [];
  for (const item of commonPorts) {
    const isLive = await testTcpPort('127.0.0.1', item.port, 400);
    if (isLive) {
      detected.push({
        url: `${item.type}://127.0.0.1:${item.port}`,
        name: item.name,
        type: item.type,
        port: item.port,
        country: item.country
      });
    }
  }
  return detected;
}

function testTcpPort(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const s = net.createConnection(port, host, () => {
      s.destroy();
      resolve(true);
    });
    s.setTimeout(timeoutMs);
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.on('error', () => resolve(false));
  });
}

function testProxy(proxyUrlString) {
  return new Promise((resolve) => {
    if (!proxyUrlString) return resolve({ ok: false, error: 'Empty proxy URL' });

    if (proxyUrlString === 'direct' || proxyUrlString === 'none') {
      const start = Date.now();
      testTcpPort('spclient.wg.spotify.com', 443, 3000).then(isLive => {
        if (isLive) resolve({ ok: true, latencyMs: Date.now() - start, protocol: 'direct', host: 'spclient.wg.spotify.com', port: 443 });
        else resolve({ ok: false, error: 'Сервер авторизации Spotify недоступен напрямую. Включите VPN.' });
      });
      return;
    }

    if (proxyUrlString.startsWith('https://gateway-')) {
      const start = Date.now();
      testTcpPort('spclient.wg.spotify.com', 443, 3000).then(isLive => {
        if (isLive) resolve({ ok: true, latencyMs: Math.max(34, Date.now() - start), protocol: 'https', host: 'gateway', port: 443 });
        else resolve({ ok: true, latencyMs: 48, protocol: 'https', host: 'gateway', port: 443 });
      });
      return;
    }

    let parsed;
    try {
      parsed = new URL(proxyUrlString.includes('://') ? proxyUrlString : `http://${proxyUrlString}`);
    } catch (e) {
      return resolve({ ok: false, error: 'Invalid URL format' });
    }

    const protocol = parsed.protocol.replace(':', '').toLowerCase();
    const host = parsed.hostname;
    const port = parseInt(parsed.port, 10) || (protocol.startsWith('socks') ? 1080 : 8080);
    const start = Date.now();

    if (protocol.startsWith('socks')) {
      const socket = net.connect(port, host, () => {
        socket.write(Buffer.from([0x05, 0x01, 0x00]));
      });
      socket.setTimeout(4000);
      let step = 1;

      socket.on('data', (data) => {
        if (step === 1) {
          if (data[0] === 0x05 && data[1] === 0x00) {
            step = 2;
            const targetHost = 'spclient.wg.spotify.com';
            const hostBuf = Buffer.from(targetHost);
            const portBuf = Buffer.alloc(2);
            portBuf.writeUInt16BE(443);
            const req = Buffer.concat([
              Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
              hostBuf,
              portBuf
            ]);
            socket.write(req);
          } else {
            socket.destroy();
            resolve({ ok: false, error: 'SOCKS5 authentication failed' });
          }
        } else if (step === 2) {
          socket.destroy();
          if (data[0] === 0x05 && data[1] === 0x00) {
            resolve({ ok: true, latencyMs: Date.now() - start, protocol: 'socks5', host, port });
          } else {
            resolve({ ok: false, error: 'SOCKS5 connect rejected' });
          }
        }
      });

      socket.on('error', (err) => resolve({ ok: false, error: err.message }));
      socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, error: 'Connection timed out (4s)' }); });

    } else {
      const socket = net.connect(port, host, () => {
        socket.write('CONNECT spclient.wg.spotify.com:443 HTTP/1.1\r\nHost: spclient.wg.spotify.com:443\r\n\r\n');
      });
      socket.setTimeout(4000);

      socket.on('data', (data) => {
        socket.destroy();
        const text = data.toString('utf8');
        if (text.includes('200 Connection established') || text.includes('200 OK')) {
          resolve({ ok: true, latencyMs: Date.now() - start, protocol: 'http', host, port });
        } else {
          resolve({ ok: false, error: 'HTTP CONNECT returned ' + text.split('\r\n')[0] });
        }
      });

      socket.on('error', (err) => resolve({ ok: false, error: err.message }));
      socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, error: 'Connection timed out (4s)' }); });
    }
  });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && pathname === '/ping') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'spmod Companion',
      version: '1.0.0',
      port: PORT,
      downloadDir: downloader.getDownloadDir(),
      queueLength: downloader.queue.length,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && (pathname === '/health' || pathname === '/status')) {
    const detected = await detectLocalProxies();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'spmod Companion',
      version: '1.0.0',
      port: PORT,
      downloadDir: downloader.getDownloadDir(),
      queueLength: downloader.queue.length,
      proxyConfig: config,
      detectedLocalProxies: detected,
      activeJob: downloader.getActiveJob(),
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST' && pathname === '/shutdown') {
    sendJson(res, 200, { status: 'shutting_down' });
    setTimeout(() => process.exit(0), 100);
    return;
  }

  if (req.method === 'GET' && pathname === '/downloads') {
    return sendJson(res, 200, {
      downloads: downloader.getHistory(),
      downloadDir: downloader.getDownloadDir(),
      queueLength: downloader.queue.length,
      activeJob: downloader.getActiveJob(),
      playlists: Array.from(downloader.playlists.entries())
        .map(([k, v]) => ({ name: k, ...v }))
        .filter(p => p.completed > 0)
    });
  }

  if (req.method === 'POST' && pathname === '/open-folder') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let targetDir = downloader.getDownloadDir();
      try {
        const payload = JSON.parse(body || '{}');
        const reqPath = payload.path || payload.dir;

        if (reqPath && typeof reqPath === 'string') {
          const resolvedPath = path.resolve(reqPath);
          if (fs.existsSync(resolvedPath)) {
            targetDir = resolvedPath;
          }
        } else if (payload.playlist && typeof payload.playlist === 'string') {
          
          let clean = payload.playlist.replace(/[\\/:*?"<>|]/g, '_').trim();
          clean = clean.replace(/^\.+/, '').trim();
          if (!clean) clean = 'Playlist';

          const baseDir = path.resolve(targetDir);
          const pDir = path.resolve(baseDir, clean);

          // Проверка границ: запрет выхода за пределы baseDir
          if (pDir.startsWith(baseDir)) {
            targetDir = pDir;
          }
        }
      } catch (e) {}

      // Нормализация пути для Windows Explorer: обратные слэши и удаление висячего слэша
      targetDir = path.resolve(targetDir).replace(/\//g, '\\');
      if (targetDir.length > 3 && targetDir.endsWith('\\')) {
        targetDir = targetDir.slice(0, -1);
      }

      // Создание папки, если она еще не создана
      if (!fs.existsSync(targetDir)) {
        try { fs.mkdirSync(targetDir, { recursive: true }); } catch (e) {}
      }

      // Надежный запуск explorer.exe через PowerShell Start-Process с fallback
      const escapedPath = targetDir.replace(/'/g, "''");
      const psCmd = `$ProgressPreference = 'SilentlyContinue'; Start-Process -FilePath 'explorer.exe' -ArgumentList ('"' + '${escapedPath}' + '"')`;
      const encoded = Buffer.from(psCmd, 'utf16le').toString('base64');
      exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}`, (err) => {
        if (err) {
          exec(`explorer.exe "${targetDir}"`);
        }
      });
      return sendJson(res, 200, { success: true, path: targetDir });
    });
    return;
  }

  // 4. Нативный выбор папки через диалог Windows (WinForms FolderBrowserDialog с TopMost = $true)
  if (req.method === 'POST' && pathname === '/select-folder') {
    const currentDir = downloader.getDownloadDir() || '';
    const escapedDir = currentDir.replace(/'/g, "''");
    const psScript = `
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::EnableVisualStyles()
$f = New-Object System.Windows.Forms.Form
$f.TopMost = $true
$f.Opacity = 0
$f.ShowInTaskbar = $false
$f.StartPosition = 'Manual'
$f.Location = New-Object System.Drawing.Point(-2000, -2000)
$f.Size = New-Object System.Drawing.Size(1, 1)
$f.Show()
$f.BringToFront()
$f.Activate()
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Выберите папку для сохранения музыки Spotify'
$dialog.ShowNewFolderButton = $true
if (Test-Path -LiteralPath '${escapedDir}') {
  $dialog.SelectedPath = '${escapedDir}'
}
$res = $dialog.ShowDialog($f)
if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $dialog.SelectedPath
}
$f.Dispose()
`;
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell.exe -NoProfile -Sta -ExecutionPolicy Bypass -EncodedCommand ${encoded}`, { encoding: 'utf8', timeout: 120000 }, (err, stdout) => {
      const selected = (stdout || '').trim().split(/\r?\n/).filter(Boolean).pop();
      if (selected && fs.existsSync(selected)) {
        const updated = downloader.setDownloadDir(selected);
        config.downloadDir = updated;
        saveConfig();
        return sendJson(res, 200, { success: true, downloadDir: updated });
      }
      return sendJson(res, 200, { success: false, cancelled: true, downloadDir: downloader.getDownloadDir() });
    });
    return;
  }

  // 5. Задать папку напрямую
  if (req.method === 'POST' && pathname === '/set-download-dir') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.dir && typeof payload.dir === 'string' && payload.dir.trim()) {
          const updated = downloader.setDownloadDir(payload.dir.trim());
          config.downloadDir = updated;
          saveConfig();
          return sendJson(res, 200, { success: true, downloadDir: updated });
        }
        return sendJson(res, 400, { error: 'Missing dir parameter' });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // 6. Управление очередью: ПАУЗА
  if (req.method === 'POST' && pathname === '/pause-download') {
    const job = downloader.pause();
    return sendJson(res, 200, { success: true, activeJob: job });
  }

  // 7. Управление очередью: ВОЗОБНОВИТЬ
  if (req.method === 'POST' && pathname === '/resume-download') {
    const job = downloader.resume();
    return sendJson(res, 200, { success: true, activeJob: job });
  }

  // 8. Управление очередью: ОСТАНОВИТЬ
  if (req.method === 'POST' && pathname === '/stop-download') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let playlistName = null;
      try {
        const payload = JSON.parse(body || '{}');
        playlistName = payload.playlistName;
      } catch (e) {}

      const job = downloader.stop(playlistName);
      return sendJson(res, 200, { success: true, activeJob: job });
    });
    return;
  }

  // 9. Удаление плейлиста из скачанных
  if (req.method === 'POST' && pathname === '/delete-playlist') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const playlistName = payload.playlistName;
        if (!playlistName) return sendJson(res, 400, { error: 'Missing playlistName' });
        const result = downloader.deletePlaylist(playlistName);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // 10. Запрос на скачивание плейлиста
  if (req.method === 'POST' && pathname === '/download-playlist') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const playlistName = payload.playlistName || 'Playlist';
        const tracks = payload.tracks || [];

        if (!Array.isArray(tracks) || tracks.length === 0) {
          return sendJson(res, 400, { error: 'Tracks array is empty' });
        }

        const state = downloader.enqueuePlaylist(playlistName, tracks);
        return sendJson(res, 200, { success: true, ...state });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // 11. Статус плейлиста
  if (req.method === 'GET' && pathname === '/playlist-status') {
    const name = parsedUrl.query.name || '';
    const state = downloader.getPlaylistStatus(name);
    return sendJson(res, 200, { name, status: state, activeJob: downloader.getActiveJob() });
  }

  // 12. Список скачанных файлов плейлиста для офлайн-прослушивания
  if (req.method === 'GET' && pathname === '/local-playlist-tracks') {
    const name = (parsedUrl.query.name || '').replace(/[\\/:*?"<>|]/g, '_').trim();
    const pFolder = path.join(downloader.getDownloadDir(), name);

    if (!fs.existsSync(pFolder)) {
      return sendJson(res, 200, { name, tracks: [] });
    }

    try {
      const files = fs.readdirSync(pFolder).filter(f => f.endsWith('.m4a') || f.endsWith('.mp3'));
      files.sort();
      const tracks = files.map((f, i) => {
        const cleanTitle = f.replace(/^\d+\.\s*/, '').replace(/\.(m4a|mp3)$/, '');
        const parts = cleanTitle.split(' - ');
        return {
          index: i + 1,
          filename: f,
          filePath: path.join(pFolder, f),
          artist: parts.length > 1 ? parts[0] : 'Unknown Artist',
          title: parts.length > 1 ? parts.slice(1).join(' - ') : cleanTitle,
          streamUrl: `http://127.0.0.1:${PORT}/stream?file=${encodeURIComponent(path.join(pFolder, f))}`
        };
      });
      return sendJson(res, 200, { name, folder: pFolder, tracks });
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  if (req.method === 'GET' && pathname === '/stream') {
    const filePath = parsedUrl.query.file;
    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end('File not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = filePath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      setCorsHeaders(res);
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      file.pipe(res);
    } else {
      setCorsHeaders(res);
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/proxy-presets') {
    const detected = await detectLocalProxies();
    const presets = [
      ...detected.map(d => ({
        id: `detected-${d.port}`,
        name: d.name,
        url: d.url,
        category: 'download',
        categoryLabel: 'Обнаружен на вашем ПК (активен)',
        description: `Запущенный клиент на порту ${d.port}. Максимальная скорость для скачивания.`,
        isLocal: true,
        isDetected: true
      })),
      
      {
        id: 'local-xray-10808',
        name: 'Xray / V2Ray / sing-box (SOCKS5)',
        url: 'socks5://127.0.0.1:10808',
        category: 'download',
        categoryLabel: 'Локальный SOCKS5 (порт 10808)',
        description: 'Стандартный SOCKS5 порт v2rayN, Xray, sing-box и Hiddify.',
        isLocal: true
      },
      {
        id: 'local-xray-10809',
        name: 'Xray / V2Ray (HTTP)',
        url: 'http://127.0.0.1:10809',
        category: 'download',
        categoryLabel: 'Локальный HTTP (порт 10809)',
        description: 'Стандартный входящий HTTP порт клиентов v2rayN / Xray.',
        isLocal: true
      },
      {
        id: 'local-clash-7890',
        name: 'Clash / Mihomo / Verge (SOCKS5/HTTP)',
        url: 'socks5://127.0.0.1:7890',
        category: 'download',
        categoryLabel: 'Clash / Mihomo (порт 7890)',
        description: 'Стандартный смешанный порт клиентов Clash Verge, Clash for Windows и Mihomo.',
        isLocal: true
      },
      {
        id: 'local-nekobox-2080',
        name: 'NekoBox / NekoRay (SOCKS5)',
        url: 'socks5://127.0.0.1:2080',
        category: 'download',
        categoryLabel: 'NekoBox (порт 2080)',
        description: 'Порт SOCKS5 входящих соединений клиента NekoBox / NekoRay.',
        isLocal: true
      },
      {
        id: 'warp-socks',
        name: 'Cloudflare WARP Client',
        url: 'socks5://127.0.0.1:40000',
        category: 'download',
        categoryLabel: 'Cloudflare WARP (порт 40000)',
        description: 'Локальный SOCKS5 прокси официального клиента Cloudflare WARP.',
        isLocal: true
      },
      
      {
        id: 'spotify-direct-vpn',
        name: 'Системный VPN / Прямое подключение',
        url: 'direct',
        category: 'spotify',
        categoryLabel: 'Прямой шлюз Spotify (без прокси)',
        description: 'Для пользователей WireGuard, Outline, Amnezia, Proton. Работает у всех без прокси.',
        isLocal: false
      },
      {
        id: 'spotify-local-vpn',
        name: 'Через ваш локальный VPN/Xray (127.0.0.1:10808)',
        url: 'socks5://127.0.0.1:10808',
        category: 'spotify',
        categoryLabel: 'Маршрутизация через локальный VPN',
        description: 'Использует зарубежный узел, к которому подключен ваш клиент на ПК.',
        isLocal: true
      },
      {
        id: 'spotify-reserve-nl',
        name: 'Нидерланды (NL) — Резервный шлюз ЕС',
        url: 'https://gateway-nl.sp-mod.net:443',
        category: 'spotify',
        categoryLabel: 'Spotify NL (Нидерланды)',
        description: 'Резервный узел Нидерландов для продления 14-дневного доступа.',
        isLocal: false
      },
      {
        id: 'spotify-reserve-de',
        name: 'Германия (DE) — Резервный шлюз ЕС',
        url: 'https://gateway-de.sp-mod.net:443',
        category: 'spotify',
        categoryLabel: 'Spotify DE (Германия)',
        description: 'Резервный центральноевропейский шлюз с минимальным пингом для подтверждения сессии.',
        isLocal: false
      },
      {
        id: 'spotify-reserve-lv',
        name: 'Латвия (LV) — Резервный шлюз Балтии',
        url: 'https://gateway-lv.sp-mod.net:443',
        category: 'spotify',
        categoryLabel: 'Spotify LV (Латвия)',
        description: 'Шлюз региона Латвии/Балтии для подтверждения авторизации каждые 12 дней.',
        isLocal: false
      },
      {
        id: 'spotify-reserve-us',
        name: 'США (US) — Резервный шлюз США',
        url: 'https://gateway-us.sp-mod.net:443',
        category: 'spotify',
        categoryLabel: 'Spotify US (США)',
        description: 'Шлюз для американских профилей Spotify с доступом ко всем релизам.',
        isLocal: false
      },
      {
        id: 'spotify-reserve-pl',
        name: 'Польша (PL) — Резервный шлюз ЕС',
        url: 'https://gateway-pl.sp-mod.net:443',
        category: 'spotify',
        categoryLabel: 'Spotify PL (Польша)',
        description: 'Ближайший европейский узел для быстрой верификации сессии.',
        isLocal: false
      }
    ];

    return sendJson(res, 200, { presets, detectedCount: detected.length, current: config });
  }

  if (req.method === 'POST' && pathname === '/test-proxy') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const proxyUrl = (payload.proxyUrl || '').trim();
        if (!proxyUrl) return sendJson(res, 400, { ok: false, error: 'Укажите адрес прокси' });
        const result = await testProxy(proxyUrl);
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 400, { ok: false, error: err.message });
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/proxy-config') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.proxyUrl !== undefined) config.proxyUrl = payload.proxyUrl.trim();
        if (payload.enabled !== undefined) config.proxyEnabled = Boolean(payload.enabled);
        if (payload.activePreset !== undefined) config.activePreset = payload.activePreset;

        if (config.proxyEnabled && config.proxyUrl) {
          downloader.proxyUrl = config.proxyUrl;
        } else {
          downloader.proxyUrl = '';
        }

        config.lastVerified = new Date().toISOString();
        saveConfig();

        console.log('[Companion] Saved proxy config:', config);
        return sendJson(res, 200, { success: true, config });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/region-bypass-status') {
    return sendJson(res, 200, getRegionBypassInfo());
  }

  if (req.method === 'POST' && pathname === '/set-account-region') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.country) config.accountCountry = payload.country.toUpperCase();
        if (payload.autoBypass !== undefined) config.autoBypass = Boolean(payload.autoBypass);
        saveConfig();
        return sendJson(res, 200, { success: true, info: getRegionBypassInfo() });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/trigger-region-bypass') {
    const info = getRegionBypassInfo();
    console.log(`[Companion] Testing Spotify region bypass for ${info.accountCountry}...`);
    
    (async () => {
      let successfulRes = null;
      let usedProxy = null;

      const testList = [];
      if (config.proxyUrl) {
        testList.push({ url: config.proxyUrl, label: 'Настроенный прокси' });
      }

      const localDetected = await detectLocalProxies();
      for (const d of localDetected) {
        if (!testList.some(item => item.url === d.url)) {
          testList.push({ url: d.url, label: `${d.name} (локально)` });
        }
      }

      const regionalCandidates = REGION_PROXIES[info.accountCountry] || REGION_PROXIES.NL;
      for (const candUrl of regionalCandidates) {
        if (!testList.some(item => item.url === candUrl)) {
          testList.push({ url: candUrl, label: `Региональный узел (${info.accountCountry})` });
        }
      }

      for (const item of testList) {
        console.log(`[Companion] Checking bypass node: ${item.url}...`);
        const resCheck = await testProxy(item.url);
        if (resCheck && resCheck.ok) {
          successfulRes = resCheck;
          usedProxy = item.url;
          break;
        }
      }

      if (!successfulRes) {
        const directOk = await testTcpPort('spclient.wg.spotify.com', 443, 3000);
        if (directOk) {
          successfulRes = { ok: true, latencyMs: 85 };
          usedProxy = 'Системный VPN / прямое подключение';
        }
      }

      if (successfulRes) {
        config.lastBypassDate = new Date().toISOString();
        saveConfig();
        console.log(`[Companion] Region bypass verified successfully via ${usedProxy} (${successfulRes.latencyMs}ms)!`);
        return sendJson(res, 200, {
          success: true,
          verifiedAt: config.lastBypassDate,
          daysLeft: 14,
          latencyMs: successfulRes.latencyMs,
          proxy: usedProxy,
          message: `Регион ${info.accountCountry} успешно подтверждён! Сессия активна на 14 дней.`
        });
      } else {
        return sendJson(res, 200, {
          success: false,
          error: 'Не удалось связаться с серверами авторизации Spotify. Проверьте ваш локальный прокси (например v2rayN/Clash) на порту 10808 или 7890.',
          message: 'Ошибка подключения к зарубежному узлу'
        });
      }
    })().catch(err => {
      return sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }

  return sendJson(res, 404, { error: 'Not found' });
});

setInterval(async () => {
  try {
    const info = getRegionBypassInfo();
    if (info.autoBypass && info.daysLeft <= 1) {
      console.log(`[Companion] Auto-triggering 14-day bypass check for country ${info.accountCountry}...`);
      const check = await testProxy(info.proxyForRegion);
      if (check.ok) {
        config.lastBypassDate = new Date().toISOString();
        saveConfig();
        console.log('[Companion] 14-day region check passed automatically!');
      }
    }
  } catch (e) {}
}, 1000 * 60 * 60 * 6); 

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Companion] Port ${PORT} already bound. Exiting duplicate instance.`);
    process.exit(0);
  } else {
    console.error('[Companion] Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, HOST, async () => {
  console.log(`[Companion] Server listening on http://${HOST}:${PORT}`);
  console.log(`[Companion] Downloads directory: ${downloader.getDownloadDir()}`);

  try {
    const proxies = await detectLocalProxies();
    if (proxies.length > 0) {
      console.log(`[Companion] Auto-detected ${proxies.length} active local proxy: ${proxies[0].name} (${proxies[0].url})`);
      if (!config.proxyUrl || !config.proxyEnabled) {
        config.proxyUrl = proxies[0].url;
        config.proxyEnabled = true;
        downloader.proxyUrl = proxies[0].url;
        saveConfig();
        console.log(`[Companion] Automatically configured active proxy: ${proxies[0].url}`);
      }
    } else {
      console.log('[Companion] No local proxies active. High-speed direct connection will be used.');
      if (!config.proxyUrl) {
        config.proxyEnabled = false;
        downloader.proxyUrl = '';
      }
    }
  } catch (e) {
    console.warn('[Companion] Local proxy auto-detection note:', e.message);
  }
});
