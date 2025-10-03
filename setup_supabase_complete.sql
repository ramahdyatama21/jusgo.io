-- Complete Supabase Database Setup for POS System
-- Run this in Supabase SQL Editor

-- 1. Create products table
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

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  payment_method VARCHAR(50) DEFAULT 'tunai',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
  qty INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create open_orders table
CREATE TABLE IF NOT EXISTS open_orders (
  id BIGSERIAL PRIMARY KEY,
  customer VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'sent', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_orders ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users on products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on transactions" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on transaction_items" ON transaction_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on stock_movements" ON stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on open_orders" ON open_orders
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Create policies for anonymous users (read access)
CREATE POLICY "Allow read access for anonymous users on products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for anonymous users on categories" ON categories
  FOR SELECT USING (true);

-- 11. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 13. Create RPC functions for stock management
CREATE OR REPLACE FUNCTION increment_stock(p_product_id BIGINT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock + p_quantity 
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id BIGINT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock - p_quantity 
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Insert sample data
INSERT INTO categories (name) VALUES
('Makanan'),
('Minuman'),
('Snack'),
('Dessert')
ON CONFLICT (name) DO NOTHING;

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

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
