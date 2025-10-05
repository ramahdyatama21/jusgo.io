// Service untuk Belanja Bahan dan HPP
import { supabase } from './supabase';

// Update harga beli bahan berdasarkan pembelian terakhir
export const updateBahanBuyPrice = async (bahanName, newBuyPrice) => {
  try {
    // Simpan harga beli bahan terbaru
    const { data, error } = await supabase
      .from('bahan_harga')
      .upsert([
        { 
          nama_bahan: bahanName, 
          harga_beli: newBuyPrice, 
          updated_at: new Date().toISOString() 
        }
      ])
      .select();
    
    if (error) {
      console.error('Error updating bahan buy price:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Update bahan buy price error:', error);
    throw error;
  }
};

// Simpan bahan belanja dan update harga beli bahan
export const saveBelanjaBahan = async (belanjaData) => {
  try {
    // Simpan data belanja bahan
    const { data: belanja, error: belanjaError } = await supabase
      .from('belanja_bahan')
      .insert([belanjaData])
      .select()
      .single();
    
    if (belanjaError) {
      console.error('Error saving belanja bahan:', belanjaError);
      throw belanjaError;
    }
    
    // Update harga beli untuk setiap bahan yang dibeli
    if (belanjaData.items && Array.isArray(belanjaData.items)) {
      for (const item of belanjaData.items) {
        if (item.bahan_name && item.buy_price) {
          await updateBahanBuyPrice(item.bahan_name, item.buy_price);
        }
      }
    }
    
    return belanja;
  } catch (error) {
    console.error('Save belanja bahan error:', error);
    throw error;
  }
};

// Get bahan belanja history
export const getBelanjaBahanHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('belanja_bahan')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting belanja bahan history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Get belanja bahan history error:', error);
    return [];
  }
};

// Get harga bahan terbaru untuk HPP calculation
export const getBahanHarga = async (bahanName) => {
  try {
    const { data, error } = await supabase
      .from('bahan_harga')
      .select('harga_beli')
      .eq('nama_bahan', bahanName)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error getting bahan harga:', error);
      return 0;
    }
    
    return data?.harga_beli || 0;
  } catch (error) {
    console.error('Get bahan harga error:', error);
    return 0;
  }
};

// Calculate HPP berdasarkan resep dan harga bahan
export const calculateHPP = async (resep) => {
  try {
    let totalHPP = 0;
    
    for (const bahan of resep.bahan) {
      const hargaBahan = await getBahanHarga(bahan.nama);
      const subtotal = bahan.qty * hargaBahan;
      totalHPP += subtotal;
    }
    
    return totalHPP;
  } catch (error) {
    console.error('Calculate HPP error:', error);
    return 0;
  }
};
