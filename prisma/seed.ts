import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      isAdmin: true,
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { username: 'john_doe' },
    update: {},
    create: {
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      password: userPassword,
      isAdmin: false,
    },
  })
  
  // Create regular user2
  const user2Password = await bcrypt.hash('user456', 12)
  const user2 = await prisma.user.upsert({
    where: { username: 'jane_doe' },
    update: {},
    create: {
      username: 'jane_doe',
      firstName: 'Jane',
      lastName: 'Doe',
      password: user2Password,
      isAdmin: false,
    },
  })

  // Create pets for the regular user
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Buddy',
      type: 'Dog',
      dateOfBirth: new Date('2020-05-15'),
      ownerId: user.id,
    },
  })

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Whiskers',
      type: 'Cat',
      dateOfBirth: new Date('2019-03-22'),
      ownerId: user.id,
    },
  })

  // Add vaccines for Buddy
  await prisma.vaccine.createMany({
    data: [
      {
        name: 'Rabies',
        date: new Date('2023-01-15'),
        petId: pet1.id,
      },
      {
        name: 'DHPP',
        date: new Date('2023-01-15'),
        petId: pet1.id,
      },
      {
        name: 'Bordetella',
        date: new Date('2023-06-10'),
        petId: pet1.id,
      },
    ],
  })

  // Add vaccines for Whiskers
  await prisma.vaccine.createMany({
    data: [
      {
        name: 'Rabies',
        date: new Date('2023-02-20'),
        petId: pet2.id,
      },
      {
        name: 'FVRCP',
        date: new Date('2023-02-20'),
        petId: pet2.id,
      },
    ],
  })

  // Add allergies for Buddy
  await prisma.allergy.create({
    data: {
      name: 'Chicken',
      reaction: 'Itchy skin and digestive upset',
      severity: 'Mild',
      petId: pet1.id,
    },
  })

  // Add allergies for Whiskers
  await prisma.allergy.createMany({
    data: [
      {
        name: 'Flea bites',
        reaction: 'Severe itching and hair loss',
        severity: 'Severe',
        petId: pet2.id,
      },
      {
        name: 'Dust mites',
        reaction: 'Sneezing and watery eyes',
        severity: 'Mild',
        petId: pet2.id,
      },
    ],
  })

  
  // Create pets for the regular user
  const pet3 = await prisma.pet.create({
    data: {
      name: 'Ruffus',
      type: 'Dog',
      dateOfBirth: new Date('2020-05-15'),
      ownerId: user2.id,
    },
  })

  const pet4 = await prisma.pet.create({
    data: {
      name: 'Princess Donut',
      type: 'Cat',
      dateOfBirth: new Date('2019-03-22'),
      ownerId: user2.id,
    },
  })

  // Add vaccines for Buddy
  await prisma.vaccine.createMany({
    data: [
      {
        name: 'Rabies',
        date: new Date('2023-01-15'),
        petId: pet3.id,
      },
      {
        name: 'Bordetella',
        date: new Date('2023-06-10'),
        petId: pet3.id,
      },
    ],
  })

  // Add vaccines for Whiskers
  await prisma.vaccine.createMany({
    data: [
      {
        name: 'Rabies',
        date: new Date('2023-02-20'),
        petId: pet4.id,
      },
      {
        name: 'FVRCP',
        date: new Date('2023-02-20'),
        petId: pet4.id,
      },
      {
        name: 'Measels',
        date: new Date('2022-02-20'),
        petId: pet4.id,
      },
    ],
  })

  // Add allergies for Ruffus
  await prisma.allergy.create({
    data: {
      name: 'Frogs',
      reaction: 'Barks like mad and digestive upset',
      severity: 'Mild',
      petId: pet3.id,
    },
  })

  // Add allergies for Princess Donut
  await prisma.allergy.createMany({
    data: [
      {
        name: 'Croissants',
        reaction: 'Severe itching and hair loss',
        severity: 'Severe',
        petId: pet4.id,
      },
      {
        name: 'Pavlova',
        reaction: 'Sneezing and watery eyes',
        severity: 'Mild',
        petId: pet4.id,
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log(`Admin user: ${admin.username} / ${'admin123'}`)
  console.log(`Regular user: ${user.username} / ${'user123'}`)
  console.log(`Regular user2: ${user2.username} / ${'user456'}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
