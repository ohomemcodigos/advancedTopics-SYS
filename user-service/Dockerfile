FROM node:20-alpine AS build

WORKDIR /app

# Configura registry mais rápido e timeouts maiores
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set prefer-offline false

COPY package*.json ./

RUN npm install --legacy-peer-deps --prefer-offline=false

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

ENTRYPOINT ["node", "dist/main.js"]
