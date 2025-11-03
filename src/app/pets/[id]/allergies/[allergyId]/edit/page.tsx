'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Allergy } from '@prisma/client'

export default function EditAllergy({ 
  params 
}: { 
  params: Promise<{ id: string; allergyId: string }> 
}) {
  const { id, allergyId } = use(params) as { id: string; allergyId: string };
  const [formData, setFormData] = useState({
    name: '',
    reaction: '',
    severity: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAllergy = async () => {
      try {
        const response = await fetch(`/api/pets/${id}/allergies/${allergyId}`)
        if (response.ok) {
          const allergy = await response.json()
          if (allergy) {
            setFormData({
              name: allergy.name,
              reaction: allergy.reaction,
              severity: allergy.severity
            })
          } else {
            setError('Allergy not found')
          }
        } else {
          setError('Failed to fetch allergy data')
        }
      } catch (error) {
        setError('An error occurred while fetching allergy data')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchAllergy()
  }, [id, allergyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/pets/${id}/allergies/${allergyId}`, {
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
        setError(errorData.error || 'Failed to update allergy')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Allergy</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Allergen Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                placeholder="e.g., Chicken, Pollen, Flea bites"
              />
            </div>

            <div>
              <label htmlFor="reaction" className="block text-sm font-medium text-gray-700">
                Reaction Description
              </label>
              <textarea
                id="reaction"
                name="reaction"
                required
                rows={3}
                value={formData.reaction}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                placeholder="Describe the allergic reaction..."
              />
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                required
                value={formData.severity}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
              >
                <option value="">Select severity</option>
                <option value="Mild">Mild</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Allergy'}
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
