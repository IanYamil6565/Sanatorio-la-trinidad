export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId: string;
  category: 'announcement' | 'news' | 'policy' | 'event';
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  priority: 'low' | 'medium' | 'high';
}

export interface BlogFilters {
  search: string;
  category: string;
  author: string;
  status: 'all' | 'draft' | 'published';
}