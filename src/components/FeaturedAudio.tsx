"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type PublicAudio = {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  user?: { id: string; firstName?: string | null; lastName?: string | null }
}

export default function FeaturedAudio() {
  const [audios, setAudios] = useState<PublicAudio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE_URL}/audio`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const list: PublicAudio[] = Array.isArray(data?.audios) ? data.audios : []
        setAudios(list.slice(0, 6))
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return null
  if (!audios.length) return null

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Featured Audio</h3>
          <Link href="/audio" className="text-orange-600 hover:text-orange-700 font-medium">Browse audio</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audios.map((a) => (
            <div key={a.id} className="border rounded-xl p-4 bg-white hover:shadow-lg transition-shadow">
              <h4 className="font-semibold text-gray-900 line-clamp-1">{a.title}</h4>
              {a.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>}
              <div className="mt-3">
                <audio controls className="w-full">
                  <source src={a.fileUrl} />
                </audio>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}








