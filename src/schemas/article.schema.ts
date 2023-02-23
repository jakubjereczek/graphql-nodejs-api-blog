import { getModelForClass, index, prop, Ref } from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { Field, InputType, ObjectType } from 'type-graphql';
import { nanoid } from 'common/utils/string';
import { Category } from 'schemas/category.schema';
import { User } from 'schemas/user.schema';
import { IsOptional } from 'class-validator';

interface QueryHelper {
  findById: AsQueryMethod<typeof findByArticleId>;
}

function findByArticleId(
  this: ReturnModelType<typeof Article, QueryHelper>,
  article_id: Article['article_id'],
) {
  return this.findOne({ article_id });
}

@index({ article_id: 1 })
@ObjectType()
export class Article {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, default: () => `article_${nanoid(6)}`, unique: true })
  article_id: string;

  @Field(() => String)
  @prop({ required: true, ref: () => Category })
  category: Ref<Category>;

  @Field(() => String)
  @prop({ required: true, unique: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  body: string;

  @Field(() => String)
  @prop({ required: true, ref: () => User })
  author: Ref<User>;

  @Field(() => Number)
  @prop({ required: true })
  views: number;

  @Field(() => Number)
  @prop({ required: true })
  created_at: number;

  @Field(() => String)
  @prop({ required: false })
  thumbnailUrl: string;

  // TODO: add comments
}

export const ArticleModel = getModelForClass<typeof Article, QueryHelper>(
  Article,
);

@InputType()
export class CreateArticleInput {
  @Field(() => String)
  category: string; // category name

  @Field(() => String)
  name: string;

  @Field(() => String)
  body: string;

  @Field(() => String)
  @IsOptional()
  thumbnailUrl?: string;
}

@InputType()
export class GetOrDeleteArticleInput {
  @Field(() => String)
  articleId: string;
}

@InputType()
export class UpdateArticleInput {
  @Field(() => String)
  category: Category;

  @Field(() => String)
  name: string;

  @Field(() => String)
  body: string;

  @Field(() => String)
  thumbnailUrl: string;
}
