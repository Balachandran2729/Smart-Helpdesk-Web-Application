FROM node:20-alpine

# --- ADD THIS SECTION TO UPDATE PACKAGES ---
# Update and upgrade system packages to patch vulnerabilities
# Also install curl (often needed for health/liveness checks) and dumb-init for proper signal handling
RUN apk update && apk upgrade && apk add --no-cache curl dumb-init
# -------------------------------

WORKDIR /app

COPY package*.json ./
# Use npm ci for clean, reproducible installs based on package-lock.json
RUN npm ci --only=production && npm cache clean --force

COPY . .

EXPOSE 8080

# Use dumb-init to handle PID 1 correctly (optional but good practice)
ENTRYPOINT ["dumb-init", "--"]
CMD [ "npm", "start" ]