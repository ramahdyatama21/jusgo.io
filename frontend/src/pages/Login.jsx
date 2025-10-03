// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple mock login
    if (email && password) {
      // Simulate login
      localStorage.setItem('supabase_user', JSON.stringify({
        email: email,
        role: 'admin'
      }));
      
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1000);
    } else {
      setLoading(false);
      alert('Email dan password harus diisi');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
            POS System
          </h1>
          <p style={{ color: '#6b7280' }}>Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f0f9ff', 
          borderRadius: '6px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: '0' }}>
            <strong>Demo Login:</strong><br />
            Email: admin@example.com<br />
            Password: password
          </p>
        </div>
      </div>
    </div>
  );
}