<div align="center">

# WeatherWise · CI/CD mit GitHub Actions

**Auftrag C2 · Deployment LB1 · HF Informatik · GIBB Bern**

![Pipeline](https://img.shields.io/badge/GitHub%20Actions-Lint%20%C2%B7%20Test%20%C2%B7%20Build%20%C2%B7%20Push-1F3864?style=flat-square&logo=githubactions&logoColor=white)
![Registry](https://img.shields.io/badge/Registry-ghcr.io-C19A2E?style=flat-square&logo=docker&logoColor=white)
![Node](https://img.shields.io/badge/Node-20%20%C2%B7%2022-2E7D32?style=flat-square&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-1565C0?style=flat-square&logo=docker&logoColor=white)
![Tags](https://img.shields.io/badge/Tags-latest%20%2B%20sha-C62828?style=flat-square)

</div>

---

## 1. Auftrag

Aufbau einer **CI/CD-Pipeline mit GitHub Actions**, die bei jedem Push auf `main` den Code automatisch **lintet, testet, baut** und das resultierende **Docker-Image mit zwei Tags** in eine **Container-Registry** (`ghcr.io`) veröffentlicht. Als Basisprojekt dient das **WeatherWise-Frontend** aus C1 (React + Vite + nginx).

## 2. Architektur der Pipeline

Drei Stages, drei Jobs, ein Workflow. Lint und Test laufen **parallel**; Build & Push laufen **sequenziell danach** und nur, wenn beide Vorgänger-Stages grün sind.

```text
                          ┌─────────────────────────────────────────────────────────────┐
                          │              GitHub Actions Runner (ubuntu-latest)          │
                          │                                                             │
  ┌──────────┐   trigger  │   ┌─────────────┐        ┌──────────────────────┐           │
  │ git push │ ─────────► │   │ 1. Lint     │        │ 2. Test (Matrix)     │           │
  │  → main  │            │   │ ESLint      │        │ Node 20 · Node 22    │           │
  └──────────┘            │   │ Node 22     │        │ Vitest               │           │
                          │   └──────┬──────┘        └──────────┬───────────┘           │
                          │          │                          │                       │
                          │          └────── parallel ──────────┘                       │
                          │                       │                                     │
                          │                       ▼  needs: [lint, test] · if success   │
                          │   ┌─────────────────────────────────────────────────────┐   │
                          │   │ 3. Build & Push  (nur auf main / workflow_dispatch) │   │
                          │   │ Buildx → Login GHCR → Tags + Build (Layer-Cache)    │   │
                          │   │                                  → Push (2 Tags)    │   │
                          │   └────────────────────┬────────────────────────────────┘   │
                          └────────────────────────┼─────────────────────────────────────┘
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │   ghcr.io/maliswiss/weatherwise-…       │
                              │   :latest   ·   :sha-<commit-hash>      │
                              └─────────────────────────────────────────┘
```

Für eine bessere Darstellung siehe die Datei [`docs/pipeline-diagramm.png`](docs/pipeline-diagramm.png).

## 3. Setup-Anleitung (in 7 Schritten reproduzierbar)

> Voraussetzung: GitHub-Konto mit Zugriff auf das Repository, Docker Desktop oder Docker Engine lokal installiert.

1. **Repository klonen**
   ```bash
   git clone https://github.com/maliswiss/WeatherWise-CI-CD-mit-GitHub-Actions.git
   cd WeatherWise-CI-CD-mit-GitHub-Actions
   ```
2. **GHCR-Sichtbarkeit aktivieren**
   In GitHub auf das Repo gehen → *Settings* → *Actions* → *General* → *Workflow permissions* auf **„Read and write permissions"** stellen. Dadurch erhält der eingebaute `GITHUB_TOKEN` die Berechtigung, in die GHCR zu pushen.
3. **Keine zusätzlichen Secrets nötig.** Die Pipeline verwendet ausschliesslich den **eingebauten `GITHUB_TOKEN`**. Für andere Registries (Docker Hub, Quay) wären `secrets.DOCKERHUB_USERNAME` und `secrets.DOCKERHUB_TOKEN` unter *Settings → Secrets and variables → Actions* zu hinterlegen.
4. **Workflow prüfen** unter `.github/workflows/ci-cd.yml`.
5. **Commit & Push auf main**
   ```bash
   git add .
   git commit -m "feat: initial CI/CD pipeline"
   git push origin main
   ```
6. **Pipeline beobachten** im Reiter *Actions* des Repositories. Alle drei Jobs müssen grün werden.
7. **Image lokal ziehen und starten**
   ```bash
   docker pull ghcr.io/maliswiss/weatherwise-ci-cd-mit-github-actions:latest
   docker run -p 8080:80 ghcr.io/maliswiss/weatherwise-ci-cd-mit-github-actions:latest
   # → http://localhost:8080
   ```

## 4. Workflow-Ausschnitte

**Trigger und Concurrency-Kontrolle:**
```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Test-Matrix mit npm-Cache:**
```yaml
test:
  strategy:
    fail-fast: false
    matrix:
      node: ['20', '22']
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node }}
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    - run: npm ci
    - run: npm test
```

**Build & Push mit zwei Tags und Layer-Cache:**
```yaml
- uses: docker/metadata-action@v5
  id: meta
  with:
    images: ghcr.io/${{ github.repository }}
    tags: |
      type=raw,value=latest,enable={{is_default_branch}}
      type=sha,format=long

- uses: docker/build-push-action@v5
  with:
    context: ./frontend
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## 5. Verwendete Technologien

| Bereich | Technologie | Zweck |
|---|---|---|
| CI/CD-Plattform | GitHub Actions | Native Integration, kostenfreie Minuten, einfaches Secret-Handling |
| Container-Registry | GHCR (`ghcr.io`) | Im Repo integriert, kein zusätzlicher Account, kein Rate-Limit wie Docker Hub |
| Auth zur Registry | `GITHUB_TOKEN` (built-in) | Keine manuell verwalteten Credentials, automatisches Rotieren |
| Image-Build | Docker Buildx + Multi-Stage Dockerfile | Schlankes Runtime-Image (`nginx:alpine`, ~50 MB) |
| Layer-Cache | `cache-from/to: type=gha` | Folgebuilds spürbar schneller (siehe Reflexion in der Doku) |
| Test-Runner | Vitest + Matrix Node 20/22 | Kompatibilität über zwei LTS-Versionen sicherstellen |
| Linting | ESLint | Statische Code-Qualität als Pflicht-Gate |

## 6. Tags-Strategie

Pro Push entstehen **zwei Tags** auf demselben Image-Digest:

- **`latest`** — menschenlesbar, immer das letzte erfolgreiche Build auf `main`.
- **`sha-<40-Hex>`** — eindeutig und nachvollziehbar, zeigt exakt auf den Commit.

## 7. Repository

🔗 **https://github.com/maliswiss/WeatherWise-CI-CD-mit-GitHub-Actions**

---

> **Hinweis zum Einsatz von KI:** Teile dieser Pipeline-Konfiguration sowie die Dokumentationsstruktur wurden mit Unterstützung von KI-Werkzeugen erarbeitet. Der gesamte Code wurde von mir geprüft, getestet und kann vollständig erklärt werden.

<div align="center">

**Mehmet Ali Gür** · HF Informatik · GIBB Bern · Mai 2026

</div>
