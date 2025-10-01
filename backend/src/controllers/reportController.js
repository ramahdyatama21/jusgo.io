// Laporan Open Order
exports.getOpenOrderReport = async (req, res) => {
  try {
    // Ambil semua open order dari tabel openOrder (atau open_orders jika nama tabel berbeda)
    const openOrders = await prisma.openOrder.findMany({});
    // Jika ingin filter status, tambahkan where: { status: 'open' }
    res.json(openOrders);
  } catch (error) {
    console.error('Get open order report error:', error);
    res.status(500).json({ error: 'Gagal mengambil laporan open order' });
  }
};
// backend/src/controllers/reportController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Omzet hari ini
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        date: { gte: today, lt: tomorrow }
      }
    });
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);

    // Omzet bulan ini
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        date: { gte: firstDayOfMonth }
      }
    });
    const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.total, 0);

    // Total produk
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });

    // Produk stok rendah
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      }
    });

    // Produk terlaris (top 5)
    const topProducts = await prisma.transactionItem.groupBy({
      by: ['productId'],
      _sum: {
        qty: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          qty: 'desc'
        }
      },
      take: 5
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        return {
          product,
          totalQty: item._sum.qty,
          totalRevenue: item._sum.subtotal
        };
      })
    );

    res.json({
      today: {
        revenue: todayRevenue,
        transactionCount: todayTransactions.length
      },
      month: {
        revenue: monthRevenue,
        transactionCount: monthTransactions.length
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      topProducts: topProductsWithDetails
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate dan endDate wajib diisi' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Group by date
    const groupedData = {};
    transactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          revenue: 0,
          transactionCount: 0,
          itemsSold: 0
        };
      }
      
      groupedData[date].revenue += transaction.total;
      groupedData[date].transactionCount += 1;
      groupedData[date].itemsSold += transaction.items.reduce((sum, item) => sum + item.qty, 0);
    });

    const reportData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Summary
    const summary = {
      totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
      totalTransactions: transactions.length,
      averageTransaction: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length 
        : 0
    };

    res.json({
      data: reportData,
      summary
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Gagal mengambil laporan penjualan' });
  }
};

exports.getProductReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.transaction = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const productSales = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        qty: true,
        subtotal: true
      },
      _count: {
        id: true
      }
    });

    const reportData = await Promise.all(
      productSales.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        return {
          product,
          totalQty: item._sum.qty,
          totalRevenue: item._sum.subtotal,
          transactionCount: item._count.id,
          profit: (product.sellPrice - product.buyPrice) * item._sum.qty
        };
      })
    );

    // Sort by revenue
    reportData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(reportData);
  } catch (error) {
    console.error('Get product report error:', error);
    res.status(500).json({ error: 'Gagal mengambil laporan produk' });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    const reportData = products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      currentStock: product.stock,
      minStock: product.minStock,
      stockValue: product.stock * product.buyPrice,
      status: product.stock <= product.minStock ? 'low' : 'normal',
      recentMovements: product.stockMovements
    }));

    res.json(reportData);
  } catch (error) {
    console.error('Get stock report error:', error);
    res.status(500).json({ error: 'Gagal mengambil laporan stok' });
  }
};