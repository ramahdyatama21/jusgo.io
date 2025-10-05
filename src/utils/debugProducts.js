// Debug utility for checking products data
import { supabase } from '../services/supabase';

export const debugProducts = async () => {
  try {
    console.log('🔍 Debugging products data...');
    
    // Check direct Supabase query
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    console.log('✅ Products data:', data);
    console.log('📊 Products count:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('🔍 First product details:');
      console.log('- ID:', data[0].id);
      console.log('- Name:', data[0].name);
      console.log('- SKU:', data[0].sku);
      console.log('- Sell Price:', data[0].sell_price);
      console.log('- Stock:', data[0].stock);
      console.log('- Category:', data[0].category);
      console.log('- Unit:', data[0].unit);
    } else {
      console.log('⚠️ No products found in database');
    }
    
    return data;
  } catch (err) {
    console.error('❌ Debug error:', err);
  }
};

// Test function
export const testProductsAPI = async () => {
  try {
    console.log('🧪 Testing products API...');
    
    const response = await fetch('/api/products');
    const data = await response.json();
    
    console.log('📡 API Response:', data);
    return data;
  } catch (err) {
    console.error('❌ API Test error:', err);
  }
};

