// Test Supabase connection
import { supabase } from '../services/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Supabase connection successful');
    return {
      success: true,
      message: 'Supabase connection is working'
    };
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
};

// Test products table access
export const testProductsTable = async () => {
  try {
    console.log('🔍 Testing products table access...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sell_price, stock')
      .limit(5);
    
    if (error) {
      console.error('❌ Products table access failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Products table access successful');
    console.log('📊 Products found:', data?.length || 0);
    console.log('📋 Sample data:', data);
    
    return {
      success: true,
      data: data,
      count: data?.length || 0
    };
    
  } catch (err) {
    console.error('❌ Products table test failed:', err);
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🧪 Running all Supabase tests...');
  
  const connectionTest = await testSupabaseConnection();
  const productsTest = await testProductsTable();
  
  console.log('📊 Test Results:');
  console.log('- Connection:', connectionTest.success ? '✅' : '❌');
  console.log('- Products Table:', productsTest.success ? '✅' : '❌');
  
  return {
    connection: connectionTest,
    products: productsTest,
    allPassed: connectionTest.success && productsTest.success
  };
};
