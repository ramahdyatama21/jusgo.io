// frontend/src/pages/RiwayatTransaksi.jsx
import { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';

export default function RiwayatTransaksi() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getTransactions();
      if (isMounted) {
        const rows = Array.isArray(data) ? data : [];
        const normalized = rows
          .map(r => ({
            ...r,
            items: Array.isArray(r.items) ? r.items : [],
            created_at: r.created_at || r.createdAt || null
          }))
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setRiwayat(normalized);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Riwayat Transaksi</h1>
        <p className="page-subtitle">Lihat semua transaksi yang telah dilakukan</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Semua Transaksi</h3>
        </div>
        {riwayat.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Belum ada transaksi</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu Transaksi</th>
                  <th>Customer</th>
                  <th>Pesanan</th>
                  <th>Catatan</th>
                  <th style={{ textAlign: 'center' }}>Sumber</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((order, idx) => (
                  <tr key={order.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {(order.created_at || order.createdAt)
                        ? new Date(order.created_at || order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                        : '-'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{order.customer || '-'}</td>
                    <td>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem' }}>
                        {(order.items || []).map((item, i) => (
                          <li key={i}>{item.name} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>x {item.qty}</span></li>
                        ))}
                      </ul>
                    </td>
                    <td>{order.notes || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {order.status === 'pos' ? (
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>POS</span>
                      ) : order.status === 'open' || order.status === 'open_order' ? (
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>Open Order</span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>{order.status || '-'}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {order.status === 'pos' ? (
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>Lunas</span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>Terkirim</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem' }}
                      onClick={() => {
                        const formatRupiah = n => n.toLocaleString('id-ID', { minimumFractionDigits: 0 });
                        const tgl = (order.sentAt || order.created_at || order.createdAt || '').replace(/\D/g, '').slice(0,12);
                        const noTrans = `${(order.created_at || order.createdAt || '').slice(0,10).replace(/-/g,'')}-${String(order.id).slice(-3)}`;
                        const kasir = order.kasir || '-';
                        const pembayaran = order.paymentMethod ? order.paymentMethod.toUpperCase() : '-';
                        const status = order.status === 'pos' ? 'LUNAS' : 'TERKIRIM';
                        const subtotal = (order.items || []).reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0);
                        const diskon = order.diskon || 0;
                        const total = subtotal - diskon;
                        const printWindow = window.open('', '', 'width=400,height=700');
                        printWindow.document.write(`
                          <html><head><title>Struk Transaksi</title>
                          <style>
                          body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:10px} .center{text-align:center} .bold{font-weight:bold}
                          .line{border-top:1px dashed #000;margin:6px 0} .item-row{display:flex;justify-content:space-between}
                          .item-name{flex:1} .item-qty{width:40px;text-align:center} .item-total{width:80px;text-align:right}
                          </style></head><body>
                          <div class='center bold'>JUSGO</div>
                          <div class='center'>Jl. Contoh No. 123</div>
                          <div class='line'></div>
                          <div>No. Transaksi : ${noTrans}</div>
                          <div>Tanggal       : ${(order.sentAt||order.created_at||order.createdAt||'').slice(0,16)}</div>
                          <div>Kasir         : ${kasir}</div>
                          <div class='line'></div>
                          <div class='item-row bold'><span class='item-name'>Item</span><span class='item-qty'>Qty</span><span class='item-total'>Total</span></div>
                          <div class='line'></div>
                          ${(order.items || []).map(item => `
                            <div class='item-row'>
                              <span class='item-name'>${item.name}</span>
                              <span class='item-qty'>${item.qty}</span>
                              <span class='item-total'>${formatRupiah(item.subtotal || (item.qty * item.price))}</span>
                            </div>
                          `).join('')}
                          <div class='line'></div>
                          <div class='item-row'><span class='item-name bold'>Subtotal</span><span></span><span class='item-total'>${formatRupiah(subtotal)}</span></div>
                          <div class='item-row'><span class='item-name'>Diskon</span><span></span><span class='item-total'>${formatRupiah(diskon)}</span></div>
                          <div class='item-row bold'><span class='item-name'>Total</span><span></span><span class='item-total'>${formatRupiah(total)}</span></div>
                          <div class='line'></div>
                          <div class='center'>Terima kasih!</div>
                          </body></html>`);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      }}
                    >
                      Cetak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
