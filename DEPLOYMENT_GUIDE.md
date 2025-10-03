# 🚀 Deployment Guide - POS System

## Build Berhasil! ✅
Project sudah di-build dan siap untuk deployment.

## Pilihan Deployment:

### 1. **Vercel (Paling Mudah)**
1. Buka https://vercel.com
2. Login dengan GitHub/GitLab
3. Klik "New Project"
4. Upload folder `dist` atau connect ke GitHub repository
5. Set environment variables:
   - `VITE_SUPABASE_URL` = https://vwnfdzgkhibdlpcygdkp.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c

### 2. **Netlify**
1. Buka https://netlify.com
2. Login dan klik "New site from files"
3. Drag & drop folder `dist`
4. Set environment variables di Site settings

### 3. **GitHub Pages**
1. Push code ke GitHub repository
2. Buka repository → Settings → Pages
3. Select source: GitHub Actions
4. Set environment variables di repository settings

### 4. **Manual Upload**
1. Upload folder `dist` ke hosting provider
2. Set environment variables di hosting panel

## File Build Location:
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-BVlbdb52.js
│   ├── index-BAtfPdvu.css
│   └── ...
```

## Environment Variables untuk Production:
```
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c
```

## Langkah Selanjutnya:
1. **Pilih platform deployment** (Vercel recommended)
2. **Upload folder `dist`** atau connect repository
3. **Set environment variables**
4. **Deploy!** 🚀

## Test Production:
Setelah deploy, test:
- Akses URL production
- Test login (masukkan email/password apapun)
- Test halaman `/supabase-test` untuk cek koneksi database
