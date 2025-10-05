import React, { useState } from 'react';
import {
  exportSalesReportCSV,
  exportOpenOrderCSV,
  exportStockReportCSV,
  exportBelanjaBahanCSV
} from '../services/api';

export default function ExportReportButtons() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <h3>Export Laporan CSV</h3>
      <div>
        <label>Periode (yyyy-mm-dd): </label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <span> - </span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <button onClick={() => exportSalesReportCSV(startDate, endDate)}>
        Export Laporan Penjualan
      </button>
      <button onClick={exportOpenOrderCSV}>
        Export Laporan Open Order
      </button>
      <button onClick={exportStockReportCSV}>
        Export Laporan Stok Barang
      </button>
      <button onClick={() => exportBelanjaBahanCSV(startDate, endDate)}>
        Export Laporan Belanja Bahan
      </button>
    </div>
  );
}
