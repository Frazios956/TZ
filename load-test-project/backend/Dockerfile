FROM node:18-alpine

WORKDIR /app


RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm install

COPY . .


COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

RUN npm run build

EXPOSE 3000


CMD ["/wait-for-db.sh", "db", "node", "dist/main"]