import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollows1670235403784 implements MigrationInterface {
  name = 'CreateFollows1670235403784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "follows" ("id" SERIAL NOT NULL, "followingId" integer NOT NULL, "followerId" integer NOT NULL, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "articles"."createdAt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "articles"."updatedAt" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "articles"."updatedAt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "articles"."createdAt" IS NULL`);
    await queryRunner.query(`DROP TABLE "follows"`);
  }
}
