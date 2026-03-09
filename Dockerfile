FROM alpine:latest AS iconbuilder
RUN apk add --no-cache imagemagick
WORKDIR /icons
RUN convert -size 192x192 xc:#58a6ff icon-192.png && \
    convert -size 512x512 xc:#58a6ff icon-512.png

FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY index.html password_icon.svg script.js styles.css manifest.json sw.js /usr/share/nginx/html/
COPY --from=iconbuilder /icons/icon-192.png /icons/icon-512.png /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
