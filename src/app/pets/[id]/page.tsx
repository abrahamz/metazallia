'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use, useCallback } from 'react'
import Link from 'next/link'
import { Pet, Vaccine, Allergy } from '@prisma/client'

type PetWithRecords = Pet & {
  vaccines: Vaccine[]
  allergies: Allergy[]
}

export default function PetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pet, setPet] = useState<PetWithRecords | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = use(params) as { id: string };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchPet = useCallback(async () => {
    try {
      const response = await fetch(`/api/pets/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPet(data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching pet:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, router]);

  useEffect(() => {
    if (session) {
      fetchPet()
    }
  }, [session, id, fetchPet])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert('Failed to delete pet')
      }
    } catch (error) {
      console.error('Error deleting pet:', error)
      alert('An error occurred while deleting the pet')
    }
  }

  const handleDeleteAllergy = async (allergyId: string) => {
    if (!confirm('Are you sure you want to delete this allergy? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${id}/allergies?allergyId=${allergyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPet() // Refresh the pet data
      } else {
        alert('Failed to delete allergy')
      }
    } catch (error) {
      console.error('Error deleting allergy:', error)
      alert('An error occurred while deleting the allergy')
    }
  }

  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!confirm('Are you sure you want to delete this vaccine? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${id}/vaccines?vaccineId=${vaccineId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPet() // Refresh the pet data
      } else {
        alert('Failed to delete vaccine')
      }
    } catch (error) {
      console.error('Error deleting vaccine:', error)
      alert('An error occurred while deleting the vaccine')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !pet) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <p className="text-gray-600 mt-2">
                  {pet.type} • Born {new Date(pet.dateOfBirth).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/pets/${pet.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Edit Pet
                </Link>
                <Link
                  href={`/pets/${pet.id}/vaccines/new`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Vaccine
                </Link>
                <Link
                  href={`/pets/${pet.id}/allergies/new`}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Add Allergy
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete Pet
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vaccines Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vaccines</h2>
                {pet.vaccines.length === 0 ? (
                  <p className="text-gray-500">No vaccines recorded</p>
                ) : (
                  <div className="space-y-3">
                    {pet.vaccines.map((vaccine) => (
                      <div key={vaccine.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{vaccine.name}</h3>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(vaccine.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Link
                              href={`/pets/${id}/vaccines/${vaccine.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteVaccine(vaccine.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergies Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Allergies</h2>
                {pet.allergies.length === 0 ? (
                  <p className="text-gray-500">No allergies recorded</p>
                ) : (
                  <div className="space-y-3">
                    {pet.allergies.map((allergy) => (
                      <div key={allergy.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{allergy.name}</h3>
                            <p className="text-sm text-gray-600">
                              Reaction: {allergy.reaction}
                            </p>
                            <p className="text-sm text-gray-600">
                              Severity: <span className={`font-medium ${
                                allergy.severity === 'Severe' ? 'text-red-600' :
                                allergy.severity === 'Mild' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>{allergy.severity}</span>
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Link
                              href={`/pets/${id}/allergies/${allergy.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteAllergy(allergy.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
