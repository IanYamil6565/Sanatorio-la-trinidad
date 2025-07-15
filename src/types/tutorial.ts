export interface Tutorial {
  id: string;
  title: string;
  content: string;
  category: 'procedures' | 'software' | 'equipment' | 'policies' | 'emergency';
  tags: string[];
  author: string;
  authorId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  attachments?: string[];
  publishedAt: string;
  updatedAt: string;
  views: number;
  rating: number;
  isPublished: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  order: number;
  image?: string;
}

export interface TutorialFilters {
  search: string;
  category: string;
  difficulty: string;
  author: string;
}