// Simple Supabase Test
import { supabase } from '../services/supabase';

export const simpleTest = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Simple test - just get one product
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Connection successful');
    console.log('📊 Data:', data);
    
    return { success: true, data: data };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};
