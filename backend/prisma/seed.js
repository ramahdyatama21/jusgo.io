// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const kasirPassword = await bcrypt.hash('kasir123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: 'admin'
    }
  });

  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      password: kasirPassword,
      name: 'Kasir 1',
      role: 'kasir'
    }
  });

  console.log('✅ Users created:', { admin: admin.username, kasir: kasir.username });

  // Create sample products
  const products = [
    {
      sku: 'PRD001',
      name: 'Indomie Goreng',
      category: 'Makanan',
      unit: 'pcs',
      buyPrice: 2500,
      sellPrice: 3500,
      stock: 100,
      minStock: 20,
      description: 'Mie instan rasa goreng'
    },
    {
      sku: 'PRD002',
      name: 'Aqua 600ml',
      category: 'Minuman',
      unit: 'pcs',
      buyPrice: 2000,
      sellPrice: 3000,
      stock: 150,
      minStock: 30,
      description: 'Air mineral dalam kemasan'
    },
    {
      sku: 'PRD003',
      name: 'Beras Premium',
      category: 'Makanan',
      unit: 'kg',
      buyPrice: 12000,
      sellPrice: 15000,
      stock: 50,
      minStock: 10,
      description: 'Beras premium kualitas terbaik'
    },
    {
      sku: 'PRD004',
      name: 'Minyak Goreng',
      category: 'Makanan',
      unit: 'liter',
      buyPrice: 14000,
      sellPrice: 18000,
      stock: 30,
      minStock: 5,
      description: 'Minyak goreng kemasan 1 liter'
    },
    {
      sku: 'PRD005',
      name: 'Gula Pasir',
      category: 'Makanan',
      unit: 'kg',
      buyPrice: 13000,
      sellPrice: 16000,
      stock: 40,
      minStock: 10,
      description: 'Gula pasir putih'
    },
    {
      sku: 'PRD006',
      name: 'Teh Botol Sosro',
      category: 'Minuman',
      unit: 'pcs',
      buyPrice: 3500,
      sellPrice: 5000,
      stock: 80,
      minStock: 15,
      description: 'Teh dalam kemasan botol'
    },
    {
      sku: 'PRD007',
      name: 'Sabun Mandi',
      category: 'Umum',
      unit: 'pcs',
      buyPrice: 3000,
      sellPrice: 4500,
      stock: 60,
      minStock: 10,
      description: 'Sabun mandi batangan'
    },
    {
      sku: 'PRD008',
      name: 'Pasta Gigi',
      category: 'Umum',
      unit: 'pcs',
      buyPrice: 8000,
      sellPrice: 12000,
      stock: 45,
      minStock: 8,
      description: 'Pasta gigi ukuran standar'
    },
    {
      sku: 'PRD009',
      name: 'Deterjen',
      category: 'Umum',
      unit: 'kg',
      buyPrice: 10000,
      sellPrice: 14000,
      stock: 25,
      minStock: 5,
      description: 'Deterjen bubuk 1kg'
    },
    {
      sku: 'PRD010',
      name: 'Kopi Sachet',
      category: 'Minuman',
      unit: 'pcs',
      buyPrice: 1000,
      sellPrice: 1500,
      stock: 200,
      minStock: 40,
      description: 'Kopi instan sachet'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    });
  }

  console.log(`✅ Created ${products.length} sample products`);

  // Create sample transactions
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const transactionDate = new Date(today);
    transactionDate.setDate(today.getDate() - i);

    const transaction = await prisma.transaction.create({
      data: {
        transactionNo: `TRX${Date.now()}${i}`,
        date: transactionDate,
        total: 50000 + (i * 10000),
        paymentMethod: 'tunai',
        userId: kasir.id,
        items: {
          create: [
            {
              productId: 1,
              qty: 2,
              price: 3500,
              subtotal: 7000
            },
            {
              productId: 2,
              qty: 3,
              price: 3000,
              subtotal: 9000
            }
          ]
        }
      }
    });

    console.log(`✅ Created transaction: ${transaction.transactionNo}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });