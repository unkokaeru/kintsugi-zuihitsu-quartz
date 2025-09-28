FROM node:22-slim AS builder
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

FROM node:22-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY . .

# Build the site
RUN npx quartz build

# Install serve for hosting
RUN npm install -g serve

# Expose port 8080 (Render's default)
EXPOSE 8080

# Serve the built site
CMD ["serve", "public", "-l", "8080"]
