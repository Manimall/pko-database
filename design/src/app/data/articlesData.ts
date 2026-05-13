// Article types. Data lives at /public/data/articles.json
// and is loaded at runtime via loader.ts (loadArticles).

export interface ArticleTable {
  headers: string[];
  rows: string[][];
}

export interface ArticleSection {
  type: 'paragraph' | 'heading' | 'subheading' | 'table' | 'bullets';
  content?: string;
  items?: string[];
  table?: ArticleTable;
}

export interface Article {
  id: string;
  title: string;
  shortTitle: string;
  image: string;
  date: string;
  summary: string;
  sections: ArticleSection[];
}
