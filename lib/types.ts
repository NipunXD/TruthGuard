export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface AnalyzedArticle extends NewsArticle {
  truthScore: number;
  truthCategory: 'True' | 'Maybe True' | 'Maybe False' | 'False';
  confidence: number;
}

export interface VerificationResult {
  headline: string;
  content?: string;
  truthScore: number;
  truthCategory: 'True' | 'Maybe True' | 'Maybe False' | 'False';
  confidence: number;
  explanation: string;
}