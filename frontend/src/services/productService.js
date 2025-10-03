import { supabase } from './supabase';

export const productService = {
  // Get all products
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProduct(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id, productData) {
    try {
      console.log('🔄 ProductService updating product:', { id, productData });
      
      // Map camelCase to snake_case
      const mappedData = {};
      Object.entries(productData).forEach(([key, value]) => {
        const columnMap = {
          'sellPrice': 'sell_price',
          'minStock': 'min_stock',
          'buyPrice': 'buy_price'
        };
        const mappedKey = columnMap[key] || key;
        mappedData[mappedKey] = value;
      });
      
      console.log('🗺️ Mapped data:', mappedData);
      
      const { data, error } = await supabase
        .from('products')
        .update(mappedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ ProductService update error:', error);
        throw error;
      }
      
      console.log('✅ ProductService update successful:', data);
      return data;
    } catch (error) {
      console.error('💥 ProductService update failed:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Update product stock
  async updateStock(id, newStock) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};
