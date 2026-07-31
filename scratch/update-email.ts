import { prisma } from '../src/lib/prisma';

async function main() {
  const result = await prisma.profile.updateMany({
    data: { email: 'nadyadearihanifah@gmail.com' },
  });
  console.log('Profile email updated count:', result.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
