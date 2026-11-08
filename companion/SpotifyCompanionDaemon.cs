using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

namespace SpotifyModCompanion {
    static class Program {
        private const string MutexName = "Local\\SpotifyModCompanionDaemonMutex";
        private const int Port = 43821;
        private const long MaxLogSizeBytes = 5 * 1024 * 1024; 

        [STAThread]
        static void Main(string[] args) {
            bool createdNew;
            using (Mutex mutex = new Mutex(true, MutexName, out createdNew)) {
                if (!createdNew) {
                    
                    return;
                }

                string baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
                string serverScript = Path.Combine(baseDir, "server.js");
                string logFile = Path.Combine(baseDir, "server.log");

                if (!File.Exists(serverScript)) {
                    Log(logFile, "CRITICAL: server.js not found at " + serverScript);
                    return;
                }

                string nodePath = ResolveNodePath();
                if (string.IsNullOrEmpty(nodePath)) {
                    Log(logFile, "CRITICAL: node.exe not found on system.");
                    return;
                }

                Log(logFile, "Watchdog daemon started. Supervised script: " + serverScript);

                while (true) {
                    try {
                        if (!IsHealthy()) {
                            RunNodeSupervisor(nodePath, serverScript, baseDir, logFile);
                            continue;
                        }
                    } catch (Exception ex) {
                        Log(logFile, "Supervisor loop error: " + ex.Message);
                    }

                    Thread.Sleep(2000);
                }
            }
        }

        private static string ResolveNodePath() {
            string defaultPath = @"C:\Program Files\nodejs\node.exe";
            if (File.Exists(defaultPath)) return defaultPath;

            string x86Path = @"C:\Program Files (x86)\nodejs\node.exe";
            if (File.Exists(x86Path)) return x86Path;

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            if (!string.IsNullOrEmpty(localAppData)) {
                string localPath = Path.Combine(localAppData, @"Programs\nodejs\node.exe");
                if (File.Exists(localPath)) return localPath;
            }

            string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
            foreach (string p in pathEnv.Split(';')) {
                string trimmed = p.Trim();
                if (string.IsNullOrEmpty(trimmed)) continue;
                try {
                    string candidate = Path.Combine(trimmed, "node.exe");
                    if (File.Exists(candidate)) return candidate;
                } catch {}
            }
            return null;
        }

        private static bool IsHealthy() {
            try {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + Port + "/ping");
                req.Timeout = 1500;
                req.Method = "GET";
                req.Proxy = null;
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse()) {
                    if (res.StatusCode != HttpStatusCode.OK) {
                        return false;
                    }
                    using (StreamReader reader = new StreamReader(res.GetResponseStream())) {
                        string body = reader.ReadToEnd();
                        return body.Contains("Spotify Mod Companion");
                    }
                }
            } catch {
                return false;
            }
        }

        private static void RunNodeSupervisor(string nodePath, string scriptPath, string workingDir, string logPath) {
            RotateLogIfNeeded(logPath);

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = nodePath;
            psi.Arguments = "\"" + scriptPath + "\"";
            psi.WorkingDirectory = workingDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;

            DateTime startTime = DateTime.UtcNow;

            using (Process p = new Process()) {
                p.StartInfo = psi;

                object fileLock = new object();
                Action<string> append = delegate(string line) {
                    if (string.IsNullOrEmpty(line)) return;
                    try {
                        lock (fileLock) {
                            File.AppendAllText(logPath, string.Format("[{0:yyyy-MM-dd HH:mm:ss}] {1}\r\n", DateTime.Now, line));
                        }
                    } catch {}
                };

                p.OutputDataReceived += delegate(object s, DataReceivedEventArgs e) { append(e.Data); };
                p.ErrorDataReceived += delegate(object s, DataReceivedEventArgs e) { append(e.Data); };

                if (!p.Start()) {
                    Log(logPath, "Failed to start node.exe process.");
                    return;
                }

                p.BeginOutputReadLine();
                p.BeginErrorReadLine();

                Log(logPath, "Spawned node.exe (PID " + p.Id + ") for server.js");
                p.WaitForExit();
                Log(logPath, "node.exe (PID " + p.Id + ") exited with code " + p.ExitCode);
            }

            if ((DateTime.UtcNow - startTime).TotalSeconds < 2) {
                Thread.Sleep(1500);
            } else {
                Thread.Sleep(400);
            }
        }

        private static void RotateLogIfNeeded(string logPath) {
            try {
                if (File.Exists(logPath)) {
                    FileInfo fi = new FileInfo(logPath);
                    if (fi.Length > MaxLogSizeBytes) {
                        string oldLog = logPath + ".old";
                        if (File.Exists(oldLog)) File.Delete(oldLog);
                        File.Move(logPath, oldLog);
                    }
                }
            } catch {}
        }

        private static void Log(string logPath, string msg) {
            try {
                File.AppendAllText(logPath, string.Format("[{0:yyyy-MM-dd HH:mm:ss}] [Daemon] {1}\r\n", DateTime.Now, msg));
            } catch {}
        }
    }
}
