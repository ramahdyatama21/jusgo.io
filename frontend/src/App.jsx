// frontend/src/App.jsx

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          🎉 Dashboard Berhasil Dimuat!
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Aplikasi POS System sudah berfungsi dengan baik!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#166534', marginBottom: '10px' }}>Omzet Hari Ini</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>Rp 0</p>
            <p style={{ color: '#15803d', fontSize: '14px' }}>0 transaksi</p>
          </div>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>Omzet Bulan Ini</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>Rp 0</p>
            <p style={{ color: '#1d4ed8', fontSize: '14px' }}>0 transaksi</p>
          </div>

          <div style={{
            background: '#faf5ff',
            border: '1px solid #d8b4fe',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#7c3aed', marginBottom: '10px' }}>Total Produk</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>0</p>
            <p style={{ color: '#7c2d12', fontSize: '14px' }}>Produk aktif</p>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>Stok Rendah</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>0</p>
            <p style={{ color: '#b91c1c', fontSize: '14px' }}>Stok aman</p>
          </div>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#166534', marginBottom: '10px' }}>✅ Aplikasi Berhasil Dimuat!</h3>
          <p style={{ color: '#15803d', margin: '0' }}>
            Dashboard POS System sudah berfungsi dengan baik. 
            Mulai tambahkan produk dan transaksi untuk melihat data yang lebih detail.
          </p>
        </div>
      </div>
    </div>
  );
}