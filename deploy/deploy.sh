#!/usr/bin/env bash
# Se ejecuta EN EL SERVIDOR (lo invoca el workflow por SSH).
# Espera en el directorio de la app: docker-compose.yml y .env.new (con IMAGE, TAG y secretos).
set -euo pipefail

cd "$(dirname "$0")"

[ -f .env.new ] || { echo "Falta .env.new"; exit 1; }

# Guarda la versión actual para poder volver atrás
[ -f .env ] && cp .env .env.prev
mv .env.new .env
chmod 600 .env

echo ">> Descargando imagen"
docker compose pull app

echo ">> Levantando la app"
docker compose up -d app

echo ">> Esperando a que la app esté sana"
ok=0
for i in $(seq 1 30); do
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$(docker compose ps -q app)" 2>/dev/null || echo "none")
  if [ "$status" = "healthy" ]; then ok=1; break; fi
  sleep 2
done

if [ "$ok" -ne 1 ]; then
  echo "!! La nueva versión no quedó sana. Mostrando logs y volviendo a la anterior."
  docker compose logs --tail 60 app || true
  if [ -f .env.prev ]; then
    mv .env.prev .env
    docker compose up -d app
    echo "!! Rollback aplicado."
  fi
  exit 1
fi

docker image prune -f >/dev/null
echo ">> Despliegue correcto: $(grep '^TAG=' .env | cut -d= -f2)"
