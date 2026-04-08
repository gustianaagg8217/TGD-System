' ===================================================================
' TGd System - Silent Launcher (VBScript)
' Menjalankan semua services tanpa menampilkan command windows
' ===================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get current directory
currentPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentPath

' Display info
MsgBox "Starting TGd System..." & vbCrLf & vbCrLf & _
        "Services yang akan dijalankan:" & vbCrLf & _
        "  + Backend Server (port 8000)" & vbCrLf & _
        "  + Frontend Server (port 5173)" & vbCrLf & _
        "  + Database (auto-initialize)" & vbCrLf & vbCrLf & _
        "Tunggu beberapa saat...", vbInformation, "TGd System Launcher"

' Check and seed database
If NOT fso.FileExists("backend\tgd_system_phase1.db") Then
    WshShell.Run "cmd /c cd backend && python seed_data.py", 1, True
End If

' Check and install frontend dependencies
If NOT fso.FolderExists("frontend\node_modules") Then
    WshShell.Run "cmd /c cd frontend && npm install", 1, True
End If

' Start backend (hidden)
WshShell.Run "cmd /c cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000", 0, False

' Start frontend (hidden)
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False

' Wait a bit for servers to start
WScript.Sleep 5000

' Open browser
WshShell.Run "http://localhost:5173", 1, False

' Show completion message
MsgBox "✓ Semua services telah dimulai!" & vbCrLf & vbCrLf & _
        "Akses melalui:" & vbCrLf & _
        "  - http://localhost:5173 (Interface)" & vbCrLf & _
        "  - http://localhost:8000/docs (API)" & vbCrLf & vbCrLf & _
        "Default login:" & vbCrLf & _
        "  - Email: admin@tgd.com" & vbCrLf & _
        "  - Password: admin@123456", vbInformation, "TGd System Started"
