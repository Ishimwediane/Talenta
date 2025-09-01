export interface MyBookSummary {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  coverImage?: string | null;
}

export interface PublishedBookSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string | null;
  publishedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  status: 'DRAFT' | 'PUBLISHED';
  isPublished: boolean;
  wordCount: number;
  readingTime: number;
  bookId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  content: string | null;
  tags: string[];
  subCategories?: string[];
  status: 'DRAFT' | 'PUBLISHED';
  coverImage: string | null;
  bookFile: string | null;
  category?: string | null;
  userId?: string | null;
  readUrl?: string | null;
  downloadUrl?: string | null;
  publishedAt: string;
  updatedAt: string;
  chapters?: Chapter[];
}