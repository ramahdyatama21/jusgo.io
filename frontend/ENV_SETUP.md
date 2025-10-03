# 🔧 Environment Variables Setup

## 📋 **Supabase Credentials**

### **Environment Variables yang Diperlukan:**

```bash
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c
```

### **Cara Setup:**

#### **1. Buat File .env di Root Frontend**
```bash
# Di folder frontend/
touch .env
```

#### **2. Isi File .env**
```bash
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c
```

#### **3. Alternatif: Gunakan .env.local**
```bash
# Di folder frontend/
touch .env.local
```

### **🔧 Fallback Configuration**

Jika environment variables tidak tersedia, aplikasi akan menggunakan konfigurasi fallback dari `src/config/supabase.js`:

```javascript
export const supabaseConfig = {
  url: 'https://vwnfdzgkhibdlpcygdkp.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

### **✅ Verifikasi Setup**

#### **1. Check Console Logs**
Buka browser console, seharusnya melihat:
```
Supabase URL: https://vwnfdzgkhibdlpcygdkp.supabase.co
Supabase Key: Present
```

#### **2. Test Connection**
- Buka halaman Products
- Coba tambah produk baru
- Jika berhasil, Supabase sudah terhubung

### **🚀 Development vs Production**

#### **Development**
```bash
# .env.local (untuk development)
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Production**
```bash
# Environment variables di hosting platform
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **🔒 Security Notes**

- ✅ **Anon Key**: Safe untuk frontend (public)
- ✅ **RLS Enabled**: Row Level Security aktif
- ✅ **Policies**: Authenticated users only
- ✅ **No Secrets**: Tidak ada sensitive data

### **📊 Database Setup**

#### **1. Jalankan SQL di Supabase Dashboard**
Copy isi file `supabase_products_table.sql` ke SQL Editor.

#### **2. Enable RLS**
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

#### **3. Create Policies**
```sql
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

### **🎯 Testing**

#### **1. Test Connection**
```javascript
// Di browser console
import { supabase } from './src/services/supabase';
console.log('Supabase client:', supabase);
```

#### **2. Test Database**
```javascript
// Test query
const { data, error } = await supabase.from('products').select('*');
console.log('Products:', data);
```

### **🚨 Troubleshooting**

#### **Error: "Invalid API key"**
- ✅ Check environment variables
- ✅ Restart development server
- ✅ Clear browser cache

#### **Error: "Failed to fetch"**
- ✅ Check Supabase URL
- ✅ Check network connection
- ✅ Check RLS policies

#### **Error: "Table doesn't exist"**
- ✅ Run SQL schema di Supabase
- ✅ Check table name
- ✅ Check permissions

### **📈 Performance**

#### **Optimized Queries**
```sql
-- Indexes untuk performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
```

#### **Caching Strategy**
- ✅ **React State**: Local state management
- ✅ **Supabase Cache**: Automatic caching
- ✅ **Optimistic Updates**: UI updates immediately

### **🎉 Ready to Use!**

Setelah setup environment variables, aplikasi siap digunakan dengan:
- ✅ **Database Connection**: Supabase terhubung
- ✅ **CRUD Operations**: Create, Read, Update, Delete
- ✅ **Real-time Search**: Search products
- ✅ **Stock Management**: Min stock alerts
- ✅ **Error Handling**: Graceful error handling

**Aplikasi siap digunakan dengan Supabase!** 🚀
