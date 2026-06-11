FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace backend
COPY backend ./backend
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "backend"]
