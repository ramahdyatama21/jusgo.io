# 🚨 Troubleshooting Supabase Integration

## ❌ **Error yang Terjadi:**
```
GET https://vwnfdzgkhibdlpcygdkp.supabase.co/rest/v1/products?select=*&order=created_at.desc
[HTTP/3 400  47ms]
```

## 🔍 **Diagnosis Error**

### **Error 400: Bad Request**
- **Penyebab**: Tabel `products` belum dibuat di database
- **Solusi**: Jalankan SQL script di Supabase Dashboard

### **Error 401: Unauthorized**
- **Penyebab**: Row Level Security (RLS) terlalu ketat
- **Solusi**: Update RLS policies untuk public access

### **Error 403: Forbidden**
- **Penyebab**: CORS atau permissions issue
- **Solusi**: Check Supabase project settings

### **Error 500: Internal Server Error**
- **Penyebab**: Database connection issue
- **Solusi**: Check Supabase project status

## 🛠️ **Solusi Step-by-Step**

### **1. Setup Database di Supabase**

#### **A. Buka Supabase Dashboard**
1. Login ke [supabase.com](https://supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**

#### **B. Jalankan SQL Script**
Copy dan paste seluruh isi file `setup_database.sql` ke SQL Editor, lalu klik **Run**.

#### **C. Verifikasi Setup**
Setelah menjalankan script, Anda akan melihat:
- ✅ **Table created successfully**
- ✅ **product_count: 8**
- ✅ **rls_enabled: true**
- ✅ **Policies created**

### **2. Test Database Connection**

#### **A. Test di SQL Editor**
```sql
-- Test 1: Check table exists
SELECT * FROM products LIMIT 5;

-- Test 2: Check count
SELECT COUNT(*) as total_products FROM products;

-- Test 3: Check RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';
```

#### **B. Test di Browser Console**
Buka browser console, seharusnya melihat:
```
🔍 Testing Supabase connection...
✅ Supabase connection successful
✅ Products table accessible
```

### **3. Check Environment Variables**

#### **A. Verify .env File**
```bash
# File: frontend/.env
VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **B. Check Console Logs**
```
Supabase URL: https://vwnfdzgkhibdlpcygdkp.supabase.co
Supabase Key: Present
```

### **4. Test CRUD Operations**

#### **A. Test Create**
```javascript
// Di browser console
const { data, error } = await supabase
  .from('products')
  .insert([{ name: 'Test', price: 1000, stock: 10 }])
  .select();
```

#### **B. Test Read**
```javascript
// Di browser console
const { data, error } = await supabase
  .from('products')
  .select('*');
```

#### **C. Test Update**
```javascript
// Di browser console
const { data, error } = await supabase
  .from('products')
  .update({ name: 'Updated' })
  .eq('id', 1)
  .select();
```

#### **D. Test Delete**
```javascript
// Di browser console
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', 1);
```

## 🔧 **Advanced Troubleshooting**

### **1. Check Supabase Project Status**
- Buka Supabase Dashboard
- Check project status
- Verify API keys

### **2. Check Network Tab**
- Buka Developer Tools
- Check Network tab
- Look for failed requests
- Check response headers

### **3. Check Console Errors**
- Buka browser console
- Look for JavaScript errors
- Check Supabase client logs

### **4. Test with curl**
```bash
# Test API endpoint
curl -X GET "https://vwnfdzgkhibdlpcygdkp.supabase.co/rest/v1/products" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📊 **Expected Results**

### **✅ After Database Setup**
- ✅ **No more 400 errors**
- ✅ **Products data loaded**
- ✅ **Search functionality working**
- ✅ **CRUD operations working**
- ✅ **Stock alerts showing**

### **✅ Console Logs**
```
🔍 Testing Supabase connection...
✅ Supabase connection successful
✅ Products table accessible
📊 Products loaded: 8 items
```

### **✅ Network Requests**
```
GET /rest/v1/products?select=*&order=created_at.desc
[HTTP/2 200  200ms]
```

## 🚀 **Quick Fix Commands**

### **1. Restart Development Server**
```bash
npm run dev
```

### **2. Clear Browser Cache**
- Hard refresh (Ctrl+F5)
- Clear browser cache
- Restart browser

### **3. Rebuild Application**
```bash
npm run build
```

### **4. Check Dependencies**
```bash
npm install
```

## 📋 **Checklist Troubleshooting**

### **✅ Database Setup**
- [ ] SQL script executed in Supabase
- [ ] Table `products` created
- [ ] RLS policies created
- [ ] Sample data inserted

### **✅ Environment Variables**
- [ ] `.env` file created
- [ ] Supabase URL correct
- [ ] Supabase key correct
- [ ] Variables loaded in app

### **✅ Application Code**
- [ ] Supabase client initialized
- [ ] Service functions working
- [ ] Error handling implemented
- [ ] Loading states working

### **✅ Network & CORS**
- [ ] No CORS errors
- [ ] API requests successful
- [ ] Response data received
- [ ] No 400/401/403 errors

## 🎯 **Common Solutions**

### **1. Database Not Created**
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100)
);
```

### **2. RLS Too Restrictive**
```sql
-- Allow public access
CREATE POLICY "Allow public access" ON products
  FOR ALL USING (true);
```

### **3. Environment Variables Missing**
```bash
# Create .env file
echo "VITE_SUPABASE_URL=https://vwnfdzgkhibdlpcygdkp.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=YOUR_KEY" >> .env
```

### **4. CORS Issues**
- Check Supabase project settings
- Verify API keys
- Check network requests

## 🎉 **Success Indicators**

### **✅ Database Working**
- Products table exists
- Sample data loaded
- RLS policies active
- CRUD operations working

### **✅ Application Working**
- No console errors
- Products data displayed
- Search functionality working
- Forms working properly

### **✅ Network Working**
- No 400/401/403 errors
- API requests successful
- Data received properly
- No CORS issues

**Setelah mengikuti troubleshooting ini, aplikasi seharusnya berfungsi dengan baik!** 🚀
