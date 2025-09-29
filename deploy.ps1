# LAKSHYA Trading Dashboard - Windows Deployment Script
Write-Host "🚀 Starting LAKSHYA Trading Dashboard Deployment..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check if build directory exists
if (Test-Path "build") {
    Write-Host "📁 Build directory found" -ForegroundColor Green
    Write-Host "📊 Build statistics:" -ForegroundColor Cyan
    
    # Get directory size
    $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum
    $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
    Write-Host "Build size: $buildSizeMB MB" -ForegroundColor White
    
    Write-Host "📄 Files in build:" -ForegroundColor Cyan
    Get-ChildItem "build" | Format-Table Name, Length, LastWriteTime
} else {
    Write-Host "❌ Build directory not found!" -ForegroundColor Red
    exit 1
}

# Health check
Write-Host "🔍 Running health checks..." -ForegroundColor Yellow
if (Test-Path "build/index.html") {
    Write-Host "✅ index.html found" -ForegroundColor Green
} else {
    Write-Host "❌ index.html not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "build/static") {
    Write-Host "✅ Static assets found" -ForegroundColor Green
    Write-Host "📊 Static assets:" -ForegroundColor Cyan
    Get-ChildItem "build/static" -Recurse | Measure-Object -Property Length -Sum | ForEach-Object {
        $sizeMB = [math]::Round($_.Sum / 1MB, 2)
        Write-Host "Total static assets: $sizeMB MB" -ForegroundColor White
    }
} else {
    Write-Host "❌ Static assets not found!" -ForegroundColor Red
    exit 1
}

# Display deployment information
Write-Host ""
Write-Host "🎉 LAKSHYA Trading Dashboard is ready for deployment!" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "• Project Name: LAKSHYA Trading Dashboard" -ForegroundColor White
Write-Host "• Build Size: $buildSizeMB MB" -ForegroundColor White
Write-Host "• Strategies Implemented: 5 (Trend Rider, Momentum Burst, Volume Surge, Mean Reversal, Breakout Hunter)" -ForegroundColor White
Write-Host "• Features: AI Strategy Coordinator, Strategy Manager, Reporting Integration" -ForegroundColor White
Write-Host "• Dashboard: Comprehensive real-time trading dashboard" -ForegroundColor White
Write-Host "• Demo Mode: Fully functional without backend" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Deployment Options:" -ForegroundColor Yellow
Write-Host "1. Netlify: Connect to GitHub and deploy from 'build' folder" -ForegroundColor White
Write-Host "2. Vercel: Import GitHub repository" -ForegroundColor White
Write-Host "3. GitHub Pages: Deploy from 'build' branch" -ForegroundColor White
Write-Host "4. Local Server: Serve from 'build' directory" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Local Preview:" -ForegroundColor Yellow
Write-Host "To preview locally, run: npx serve build" -ForegroundColor White
Write-Host ""
Write-Host "✨ Your advanced trading system with all 5 strategies is now ready!" -ForegroundColor Green

# Create deployment ready marker
$deploymentInfo = @"
LAKSHYA_DEPLOYMENT_READY=true
BUILD_DATE=$(Get-Date)
STRATEGIES=5
VERSION=1.0.0
BUILD_SIZE=$buildSizeMB MB
"@

$deploymentInfo | Out-File -FilePath ".deployment-status" -Encoding UTF8
Write-Host "📄 Deployment status saved to .deployment-status" -ForegroundColor Gray