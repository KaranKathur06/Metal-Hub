const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing productCapability...');
    const pc = await prisma.productCapability.findMany({ take: 1 });
    console.log('productCapability OK:', pc.length);
  } catch (e) {
    console.error('productCapability ERROR:', e.message);
  }

  try {
    console.log('Testing requirementCapability...');
    const rc = await prisma.requirementCapability.findMany({ take: 1 });
    console.log('requirementCapability OK:', rc.length);
  } catch (e) {
    console.error('requirementCapability ERROR:', e.message);
  }

  try {
    console.log('Testing industry...');
    const ind = await prisma.industry.findMany({ take: 1 });
    console.log('industry OK:', ind.length);
  } catch (e) {
    console.error('industry ERROR:', e.message);
  }

  try {
    console.log('Testing category...');
    const cat = await prisma.category.findMany({ take: 1 });
    console.log('category OK:', cat.length);
  } catch (e) {
    console.error('category ERROR:', e.message);
  }

  await prisma.$disconnect();
}

test();
