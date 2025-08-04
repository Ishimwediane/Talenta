import Link from "next/link";

const categories = [
  {
    name: "Poetry",
    subcategories: ["Romance", "Social Issues", "Nature", "Philosophy", "Spirituality"],
  },
  {
    name: "Ibisigo (Traditional Poems)",
    subcategories: ["Heroic", "Praise", "Historical", "Nature", "Celebratory"],
  },
  {
    name: "Films",
    subcategories: ["Romance", "Drama", "Documentary", "Comedy", "Culture"],
  },
  {
    name: "Podcasts",
    subcategories: ["Storytelling", "Interviews", "Music", "Culture", "Education"],
  },
  {
    name: "Cultural Stories (Inkuru)",
    subcategories: ["Folk Tales", "Myths", "Legends", "Oral History"],
  },
  {
    name: "Stories",
    subcategories: ["Romance", "Adventure", "Mystery", "Fantasy"],
  },
];

export default function BrowsingPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse All Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {categories.map(({ name, subcategories }) => (
          <div key={name} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-4">{name}</h2>
            <ul className="space-y-2">
              {subcategories.map((subcat) => (
                <li key={subcat}>
                  <Link
                    href={`/explore/${encodeURIComponent(name.toLowerCase())}/${encodeURIComponent(subcat.toLowerCase())}`}
                    className="text-[#7FE8C9] hover:underline"
                  >
                    {subcat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
