# 🚀 GitHub Deployment Guide

## Langkah-langkah Push ke GitHub:

### 1. **Install Git** (jika belum ada)
- Download dari: https://git-scm.com/download/win
- Install dengan default settings
- Restart terminal setelah install

### 2. **Setup Git Repository**
```bash
# Di direktori frontend
git init
git add .
git commit -m "Initial commit - POS System"
```

### 3. **Connect ke GitHub Repository**
```bash
# Ganti dengan URL repository GitHub Anda
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
git branch -M main
git push -u origin main
```

### 4. **Setup Vercel**
1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik "New Project"
4. Import repository GitHub Anda
5. Set environment variables:
   - `VITE_SUPABASE_URL` = https://vwnfdzgkhibdlpcygdkp.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c

### 5. **Auto Deploy**
Setelah setup, setiap push ke GitHub akan otomatis deploy ke Vercel!

## File yang akan di-push:
- ✅ Source code React
- ✅ Build files (dist/)
- ✅ Environment variables (.env)
- ✅ Configuration files

## Environment Variables untuk Production:
```
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c
```

## Langkah Selanjutnya:
1. **Install Git** jika belum ada
2. **Buat repository** di GitHub
3. **Push code** ke GitHub
4. **Connect Vercel** ke repository
5. **Set environment variables** di Vercel
6. **Deploy!** 🚀
