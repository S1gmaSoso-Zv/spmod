Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\sigma\.gemini\antigravity\scratch\mod\companion"
WshShell.Run """C:\Program Files\nodejs\node.exe"" server.js", 0, False
