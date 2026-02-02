# Cleanup and Restart Script for Pre-School ERP
# Run this script to fix webpack cache errors and regenerate Prisma Client

Write-Host "🧹 Cleaning up build cache..." -ForegroundColor Cyan

# Stop any running Next.js processes (optional - you can Ctrl+C manually)
# Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*pre-school*"} | Stop-Process -Force

# Remove Next.js cache
if (Test-Path ".next") {
    Write-Host "Removing .next folder..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Remove node_modules/.cache if exists
if (Test-Path "node_modules/.cache") {
    Write-Host "Removing node_modules cache..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Prisma Client regenerated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host ""
    Write-Host "❌ Prisma generation failed. Please check the error above." -ForegroundColor Red
    Write-Host "You may need to stop the dev server first (Ctrl+C) and run this script again." -ForegroundColor Yellow
}
