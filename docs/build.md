# Buildear y correr la aplicación para producción / build de desarrollo

```sh
DOCKER_BUILDKIT=1 \
docker build -t auditoria:latest . \ # Construir la imagen Docker etiquetada como 'auditoria:latest'
&& docker stop auditoria_DEV \ # Detener el contenedor actual
&& docker rename auditoria_DEV auditoria_DEV_old \ # Renombrar el contenedor anterior para mantener un respaldo
&& docker run -d -p 80:80 -p 443:80 --env-file .env.local --name="auditoria_DEV" auditoria:latest \ # Correr nuevo contenedor en segundo plano, exponiendo puertos 80 y 443, usando variables del archivo '.env.local'
&& docker rm auditoria_DEV_old \ # Eliminar el contenedor viejo tras confirmar que el nuevo funciona correctamente
&& docker image prune -f # Limpiar imágenes Docker no utilizadas para liberar espacio
```
