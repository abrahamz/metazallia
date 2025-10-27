import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pets = await prisma.pet.findMany({
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
        },
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(pets)
  } catch (error) {
    console.error('Error fetching all pets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
