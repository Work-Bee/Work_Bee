# Work-Bee Startup Script for Windows PowerShell
# Run this script to start both frontend and backend servers

Write-Host "🐝 Starting Work-Bee Application..." -ForegroundColor Yellow
Write-Host ""

# Check if we're in the correct directory
$currentDir = Get-Location
if (-not (Test-Path ".\backend\package.json" -or Test-Path ".\Work_Bee\backend\package.json")) {
    Write-Host "❌ Error: Please run this script from the Work-bee or Work_Bee directory" -ForegroundColor Red
    exit 1
}

# Navigate to Work_Bee if needed
if (Test-Path ".\Work_Bee") {
    Set-Location ".\Work_Bee"
}

Write-Host "📦 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"
Start-Sleep -Seconds 3

Write-Host "📦 Starting Frontend Server (Port 3333)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; `$env:PORT='3333'; npm start"

Write-Host ""
Write-Host "✅ Servers starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Server URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3333" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test URLs:" -ForegroundColor Yellow
Write-Host "   Job Seeker Login:  http://localhost:3333/login/jobseeker" -ForegroundColor White
Write-Host "   Employer Login:    http://localhost:3333/login/employer" -ForegroundColor White
Write-Host "   Admin Login:       http://localhost:3333/login/admin" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  To stop servers: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For testing guide, see: GOOGLE_OAUTH_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
