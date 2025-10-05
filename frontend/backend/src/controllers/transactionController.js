// backend/src/controllers/transactionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate transaction number
const generateTransactionNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX${year}${month}${day}${random}`;
};

exports.createTransaction = async (req, res) => {
  try {
    const { items, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // Validasi items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Item transaksi tidak boleh kosong' });
    }

    // Hitung total dan validasi stok
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({ error: `Stok ${product.name} tidak mencukupi` });
      }

      total += product.sellPrice * item.qty;
    }

    // Buat transaksi
    const transaction = await prisma.transaction.create({
      data: {
        transactionNo: generateTransactionNo(),
        total,
        paymentMethod: paymentMethod || 'tunai',
        userId,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            subtotal: item.price * item.qty
          }))
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

    // Update stok produk
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty
          }
        }
      });

      // Catat pergerakan stok
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'out',
          qty: item.qty,
          description: `Penjualan - ${transaction.transactionNo}`,
          userId
        }
      });
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Gagal membuat transaksi' });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              name: true,
              username: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
};

exports.getTodayTransactions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

    res.json({
      transactions,
      summary: {
        count: transactions.length,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get today transactions error:', error);
    res.status(500).json({ error: 'Gagal mengambil transaksi hari ini' });
  }
};