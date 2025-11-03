import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: id,
        ownerId: session.user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const vaccines = await prisma.vaccine.findMany({
      where: {
        petId: id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(vaccines)
  } catch (error) {
    console.error('Error fetching vaccines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: id,
        ownerId: session.user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, date } = body

    if (!name || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        name,
        date: new Date(date),
        petId: id
      }
    })

    return NextResponse.json(vaccine, { status: 201 })
  } catch (error) {
    console.error('Error creating vaccine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const vaccineId = url.searchParams.get('vaccineId')

    if (!vaccineId) {
      return NextResponse.json({ error: 'Vaccine ID is required' }, { status: 400 })
    }

    // Verify the vaccine belongs to a pet owned by the user
    const vaccine = await prisma.vaccine.findFirst({
      where: {
        id: vaccineId,
        pet: {
          ownerId: session.user.id
        }
      }
    })

    if (!vaccine) {
      return NextResponse.json({ error: 'Vaccine not found' }, { status: 404 })
    }

    await prisma.vaccine.delete({
      where: { id: vaccineId }
    })

    return NextResponse.json({ message: 'Vaccine deleted successfully' })
  } catch (error) {
    console.error('Error deleting vaccine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}