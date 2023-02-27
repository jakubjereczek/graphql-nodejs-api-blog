import {
  getModelForClass,
  index,
  prop,
  Ref,
  queryMethod,
} from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { IsOptional, Length, MaxLength, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { nanoid } from 'common/utils/string';
import { Category } from 'schemas/category.schema';
import { User } from 'schemas/user.schema';
import { Comment } from 'schemas/comment.schema';

interface QueryHelper {
  findByArticleId: AsQueryMethod<typeof findByArticleId>;
}

function findByArticleId(
  this: ReturnModelType<typeof Article, QueryHelper>,
  article_id: Article['article_id'],
) {
  return this.findOne({ article_id });
}

@index({ article_id: 1 })
@queryMethod(findByArticleId)
@ObjectType()
export class Article {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({
    required: true,
    default: () => `article_${nanoid(6)()}`,
    unique: true,
  })
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
  thumbnail_url: string;

  @Field(() => [String])
  @prop({ required: true, ref: () => Array<Comment> })
  comments: Ref<Comment[]>;
}

export const ArticleModel = getModelForClass<typeof Article, QueryHelper>(
  Article,
);

@InputType()
export class CreateArticleInput {
  @MinLength(4, {
    message: 'Category must have at least 4 chars length.',
  })
  @MaxLength(32, {
    message: 'Category should not be longer than 32 chars.',
  })
  @Field(() => String)
  category: string; // category name

  @Field(() => String)
  name: string;

  @Field(() => String)
  body: string;

  @Field(() => String)
  thumbnail_url: string;
}

@InputType()
export class GetOrDeleteArticleInput {
  @Field(() => String)
  @Length(14)
  articleId: string;
}

@InputType()
export class UpdateArticleInput {
  @Field(() => String)
  articleId: string;

  @MinLength(4, {
    message: 'Category must have at least 4 chars length.',
  })
  @MaxLength(32, {
    message: 'Category should not be longer than 32 chars.',
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  category?: string; // category name

  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  body?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  thumbnail_url?: string;
}
