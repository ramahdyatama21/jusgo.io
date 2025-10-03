// Simplified App component for testing

function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          marginBottom: '1rem',
          margin: '0 0 1rem 0'
        }}>
          Jusgo.io POS System
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          fontSize: '1.2rem',
          margin: '0 0 2rem 0'
        }}>
          Sistem Kasir & Inventory
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Dashboard
          </button>
        </div>
        <div style={{ 
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#9ca3af'
        }}>
          <p>Backend: http://localhost:5000</p>
          <p>Frontend: http://localhost:5173</p>
        </div>
      </div>
    </div>
  );
}

export default App;