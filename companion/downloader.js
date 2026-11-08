const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const https = require('https');
const { spawn } = require('child_process');

let DOWNLOAD_DIR = path.join(os.homedir(), 'Music', 'Spotify Downloads');
const BIN_DIR = path.join(__dirname, 'bin');
const YTDLP_PATH = path.join(BIN_DIR, 'yt-dlp.exe');
const PLAYLISTS_FILE = path.join(__dirname, 'playlists.json');
const LOCAL_NODE = path.join(BIN_DIR, 'node.exe');
const NODE_PATH = (fs.existsSync(LOCAL_NODE) ? LOCAL_NODE : process.execPath) || 'C:\\Program Files\\nodejs\\node.exe';

function isPortActive(host, port, timeoutMs = 350) {
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

async function resolveWorkingProxy(proxyUrlString) {
  if (!proxyUrlString) return null;
  try {
    const parsed = new URL(proxyUrlString);
    const host = parsed.hostname || '127.0.0.1';
    const port = parseInt(parsed.port, 10);
    if (!port) return null;
    const ok = await isPortActive(host, port, 350);
    if (ok) return proxyUrlString;
    console.warn(`[Downloader] Configured proxy ${proxyUrlString} is offline (port ${port} not listening). Falling back to direct connection.`);
    return null;
  } catch (e) {
    return null;
  }
}

function ensureDirs() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    try { fs.mkdirSync(DOWNLOAD_DIR, { recursive: true }); } catch (e) {}
  }
  if (!fs.existsSync(BIN_DIR)) {
    try { fs.mkdirSync(BIN_DIR, { recursive: true }); } catch (e) {}
  }
}
ensureDirs();

class DownloadManager {
  constructor() {
    this.queue = [];
    this.history = [];
    this.playlists = new Map(); 
    this.isProcessing = false;
    this.isPaused = false;
    this.activeItem = null;
    this.currentProcess = null;
    this.proxyUrl = '';
    this.loadPlaylists();
  }

  loadPlaylists() {
    try {
      if (fs.existsSync(PLAYLISTS_FILE)) {
        const raw = fs.readFileSync(PLAYLISTS_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let needsSave = false;
          for (const item of list) {
            const pFolder = item.folder || path.join(DOWNLOAD_DIR, item.name);
            let audioFilesCount = 0;
            if (fs.existsSync(pFolder)) {
              try {
                const files = fs.readdirSync(pFolder).filter(f => f.endsWith('.m4a') || f.endsWith('.mp3') || f.endsWith('.opus'));
                audioFilesCount = files.length;
              } catch (e) {}
            }

            if (!fs.existsSync(pFolder) || audioFilesCount === 0) {
              needsSave = true;
              continue;
            }

            if (item.status === 'downloading' || item.status === 'paused') {
              if (item.total > 0 && audioFilesCount >= item.total) {
                item.status = 'completed';
                item.completed = audioFilesCount;
              } else {
                item.status = 'stopped';
                item.completed = audioFilesCount;
              }
              item.updatedAt = new Date().toISOString();
              needsSave = true;
            }
            this.playlists.set(item.name, item);
          }
          if (needsSave) {
            this.savePlaylists();
          }
        }
      }
    } catch (e) {
      console.warn('[Downloader] Could not load playlists.json', e);
    }
  }

  savePlaylistMetadata(cleanName, state) {
    try {
      const pFolder = (state && state.folder) || path.join(DOWNLOAD_DIR, cleanName);
      if (fs.existsSync(pFolder)) {
        const metaPath = path.join(pFolder, 'metadata.json');
        const meta = {
          name: (state && state.name) || cleanName,
          total: (state && state.total) || 0,
          completed: (state && state.completed) || 0,
          failed: (state && state.failed) || 0,
          status: (state && state.status) || 'unknown',
          folder: pFolder,
          updatedAt: (state && state.updatedAt) || new Date().toISOString()
        };
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('[Downloader] Failed to save metadata.json', e);
    }
  }

  savePlaylists() {
    try {
      const arr = Array.from(this.playlists.values());
      fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(arr, null, 2), 'utf8');
    } catch (e) {
      console.warn('[Downloader] Could not save playlists.json', e);
    }
  }

  getDownloadDir() {
    return DOWNLOAD_DIR;
  }

  setDownloadDir(newDir) {
    if (newDir && typeof newDir === 'string') {
      DOWNLOAD_DIR = path.resolve(newDir);
      ensureDirs();
      console.log('[Downloader] Download directory changed to:', DOWNLOAD_DIR);
      return DOWNLOAD_DIR;
    }
    return DOWNLOAD_DIR;
  }

  getActiveJob() {
    let activePlaylist = null;
    for (const [name, p] of this.playlists.entries()) {
      if (p.status === 'downloading' || p.status === 'paused') {
        activePlaylist = p;
        break;
      }
    }

    return {
      isPaused: this.isPaused,
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      activeItem: this.activeItem ? {
        title: this.activeItem.title,
        artist: this.activeItem.artist,
        playlist: this.activeItem.playlist,
        index: this.activeItem.index || 0,
        progress: this.activeItem.progress || 0,
        stage: this.activeItem.stage || 'searching'
      } : null,
      activePlaylist: activePlaylist ? {
        name: activePlaylist.name,
        total: activePlaylist.total,
        completed: activePlaylist.completed,
        failed: activePlaylist.failed,
        status: activePlaylist.status,
        percent: activePlaylist.total > 0 ? Math.round((activePlaylist.completed / activePlaylist.total) * 100) : 0
      } : null
    };
  }

  pause() {
    this.isPaused = true;
    for (const [name, p] of this.playlists.entries()) {
      if (p.status === 'downloading') {
        p.status = 'paused';
        p.updatedAt = new Date().toISOString();
      }
    }
    this.savePlaylists();
    console.log('[Downloader] Paused download queue.');
    return this.getActiveJob();
  }

  resume() {
    this.isPaused = false;
    for (const [name, p] of this.playlists.entries()) {
      if (p.status === 'paused') {
        p.status = 'downloading';
        p.updatedAt = new Date().toISOString();
      }
    }
    this.savePlaylists();
    console.log('[Downloader] Resumed download queue.');
    this.processNext();
    return this.getActiveJob();
  }

  stop(playlistName) {
    console.log(`[Downloader] Stopping downloads${playlistName ? ' for: ' + playlistName : ''}...`);

    if (playlistName) {
      const cleanName = playlistName.replace(/[\\/:*?"<>|]/g, '_').trim();
      this.queue = this.queue.filter(item => item.playlist !== cleanName);

      const pState = this.playlists.get(cleanName);
      if (pState) {
        pState.status = 'stopped';
        pState.updatedAt = new Date().toISOString();
      }

      if (this.activeItem && this.activeItem.playlist === cleanName && this.currentProcess) {
        try {
          this.currentProcess.kill('SIGTERM');
        } catch (e) {}
      }
    } else {
      this.queue = [];
      for (const [name, p] of this.playlists.entries()) {
        if (p.status === 'downloading' || p.status === 'paused') {
          p.status = 'stopped';
          p.updatedAt = new Date().toISOString();
        }
      }
      if (this.currentProcess) {
        try {
          this.currentProcess.kill('SIGTERM');
        } catch (e) {}
      }
    }

    this.isPaused = false;
    this.isProcessing = false;
    this.activeItem = null;
    this.currentProcess = null;
    this.savePlaylists();

    return this.getActiveJob();
  }

  // Удаление плейлиста из офлайн-библиотеки
  deletePlaylist(playlistName) {
    const cleanName = (playlistName || '').replace(/[\\/:*?"<>|]/g, '_').trim();
    console.log(`[Downloader] Deleting downloaded playlist: ${cleanName}`);

    this.queue = this.queue.filter(item => item.playlist !== cleanName);
    if (this.activeItem && this.activeItem.playlist === cleanName && this.currentProcess) {
      try { this.currentProcess.kill('SIGTERM'); } catch (e) {}
    }

    const playlistFolder = path.join(DOWNLOAD_DIR, cleanName);
    if (fs.existsSync(playlistFolder)) {
      try {
        fs.rmSync(playlistFolder, { recursive: true, force: true });
        console.log(`[Downloader] Deleted folder: ${playlistFolder}`);
      } catch (e) {
        console.warn(`[Downloader] Error removing folder ${playlistFolder}:`, e);
      }
    }

    const m3uFile = path.join(DOWNLOAD_DIR, `${cleanName}.m3u8`);
    if (fs.existsSync(m3uFile)) {
      try { fs.unlinkSync(m3uFile); } catch (e) {}
    }

    this.playlists.delete(cleanName);
    this.savePlaylists();

    return { success: true, name: cleanName };
  }

  ensureYtDlp() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(YTDLP_PATH)) {
        return resolve(YTDLP_PATH);
      }

      console.log('[Downloader] yt-dlp.exe not found. Downloading standalone binary...');
      const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
      const file = fs.createWriteStream(YTDLP_PATH);

      function download(redirectUrl) {
        https.get(redirectUrl, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            return download(response.headers.location);
          }
          if (response.statusCode !== 200) {
            file.close();
            try { fs.unlinkSync(YTDLP_PATH); } catch (e) {}
            return reject(new Error(`Failed to download yt-dlp: HTTP ${response.statusCode}`));
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              console.log('[Downloader] yt-dlp.exe successfully downloaded.');
              resolve(YTDLP_PATH);
            });
          });
        }).on('error', (err) => {
          file.close();
          try { fs.unlinkSync(YTDLP_PATH); } catch (e) {}
          reject(err);
        });
      }

      download(url);
    });
  }

  enqueue(track) {
    const item = {
      id: track.id || `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      index: track.index || 0,
      coverUrl: track.coverUrl || '',
      playlist: track.playlist || null,
      targetFolder: track.targetFolder || DOWNLOAD_DIR,
      status: 'queued', 
      progress: 0,
      filePath: null,
      error: null,
      createdAt: new Date().toISOString()
    };

    this.queue.push(item);
    this.history.unshift(item);
    if (this.history.length > 100) this.history.pop();

    console.log(`[Downloader] Enqueued: ${item.index ? item.index + '. ' : ''}${item.artist} - ${item.title}`);
    this.processNext();
    return item;
  }

  enqueuePlaylist(playlistName, tracks) {
    const cleanName = (playlistName || 'Playlist').replace(/[\\/:*?"<>|]/g, '_').trim();
    const playlistFolder = path.join(DOWNLOAD_DIR, cleanName);
    if (!fs.existsSync(playlistFolder)) {
      try { fs.mkdirSync(playlistFolder, { recursive: true }); } catch (e) {}
    }

    // 1. Проверяем, есть ли уже треки этого плейлиста в очереди или в активной обработке
    const isAlreadyInQueue = this.queue.some(item => item.playlist === cleanName) ||
                             (this.activeItem && this.activeItem.playlist === cleanName);
    if (isAlreadyInQueue) {
      console.log(`[Downloader] Playlist "${cleanName}" is already in active queue, blocking duplicate.`);
      return { alreadyDownloading: true, message: 'Плейлист уже в очереди загрузки' };
    }

    // 2. Если плейлист уже полностью скачан или уже качается — не качать повторно!
    const existing = this.playlists.get(cleanName);
    if (existing && (existing.status === 'downloading' || existing.status === 'paused')) {
      return { alreadyDownloading: true, playlist: existing };
    }
    if (existing && existing.status === 'completed' && existing.completed >= existing.total && existing.total > 0) {
      return { alreadyCompleted: true, playlist: existing };
    }

    // 3. Проверяем существующие аудиофайлы на диске
    if (fs.existsSync(playlistFolder)) {
      try {
        const files = fs.readdirSync(playlistFolder).filter(f => f.endsWith('.m4a') || f.endsWith('.mp3') || f.endsWith('.opus'));
        if (files.length > 0 && files.length >= tracks.length) {
          const completedState = {
            name: cleanName,
            total: tracks.length,
            completed: files.length,
            failed: 0,
            status: 'completed',
            folder: playlistFolder,
            updatedAt: new Date().toISOString()
          };
          this.playlists.set(cleanName, completedState);
          this.savePlaylistMetadata(cleanName, completedState);
          this.savePlaylists();
          console.log(`[Downloader] Playlist "${cleanName}" files already on disk (${files.length}/${tracks.length}), skipping duplicate download.`);
          return { alreadyCompleted: true, playlist: completedState };
        }
      } catch (e) {}
    }

    const playlistState = {
      name: cleanName,
      total: tracks.length,
      completed: 0,
      failed: 0,
      status: 'downloading',
      folder: playlistFolder,
      updatedAt: new Date().toISOString()
    };
    this.playlists.set(cleanName, playlistState);
    this.savePlaylistMetadata(cleanName, playlistState);
    this.savePlaylists();

    console.log(`[Downloader] Enqueueing playlist "${cleanName}" (${tracks.length} tracks) into: ${playlistFolder}`);

    // Добавляем треки с сохранением оригинального порядка (001, 002...)
    tracks.forEach((t, i) => {
      t.index = i + 1;
      t.playlist = cleanName;
      t.targetFolder = playlistFolder;
      this.enqueue(t);
    });

    return playlistState;
  }

  getPlaylistStatus(playlistName) {
    const cleanName = (playlistName || '').replace(/[\\/:*?"<>|]/g, '_').trim();
    return this.playlists.get(cleanName) || null;
  }

  generateM3uPlaylist(playlistName) {
    try {
      const cleanName = (playlistName || '').replace(/[\\/:*?"<>|]/g, '_').trim();
      const pFolder = path.join(DOWNLOAD_DIR, cleanName);
      if (!fs.existsSync(pFolder)) return;

      const files = fs.readdirSync(pFolder).filter(f => f.endsWith('.m4a') || f.endsWith('.mp3'));
      files.sort();

      let content = '#EXTM3U\n';
      for (const f of files) {
        content += `#EXTINF:-1,${f.replace(/\.(m4a|mp3)$/, '')}\n${path.join(pFolder, f)}\n`;
      }

      fs.writeFileSync(path.join(pFolder, `${cleanName}.m3u8`), content, 'utf8');
      fs.writeFileSync(path.join(DOWNLOAD_DIR, `${cleanName}.m3u8`), content, 'utf8');
    } catch (e) {
      console.warn('[Downloader] Failed to write m3u8 playlist', e);
    }
  }

  async processNext() {
    if (this.isPaused || this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue.shift();
    this.activeItem = item;
    item.status = 'downloading';
    item.stage = 'searching';

    try {
      const ytdlp = await this.ensureYtDlp();
      const searchQuery = `ytsearch1:${item.artist} - ${item.title} audio`;
      
      // Нумерация трека 001, 002... для строгого порядка в проводнике и плеере
      const trackNumStr = item.index ? `${String(item.index).padStart(3, '0')}. ` : '';
      const safeTitle = `${trackNumStr}${item.artist} - ${item.title}`.replace(/[\\/:*?"<>|]/g, '_').trim();
      
      const targetDir = item.targetFolder || DOWNLOAD_DIR;
      if (!fs.existsSync(targetDir)) {
        try { fs.mkdirSync(targetDir, { recursive: true }); } catch (e) {}
      }

      const existingExts = ['.m4a', '.mp3', '.opus'];
      let existingTrackPath = null;
      for (const ext of existingExts) {
        const candidate = path.join(targetDir, `${safeTitle}${ext}`);
        if (fs.existsSync(candidate)) {
          try {
            const stat = fs.statSync(candidate);
            if (stat.size > 10240) { 
              existingTrackPath = candidate;
              break;
            }
          } catch (e) {}
        }
      }

      if (!existingTrackPath) {
        try {
          const files = fs.readdirSync(targetDir);
          const match = files.find(f => f.startsWith(safeTitle) && (f.endsWith('.m4a') || f.endsWith('.mp3') || f.endsWith('.opus')));
          if (match) {
            const candidate = path.join(targetDir, match);
            const stat = fs.statSync(candidate);
            if (stat.size > 10240) {
              existingTrackPath = candidate;
            }
          }
        } catch (e) {}
      }

      if (existingTrackPath) {
        console.log(`[Downloader] Track already exists on disk (>10KB), skipping download: ${existingTrackPath}`);
        item.status = 'completed';
        item.progress = 100;
        item.stage = 'completed';
        item.filePath = existingTrackPath;
        this.activeItem = null;
        this.isProcessing = false;

        if (item.playlist) {
          const pState = this.playlists.get(item.playlist);
          if (pState) {
            pState.completed++;
            pState.updatedAt = new Date().toISOString();
            if (pState.completed + pState.failed >= pState.total) {
              pState.status = 'completed';
              this.generateM3uPlaylist(item.playlist);
            }
            this.savePlaylistMetadata(item.playlist, pState);
            this.savePlaylists();
          }
        }
        return this.processNext();
      }

      const outputTemplate = path.join(targetDir, `${safeTitle}.%(ext)s`);

      console.log(`[Downloader] [${this.queue.length} in queue] Downloading: ${safeTitle}`);

      const scQuery = `scsearch1:${item.artist} - ${item.title}`;
      const ytQuery = `ytsearch1:${item.artist} - ${item.title} audio`;

      const runYtDlpAttempt = async (query, onDone) => {
        const activeProxy = await resolveWorkingProxy(this.proxyUrl);
        const args = [
          query,
          '-f', 'ba[ext=m4a]/ba[ext=mp3]/ba',
          '-o', outputTemplate,
          '--no-playlist',
          '--no-check-certificates',
          '--newline',
          '--js-runtimes', `node:${NODE_PATH}`
        ];

        if (activeProxy) {
          args.push('--proxy', activeProxy);
        }

        const child = spawn(ytdlp, args);
        this.currentProcess = child;

        child.stdout.on('data', (data) => {
          const text = data.toString();
          if (text.includes('[soundcloud]') || text.includes('[youtube]') || text.includes('Extracting URL')) {
            item.stage = 'extracting';
          } else if (text.includes('[download]')) {
            item.stage = 'downloading';
          } else if (text.includes('[Fixup]') || text.includes('[ExtractAudio]')) {
            item.stage = 'processing';
          }

          const match = text.match(/\[download\]\s+(\d+\.?\d*)%/);
          if (match) {
            item.progress = parseFloat(match[1]);
          }
        });

        child.on('close', (code) => {
          onDone(code);
        });

        child.on('error', (err) => {
          onDone(-1, err);
        });
      };

      const handleSuccess = () => {
        this.isProcessing = false;
        this.currentProcess = null;
        this.activeItem = null;

        item.status = 'completed';
        item.progress = 100;
        item.stage = 'completed';

        let foundPath = path.join(targetDir, `${safeTitle}.m4a`);
        if (!fs.existsSync(foundPath)) {
          foundPath = path.join(targetDir, `${safeTitle}.mp3`);
        }
        if (!fs.existsSync(foundPath)) {
          try {
            const files = fs.readdirSync(targetDir);
            const m = files.find(f => f.startsWith(safeTitle));
            if (m) foundPath = path.join(targetDir, m);
          } catch (e) {}
        }
        item.filePath = foundPath;
        console.log(`[Downloader] Saved: ${item.filePath}`);

        if (item.playlist) {
          const pState = this.playlists.get(item.playlist);
          if (pState) {
            pState.completed++;
            pState.updatedAt = new Date().toISOString();
            if (pState.completed + pState.failed >= pState.total) {
              pState.status = 'completed';
              this.generateM3uPlaylist(item.playlist);
            }
            this.savePlaylistMetadata(item.playlist, pState);
            this.savePlaylists();
          }
        }
        this.processNext();
      };

      const handleFailure = (code) => {
        this.isProcessing = false;
        this.currentProcess = null;
        this.activeItem = null;

        item.status = 'error';
        item.error = `yt-dlp code ${code}`;
        item.stage = 'error';
        if (item.playlist) {
          const pState = this.playlists.get(item.playlist);
          if (pState) {
            pState.failed++;
            pState.updatedAt = new Date().toISOString();
            if (pState.completed + pState.failed >= pState.total) {
              pState.status = 'completed';
              this.generateM3uPlaylist(item.playlist);
            }
            this.savePlaylistMetadata(item.playlist, pState);
            this.savePlaylists();
          }
        }
        console.error(`[Downloader] Error for ${safeTitle}: code ${code}`);
        this.processNext();
      };

      runYtDlpAttempt(scQuery, (code) => {
        if (code === 0) {
          handleSuccess();
        } else {
          console.log(`[Downloader] SoundCloud attempt finished with code ${code}. Trying YouTube fallback...`);
          runYtDlpAttempt(ytQuery, (ytCode) => {
            if (ytCode === 0) {
              handleSuccess();
            } else {
              handleFailure(ytCode);
            }
          });
        }
      });

    } catch (err) {
      this.isProcessing = false;
      this.currentProcess = null;
      this.activeItem = null;
      item.status = 'error';
      item.error = err.message;
      console.error('[Downloader] Processing error:', err);
      this.processNext();
    }
  }

  getHistory() {
    return this.history;
  }
}

module.exports = new DownloadManager();
