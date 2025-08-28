"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import api from "@/lib/bookapi"
import { PublishedBookSummary } from "@/lib/types"

export default function FeaturedBooks() {
  const [books, setBooks] = useState<PublishedBookSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.getPublishedBooks()
      .then((list) => {
        if (!mounted) return
        const sorted = [...list].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        setBooks(sorted.slice(0, 6))
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return null
  if (!books.length) return null

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Featured Books</h3>
          <Link href="/books" className="text-orange-600 hover:text-orange-700 font-medium">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => (
            <Link key={b.id} href={`/books/${b.id}`} className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-50">
                {b.coverImage ? (
                  <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">No cover</div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600">{b.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{b.author}</p>
                {b.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-2">{b.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


