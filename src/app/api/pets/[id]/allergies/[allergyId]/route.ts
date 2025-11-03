import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, allergyId } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!allergyId) {
      return NextResponse.json({ error: 'Allergy ID is required' }, { status: 400 })
    }

    const allergy = await prisma.allergy.findFirst({
      where: {
        id: allergyId,
        pet: {
          ownerId: session.user.id
        }
      }
    })

    return NextResponse.json(allergy)
  } catch (error) {
    console.error('Error fetching allergy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, allergyId } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!allergyId) {
      return NextResponse.json({ error: 'Allergy ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, reaction, severity } = body

    if (!name || !reaction || !severity) {
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
