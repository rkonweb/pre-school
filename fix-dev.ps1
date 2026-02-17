# Fix Script for Pre-School App
# This script kills any processes blocking port 3000 and clears the build cache.

echo "--- Cleaning up development environment ---"

# 1. Kill Node.js processes
echo "Stopping background processes..."
taskkill /F /IM node.exe /T 2>$null

# 2. Kill anything on Port 3000 or 3001
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    echo "Clearing Port 3000..."
    Stop-Process -Id $port3000.OwningProcess -Force
}

$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    echo "Clearing Port 3001..."
    Stop-Process -Id $port3001.OwningProcess -Force
}

# 3. Clear Next.js cache
echo "Clearing build cache..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
}

echo "--- Cleanup Complete! You can now run: npm run dev ---"
