# Script PowerShell pour tester l'installation Docker
# Exécuter avec : .\test-docker.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tests de Configuration Docker         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "🔍 Test : $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "   Erreur : $_" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

Write-Host "=== TESTS PRÉREQUIS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1 : Docker installé
Test-Step "Docker est installé" {
    $null = docker --version 2>&1
    return $LASTEXITCODE -eq 0
}

# Test 2 : Docker Desktop lancé
Test-Step "Docker Desktop est actif" {
    $null = docker info 2>&1
    return $LASTEXITCODE -eq 0
}

# Test 3 : Docker Compose disponible
Test-Step "Docker Compose est disponible" {
    $null = docker-compose --version 2>&1
    return $LASTEXITCODE -eq 0
}

Write-Host ""
Write-Host "=== TESTS FICHIERS ===" -ForegroundColor Cyan
Write-Host ""

# Test 4 : Dockerfile frontend existe
Test-Step "Dockerfile frontend existe" {
    return Test-Path ".\Dockerfile"
}

# Test 5 : docker-compose.yml existe
Test-Step "docker-compose.yml existe" {
    return Test-Path ".\docker-compose.yml"
}

# Test 6 : nginx.conf existe
Test-Step "nginx.conf existe" {
    return Test-Path ".\nginx.conf"
}

# Test 7 : Backend existe
Test-Step "Dossier backend existe" {
    return Test-Path "..\..\OneDrive\Bureau\back-master"
}

# Test 8 : Dockerfile backend existe
Test-Step "Dockerfile backend existe" {
    return Test-Path "..\..\OneDrive\Bureau\back-master\Dockerfile"
}

Write-Host ""
Write-Host "=== TESTS PORTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 9 : Port 3000 disponible
Test-Step "Port 3000 est disponible" {
    $used = netstat -ano | Select-String ":3000 " -Quiet
    return -not $used
}

# Test 10 : Port 8089 disponible
Test-Step "Port 8089 est disponible" {
    $used = netstat -ano | Select-String ":8089 " -Quiet
    return -not $used
}

# Test 11 : Port 3306 disponible
Test-Step "Port 3306 est disponible" {
    $used = netstat -ano | Select-String ":3306 " -Quiet
    return -not $used
}

Write-Host ""
Write-Host "=== TESTS CONFIGURATION ===" -ForegroundColor Cyan
Write-Host ""

# Test 12 : package.json existe
Test-Step "package.json existe" {
    return Test-Path ".\package.json"
}

# Test 13 : Scripts npm configurés
Test-Step "Scripts npm configurés" {
    if (Test-Path ".\package.json") {
        $pkg = Get-Content ".\package.json" -Raw | ConvertFrom-Json
        return ($null -ne $pkg.scripts.build) -and ($null -ne $pkg.scripts.start)
    }
    return $false
}

# Test 14 : nginx.conf contient proxy backend
Test-Step "nginx.conf contient proxy API" {
    if (Test-Path ".\nginx.conf") {
        $content = Get-Content ".\nginx.conf" -Raw
        return $content -match "proxy_pass.*backend"
    }
    return $false
}

# Test 15 : docker-compose contient 3 services
Test-Step "docker-compose contient 3 services" {
    if (Test-Path ".\docker-compose.yml") {
        $content = Get-Content ".\docker-compose.yml" -Raw
        return ($content -match "mysql:") -and 
               ($content -match "backend:") -and 
               ($content -match "frontend:")
    }
    return $false
}

Write-Host ""
Write-Host "=== TESTS OPTIONNELS (si Docker est lancé) ===" -ForegroundColor Cyan
Write-Host ""

$dockerRunning = $null -ne (docker info 2>&1) -and $LASTEXITCODE -eq 0

if ($dockerRunning) {
    # Test 16 : Créer network test
    Test-Step "Peut créer un network Docker" {
        $null = docker network create test-network 2>&1
        $result = $LASTEXITCODE -eq 0
        $null = docker network rm test-network 2>&1
        return $result
    }
    
    # Test 17 : Pull image de test
    Test-Step "Peut pull une image Docker" {
        $null = docker pull hello-world:latest 2>&1
        return $LASTEXITCODE -eq 0
    }
    
    # Test 18 : Run conteneur de test
    Test-Step "Peut run un conteneur Docker" {
        $null = docker run --rm hello-world 2>&1
        return $LASTEXITCODE -eq 0
    }
} else {
    Write-Host "⏭️  Tests Docker ignorés (Docker non démarré)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSULTATS DES TESTS                   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = $testsPassed + $testsFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "Tests réussis  : " -NoNewline
Write-Host "$testsPassed" -ForegroundColor Green

Write-Host "Tests échoués  : " -NoNewline
Write-Host "$testsFailed" -ForegroundColor Red

Write-Host "Total          : $totalTests"
Write-Host "Taux de succès : $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })

Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✅ Tous les tests sont passés !" -ForegroundColor Green
    Write-Host "Vous pouvez démarrer l'application avec : .\start-docker.ps1" -ForegroundColor Green
    exit 0
} elseif ($testsFailed -le 3) {
    Write-Host "⚠️  Quelques tests ont échoué, mais vous pouvez probablement continuer" -ForegroundColor Yellow
    Write-Host "Consultez les détails ci-dessus" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ Plusieurs tests ont échoué" -ForegroundColor Red
    Write-Host "Corrigez les problèmes avant de démarrer l'application" -ForegroundColor Red
    Write-Host ""
    Write-Host "Problèmes fréquents :" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop n'est pas lancé" -ForegroundColor White
    Write-Host "  2. Ports déjà utilisés (fermez les apps)" -ForegroundColor White
    Write-Host "  3. Chemins du backend incorrects" -ForegroundColor White
    Write-Host "  4. Fichiers de configuration manquants" -ForegroundColor White
    exit 1
}
