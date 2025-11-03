'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pet, Vaccine, Allergy, User } from '@prisma/client'

type PetWithRecords = Pet & {
  vaccines: Vaccine[]
  allergies: Allergy[]
  owner: User
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pets, setPets] = useState<PetWithRecords[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && !session?.user.isAdmin) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetchAllPets()
    }
  }, [session])

  const fetchAllPets = async () => {
    try {
      const response = await fetch('/api/admin/pets')
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

  if (!session || !session.user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Pets and Medical Records</h2>

          {pets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pets found in the system.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {pet.name}
                      </h3>
                      <p className="text-gray-600">
                        {pet.type} • Born {new Date(pet.dateOfBirth).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Owner: {pet.owner.firstName} {pet.owner.lastName} ({pet.owner.username})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vaccines Section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Vaccines ({pet.vaccines.length})</h4>
                      {pet.vaccines.length === 0 ? (
                        <p className="text-gray-500 text-sm">No vaccines recorded</p>
                      ) : (
                        <div className="space-y-2">
                          {pet.vaccines.map((vaccine) => (
                            <div key={vaccine.id} className="border-l-4 border-green-400 pl-3 py-1">
                              <p className="font-medium text-gray-900">{vaccine.name}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(vaccine.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Allergies Section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Allergies ({pet.allergies.length})</h4>
                      {pet.allergies.length === 0 ? (
                        <p className="text-gray-500 text-sm">No allergies recorded</p>
                      ) : (
                        <div className="space-y-2">
                          {pet.allergies.map((allergy) => (
                            <div key={allergy.id} className="border-l-4 border-red-400 pl-3 py-1">
                              <p className="font-medium text-gray-900">{allergy.name}</p>
                              <p className="text-sm text-gray-600">{allergy.reaction}</p>
                              <p className="text-sm text-gray-600">
                                Severity: <span className={`font-medium ${
                                  allergy.severity === 'Severe' ? 'text-red-600' :
                                  allergy.severity === 'Mild' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>{allergy.severity}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
