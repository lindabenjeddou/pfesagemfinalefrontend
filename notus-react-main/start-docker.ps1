# Script PowerShell pour démarrer l'application Docker
# Exécuter avec : .\start-docker.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage de l'application Docker    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker Desktop est lancé
Write-Host "Vérification de Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop n'est pas lancé!" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop et réessayer." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker Desktop est actif" -ForegroundColor Green
Write-Host ""

# Vérifier que le backend existe
$backendPath = "..\..\OneDrive\Bureau\back-master"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Le dossier backend n'existe pas : $backendPath" -ForegroundColor Red
    Write-Host "Veuillez vérifier le chemin dans docker-compose.yml" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend trouvé" -ForegroundColor Green
Write-Host ""

# Nettoyer les anciens conteneurs (optionnel)
Write-Host "Nettoyage des anciens conteneurs..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
Write-Host ""

# Construire et démarrer les services
Write-Host "Construction et démarrage des services..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes la première fois..." -ForegroundColor Yellow
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Application démarrée avec succès!  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Accès aux services :" -ForegroundColor Cyan
    Write-Host "   Frontend : http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend  : http://localhost:8089/PI/swagger-ui/index.html" -ForegroundColor White
    Write-Host "   MySQL    : localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Commandes utiles :" -ForegroundColor Cyan
    Write-Host "   Voir les logs       : docker-compose logs -f" -ForegroundColor White
    Write-Host "   Voir le statut      : docker-compose ps" -ForegroundColor White
    Write-Host "   Arrêter l'app       : docker-compose down" -ForegroundColor White
    Write-Host ""
    
    # Attendre que les services soient prêts
    Write-Host "Attente du démarrage des services..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Vérifier le statut
    Write-Host ""
    Write-Host "Statut des conteneurs :" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    $openBrowser = Read-Host "Voulez-vous ouvrir le frontend dans le navigateur ? (O/N)"
    if ($openBrowser -eq "O" -or $openBrowser -eq "o") {
        Start-Process "http://localhost:3000"
    }
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ Erreur lors du démarrage           " -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consultez les logs avec : docker-compose logs" -ForegroundColor Yellow
    exit 1
}
