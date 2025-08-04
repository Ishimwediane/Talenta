export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#7FE8C9] mb-4">
          Welcome to Talenta
        </h1>
        <p className="text-gray-700 text-lg sm:text-xl mb-6">
          Discover, Write, and Listen to stories rooted in Rwandan culture.
          From <strong>Ibisigo</strong> to <strong>Podcasts</strong> to <strong>Films</strong>, Talenta gives a platform to African voices.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/explore"
            className="bg-[#7FE8C9] text-white px-6 py-2 rounded-full hover:bg-[#6ddfba] transition"
          >
            Browse All
          </a>
          <a
            href="/signup"
            className="border border-[#7FE8C9] text-[#7FE8C9] px-6 py-2 rounded-full hover:bg-[#7FE8C9] hover:text-white transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="mt-16 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Popular Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <a href="/explore/ibisigo" className="p-4 border rounded shadow hover:bg-gray-50">
            📜 Ibisigo (Traditional Poems)
          </a>
          <a href="/explore/poetry" className="p-4 border rounded shadow hover:bg-gray-50">
            ✍️ Modern Poetry
          </a>
          <a href="/explore/inkuru-nyezamuco" className="p-4 border rounded shadow hover:bg-gray-50">
            📚 Cultural Stories
          </a>
          <a href="/explore/podcasts" className="p-4 border rounded shadow hover:bg-gray-50">
            🎧 Podcasts
          </a>
          <a href="/explore/films" className="p-4 border rounded shadow hover:bg-gray-50">
            🎬 Short Films
          </a>
          <a href="/search" className="p-4 border rounded shadow hover:bg-gray-50">
            🔍 Search Talenta
          </a>
        </div>
      </section>
    </main>
  );
}
