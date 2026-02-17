# Database Backup Script (Windows PowerShell)
# Usage: .\scripts\backup-db.ps1

# Create backups directory if it doesn't exist
$BackupDir = ".\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Backup filename
$BackupFile = "$BackupDir\backup_$Timestamp.sql"

Write-Host "🔄 Creating database backup..." -ForegroundColor Cyan

# Get DATABASE_URL from .env
$DatabaseUrl = $env:DATABASE_URL

if ($DatabaseUrl) {
    # For PostgreSQL (adjust pg_dump path if needed)
    try {
        pg_dump $DatabaseUrl | Out-File -FilePath $BackupFile -Encoding UTF8
        
        Write-Host "✅ Backup created successfully: $BackupFile" -ForegroundColor Green
        
        # Get file size
        $Size = (Get-Item $BackupFile).Length / 1MB
        Write-Host "📦 Backup size: $([Math]::Round($Size, 2)) MB" -ForegroundColor Cyan
        
        # Keep only last 10 backups
        Get-ChildItem $BackupDir -Filter "backup_*.sql" | 
            Sort-Object CreationTime -Descending | 
            Select-Object -Skip 10 | 
            Remove-Item -Force
        
        Write-Host "🧹 Cleaned old backups (keeping last 10)" -ForegroundColor Yellow
        Write-Host "✅ Backup complete!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Backup failed: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ DATABASE_URL not set!" -ForegroundColor Red
    exit 1
}
