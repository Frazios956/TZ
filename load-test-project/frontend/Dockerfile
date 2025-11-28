FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


RUN echo "=== Проверка структуры файлов ===" && \
    ls -la && \
    echo "=== Проверка src директории ===" && \
    ls -la src/ && \
    echo "=== Сборка приложения ==="

RUN npm run build

FROM nginx:alpine as production-stage


COPY --from=build-stage /app/dist /usr/share/nginx/html


COPY nginx.conf /etc/nginx/nginx.conf


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]