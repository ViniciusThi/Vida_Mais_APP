FROM node:20-slim AS deps
WORKDIR /app

COPY package.json ./
RUN npm install


FROM node:20-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

RUN npm prune --omit=dev

EXPOSE 3000

# Garante que o Prisma Client esteja gerado e o schema exista no banco.
# Usa db push para criar/atualizar tabelas de forma simples (sem depender de migrações).
CMD sh -c "npx prisma generate && npx prisma db push && node dist/server.js"

