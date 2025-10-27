import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pets = await prisma.pet.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        vaccines: true,
        allergies: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(pets)
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, dateOfBirth } = body

    if (!name || !type || !dateOfBirth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        type,
        dateOfBirth: new Date(dateOfBirth),
        ownerId: session.user.id
      }
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
