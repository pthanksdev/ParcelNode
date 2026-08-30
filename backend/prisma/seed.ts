import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ParcelNode Enterprise Database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const merchant = await prisma.merchant.upsert({
    where: { email: 'merchant@acme.com' },
    update: { role: 'MERCHANT' },
    create: {
      name: 'Acme Global Logistics',
      email: 'merchant@acme.com',
      passwordHash,
      role: 'MERCHANT',
      status: 'ACTIVE',
    },
  });

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.merchant.upsert({
    where: { email: 'admin@parcelnode.io' },
    update: { role: 'ADMIN' },
    create: {
      name: 'ParcelNode Platform Owner',
      email: 'admin@parcelnode.io',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`Seeded Merchant: ${merchant.name} (${merchant.email})`);
  console.log(`Seeded Super Admin: ${admin.name} (${admin.email})`);

  const order1 = await prisma.order.create({
    data: {
      merchantId: merchant.id,
      item: 'Autonomous Drone Flight Controller',
      weightKg: 2.1,
      destination: 'San Francisco, CA 94107',
    },
  });

  const shipment1 = await prisma.shipment.create({
    data: {
      orderId: order1.id,
      carrier: 'FASTSHIP',
      trackingId: 'FS-984210',
      status: 'DELIVERED',
      trackingEvents: {
        create: [
          {
            status: 'DELIVERED',
            location: 'Front Door / Reception Desk',
            timestamp: new Date(),
            dedupeKey: 'FS-984210-DELIVERED-001',
            leafHash: '0x8f2d91a92bf0c1840294821a74829104b2819385918239e41c8f192837461928',
            chainStatus: 'CONFIRMED',
          },
          {
            status: 'IN_TRANSIT',
            location: 'Oakland Logistics Hub',
            timestamp: new Date(Date.now() - 3600000 * 4),
            dedupeKey: 'FS-984210-IN_TRANSIT-000',
            chainStatus: 'NONE',
          },
        ],
      },
    },
  });

  console.log(`Seeded Shipment: ${shipment1.trackingId}`);

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SYSTEM_BOOT',
        detail: 'ParcelNode Core Engine & System Committer Wallet Initialized',
        performedBy: 'SYSTEM',
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        action: 'CONTRACT_DEPLOY',
        detail: 'DeliveryLedgerV2 Upgraded via UUPS Proxy (0x5FbDB2315678afecb367f032d93F642f64180aa3)',
        performedBy: 'ADMIN',
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
    ],
  });

  console.log('Seeded Initial System Audit Logs.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
