FROM alpine:latest@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659 AS iconbuilder
RUN apk add --no-cache imagemagick librsvg
WORKDIR /icons
COPY password_icon.svg .
RUN magick password_icon.svg -background none -resize 192x192 icon-192.png && \
    magick password_icon.svg -background none -resize 512x512 icon-512.png && \
    magick password_icon.svg -background none -resize 410x410 -gravity center -extent 512x512 icon-maskable-512.png

FROM node:20-alpine
WORKDIR /app

COPY package.json server.js index.html password_icon.svg script.js styles.css manifest.json sw.js ./
COPY --from=iconbuilder /icons/icon-192.png /icons/icon-512.png /icons/icon-maskable-512.png ./

EXPOSE 80

CMD ["npm", "start"]
