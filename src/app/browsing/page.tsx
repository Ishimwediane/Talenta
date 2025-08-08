
import Link from "next/link"
import Image from "next/image"

export default function BrowsePage() {
  const categories = [
    {
      name: "Poetry",
      description: "Express emotions through beautiful verses",
      image: "/placeholder.svg?height=200&width=300",
      count: "1,234 poems",
      color: "from-orange-400 to-red-400",
    },
    {
      name: "Ibisigo (Traditional Poems)",
      description: "Ancient wisdom in rhythmic form",
      image: "/placeholder.svg?height=200&width=300",
      count: "567 ibisigo",
      color: "from-red-400 to-pink-400",
    },
    {
      name: "Films",
      description: "Visual stories that captivate",
      image: "/placeholder.svg?height=200&width=300",
      count: "89 films",
      color: "from-pink-400 to-purple-400",
    },
    {
      name: "Podcasts",
      description: "Voices that inspire and educate",
      image: "/placeholder.svg?height=200&width=300",
      count: "156 episodes",
      color: "from-purple-400 to-indigo-400",
    },
    {
      name: "Cultural Stories",
      description: "Tales passed through generations",
      image: "/placeholder.svg?height=200&width=300",
      count: "432 stories",
      color: "from-indigo-400 to-blue-400",
    },
    {
      name: "Stories",
      description: "Modern narratives and adventures",
      image: "/placeholder.svg?height=200&width=300",
      count: "678 stories",
      color: "from-blue-400 to-cyan-400",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
  

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Cultural Collection
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover authentic Rwandan culture through poetry, stories, films, and traditional arts
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/explore/${encodeURIComponent(category.name.toLowerCase())}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                  ></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.count}</span>
                    <span className="text-orange-500 font-medium group-hover:text-orange-600">Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
