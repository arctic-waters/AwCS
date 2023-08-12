import { PrismaClient } from '@prisma/client';
import prompts from 'prompts';

const prisma = new PrismaClient();

async function main() {
  const yes = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Are you sure you want to do this?',
  });

  if (!yes.value) return;

  await prisma.image.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.imageSource.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
