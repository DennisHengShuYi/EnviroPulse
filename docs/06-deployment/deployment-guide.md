# Deployment Guide

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Build the Frontend

```bash
npm run build
```

Output goes to `/dist`. This is the static React SPA served in production.

---

## 2. Environment Variables (Production)

Set the following on the host/container:

```env
NODE_ENV=production
PORT=3001

# Required
AQICN_TOKEN=<production_token>
ANTHROPIC_API_KEY=<production_key>
ANTHROPIC_MODEL=ilmu-glm-5.1

# Do NOT set this in production
# SIMULATE_LIVE_INFERENCE=true
```

---

## 3. Run the Backend

```bash
node server/index.js
```

In production, use a process manager:

```bash
# Using PM2
npm install -g pm2
pm2 start server/index.js --name enviropulse-api
pm2 save
pm2 startup
```

---

## 4. Serve the Frontend

**Option A — Serve via Express (simplest)**

Add static file serving to `server/index.js`:

```js
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
```

Then visit `http://<host>:3001`.

**Option B — Nginx reverse proxy (recommended for production)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /path/to/UMDT-fix/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 5. Data Persistence

Ensure the `.data/` directory is writable:

```bash
mkdir -p .data
chmod 755 .data
```

`scrutiny.json` is created automatically on first run and must persist across restarts (do not mount as read-only in containers).

---

## 6. Container Deployment (Docker — outline)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server/index.js"]
```

Mount `.data/` as a volume for audit chain persistence:

```bash
docker run -p 3001:3001 \
  -v $(pwd)/.data:/app/.data \
  --env-file .env \
  enviropulse:latest
```

---

## 7. Health Check

After deployment, verify:

```bash
curl http://localhost:3001/api/districts   # Should return 50 districts
curl http://localhost:3001/api/sensors?district=kuala-lumpur   # Should return sensor data
```

---

## 8. Checklist

- [ ] `.env` configured with production keys
- [ ] `SIMULATE_LIVE_INFERENCE` NOT set
- [ ] `npm run build` completed successfully
- [ ] `.data/` directory writable
- [ ] PM2 / process manager running and saving state
- [ ] Nginx / reverse proxy configured if applicable
- [ ] HTTPS / TLS certificate in place for production
- [ ] AQICN API token tested and valid
- [ ] AI API key tested and valid
