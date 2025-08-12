"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Search, Menu, X, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginModal from './login-modal'
import SignupModal from './signup-modal'
import AuthModal from "./auth-modal"
import { useAuth } from "@/contexts/AuthContext" // Adjust path to your AuthContext

export default function Navbar() {
  const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [language, setLanguage] = useState("EN")
  const browseRef = useRef<HTMLDivElement>(null)
  const createRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()


  // Functions to switch between modals
  const handleSwitchToSignup = () => {
    setLoginModalOpen(false)
    setSignupModalOpen(true)
  }

  const handleSwitchToLogin = () => {
    setSignupModalOpen(false)
    setLoginModalOpen(true)
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setBrowseOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const categories = [
    {
      name: "Poetry",
      subcategories: ["Romance", "Social Issues", "Nature", "Philosophy", "Spirituality"],
      badge: "POPULAR",
    },
    {
      name: "Ibisigo",
      subcategories: ["Heroic", "Praise", "Historical", "Nature", "Celebratory"],
      badge: "HERITAGE",
    },
    {
      name: "Films",
      subcategories: ["Romance", "Drama", "Documentary", "Comedy", "Culture"],
      badge: "NEW",
    },
    {
      name: "Podcasts",
      subcategories: ["Storytelling", "Interviews", "Music", "Culture", "Education"],
      badge: "TRENDING",
    },
    {
      name: "Cultural Stories",
      subcategories: ["Folk Tales", "Myths", "Legends", "Oral History"],
      badge: "FEATURED",
    },
    {
      name: "Stories",
      subcategories: ["Romance", "Adventure", "Mystery", "Fantasy"],
    },
  ]

  const contentTypes = [
    { name: "Audio Content", items: ["Podcasts", "Poetry Readings", "Music", "Interviews"] },
    { name: "Visual Content", items: ["Films", "Documentaries", "Photo Stories", "Art Gallery"] },
    { name: "Written Content", items: ["Articles", "Poems", "Stories", "Reviews"] },
  ]

  const featuredContent = [
    { name: "Trending Now", items: ["Popular Poems", "Viral Stories", "Top Films"] },
    { name: "Editor's Choice", items: ["Staff Picks", "Award Winners", "Hidden Gems"] },
    { name: "For Artists", items: ["Submit Work", "Artist Spotlight", "Collaborations"] },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Talenta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                   <div className="relative" ref={browseRef}>
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                onMouseEnter={() => setBrowseOpen(true)}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                <span>Browse</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {browseOpen && (
                <div
                  onMouseEnter={() => setBrowseOpen(true)}
                  onMouseLeave={() => setBrowseOpen(false)}
                  className="absolute top-full mt-2 w-screen max-w-6xl bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden z-50"
                  style={{ left: "-300px" }}
                >
                  <div className="flex">
                    {/* Main content area */}
                    <div className="flex-1 p-8">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Categories */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🎨</span>
                            Categories
                          </h3>
                          <div className="space-y-3">
                            {categories.slice(0, 3).map(({ name, subcategories, badge }) => (
                              <div key={name} className="group">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Link
                                    href={`/explore/${encodeURIComponent(name.toLowerCase())}`}
                                    className="font-medium text-gray-800 group-hover:text-orange-500 transition-colors"
                                  >
                                    {name}
                                  </Link>
                                  {badge && (
                                    <span className="px-2 py-1 text-xs font-semibold bg-orange-500 text-white rounded-full">
                                      {badge}
                                    </span>
                                  )}
                                </div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {subcategories.slice(0, 3).map((subcat) => (
                                    <li key={subcat}>
                                      <Link
                                        href={`/explore/${encodeURIComponent(name.toLowerCase())}/${encodeURIComponent(subcat.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {subcat}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Content Types */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📚</span>
                            Content Types
                          </h3>
                          <div className="space-y-3">
                            {contentTypes.map(({ name, items }) => (
                              <div key={name} className="group">
                                <h4 className="font-medium text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                                  {name}
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/content/${encodeURIComponent(item.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Featured */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">⭐</span>
                            Featured
                          </h3>
                          <div className="space-y-3">
                            {featuredContent.map(({ name, items }) => (
                              <div key={name} className="group">
                                <h4 className="font-medium text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                                  {name}
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/featured/${encodeURIComponent(item.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Promotional sidebar */}
                    <div className="w-80 bg-orange-500 p-8 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative h-full flex flex-col justify-center items-center text-center">
                        <div className="mb-6">
                          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                            <span className="text-3xl">🎭</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Embrace Culture</h3>
                        <p className="text-sm opacity-90 mb-6 leading-relaxed">
                          Connect with Rwanda&apos;s artistic soul through poetry, stories, and creative expressions
                        </p>
                        <Link
                          href="/featured"
                          className="bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                          Join Artists
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
             {/* Search */}
                <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Search
                </Link>
                {/* Create Dropdown */}
                <div className="relative" ref={createRef}>
                  <button
                    onClick={() => setCreateOpen(!createOpen)}
                    onMouseEnter={() => setCreateOpen(true)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    <span>Create</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                   {createOpen && (
                    <div
                      onMouseEnter={() => setCreateOpen(true)}
                      onMouseLeave={() => setCreateOpen(false)}
                      className="absolute top-full mt-2 min-w-[160px] bg-white shadow-lg border border-gray-200 rounded-lg z-50"
                    >
                      <Link href="/read" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Read</Link>
                      <Link href="/dashboard/write" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Write</Link>
                      <Link href="/record" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Record</Link>
                      <Link href="/listen" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Listen</Link>
                    </div>
                  )}
                </div>
              </>
            ) :( 
              <>
              <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Home
                </Link>
                {/* Browse Dropdown */}
               <div className="relative" ref={browseRef}>
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                onMouseEnter={() => setBrowseOpen(true)}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                <span>Browse</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {browseOpen && (
                <div
                  onMouseEnter={() => setBrowseOpen(true)}
                  onMouseLeave={() => setBrowseOpen(false)}
                  className="absolute top-full mt-2 w-screen max-w-6xl bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden z-50"
                  style={{ left: "-300px" }}
                >
                  <div className="flex">
                    {/* Main content area */}
                    <div className="flex-1 p-8">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Categories */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🎨</span>
                            Categories
                          </h3>
                          <div className="space-y-3">
                            {categories.slice(0, 3).map(({ name, subcategories, badge }) => (
                              <div key={name} className="group">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Link
                                    href={`/explore/${encodeURIComponent(name.toLowerCase())}`}
                                    className="font-medium text-gray-800 group-hover:text-orange-500 transition-colors"
                                  >
                                    {name}
                                  </Link>
                                  {badge && (
                                    <span className="px-2 py-1 text-xs font-semibold bg-orange-500 text-white rounded-full">
                                      {badge}
                                    </span>
                                  )}
                                </div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {subcategories.slice(0, 3).map((subcat) => (
                                    <li key={subcat}>
                                      <Link
                                        href={`/explore/${encodeURIComponent(name.toLowerCase())}/${encodeURIComponent(subcat.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {subcat}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Content Types */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📚</span>
                            Content Types
                          </h3>
                          <div className="space-y-3">
                            {contentTypes.map(({ name, items }) => (
                              <div key={name} className="group">
                                <h4 className="font-medium text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                                  {name}
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/content/${encodeURIComponent(item.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Featured */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">⭐</span>
                            Featured
                          </h3>
                          <div className="space-y-3">
                            {featuredContent.map(({ name, items }) => (
                              <div key={name} className="group">
                                <h4 className="font-medium text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                                  {name}
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/featured/${encodeURIComponent(item.toLowerCase())}`}
                                        className="hover:text-orange-500 transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Promotional sidebar */}
                    <div className="w-80 bg-orange-500 p-8 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative h-full flex flex-col justify-center items-center text-center">
                        <div className="mb-6">
                          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                            <span className="text-3xl">🎭</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Embrace Culture</h3>
                        <p className="text-sm opacity-90 mb-6 leading-relaxed">
                          Connect with Rwanda&apos;s artistic soul through poetry, stories, and creative expressions
                        </p>
                        <Link
                          href="/featured"
                          className="bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                          Join Artists
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
                   <Link href="/creators" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Creators
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  About Us
                </Link>
                <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Search
                </Link>
              </>
            )
            }</div>
          

          {/* Right side icons and auth */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle with Flags */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:border-orange-500 focus:outline-none focus:border-orange-500 cursor-pointer appearance-none pr-8"
              >
                <option value="EN">🇺🇸 EN</option>
                <option value="RW">🇷🇼 RW</option>
                <option value="FR">🇫🇷 FR</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Search */}
            <Link href="/search" className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-3">
                          <button
                onClick={() => setLoginModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setSignupModalOpen(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link href="/" className="block text-gray-700 font-medium">
                Home
              </Link>

              <div>
                <button
                  onClick={() => setBrowseOpen(!browseOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-medium"
                >
                  Browse
                  <ChevronDown className={`w-4 h-4 transition-transform ${browseOpen ? "rotate-180" : ""}`} />
                </button>

                {browseOpen && (
                  <div className="mt-3 pl-4 border-l-2 border-orange-200 space-y-4">
                    {categories.map(({ name, subcategories, badge }) => (
                      <div key={name}>
                        <div className="flex items-center space-x-2 mb-2">
                          <Link
                            href={`/explore/${encodeURIComponent(name.toLowerCase())}`}
                            className="font-medium text-gray-800"
                          >
                            {name}
                          </Link>
                          {badge && (
                            <span className="px-2 py-1 text-xs font-semibold bg-orange-500 text-white rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <ul className="pl-4 space-y-1 text-sm text-gray-600">
                          {subcategories.map((subcat) => (
                            <li key={subcat}>
                              <Link
                                href={`/explore/${encodeURIComponent(name.toLowerCase())}/${encodeURIComponent(subcat.toLowerCase())}`}
                                className="block hover:text-orange-500"
                              >
                                {subcat}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/creators" className="block text-gray-700 font-medium">
                Creators
              </Link>
              <Link href="/about" className="block text-gray-700 font-medium">
                About Us
              </Link>
              <Link href="/search" className="block text-gray-700 font-medium">
                Search
              </Link>

              <hr className="border-gray-200" />

                            <button
                onClick={() => setLoginModalOpen(true)}
                className="block text-gray-700 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => setSignupModalOpen(true)}
                className="block text-orange-500 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
                )}
      </div>

      {/* Modals */}
      {loginModalOpen && (
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSwitchToSignup={handleSwitchToSignup}
          onLoginSuccess={(userData) => {
            setLoginModalOpen(false)
            if (userData.role === "ADMIN") {
              router.push("/admin")
            } else {
              router.push("/")
            }
          }}
        />
      )}

      {signupModalOpen && (
        <SignupModal
          isOpen={signupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </nav>
  )
}