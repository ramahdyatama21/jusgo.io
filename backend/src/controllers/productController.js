// backend/src/controllers/productController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { sku, name, category, unit, buyPrice, sellPrice, stock, minStock, description } = req.body;

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        unit,
        buyPrice: parseFloat(buyPrice),
        sellPrice: parseFloat(sellPrice),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        description
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SKU sudah digunakan' });
    }
    res.status(500).json({ error: 'Gagal membuat produk' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, unit, buyPrice, sellPrice, minStock, description } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        name,
        category,
        unit,
        buyPrice: parseFloat(buyPrice),
        sellPrice: parseFloat(sellPrice),
        minStock: parseInt(minStock),
        description
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal mengupdate produk' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
};

exports.importProducts = async (req, res) => {
  try {
    const { products } = req.body; // Array of products from CSV

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of products) {
      try {
        await prisma.product.create({
          data: {
            sku: item.sku,
            name: item.name,
            category: item.category || 'Umum',
            unit: item.unit || 'pcs',
            buyPrice: parseFloat(item.buyPrice) || 0,
            sellPrice: parseFloat(item.sellPrice) || 0,
            stock: parseInt(item.stock) || 0,
            minStock: parseInt(item.minStock) || 0,
            description: item.description || ''
          }
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ sku: item.sku, error: error.message });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ error: 'Gagal import produk' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Gagal mengambil data stok rendah' });
  }
};