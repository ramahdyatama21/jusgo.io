-- =============================================
-- SUPABASE DATABASE SETUP SCRIPT
-- =============================================
-- Jalankan script ini di SQL Editor di Supabase Dashboard

-- 1. CREATE PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
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

-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- =============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow read access for anonymous users" ON products;
DROP POLICY IF EXISTS "Allow public read access" ON products;

-- Create new policies
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON products
  FOR DELETE USING (true);

-- 5. CREATE FUNCTION TO UPDATE UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CREATE TRIGGER FOR AUTO-UPDATE
-- =============================================
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERT SAMPLE DATA
-- =============================================
INSERT INTO products (name, sku, price, stock, min_stock, category, description) VALUES
('Kopi Hitam', 'KOPI001', 15000, 50, 10, 'Minuman', 'Kopi hitam segar tanpa gula'),
('Nasi Goreng', 'NASI001', 25000, 25, 5, 'Makanan', 'Nasi goreng dengan telur dan ayam'),
('Teh Manis', 'TEH001', 8000, 100, 20, 'Minuman', 'Teh manis segar'),
('Mie Ayam', 'MIE001', 20000, 15, 5, 'Makanan', 'Mie ayam dengan pangsit'),
('Es Jeruk', 'JERUK001', 12000, 30, 10, 'Minuman', 'Es jeruk segar'),
('Gado-gado', 'GADO001', 18000, 20, 5, 'Makanan', 'Gado-gado dengan bumbu kacang'),
('Keripik Singkong', 'KERIPIK001', 5000, 40, 10, 'Snack', 'Keripik singkong gurih'),
('Pisang Goreng', 'PISANG001', 10000, 35, 8, 'Dessert', 'Pisang goreng crispy')
ON CONFLICT (sku) DO NOTHING;

-- 8. VERIFY SETUP
-- =============================================
-- Check if table exists and has data
SELECT 
  'Table created successfully' as status,
  COUNT(*) as product_count
FROM products;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- Check policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'products';
