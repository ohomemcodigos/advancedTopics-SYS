FROM node:20-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala todas as dependência
RUN npm install

# Copia o restante do código
COPY . .

# Criando a versão de produção
RUN npm run build

# Usamos uma imagem limpa
FROM node:20-alpine AS production

WORKDIR /app

# Copiando apenas os arquivos compilados do estágio anterior
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Instalando apenas as dependências necessárias
RUN npm install --only=production

# Define como o container será iniciado [cite: 64, 85, 201]
ENTRYPOINT ["node", "dist/main.js"]