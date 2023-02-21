import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { Field, ObjectType } from 'type-graphql';
import { nanoid } from 'common/utils/string';
import { Category } from 'schemas/category.schema';
import { User } from 'schemas/user.schema';

interface QueryHelper {
  findById: AsQueryMethod<typeof findByArticleId>;
}

function findByArticleId(
  this: ReturnModelType<typeof Article, QueryHelper>,
  articleId: Article['articleId'],
) {
  return this.findOne({ articleId });
}

@ObjectType()
export class Article {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, default: () => `article_${nanoid(6)}`, unique: true })
  articleId: string;

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

  // TODO: add comments
}

export const ArticleModel = getModelForClass<typeof Article, QueryHelper>(
  Article,
);

// TODO
export class CreateArticleInput {}

// TODO
export class GetOrDeleteArticleInput {}

// TODO
export class UpdateArticleInput {}
