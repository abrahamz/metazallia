import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { useSearchParams } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { request } from 'http'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // const searchParams = useSearchParams();
    // const search = searchParams.get('q');

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'requires search params' }, { status: 500 })
    }

    if (q.length < 1 || q.trim().length < 1) {
        return;
    }

    const allergies = await prisma.allergy.findMany({
      where: {
        name: {
            startsWith: q
        }
      },
      distinct: ['name'],
      select: {
        name: true
      }
    });

    const allergyNames = allergies.map(allergy => allergy.name);

    return NextResponse.json(allergyNames);
  } catch (error) {
    console.error('Error fetching allergies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}