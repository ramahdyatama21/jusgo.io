import React, { useState } from 'react';
import { testSupabaseConnection, testProductsTable, testCRUDOperations, runAllTests } from '../utils/testSupabase';

const SupabaseTest = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (testType) => {
    setLoading(true);
    setResults(null);
    
    try {
      let result;
      switch (testType) {
        case 'connection':
          result = await testSupabaseConnection();
          break;
        case 'table':
          result = await testProductsTable();
          break;
        case 'crud':
          result = await testCRUDOperations();
          break;
        case 'all':
          result = await runAllTests();
          break;
        default:
          result = { success: false, error: 'Invalid test type' };
      }
      
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => runTest('connection')}
          disabled={loading}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={() => runTest('table')}
          disabled={loading}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
        >
          Test Products Table
        </button>
        
        <button 
          onClick={() => runTest('crud')}
          disabled={loading}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
        >
          Test CRUD Operations
        </button>
        
        <button 
          onClick={() => runTest('all')}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          Run All Tests
        </button>
      </div>

      {loading && (
        <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          🔄 Running tests...
        </div>
      )}

      {results && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: results.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${results.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <h3 style={{ color: results.success ? '#155724' : '#721c24' }}>
            {results.success ? '✅ Success' : '❌ Error'}
          </h3>
          
          {results.message && (
            <p><strong>Message:</strong> {results.message}</p>
          )}
          
          {results.error && (
            <p><strong>Error:</strong> {results.error}</p>
          )}
          
          {results.data && (
            <div>
              <p><strong>Data:</strong></p>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '0.5rem', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          )}
          
          {results.details && (
            <div>
              <p><strong>Details:</strong></p>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '0.5rem', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(results.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
