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

  const formatRupiah = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 0 });

  const handlePrint = (order) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">📜 Riwayat Transaksi</h1>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">Lihat semua transaksi yang telah dilakukan</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">🛒 Daftar Semua Transaksi</h3>
          </div>
          
          {riwayat.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-gray-500">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Catatan</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sumber</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {riwayat.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-xs text-gray-600 whitespace-nowrap">
                          {(order.created_at || order.createdAt)
                            ? new Date(order.created_at || order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                            : '-'}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{order.customer || '-'}</td>
                        <td className="px-3 py-4">
                          <ul className="list-disc pl-5 text-sm">
                            {(order.items || []).map((item, i) => (
                              <li key={i}>{item.name} <span className="text-xs text-gray-500">x{item.qty}</span></li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600 hidden xl:table-cell">{order.notes || '-'}</td>
                        <td className="px-3 py-4 text-center">
                          {order.status === 'pos' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">POS</span>
                          ) : order.status === 'open' || order.status === 'open_order' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Open</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{order.status || '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center">
                          {order.status === 'pos' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">Lunas</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">Terkirim</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <button
                            onClick={() => handlePrint(order)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            🖨️ Cetak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 max-h-[600px] overflow-y-auto">
                {riwayat.map((order) => {
                  const subtotal = (order.items || []).reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0);
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{order.customer || 'Customer'}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {(order.created_at || order.createdAt)
                              ? new Date(order.created_at || order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                              : '-'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end ml-2">
                          {order.status === 'pos' ? (
                            <>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">POS</span>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">Lunas</span>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Open</span>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">Terkirim</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3 mb-3">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Pesanan:</p>
                        <ul className="space-y-1">
                          {(order.items || []).map((item, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="text-gray-600">x{item.qty}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.notes && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded text-xs">
                          <span className="font-medium text-yellow-800">Catatan:</span>
                          <p className="text-yellow-700 mt-1">{order.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-lg text-blue-600">Rp {formatRupiah(subtotal)}</p>
                        </div>
                        <button
                          onClick={() => handlePrint(order)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🖨️ Cetak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
