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
        id,
        ownerId: session.user.id
      },
      include: {
        vaccines: {
          orderBy: {
            date: 'desc'
          }
        },
        allergies: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error('Error fetching pet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, dateOfBirth } = body

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        ownerId: session.user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const updatedPet = await prisma.pet.update({
      where: {
        id
      },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) })
      }
    })

    return NextResponse.json(updatedPet)
  } catch (error) {
    console.error('Error updating pet:', error)
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

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        ownerId: session.user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    await prisma.pet.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: 'Pet deleted successfully' })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
