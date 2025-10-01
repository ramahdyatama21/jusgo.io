// frontend/src/pages/RiwayatTransaksi.jsx
import { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';

export default function RiwayatTransaksi() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getTransactions();
      if (isMounted) setRiwayat(Array.isArray(data) ? data : []);
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Riwayat Transaksi</h1>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Daftar Semua Transaksi</h2>
        {riwayat.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Belum ada transaksi</div>
        ) : (
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b text-left">Waktu Transaksi</th>
                <th className="px-4 py-3 border-b text-left">Customer</th>
                <th className="px-4 py-3 border-b text-left">Pesanan</th>
                <th className="px-4 py-3 border-b text-left">Catatan</th>
                <th className="px-4 py-3 border-b text-center">Sumber</th>
                <th className="px-4 py-3 border-b text-center">Status</th>
                <th className="px-4 py-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((order, idx) => (
                <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}>
                  <td className="px-4 py-3 border-b align-top whitespace-nowrap">
                    {(order.created_at || order.createdAt)
                      ? new Date(order.created_at || order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 border-b align-top whitespace-nowrap">{order.customer || '-'}</td>
                  <td className="px-4 py-3 border-b align-top">
                    <ul className="list-disc pl-5 space-y-1">
                      {(order.items || []).map((item, i) => (
                        <li key={i}>{item.name} <span className="text-xs text-gray-500">x {item.qty}</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 border-b align-top">{order.notes || '-'}</td>
                  <td className="px-4 py-3 border-b align-top text-center">
                    {order.status === 'pos' ? (
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">POS</span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Open Order</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b align-top text-center">
                    {order.status === 'pos' ? (
                      <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">Lunas</span>
                    ) : (
                      <span className="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">Terkirim</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b align-top text-center">
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
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
        )}
      </div>
    </div>
  );
}
