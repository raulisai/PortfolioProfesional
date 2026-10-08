# Despliegue en producción — isaidev.site

Cada push a `main` ejecuta `.github/workflows/deploy.yml`:

1. **CI** — `npm ci` + `npm run build` (también corre en pull requests).
2. **Imagen** — construye el Docker y lo publica en `ghcr.io/<usuario>/<repo>` con tag del commit y `latest`.
3. **CD** — por SSH copia `docker-compose.yml` y `deploy.sh` a tu servidor, descarga la imagen y levanta el contenedor.
   Si la nueva versión no queda sana en ~60 s, vuelve sola a la anterior y el job falla.
4. **Verificación** — comprueba que `https://isaidev.site/` responde 200.

En el servidor corre **un contenedor** (la app Node) publicado solo en `127.0.0.1:4321`. Tu **nginx** existente recibe el tráfico de `isaidev.site` y lo pasa a ese puerto.

## Una sola vez: preparar el servidor

**1. DNS** — registros `A` (y `AAAA` si usas IPv6) de `isaidev.site` y `www.isaidev.site` hacia la IP del servidor.

**2. Docker** — instalado con el plugin `docker compose` (v2).

**3. Usuario de despliegue** (no uses root):

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo mkdir -p /opt/portfolio && sudo chown deploy:deploy /opt/portfolio
```

**4. Llave SSH solo para el despliegue** — en tu computadora:

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-actions-portfolio" -N ""
ssh-copy-id -i deploy_key.pub deploy@IP_DEL_SERVIDOR   # o pega deploy_key.pub en ~deploy/.ssh/authorized_keys
```

Guarda el contenido de `deploy_key` (la privada) como secreto de GitHub y **borra el archivo local**.

**5. Huella del servidor** (para que Actions verifique que se conecta a tu servidor y no a otro):

```bash
ssh-keyscan -p 22 IP_DEL_SERVIDOR
```

**6. nginx** — instala el sitio y saca el certificado:

```bash
sudo cp deploy/nginx/isaidev.site.conf /etc/nginx/sites-available/isaidev.site
sudo ln -s /etc/nginx/sites-available/isaidev.site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d isaidev.site -d www.isaidev.site
```

Después de certbot, descomenta la línea `Strict-Transport-Security` del archivo y recarga nginx.
El proxy debe enviar `Host` y `X-Forwarded-Proto: https` (ya lo hace el archivo): sin eso el formulario de contacto rechaza los envíos.

> Si el puerto 4321 ya está ocupado en el servidor, define la variable de GitHub `APP_PORT` (p. ej. `4322`) y cambia el `proxy_pass` de nginx al mismo puerto.

## Una sola vez: secretos en GitHub

*Settings → Secrets and variables → Actions → New repository secret*

| Secreto | Valor |
|---|---|
| `SSH_HOST` | IP o dominio del servidor |
| `SSH_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | contenido completo de `deploy_key` |
| `SSH_KNOWN_HOSTS` | salida del `ssh-keyscan` (recomendado) |
| `SSH_PORT` | solo si no es el 22 |
| `RESEND_API_KEY` | clave de Resend para el formulario de contacto |
| `CONTACT_EMAIL` | correo donde recibes los mensajes |
| `CONTACT_FROM` | opcional, p. ej. `Portafolio <contacto@isaidev.site>` (dominio verificado en Resend) |

Variables opcionales (*Variables*): `APP_DIR` (por defecto `/opt/portfolio`) y `APP_PORT` (por defecto `4321`).
Opcional: crea el *Environment* `production` (Settings → Environments) para exigir aprobación manual antes de desplegar.

## Primer despliegue

```bash
git push -u origin main
```

Sigue el progreso en la pestaña **Actions**. El último paso (verificar el sitio) solo pasa cuando nginx y el certificado ya están configurados.

> Si el repositorio es privado, el paquete en GHCR también lo será: está bien, el workflow inicia sesión en el servidor con un token temporal solo mientras despliega.

## Operación

```bash
cd /opt/portfolio
docker compose ps                  # estado
docker compose logs -f app         # logs de la app
```

**Volver a una versión anterior** — cada commit queda como tag de imagen:

```bash
cd /opt/portfolio
sed -i 's/^TAG=.*/TAG=<sha12-anterior>/' .env && docker compose up -d app
```

**Probar la imagen en tu máquina**

```bash
docker build -t portfolio .
docker run --rm -p 4321:4321 -e RESEND_API_KEY=... -e CONTACT_EMAIL=... portfolio
```
