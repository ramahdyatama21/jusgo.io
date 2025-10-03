# 🚀 Deployment Guide

## Pilihan Deployment

### 1. **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. **Netlify**
```bash
# Build project
npm run build

# Deploy to Netlify (drag & drop dist folder)
# Atau gunakan Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 3. **GitHub Pages**
```bash
# Build project
npm run build

# Push ke GitHub
git add .
git commit -m "Deploy to production"
git push origin main
```

## Environment Variables untuk Production

Set environment variables di platform deployment:

```
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c
```

## Build Project

```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

## Deploy Script

```bash
# Deploy ke Vercel
npm run deploy
```
