const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Get all stock movements
router.get('/movements', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;
    const where = {};
    
    if (productId) {
      where.productId = parseInt(productId);
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat stok' });
  }
});

// Add stock (stock in)
router.post('/in', authMiddleware, async (req, res) => {
  try {
    const { productId, qty, description } = req.body;
    const userId = req.user.id;

    // Update stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: qty
        }
      }
    });

    // Create movement record
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type: 'in',
        qty,
        description,
        userId
      },
      include: {
        product: true
      }
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambah stok' });
  }
});

// Remove stock (stock out)
router.post('/out', authMiddleware, async (req, res) => {
  try {
    const { productId, qty, description } = req.body;
    const userId = req.user.id;

    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (product.stock < qty) {
      return res.status(400).json({ error: 'Stok tidak mencukupi' });
    }

    // Update stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: qty
        }
      }
    });

    // Create movement record
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type: 'out',
        qty,
        description,
        userId
      },
      include: {
        product: true
      }
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengurangi stok' });
  }
});

module.exports = router;