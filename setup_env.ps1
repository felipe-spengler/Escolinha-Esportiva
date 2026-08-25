$ErrorActionPreference = "Stop"

Write-Host "Verificando dependências do ambiente..."

# 1. Verifica se Docker está instalado e rodando
try {
    $dockerVersion = docker --version
    Write-Host "Docker encontrado: $dockerVersion"
} catch {
    Write-Host "Docker NÃO ENCONTRADO! Você precisa instalar o Docker Desktop para Windows."
    Write-Host "Acesse: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Verifica se o docker está rodando
$dockerInfo = docker info 2>&1
if ($dockerInfo -match "error during connect") {
    Write-Host "Docker está instalado, mas o serviço não está rodando. Por favor, abra o Docker Desktop."
    exit 1
}

# 2. Sobe o ambiente
Write-Host "Subindo containers..."
Set-Location "d:\Área de Trabalho\escolinha esporte"
docker compose up -d

# 3. Instala dependências do PHP (Composer) dentro do container
Write-Host "Instalando dependências do Composer no container backend..."
docker compose exec backend composer install

# 4. Roda as migrations
Write-Host "Rodando migrations do banco de dados..."
docker compose exec backend php artisan migrate --force

# 5. Roda os testes
Write-Host "Rodando bateria de testes..."
docker compose exec backend php artisan test

Write-Host "Processo concluído com sucesso!"
