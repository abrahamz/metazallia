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
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const allergies = await prisma.allergy.findMany({
      where: {
        petId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(allergies)
  } catch (error) {
    console.error('Error fetching allergies:', error)
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
        id,
        ownerId: session.user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, reaction, severity } = body

    if (!name || !reaction || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const allergy = await prisma.allergy.create({
      data: {
        name,
        reaction,
        severity,
        petId: id
      }
    })

    return NextResponse.json(allergy, { status: 201 })
  } catch (error) {
    console.error('Error creating allergy:', error)
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
    const { allergyId, name, reaction, severity } = body

    if (!allergyId || !name || !reaction || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the allergy belongs to a pet owned by the user
    const allergy = await prisma.allergy.findFirst({
      where: {
        id: allergyId,
        pet: {
          ownerId: session.user.id
        }
      }
    })

    if (!allergy) {
      return NextResponse.json({ error: 'Allergy not found' }, { status: 404 })
    }

    const updatedAllergy = await prisma.allergy.update({
      where: { id: allergyId },
      data: {
        name,
        reaction,
        severity
      }
    })

    return NextResponse.json(updatedAllergy)
  } catch (error) {
    console.error('Error updating allergy:', error)
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
    const allergyId = url.searchParams.get('allergyId')

    if (!allergyId) {
      return NextResponse.json({ error: 'Allergy ID is required' }, { status: 400 })
    }

    // Verify the allergy belongs to a pet owned by the user
    const allergy = await prisma.allergy.findFirst({
      where: {
        id: allergyId,
        pet: {
          ownerId: session.user.id
        }
      }
    })

    if (!allergy) {
      return NextResponse.json({ error: 'Allergy not found' }, { status: 404 })
    }

    await prisma.allergy.delete({
      where: { id: allergyId }
    })

    return NextResponse.json({ message: 'Allergy deleted successfully' })
  } catch (error) {
    console.error('Error deleting allergy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}