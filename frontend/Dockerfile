FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY . .

RUN npm install && npm run build

FROM lscr.io/linuxserver/nginx:latest AS dist

COPY ./nginx/nginx.conf /config/nginx/site-confs/default.conf

COPY --from=builder --chown=abc:abc /app/dist /config/www

EXPOSE 80