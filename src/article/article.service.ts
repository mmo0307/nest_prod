import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { ArticleResponseInterface } from '@app/types/article/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from '@app/types/article/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          username: query.favorited,
        },
        { relations: ['favorites'] },
      );
      const ids = author.favorites.map((item) => item.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (queryBuilder.limit) {
      queryBuilder.limit(query.limit);
    }

    if (queryBuilder.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articleWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return {
      articles: articleWithFavorites,
      articlesCount,
    };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async getCurrentArticle(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  async deleteArticle(slug: string, id: number): Promise<DeleteResult> {
    const article = await this.getCurrentArticle(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== id) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    id: number,
    updateArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.getCurrentArticle(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== id) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    id: number,
  ): Promise<ArticleEntity> {
    const article = await this.getCurrentArticle(slug);
    const user = await this.userRepository.findOne(id, {
      relations: ['favorites'],
    });

    const isNotFavorited: boolean =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    id: number,
  ): Promise<ArticleEntity> {
    const article = await this.getCurrentArticle(slug);
    const user = await this.userRepository.findOne(id, {
      relations: ['favorites'],
    });

    const articleIndex: number = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article,
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
