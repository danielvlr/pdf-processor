FROM node:20-alpine

WORKDIR /app

# Install dependencies for sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

# Optimize Node.js for performance
ENV NODE_OPTIONS="--max-old-space-size=4096"

CMD ["npm", "start"]
