"use client"
import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey)
      return () => document.removeEventListener("keydown", handleKey)
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    onClose()
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-3 md:p-4 flex items-center gap-3">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-500" aria-hidden="true" />
            <form onSubmit={onSubmit} className="flex-1">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, tags and authors"
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-base md:text-lg"
                aria-label="Search"
              />
            </form>
            <button
              aria-label="Close search"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}







