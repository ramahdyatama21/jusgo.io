-- Fix Supabase Database Schema
-- Run this in Supabase SQL Editor to fix existing schema issues

-- 1. Drop problematic duplicate columns in products table
ALTER TABLE public.products DROP COLUMN IF EXISTS "buyPrice";
ALTER TABLE public.products DROP COLUMN IF EXISTS "sellPrice";
ALTER TABLE public.products DROP COLUMN IF EXISTS "minStock";
ALTER TABLE public.products DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE public.products DROP COLUMN IF EXISTS "updatedAt";

-- 2. Rename columns to match application expectations
ALTER TABLE public.products RENAME COLUMN buyprice TO buy_price;
ALTER TABLE public.products RENAME COLUMN sellprice TO sell_price;
ALTER TABLE public.products RENAME COLUMN minstock TO min_stock;
ALTER TABLE public.products RENAME COLUMN createdat TO created_at;
ALTER TABLE public.products RENAME COLUMN updatedat TO updated_at;

-- 3. Fix stock_movements table - remove duplicate created_at
ALTER TABLE public.stock_movements DROP COLUMN IF EXISTS "createdAt";

-- 4. Fix transactions table - remove duplicate columns
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "createdat";
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "paymentmethod";
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "userid";

-- 5. Fix transaction_items foreign key reference
ALTER TABLE public.transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_tx;
ALTER TABLE public.transaction_items ADD CONSTRAINT fk_transaction_items_tx 
  FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

-- 6. Add missing columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 7. Add missing columns to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_orders ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users on products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on open_orders" ON public.open_orders;
DROP POLICY IF EXISTS "Allow read access for anonymous users on products" ON public.products;
DROP POLICY IF EXISTS "Allow read access for anonymous users on categories" ON public.categories;

-- 11. Create RLS policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users on products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on transactions" ON public.transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on transaction_items" ON public.transaction_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on stock_movements" ON public.stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on open_orders" ON public.open_orders
  FOR ALL USING (auth.role() = 'authenticated');

-- 12. Create policies for anonymous users (read access)
CREATE POLICY "Allow read access for anonymous users on products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for anonymous users on categories" ON public.categories
  FOR SELECT USING (true);

-- 13. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 15. Create RPC functions for stock management
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products 
  SET stock = stock + p_quantity 
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products 
  SET stock = stock - p_quantity 
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 16. Insert sample categories if not exist
INSERT INTO public.categories (name) VALUES
('Makanan'),
('Minuman'),
('Snack'),
('Dessert'),
('Umum')
ON CONFLICT (name) DO NOTHING;

-- 17. Insert sample products if not exist
INSERT INTO public.products (name, sku, category, unit, buy_price, sell_price, stock, min_stock, description) VALUES
('Kopi Hitam', 'KOPI001', 'Minuman', 'pcs', 10000, 15000, 50, 10, 'Kopi hitam segar tanpa gula'),
('Nasi Goreng', 'NASI001', 'Makanan', 'pcs', 15000, 25000, 25, 5, 'Nasi goreng dengan telur dan ayam'),
('Teh Manis', 'TEH001', 'Minuman', 'pcs', 5000, 8000, 100, 20, 'Teh manis segar'),
('Mie Ayam', 'MIE001', 'Makanan', 'pcs', 12000, 20000, 15, 5, 'Mie ayam dengan pangsit'),
('Es Jeruk', 'JERUK001', 'Minuman', 'pcs', 8000, 12000, 30, 10, 'Es jeruk segar'),
('Gado-gado', 'GADO001', 'Makanan', 'pcs', 12000, 18000, 20, 5, 'Gado-gado dengan bumbu kacang'),
('Keripik Singkong', 'KERIPIK001', 'Snack', 'pcs', 3000, 5000, 40, 10, 'Keripik singkong gurih'),
('Pisang Goreng', 'PISANG001', 'Dessert', 'pcs', 6000, 10000, 35, 8, 'Pisang goreng crispy')
ON CONFLICT (sku) DO NOTHING;

-- 18. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
