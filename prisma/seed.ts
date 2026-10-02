import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing
  await prisma.guest.deleteMany()
  await prisma.table.deleteMany()

  // 1. Venue Landmarks
  await prisma.table.create({
    data: { name: 'Main Entrance', type: 'ENTRANCE', x: 50, y: 50, width: 100, height: 40, capacity: 0 }
  })
  
  await prisma.table.create({
    data: { name: 'Dance Floor', type: 'DANCE_FLOOR', x: 400, y: 400, width: 300, height: 300, capacity: 0 }
  })
  
  await prisma.table.create({
    data: { name: 'Head Table', type: 'HEAD', x: 400, y: 150, width: 300, height: 80, capacity: 10 }
  })

  // 2. Tables
  const table6 = await prisma.table.create({
    data: { name: 'Table 6', type: 'ROUND', x: 150, y: 250, capacity: 8 }
  })
  
  for (let i = 1; i <= 9; i++) {
    if (i === 6) continue;
    await prisma.table.create({
      data: {
        name: `Table ${i}`,
        type: 'ROUND',
        x: 150 + (i % 3) * 250,
        y: 250 + Math.floor(i / 3) * 250,
        capacity: 8
      }
    })
  }

  // 3. Guests
  await prisma.guest.create({
    data: {
      firstName: 'Muhammed',
      lastName: 'Demo',
      group: 'Bride Family',
      dietaryNotes: 'Halal',
      tableId: table6.id,
      seatNumber: 1
    }
  })

  // Add more dummy guests
  for (let i = 0; i < 49; i++) {
    await prisma.guest.create({
      data: {
        firstName: `Guest${i}`,
        lastName: `Test`,
        group: i % 2 === 0 ? 'Bride Family' : 'Groom Friends',
      }
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
