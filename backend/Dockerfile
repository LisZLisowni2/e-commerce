# Stage 1: Build dependencies
FROM composer:2.9.3 AS build
WORKDIR /app
COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

COPY . .

RUN composer dump-autoload --optimize

FROM php:8.4-fpm-alpine3.22 AS runner

WORKDIR /app

RUN apk add --no-cache \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    curl && \ 
        docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl gd

COPY --from=build app .

EXPOSE 9000
CMD ["php-fpm"]