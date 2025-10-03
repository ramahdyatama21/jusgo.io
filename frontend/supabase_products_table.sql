-- Create products table for Supabase
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (if needed)
CREATE POLICY "Allow read access for anonymous users" ON products
  FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
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
