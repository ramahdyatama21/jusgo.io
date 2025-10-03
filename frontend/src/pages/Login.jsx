import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simulate login
      if (email && password) {
        // Mock authentication
        const user = {
          id: 1,
          name: 'Admin',
          email: email,
          role: 'admin'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setTimeout(() => {
          setLoading(false);
          navigate('/dashboard');
        }, 1000);
      } else {
        setError('Email dan password harus diisi');
        setLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            POS System
          </h1>
          <p style={{ color: '#64748b' }}>Masuk ke akun Anda</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <strong>Demo Login:</strong><br />
            Email: admin@example.com<br />
            Password: password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;