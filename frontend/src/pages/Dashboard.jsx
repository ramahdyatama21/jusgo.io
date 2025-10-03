// frontend/src/pages/Dashboard.jsx

export default function Dashboard() {
  // Get user data safely
  let user = {};
  try {
    const userData = localStorage.getItem('supabase_user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (e) {
    console.log('Error parsing user data:', e);
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Selamat datang, {user.email || 'User'}!</p>
      </div>

      {/* Simple Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Omzet Hari Ini</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>Rp 0</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>0 transaksi</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Omzet Bulan Ini</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>Rp 0</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>0 transaksi</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Total Produk</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', margin: '0' }}>0</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>Produk aktif</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Stok Rendah</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', margin: '0' }}>0</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>Stok aman</p>
        </div>
      </div>

      {/* Success Message */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '12px' }}>
            <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#166534', margin: '0 0 5px 0' }}>Dashboard Berhasil Dimuat!</h3>
            <p style={{ fontSize: '14px', color: '#15803d', margin: '0' }}>Dashboard Anda sudah berfungsi dengan baik. Mulai tambahkan produk dan transaksi untuk melihat data yang lebih detail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}