import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchBooks(category: string, subCategory?: string) {
  const url = `${API_BASE_URL}/books?category=${encodeURIComponent(category)}${subCategory ? `&subCategory=${encodeURIComponent(subCategory)}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function fetchAudios(category: string, subCategory?: string) {
  const url = `${API_BASE_URL}/audio?published=true&category=${encodeURIComponent(category)}${subCategory ? `&subCategory=${encodeURIComponent(subCategory)}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { audios: [] };
  return res.json();
}

export default async function ExploreCategoryPage({ params, searchParams }: { params: { category: string }, searchParams?: { subCategory?: string } }) {
  const rawCategory = decodeURIComponent(params.category);
  const category = rawCategory.replace(/%20/g, ' ');
  const subCategory = searchParams?.subCategory;

  const [books, audioResp] = await Promise.all([
    fetchBooks(category, subCategory),
    fetchAudios(category, subCategory)
  ]);

  const audios = audioResp.audios || [];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Explore: {category}</h1>
          <p className="text-gray-600 mt-2">Browse published books and podcasts in this category{subCategory ? ` — ${subCategory}` : ''}.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">Books</h2>
          {(!books || books.length === 0) ? (
            <p className="text-gray-500">No books found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book: any) => (
                <div key={book.id} className="border rounded-lg p-4 hover:shadow-sm">
                  <h3 className="font-medium text-lg">{book.title}</h3>
                  {book.author && <p className="text-sm text-gray-600">by {book.author}</p>}
                  {book.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{book.description}</p>}
                  <div className="mt-3">
                    <Link href={`/books/${book.id}`} className="text-orange-600 text-sm font-medium">View details →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">Podcasts</h2>
          {(!audios || audios.length === 0) ? (
            <p className="text-gray-500">No podcasts found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audios.map((audio: any) => (
                <div key={audio.id} className="border rounded-lg p-4 hover:shadow-sm">
                  <h3 className="font-medium text-lg">{audio.title}</h3>
                  {audio.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{audio.description}</p>}
                  <audio controls className="w-full mt-3">
                    <source src={audio.fileUrl} />
                  </audio>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


