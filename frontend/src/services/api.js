// frontend/src/services/api.js

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const getToken = () => {
  return localStorage.getItem('token');
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
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateProduct = async (id, data) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
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
export const getStockMovements = async (productId = null) => {
  const params = productId ? `?productId=${productId}` : '';
  const res = await fetch(`${API_URL}/stock/movements${params}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const addStock = async (productId, qty, description) => {
  const res = await fetch(`${API_URL}/stock/in`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, qty, description })
  });
  return res.json();
};

export const removeStock = async (productId, qty, description) => {
  const res = await fetch(`${API_URL}/stock/out`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, qty, description })
  });
  return res.json();
};

// Transactions
export const createTransaction = async (data) => {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getTransactions = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await fetch(`${API_URL}/transactions?${params}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const getTodayTransactions = async () => {
  const res = await fetch(`${API_URL}/transactions/today`, {
    headers: getHeaders()
  });
  return res.json();
};

// Reports
export const getDashboardStats = async () => {
  const res = await fetch(`${API_URL}/reports/dashboard`, {
    headers: getHeaders()
  });
  return res.json();
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
