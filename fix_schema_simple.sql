-- Simple Fix for Supabase Schema Issues
-- Run this in Supabase SQL Editor

-- 1. Fix products table - remove duplicate columns
ALTER TABLE public.products DROP COLUMN IF EXISTS "buyPrice";
ALTER TABLE public.products DROP COLUMN IF EXISTS "sellPrice"; 
ALTER TABLE public.products DROP COLUMN IF EXISTS "minStock";
ALTER TABLE public.products DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE public.products DROP COLUMN IF EXISTS "updatedAt";

-- 2. Fix transactions table - remove duplicate columns
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "createdat";
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "paymentmethod";
ALTER TABLE public.transactions DROP COLUMN IF EXISTS "userid";

-- 3. Fix stock_movements table - remove duplicate created_at
ALTER TABLE public.stock_movements DROP COLUMN IF EXISTS "createdAt";

-- 4. Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_orders ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for anonymous access (allow all for testing)
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all for transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow all for transaction_items" ON public.transaction_items FOR ALL USING (true);
CREATE POLICY "Allow all for stock_movements" ON public.stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all for open_orders" ON public.open_orders FOR ALL USING (true);

-- 6. Create RPC functions for stock management
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

-- 7. Hapus semua data yang ada
DELETE FROM public.transaction_items;
DELETE FROM public.stock_movements;
DELETE FROM public.transactions;
DELETE FROM public.open_orders;
DELETE FROM public.products;
DELETE FROM public.categories;
