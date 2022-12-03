import { ArticleType } from '@app/types/article/article.type';

export interface ArticlesResponseInterface {
  articles: ArticleType[];
  articlesCount: number;
}
