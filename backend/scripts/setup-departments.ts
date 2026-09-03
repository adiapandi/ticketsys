import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Membuat department default "IT Support"...');
  const defaultDept = await prisma.department.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: { name: 'IT Support' },
  });

  console.log('Memindahkan kategori lama ke department default...');
  const categoriesUpdated = await prisma.category.updateMany({
    where: { departmentId: null },
    data: { departmentId: defaultDept.id },
  });
  console.log(`${categoriesUpdated.count} kategori dipindahkan.`);

  console.log('Memindahkan ticket lama ke department default...');
  const ticketsUpdated = await prisma.ticket.updateMany({
    where: { departmentId: null },
    data: { departmentId: defaultDept.id },
  });
  console.log(`${ticketsUpdated.count} ticket dipindahkan.`);

  console.log('Menaikkan semua akun ADMIN lama jadi SUPER_ADMIN...');
  const adminsPromoted = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { role: 'SUPER_ADMIN' },
  });
  console.log(`${adminsPromoted.count} admin dinaikkan jadi Super Admin.`);

  console.log('Memindahkan akun AGENT lama ke department default...');
  const agentsUpdated = await prisma.user.updateMany({
    where: { role: 'AGENT', departmentId: null },
    data: { departmentId: defaultDept.id },
  });
  console.log(`${agentsUpdated.count} agent dipindahkan ke IT Support.`);

  console.log('Selesai! Department default: IT Support (id: ' + defaultDept.id + ')');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
