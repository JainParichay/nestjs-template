# Build stage
FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npm run prisma:generate
RUN npm run prisma:migrate

COPY . .
RUN npm run build

# Production stage
FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 