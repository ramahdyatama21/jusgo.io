// Test Supabase Connection
import { supabase } from '../services/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if supabase client is initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    console.log('✅ Supabase client initialized');
    
    // Test 2: Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Products count:', data);
    
    return {
      success: true,
      message: 'Supabase connection successful',
      data: data
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export const testProductsTable = async () => {
  try {
    console.log('🔍 Testing products table...');
    
    // Test 1: Check if table exists
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Products table error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Products table accessible');
    console.log('📊 Sample products:', data);
    
    return {
      success: true,
      message: 'Products table accessible',
      data: data,
      count: data.length
    };
    
  } catch (error) {
    console.error('❌ Products table test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export const testCRUDOperations = async () => {
  try {
    console.log('🔍 Testing CRUD operations...');
    
    // Test 1: Create a test product
    const testProduct = {
      name: 'Test Product',
      sku: 'TEST001',
      price: 10000,
      stock: 10,
      min_stock: 5,
      category: 'Test',
      description: 'Test product for CRUD operations'
    };
    
    const { data: createData, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Create operation failed:', createError);
      return {
        success: false,
        error: createError.message,
        operation: 'CREATE'
      };
    }
    
    console.log('✅ Create operation successful');
    
    // Test 2: Read the created product
    const { data: readData, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', createData.id)
      .single();
    
    if (readError) {
      console.error('❌ Read operation failed:', readError);
      return {
        success: false,
        error: readError.message,
        operation: 'READ'
      };
    }
    
    console.log('✅ Read operation successful');
    
    // Test 3: Update the product
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ name: 'Updated Test Product' })
      .eq('id', createData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Update operation failed:', updateError);
      return {
        success: false,
        error: updateError.message,
        operation: 'UPDATE'
      };
    }
    
    console.log('✅ Update operation successful');
    
    // Test 4: Delete the test product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', createData.id);
    
    if (deleteError) {
      console.error('❌ Delete operation failed:', deleteError);
      return {
        success: false,
        error: deleteError.message,
        operation: 'DELETE'
      };
    }
    
    console.log('✅ Delete operation successful');
    
    return {
      success: true,
      message: 'All CRUD operations successful',
      operations: ['CREATE', 'READ', 'UPDATE', 'DELETE']
    };
    
  } catch (error) {
    console.error('❌ CRUD operations test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running all Supabase tests...');
  
  const results = {
    connection: await testSupabaseConnection(),
    table: await testProductsTable(),
    crud: await testCRUDOperations()
  };
  
  console.log('📊 Test Results:', results);
  
  return results;
};
