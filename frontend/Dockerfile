FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY . .

RUN npm install && npm run build

FROM nginx:1.29.8-alpine3.23 AS dist

COPY ./nginx/nginx.conf /usr/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]