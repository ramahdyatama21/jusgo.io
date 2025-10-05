import React from 'react';

const PrintReceipt = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={onClose}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview Receipt */}
          <div id="receipt-preview" style={{ marginBottom: '1rem' }}>
            <ReceiptContent 
              transaction={transaction}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePrint}
              style={{ flex: 1 }}
            >
              🖨️ Print
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          #receipt-print, #receipt-print * {
            visibility: visible;
          }
          
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
      `}</style>

      {/* Hidden Print Content */}
      <div id="receipt-print" style={{ display: 'none' }}>
        <ReceiptContent 
          transaction={transaction}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          isPrint={true}
        />
      </div>
    </>
  );
};

const ReceiptContent = ({ transaction, formatCurrency, formatDate, isPrint = false }) => {
  const styles = {
    receipt: {
      fontFamily: 'monospace',
      fontSize: isPrint ? '10px' : '12px',
      lineHeight: isPrint ? '1.3' : '1.4',
      width: isPrint ? '58mm' : '100%',
      maxWidth: isPrint ? '58mm' : '320px',
      margin: '0 auto',
      padding: isPrint ? '5mm 3mm' : '1rem',
      backgroundColor: 'white',
      color: '#000'
    },
    header: {
      textAlign: 'center',
      marginBottom: '10px',
      borderBottom: '1px dashed #000',
      paddingBottom: '10px'
    },
    logo: {
      fontSize: isPrint ? '18px' : '20px',
      fontWeight: 'bold',
      marginBottom: '5px',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: '2px'
    },
    companyName: {
      fontSize: isPrint ? '14px' : '16px',
      fontWeight: 'bold',
      marginBottom: '3px'
    },
    companyInfo: {
      fontSize: isPrint ? '9px' : '10px',
      margin: '2px 0'
    },
    section: {
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px dashed #000'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '3px 0',
      fontSize: isPrint ? '9px' : '10px'
    },
    itemRow: {
      margin: '5px 0'
    },
    itemName: {
      fontSize: isPrint ? '10px' : '11px',
      fontWeight: 'bold',
      marginBottom: '2px'
    },
    itemDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isPrint ? '9px' : '10px',
      paddingLeft: '5px'
    },
    totalSection: {
      marginTop: '10px',
      paddingTop: '8px',
      borderTop: '2px solid #000'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isPrint ? '12px' : '14px',
      fontWeight: 'bold',
      margin: '5px 0'
    },
    footer: {
      textAlign: 'center',
      marginTop: '15px',
      paddingTop: '10px',
      borderTop: '1px dashed #000',
      fontSize: isPrint ? '9px' : '10px'
    },
    thanks: {
      fontSize: isPrint ? '11px' : '12px',
      fontWeight: 'bold',
      margin: '5px 0'
    }
  };

  return (
    <div style={styles.receipt}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>✦ JUSGO ✦</div>
        <div style={styles.companyName}>Cold Press Juice</div>
        <div style={styles.companyInfo}>Jl. Sehat Segar No. 123</div>
        <div style={styles.companyInfo}>Telp: 0812-3456-7890</div>
        <div style={styles.companyInfo}>Instagram: @jusgo.id</div>
      </div>

      {/* Transaction Info */}
      <div style={styles.section}>
        <div style={styles.row}>
          <span>No. Transaksi:</span>
          <span style={{ fontWeight: 'bold' }}>#{transaction.id?.slice(0, 8) || 'N/A'}</span>
        </div>
        <div style={styles.row}>
          <span>Tanggal:</span>
          <span>{formatDate(transaction.created_at || new Date())}</span>
        </div>
        <div style={styles.row}>
          <span>Kasir:</span>
          <span>{transaction.cashier || 'Admin'}</span>
        </div>
      </div>

      {/* Items */}
      <div style={styles.section}>
        {transaction.items?.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <div style={styles.itemName}>{item.name}</div>
            <div style={styles.itemDetail}>
              <span>{item.qty} x {formatCurrency(item.price)}</span>
              <span style={{ fontWeight: 'bold' }}>
                {formatCurrency(item.subtotal || (item.qty * item.price))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div>
        <div style={styles.row}>
          <span>Subtotal:</span>
          <span>{formatCurrency(transaction.subtotal || 0)}</span>
        </div>
        {transaction.discount > 0 && (
          <div style={styles.row}>
            <span>Diskon:</span>
            <span>-{formatCurrency(transaction.discount)}</span>
          </div>
        )}
        {transaction.tax > 0 && (
          <div style={styles.row}>
            <span>Pajak:</span>
            <span>{formatCurrency(transaction.tax)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div style={styles.totalSection}>
        <div style={styles.totalRow}>
          <span>TOTAL:</span>
          <span>{formatCurrency(transaction.total || 0)}</span>
        </div>
        {transaction.payment > 0 && (
          <>
            <div style={styles.row}>
              <span>Bayar:</span>
              <span>{formatCurrency(transaction.payment)}</span>
            </div>
            <div style={styles.row}>
              <span>Kembali:</span>
              <span>{formatCurrency(transaction.change || 0)}</span>
            </div>
          </>
        )}
        <div style={styles.row}>
          <span>Metode Bayar:</span>
          <span style={{ textTransform: 'uppercase' }}>
            {transaction.paymentMethod || 'TUNAI'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.thanks}>Terima Kasih!</div>
        <div>Sehat & Segar Setiap Hari</div>
        <div style={{ margin: '8px 0' }}>~~~</div>
        <div style={{ fontSize: isPrint ? '8px' : '9px' }}>
          Barang yang sudah dibeli tidak dapat ditukar
        </div>
        <div style={{ fontSize: isPrint ? '8px' : '9px', marginTop: '5px' }}>
          www.jusgo.id
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
