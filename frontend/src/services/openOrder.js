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

  // Update status open order menjadi 'sent'
  const { error: updError } = await supabase.from('open_orders').update({ status: 'sent' }).eq('id', orderId);
  if (updError) throw updError;

  return tx?.[0] || null;
}
