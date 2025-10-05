# 🥤 JusGo.io - POS System untuk Coldpress Juice

## **Fitur Utama:**
- ✅ **POS System** - Transaksi penjualan
- ✅ **Inventory Management** - Kelola stok produk
- ✅ **HPP Calculator** - Hitung Harga Pokok Penjualan
- ✅ **Resep Management** - Kelola resep coldpress juice
- ✅ **Bahan Belanja** - Tracking pembelian bahan
- ✅ **Reports** - Laporan penjualan dan stok

## **Setup Development:**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Environment**
```bash
# Buat file .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Run Development Server**
```bash
npm run dev
```

### **4. Build Production**
```bash
npm run build
```

## **Database Setup:**

### **1. Supabase Tables**
Jalankan query SQL di Supabase SQL Editor:
- `sql/setup_database.sql` - Setup tabel utama
- `sql/bahan_harga_table.sql` - Tabel harga bahan
- `sql/resep_belanja_tables.sql` - Tabel resep dan belanja
- `sql/SAMPLE_DATA_HPP.sql` - Data contoh

### **2. Environment Variables**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## **Deployment:**

### **1. Vercel (Recommended)**
```bash
# Connect to GitHub
# Auto deploy on push
```

### **2. Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
```

## **Dokumentasi:**
- `docs/` - Dokumentasi lengkap
- `sql/` - Query SQL untuk database
- `HPP_SYSTEM_GUIDE.md` - Panduan sistem HPP

## **Contoh Penggunaan:**

### **1. Pineapple Punch**
```
Resep: 1/4 nanas + 1 apel + 1 jeruk
Harga Jual: Rp 25.000/botol
HPP: Rp 12.750 (otomatis)
Profit: Rp 12.250 (49% margin)
```

### **2. HPP Calculation**
```
HPP = (Bahan A × Harga A) + (Bahan B × Harga B) + ...
Profit = Harga Jual - HPP
```

## **Tech Stack:**
- **Frontend:** React + Vite
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## **Support:**
Untuk bantuan atau pertanyaan, silakan buka issue di repository.
