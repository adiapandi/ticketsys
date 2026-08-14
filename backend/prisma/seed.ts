import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: {
      email: '[email protected]',
      password: adminPassword,
      name: 'Administrator',
      role: Role.ADMIN,
    },
  });

  const categories = ['Hardware', 'Software', 'Network', 'Account Access', 'Other'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed selesai. Admin login:', admin.email, '/ password: Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
