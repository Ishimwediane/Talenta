"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = useMemo(() => params.get("q") ?? "", [params])
  const [query, setQuery] = useState(initial)

  useEffect(() => {
    // keep input synced if user navigates with back/forward
    const current = params.get("q") ?? ""
    if (current !== query) setQuery(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
    router.push(next)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Large centered search box */}
        <div className="flex justify-center">
          <form
            onSubmit={onSubmit}
            className="w-full md:w-4/5 lg:w-3/4"
            role="search"
            aria-label="Site search"
          >
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200 px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, tags and authors"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-base md:text-lg"
                autoFocus
              />
              <button
                type="submit"
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results area (placeholder) */}
        <div className="mt-10">
          {query ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">Showing results for:</p>
              <h2 className="text-2xl font-semibold text-gray-900">{query}</h2>
              <div className="mt-6 grid gap-4 text-gray-600">
                <div className="p-4 rounded-lg border border-gray-200 bg-white">No results yet. Hook this up to your API.</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="mt-8">Try searching for books, authors, tags, or audio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}






