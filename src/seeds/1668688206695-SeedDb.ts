import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1668688206695 implements MigrationInterface {
  name = 'SeedDb1668688206695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    // password 1234
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('Vitya', 'vitya@gmail.com', '$2b$10$N8R15ms8wswkdZU3h1wZh.VfZ1vsC0Y/tNbCpVAg2lrYMmujS4HXm')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article desc', 'first article body', 'coffee,dragons',  1)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article desc', 'second article body', 'coffee,dragons',  1)`,
    );
  }

  public async down(): Promise<void> {}
}
