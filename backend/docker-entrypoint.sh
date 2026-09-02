#!/bin/bash
set -e

echo "Rodando as migrations do banco de dados..."
php artisan migrate --force

# Executa o comando original (ex: apache2-foreground)
exec "$@"
