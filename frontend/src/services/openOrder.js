// Supabase Open Order Service
import { supabase } from './supabase';

// Struktur tabel open_orders di Supabase:
// id: uuid (primary key)
// created_at: timestamptz
// customer: text
// items: text (JSON string)
// total: numeric
// status: text (default 'open')

export async function createOpenOrder({ customer, items, total }) {
  // items: array of item objects, will be stringified
  const { data, error } = await supabase.from('open_orders').insert([
    {
      customer,
      items: JSON.stringify(items),
      total,
      status: 'open',
    }
  ]).select();
  if (error) throw error;
  return data?.[0] || null;
}

export async function getOpenOrders() {
  const { data, error } = await supabase.from('open_orders').select('*').eq('status', 'open').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function sendOpenOrderToTransaction(orderId) {
  // Ambil open order
  const { data: order, error: orderError } = await supabase.from('open_orders').select('*').eq('id', orderId).single();
  if (orderError) throw orderError;
  if (!order) throw new Error('Open order tidak ditemukan');

  // Buat transaksi baru di tabel transactions
  const { data: tx, error: txError } = await supabase.from('transactions').insert([
    {
      total: order.total,
      notes: `Dari open order: ${order.id}`,
      created_at: new Date().toISOString(),
      // Tambahkan field lain sesuai kebutuhan
    }
  ]).select();
  if (txError) throw txError;

  // Insert items ke transaction_items
  const transactionId = tx?.[0]?.id;
  const items = JSON.parse(order.items || '[]');
  if (transactionId && items.length > 0) {
    const itemRows = items.map(i => ({
      transaction_id: transactionId,
      product_id: i.product_id || i.productId, // support both just in case
      price: Number(i.price || 0),
      qty: Number(i.qty || 0),
      subtotal: Number(i.subtotal ?? (Number(i.price || 0) * Number(i.qty || 0)))
    }));
    const { error: itemsError } = await supabase.from('transaction_items').insert(itemRows);
    if (itemsError) throw itemsError;

    // Insert ke stock_movements (snake_case)
    for (const i of items) {
      const qty = Number(i.qty) || 0;
      if (!(i.product_id || i.productId) || qty <= 0) continue;
      const { error: moveError } = await supabase.from('stock_movements').insert([
        {
          product_id: i.product_id || i.productId,
          qty,
          description: 'Penjualan',
          type: 'out'
        }
      ]);
      if (moveError) throw moveError;
    }
  }

  // Update status open order menjadi 'sent'
  const { error: updError } = await supabase.from('open_orders').update({ status: 'sent' }).eq('id', orderId);
  if (updError) throw updError;

  return tx?.[0] || null;
}
