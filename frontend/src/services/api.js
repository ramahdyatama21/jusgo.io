// frontend/src/services/api.js

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const getToken = () => {
  // Try to get JWT token first
  let token = localStorage.getItem('token');
  
  // If no JWT token, try to get from Supabase session
  if (!token) {
    const session = localStorage.getItem('supabase_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        token = sessionData.access_token;
      } catch (e) {
        console.error('Error parsing Supabase session:', e);
      }
    }
  }
  
  return token;
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth
export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: getHeaders()
  });
  return res.json();
};

// Products
export const getProducts = async (search = '', category = '') => {
  let query = supabase.from('products').select('*');
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Supabase getProducts error:', error);
    return [];
  }
  return data || [];
};

export const createProduct = async (data) => {
  const { data: result, error } = await supabase.from('products').insert([data]).select();
  if (error) {
    console.error('Supabase createProduct error:', error);
    throw error;
  }
  return result?.[0] || null;
};

export const updateProduct = async (id, data) => {
  const { data: result, error } = await supabase.from('products').update(data).eq('id', id).select();
  if (error) {
    console.error('Supabase updateProduct error:', error);
    throw error;
  }
  return result?.[0] || null;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteProduct error:', error);
    throw error;
  }
  return true;
};

export const importProducts = async (products) => {
  const res = await fetch(`${API_URL}/products/import`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ products })
  });
  return res.json();
};

// Stock

// Supabase-based Stock Management
export const getStockMovements = async (productId = null) => {
  try {
    let query = supabase
      .from('stock_movements')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (productId) {
      query = query.eq('productId', productId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get stock movements error:', error);
    return [];
  }
};

export const addStock = async (productId, qty, description) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error('Sesi login telah berakhir. Silakan login ulang.');
    }
    // Create movement record first
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert([{
        productId: productId,
        type: 'in', // atau 'out'
        qty: qty,
        description: description || ''
      }])
      .select('*, product:products(*)')
      .single();
    if (movementError) {
      console.error('Create movement error:', movementError);
      throw new Error('Gagal mencatat pergerakan stok');
    }
    // Then update product stock using RPC
    const { error: updateError } = await supabase.rpc('increment_stock', {
      p_product_id: productId,
      p_quantity: qty
    });
    if (updateError) {
      console.error('Supabase RPC increment_stock error:', updateError);
      // Rollback movement if stock update fails
      try {
        await supabase
          .from('stock_movements')
          .delete()
          .eq('id', movement.id);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
      throw new Error('Gagal memperbarui stok');
    }
    return movement;
  } catch (error) {
    console.error('Add stock error:', error);
    throw error;
  }
};

export const removeStock = async (productId, qty, description) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error('Sesi login telah berakhir. Silakan login ulang.');
    }
    // Check current stock first
    const { data: product, error: stockError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    if (stockError) {
      throw new Error('Gagal memeriksa stok produk');
    }
    if ((product?.stock || 0) < qty) {
      throw new Error('Stok tidak mencukupi');
    }
    // Create movement record first
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert([{
        productId: productId,
        type: 'out',
        qty: qty,
        description: description || ''
      }])
      .select('*, product:products(*)')
      .single();
    if (movementError) {
      console.error('Create movement error:', movementError);
      throw new Error('Gagal mencatat pergerakan stok');
    }
    // Then update product stock using RPC
    const { error: updateError } = await supabase.rpc('decrement_stock', {
      p_product_id: productId,
      p_quantity: qty
    });
    if (updateError) {
      console.error('Supabase RPC decrement_stock error:', updateError);
      // Rollback movement if stock update fails
      try {
        await supabase
          .from('stock_movements')
          .delete()
          .eq('id', movement.id);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
      throw new Error('Gagal memperbarui stok');
    }
    return movement;
  } catch (error) {
    console.error('Remove stock error:', error);
    throw error;
  }
};

// Transactions (migrated to Supabase)
export const createTransaction = async (payload) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Supabase getUser error:', userError);
  }
  const userId = userData?.user?.id || null;

  const items = Array.isArray(payload.items) ? payload.items : [];
  const computedSubtotal = items.reduce((s, i) => s + Number(i.subtotal ?? (Number(i.price || 0) * Number(i.qty || 0))), 0);
  const subtotal = payload.subtotal ?? computedSubtotal;
  const discount = payload.discount ?? payload.diskon ?? 0;
  const total = payload.total ?? Math.max(0, Number(subtotal) - Number(discount));

  const nowIso = new Date().toISOString();
  const txSnakeNoCreated = {
    payment_method: payload.paymentMethod || 'tunai',
    subtotal,
    discount,
    total,
    notes: payload.notes || null,
    user_id: userId
  };
  const txCamelNoCreated = {
    paymentMethod: payload.paymentMethod || 'tunai',
    subtotal,
    discount,
    total,
    notes: payload.notes || null,
    userId
  };
  const txLowerNoCreated = {
    paymentmethod: payload.paymentMethod || 'tunai',
    subtotal,
    discount,
    total,
    notes: payload.notes || null,
    userid: userId
  };
  let txRows, txError;
  ({ data: txRows, error: txError } = await supabase.from('transactions').insert([txSnakeNoCreated]).select());
  if (txError && txError?.code === 'PGRST204') {
    ({ data: txRows, error: txError } = await supabase.from('transactions').insert([txCamelNoCreated]).select());
  }
  if (txError && txError?.code === 'PGRST204') {
    ({ data: txRows, error: txError } = await supabase.from('transactions').insert([txLowerNoCreated]).select());
  }
  if (txError) {
    console.error('Supabase createTransaction error:', txError);
    throw txError;
  }
  const transaction = txRows?.[0];
  if (!transaction) {
    throw new Error('Transaksi tidak dibuat');
  }

  const transactionId = transaction.id;

  if (items.length > 0) {
    const itemRowsCamel = items.map(i => ({
      transactionId: Number(transactionId),
      productId: Number(i.productId),
      price: Number(i.price || 0),
      qty: Number(i.qty || 0),
      subtotal: Number(i.subtotal ?? (Number(i.price || 0) * Number(i.qty || 0)))
    }));
    const itemRowsSnake = items.map(i => ({
      transaction_id: Number(transactionId),
      product_id: Number(i.productId),
      price: Number(i.price || 0),
      qty: Number(i.qty || 0),
      subtotal: Number(i.subtotal ?? (Number(i.price || 0) * Number(i.qty || 0)))
    }));
    let itemsError;
    ({ error: itemsError } = await supabase.from('transaction_items').insert(itemRowsCamel));
    if (itemsError && itemsError?.code === 'PGRST204') {
      ({ error: itemsError } = await supabase.from('transaction_items').insert(itemRowsSnake));
    }
    if (itemsError) {
      console.error('Supabase insert transaction_items error:', itemsError);
      throw itemsError;
    }

    for (const i of items) {
      const qty = Number(i.qty) || 0;
      if (!i.productId || qty <= 0) continue;
      let moveError;
      ({ error: moveError } = await supabase.from('stock_movements').insert([
        { productId: i.productId, qty, description: 'Penjualan', type: 'out' }
      ]));
      if (moveError && moveError?.code === 'PGRST204') {
        ({ error: moveError } = await supabase.from('stock_movements').insert([
          { product_id: i.productId, qty, description: 'Penjualan', type: 'out' }
        ]));
      }
      if (moveError) {
        console.error('Supabase movement (sale) error:', moveError);
        throw moveError;
      }
      const { data: prod, error: prodErr } = await supabase.from('products').select('stock').eq('id', i.productId).single();
      if (prodErr) throw prodErr;
      const newStock = Math.max(0, (prod?.stock || 0) - qty);
      const { error: updErr } = await supabase.from('products').update({ stock: newStock }).eq('id', i.productId);
      if (updErr) throw updErr;
    }
  }

  return { id: transactionId, ...transaction };
};

export const getTransactions = async (startDate = null, endDate = null) => {
  // Try camelCase first, then snake_case fallback for createdAt/created_at
  let data, error;
  let query = supabase.from('transactions').select('*, transaction_items(*)').order('id', { ascending: false });
  if (startDate && endDate) {
    // Try date filters on createdAt first
    query = supabase.from('transactions').select('*, transaction_items(*)')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false });
  }
  ({ data, error } = await query);
  if (error && error?.code === 'PGRST204') {
    let q2 = supabase.from('transactions').select('*, transaction_items(*)').order('id', { ascending: false });
    if (startDate && endDate) {
      q2 = supabase.from('transactions').select('*, transaction_items(*)')
        .gte('created_at', `${startDate}T00:00:00.000Z`)
        .lte('created_at', `${endDate}T23:59:59.999Z`)
        .order('created_at', { ascending: false });
    }
    ({ data, error } = await q2);
  }
  if (error) {
    console.error('Supabase getTransactions error:', error);
    return [];
  }
  return data || [];
};

export const getTodayTransactions = async () => {
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  const start = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
  const end = `${yyyy}-${mm}-${dd}T23:59:59.999Z`;

  let data, error;
  ({ data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .gte('created_at', start)
    .lte('created_at', end)
    .order('id', { ascending: false }));
  if (error && error?.code === 'PGRST204') {
    ({ data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('id', { ascending: false }));
  }

  if (error) {
    console.error('Supabase getTodayTransactions error:', error);
    return [];
  }
  return data || [];
};

// Reports (basic dashboard stats from Supabase)
export const getDashboardStats = async () => {
  // Today
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  const startToday = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
  const endToday = `${yyyy}-${mm}-${dd}T23:59:59.999Z`;

  // This month
  const monthStart = `${yyyy}-${mm}-01T00:00:00.000Z`;
  const monthEndDate = new Date(Date.UTC(yyyy, Number(mm), 0)).getUTCDate();
  const monthEnd = `${yyyy}-${mm}-${String(monthEndDate).padStart(2, '0')}T23:59:59.999Z`;

  // Fetch transactions for today and month
  let todayTx, todayErr, monthTx, monthErr;
  [{ data: todayTx, error: todayErr }, { data: monthTx, error: monthErr }] = await Promise.all([
    supabase.from('transactions').select('total').gte('created_at', startToday).lte('created_at', endToday),
    supabase.from('transactions').select('total').gte('created_at', monthStart).lte('created_at', monthEnd)
  ]);
  if (todayErr?.code === 'PGRST204' || monthErr?.code === 'PGRST204') {
    [{ data: todayTx, error: todayErr }, { data: monthTx, error: monthErr }] = await Promise.all([
      supabase.from('transactions').select('total').gte('created_at', startToday).lte('created_at', endToday),
      supabase.from('transactions').select('total').gte('created_at', monthStart).lte('created_at', monthEnd)
    ]);
  }

  if (todayErr) console.error('Supabase today stats error:', todayErr);
  if (monthErr) console.error('Supabase month stats error:', monthErr);

  const todayRevenue = Array.isArray(todayTx) ? todayTx.reduce((s, t) => s + Number(t.total || 0), 0) : 0;
  const monthRevenue = Array.isArray(monthTx) ? monthTx.reduce((s, t) => s + Number(t.total || 0), 0) : 0;
  const todayCount = Array.isArray(todayTx) ? todayTx.length : 0;

  // Products stats
  const [{ count: productsCount }, { data: lowStockList, error: lowErr }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('id, stock, minStock').lte('stock', supabase.rpc ? undefined : 999999)
  ]);
  if (lowErr) console.error('Supabase low stock error:', lowErr);

  const lowStock = Array.isArray(lowStockList)
    ? lowStockList.filter(p => typeof p.stock === 'number' && typeof p.minStock === 'number' && p.stock <= p.minStock).length
    : 0;

  return {
    today: { revenue: todayRevenue, transactionCount: todayCount },
    month: { revenue: monthRevenue },
    products: { total: productsCount || 0, lowStock }
  };
};

export const getSalesReport = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`${API_URL}/reports/sales?${params}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const getProductReport = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await fetch(`${API_URL}/reports/products?${params}`, {
    headers: getHeaders()
  });
  return res.json();
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) {
    console.error('Supabase getCategories error:', error);
    return [];
  }
  return data || [];
};

export const createCategory = async (name) => {
  const { data, error } = await supabase.from('categories').insert([{ name }]).select();
  if (error) {
    console.error('Supabase createCategory error:', error);
    throw error;
  }
  return data?.[0] || null;
};

// Open Orders
export const getOpenOrders = async () => {
  const { data, error } = await supabase.from('open_orders').select('*');
  if (error) {
    console.error('Supabase getOpenOrders error:', error);
    return [];
  }
  return data || [];
};

export const saveOpenOrder = async (order) => {
  // Only include columns that exist in the OpenOrder schema
  const orderData = {
    id: order.id,
    customer: order.customer,
    items: JSON.stringify(order.items), // Convert to JSON string as per schema
    total: Number(order.total || 0),
    created_at: order.created_at || new Date().toISOString(),
    status: order.status || 'open'
  };
  
  const { data, error } = await supabase.from('open_orders').insert([orderData]);
  if (error) {
    console.error('Supabase saveOpenOrder error:', error);
    throw error;
  }
  return data?.[0] || null;
};

export const deleteOpenOrder = async (id) => {
  const { error } = await supabase.from('open_orders').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteOpenOrder error:', error);
    throw error;
  }
  return true;
};

// Utility: Convert array of objects to CSV string
function arrayToCSV(data, columns) {
  const header = columns.join(',');
  const rows = data.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(','));
  return [header, ...rows].join('\r\n');
}

// Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Sales Report to CSV
export async function exportSalesReportCSV(startDate, endDate) {
  const data = await getSalesReport(startDate, endDate);
  const columns = ['date', 'invoice', 'customer', 'total', 'payment_method'];
  const arr = Array.isArray(data) ? data : [];
  const csv = arrayToCSV(arr, columns);
  downloadCSV(csv, `laporan_penjualan_${startDate}_${endDate}.csv`);
}

// Export Open Order Report to CSV
export async function exportOpenOrderCSV() {
  // Ambil data open order dari backend endpoint
  const res = await fetch(`${API_URL}/reports/open-order`, {
    headers: getHeaders()
  });
  let arr = [];
  try {
    arr = await res.json();
    if (!Array.isArray(arr)) arr = [];
  } catch (e) {
    arr = [];
  }
  let columns = arr.length > 0 ? Object.keys(arr[0]) : ['id', 'created_at', 'customer', 'status'];
  const csv = arrayToCSV(arr, columns);
  downloadCSV(csv, 'laporan_open_order.csv');
}

// Export Stock Report to CSV
export async function exportStockReportCSV() {
  const { data, error } = await supabase.from('products').select('id, name, stock, minStock, category');
  const arr = Array.isArray(data) ? data : [];
  const columns = ['id', 'name', 'stock', 'minStock', 'category'];
  const csv = arrayToCSV(arr, columns);
  downloadCSV(csv, 'laporan_stok_barang.csv');
}

// Export Belanja Bahan Report to CSV
export async function exportBelanjaBahanCSV(startDate, endDate) {
  // Ambil data belanja bahan dari Supabase (misal tabel 'belanja_bahan')
  const { data, error } = await supabase.from('belanja_bahan').select('*');
  let arr = Array.isArray(data) ? data : [];
  let columns = arr.length > 0 ? Object.keys(arr[0]) : ['id', 'created_at', 'supplier', 'total', 'status'];
  const csv = arrayToCSV(arr, columns);
  downloadCSV(csv, `laporan_belanja_bahan_${startDate}_${endDate}.csv`);
};
