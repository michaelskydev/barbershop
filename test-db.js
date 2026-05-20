const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const images = await prisma.aboutImage.findMany();
    const info = await prisma.aboutInfo.findFirst();
    console.log("Images in DB:", images);
    console.log("Info in DB:", info);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
