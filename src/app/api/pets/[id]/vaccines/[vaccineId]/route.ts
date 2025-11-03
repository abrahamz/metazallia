import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, vaccineId } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json(vaccine)
  } catch (error) {
    console.error('Error fetching vaccine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, vaccineId } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!vaccineId) {
      return NextResponse.json({ error: 'Vaccine ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, date } = body

    if ( !name || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const updatedVaccine = await prisma.vaccine.update({
      where: { id: vaccineId },
      data: {
        name,
        date: new Date(date)
      }
    })

    return NextResponse.json(updatedVaccine)
  } catch (error) {
    console.error('Error updating vaccine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
