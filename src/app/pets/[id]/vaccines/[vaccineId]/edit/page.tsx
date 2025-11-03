'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Vaccine } from '@prisma/client'

export default function EditVaccine({ 
  params 
}: { 
  params: Promise<{ id: string; vaccineId: string }> 
}) {
  const { id, vaccineId } = use(params) as { id: string; vaccineId: string };
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        const response = await fetch(`/api/pets/${id}/vaccines/${vaccineId}`)
        if (response.ok) {
          const vaccine = await response.json()
          if (vaccine) {
            setFormData({
              name: vaccine.name,
              date: new Date(vaccine.date).toISOString().split('T')[0]
            })
          } else {
            setError('Vaccine not found')
          }
        } else {
          setError('Failed to fetch vaccine data')
        }
      } catch (error) {
        setError('An error occurred while fetching vaccine data')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchVaccine()
  }, [id, vaccineId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/pets/${id}/vaccines/${vaccineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData
        }),
      })

      if (response.ok) {
        router.push(`/pets/${id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update vaccine')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/pets/${id}`} className="text-indigo-600 hover:text-indigo-800">
                ← Back to Pet Details
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Vaccine</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Vaccine Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                placeholder="e.g., Rabies, DHPP, Bordetella"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Vaccination Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Vaccine'}
              </button>
              <Link
                href={`/pets/${id}`}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
