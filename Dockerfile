FROM node:20-alpine AS client-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS client-build
WORKDIR /app
COPY --from=client-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server ./server
COPY --from=client-build /app/dist ./dist

EXPOSE 5000
CMD ["node", "server/index.js"]
