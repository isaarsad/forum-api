FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# DEVELOPMENT
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# PRODUCTION
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
CMD ["node", "src/app.js"]