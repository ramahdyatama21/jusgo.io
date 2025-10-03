# 🗄️ Database Setup untuk Supabase

## 🚨 **Error yang Terjadi:**
```
GET https://vwnfdzgkhibdlpcygdkp.supabase.co/rest/v1/products?select=*&order=created_at.desc
[HTTP/3 400  47ms]
```

**Penyebab:** Tabel `products` belum dibuat di database Supabase.

## 🔧 **Solusi: Setup Database**

### **1. Buka Supabase Dashboard**
- Login ke [supabase.com](https://supabase.com)
- Pilih project Anda
- Buka **SQL Editor**

### **2. Jalankan SQL Script**
Copy dan paste seluruh isi file `setup_database.sql` ke SQL Editor, lalu klik **Run**.

### **3. Verifikasi Setup**
Setelah menjalankan script, Anda akan melihat:
- ✅ **Table created successfully** - Tabel berhasil dibuat
- ✅ **product_count: 8** - 8 produk sample sudah dimasukkan
- ✅ **rls_enabled: true** - Row Level Security aktif
- ✅ **Policies created** - 4 policies untuk CRUD operations

## 📊 **Database Schema**

### **Tabel Products**
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Indexes untuk Performance**
```sql
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_at ON products(created_at);
```

### **Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies untuk public access
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON products FOR DELETE USING (true);
```

## 🎯 **Sample Data**

### **🍽️ Makanan**
- **Nasi Goreng** - Rp 25,000 (Stok: 25, Min: 5)
- **Mie Ayam** - Rp 20,000 (Stok: 15, Min: 5)
- **Gado-gado** - Rp 18,000 (Stok: 20, Min: 5)

### **🥤 Minuman**
- **Kopi Hitam** - Rp 15,000 (Stok: 50, Min: 10)
- **Es Jeruk** - Rp 12,000 (Stok: 30, Min: 10)
- **Teh Manis** - Rp 8,000 (Stok: 100, Min: 20)

### **🍿 Snack & Dessert**
- **Keripik Singkong** - Rp 5,000 (Stok: 40, Min: 10)
- **Pisang Goreng** - Rp 10,000 (Stok: 35, Min: 8)

## 🔍 **Testing Database**

### **1. Test Query di SQL Editor**
```sql
-- Test select all products
SELECT * FROM products ORDER BY created_at DESC;

-- Test count products
SELECT COUNT(*) as total_products FROM products;

-- Test search products
SELECT * FROM products WHERE name ILIKE '%kopi%';
```

### **2. Test dari Aplikasi**
- Buka halaman Products
- Cek apakah data muncul
- Test search functionality
- Test CRUD operations

### **3. Check Browser Console**
Setelah database setup, console seharusnya tidak ada error 400 lagi.

## 🚨 **Troubleshooting**

### **Error 400: Bad Request**
- ✅ **Cause**: Tabel belum dibuat
- ✅ **Solution**: Jalankan `setup_database.sql`

### **Error 401: Unauthorized**
- ✅ **Cause**: RLS policies terlalu ketat
- ✅ **Solution**: Policies sudah diset untuk public access

### **Error 403: Forbidden**
- ✅ **Cause**: CORS atau permissions
- ✅ **Solution**: Check Supabase project settings

### **Error 500: Internal Server Error**
- ✅ **Cause**: Database connection issue
- ✅ **Solution**: Check Supabase project status

## 📈 **Performance Optimization**

### **Database Indexes**
```sql
-- Indexes untuk query performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(stock);
```

### **Query Optimization**
```sql
-- Optimized queries
SELECT * FROM products WHERE category = 'Minuman';
SELECT * FROM products WHERE stock <= min_stock;
SELECT * FROM products WHERE name ILIKE '%search%';
```

## 🎉 **Setelah Setup Database**

### **✅ Yang Akan Berfungsi**
- ✅ **Load Products** - Data produk muncul
- ✅ **Search Products** - Cari produk real-time
- ✅ **Add Product** - Tambah produk baru
- ✅ **Edit Product** - Update produk existing
- ✅ **Delete Product** - Hapus produk
- ✅ **Stock Management** - Min stock alerts

### **📊 Expected Results**
- ✅ **No more 400 errors**
- ✅ **Products data loaded**
- ✅ **Search functionality working**
- ✅ **CRUD operations working**
- ✅ **Stock alerts showing**

## 🚀 **Next Steps**

1. **Jalankan SQL Script** di Supabase Dashboard
2. **Refresh Aplikasi** di browser
3. **Test Halaman Products** - Data seharusnya muncul
4. **Test CRUD Operations** - Create, Read, Update, Delete
5. **Test Search** - Cari produk by name/category

**Database setup selesai! Aplikasi siap digunakan.** 🎉
