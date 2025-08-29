import Link from "next/link"
import Image from "next/image"

export default function BrowsePage() {
  const categories = [
    {
      name: "Books & Novels",
      description: "Fiction, poetry, biographies, and educational works by talented writers.",
      image: "/categories/books.jpg",
      count: "1,200+ books",
      color: "from-orange-400 to-red-400",
    },
    {
      name: "Storytelling Films",
      description: "Short cinematic stories with narrative depth and cultural themes.",
      image: "/categories/storytelling-films.jpg",
      count: "96 films",
      color: "from-red-400 to-pink-400",
    },
    {
      name: "Photo Stories",
      description: "Narratives told through powerful sequences of images.",
      image: "/categories/photo-stories.jpg",
      count: "210 photo series",
      color: "from-pink-400 to-purple-400",
    },
    {
      name: "Modern Poetry",
      description: "Contemporary poems in text, audio, and video form.",
      image: "/categories/modern-poetry.jpg",
      count: "1,234 works",
      color: "from-purple-400 to-indigo-400",
    },
    {
      name: "Ibisigo (Traditional Poetry)",
      description: "Heritage poetic art blending wisdom, history, and rhythm.",
      image: "/categories/ibisigo.jpg",
      count: "567 ibisigo",
      color: "from-indigo-400 to-blue-400",
    },
    {
      name: "Cultural Stories & Folktales",
      description: "Legends, myths, and oral traditions passed through generations.",
      image: "/categories/cultural-stories.jpg",
      count: "432 stories",
      color: "from-blue-400 to-cyan-400",
    },
    {
      name: "Podcasts",
      description: "Voices sharing inspiration, interviews, and cultural dialogue.",
      image: "/categories/podcasts.jpg",
      count: "156 episodes",
      color: "from-teal-400 to-green-400",
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
              Creative & Cultural Hub
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover books, films, poetry, and visual stories created by talented minds and inspired by cultural heritage.
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
