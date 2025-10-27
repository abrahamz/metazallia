'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pet, Vaccine, Allergy } from '@prisma/client'

type PetWithRecords = Pet & {
  vaccines: Vaccine[]
  allergies: Allergy[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pets, setPets] = useState<PetWithRecords[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPets()
    }
  }, [session])

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Pet Medical Records
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {session.user.firstName} {session.user.lastName}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
            <Link
              href="/pets/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add New Pet
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pets found. Add your first pet!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {pet.name}
                  </h3>
                  <p className="text-gray-600 mb-2">Type: {pet.type}</p>
                  <p className="text-gray-600 mb-4">
                    Born: {new Date(pet.dateOfBirth).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Vaccines: {pet.vaccines.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Allergies: {pet.allergies.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/pets/${pet.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/pets/${pet.id}/vaccines/new`}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Add Vaccine
                    </Link>
                    <Link
                      href={`/pets/${pet.id}/allergies/new`}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Add Allergy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
