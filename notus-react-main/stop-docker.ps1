# Script PowerShell pour arrêter l'application Docker
# Exécuter avec : .\stop-docker.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Arrêt de l'application Docker         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Arrêt des services..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Services arrêtés avec succès!" -ForegroundColor Green
    Write-Host ""
    
    $removeVolumes = Read-Host "Voulez-vous aussi supprimer les données (volumes) ? (O/N)"
    if ($removeVolumes -eq "O" -or $removeVolumes -eq "o") {
        Write-Host ""
        Write-Host "Suppression des volumes..." -ForegroundColor Yellow
        docker-compose down -v
        Write-Host "✅ Volumes supprimés!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'arrêt" -ForegroundColor Red
    exit 1
}

Write-Host ""
