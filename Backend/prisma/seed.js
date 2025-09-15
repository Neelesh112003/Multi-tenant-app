const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create tenants
  const acme = await prisma.tenant.create({
    data: { name: 'Acme', slug: 'acme' },
  });
  const globex = await prisma.tenant.create({
    data: { name: 'Globex', slug: 'globex' },
  });

  // Hash password for all users (password is 'password')
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create Acme users
  await prisma.user.createMany({
    data: [
      { email: 'admin@acme.test', password: hashedPassword, role: 'ADMIN', tenantId: acme.id },
      { email: 'user@acme.test', password: hashedPassword, role: 'MEMBER', tenantId: acme.id },
    ],
  });

  // Create Globex users
  await prisma.user.createMany({
    data: [
      { email: 'admin@globex.test', password: hashedPassword, role: 'ADMIN', tenantId: globex.id },
      { email: 'user@globex.test', password: hashedPassword, role: 'MEMBER', tenantId: globex.id },
    ],
  });

  console.log('Seeded tenants and users successfully.');
}

main()
  .catch((e) => {
    console.error('Failed to seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
