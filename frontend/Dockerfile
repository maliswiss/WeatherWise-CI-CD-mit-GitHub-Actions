# ============================================================
# Multi-Stage Dockerfile · WeatherWise Frontend
# Stage 1: Build mit Node 22 (Vite production build)
# Stage 2: Schlankes nginx:alpine-Image, das das statische Build serviert
# Resultat: ~50 MB Image statt ~1 GB Node-Image
# ============================================================

# --------- Stage 1: Build ---------
FROM node:22-alpine AS builder

WORKDIR /app

# package*.json zuerst kopieren → Docker-Layer-Cache nutzt das,
# solange sich Abhängigkeiten nicht ändern.
COPY package*.json ./
RUN npm ci

# Quellcode kopieren und produktiv bauen
COPY . .
RUN npm run build

# --------- Stage 2: Runtime ---------
FROM nginx:alpine AS runtime

# Eigene nginx-Konfiguration (SPA-Routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Statische Dateien aus dem Builder kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Container läuft als non-root für mehr Sicherheit
USER nginx

EXPOSE 80

# Healthcheck: nginx muss auf Port 80 antworten
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
