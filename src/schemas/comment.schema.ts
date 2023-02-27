import {
  getModelForClass,
  index,
  prop,
  Ref,
  ReturnModelType,
  queryMethod,
} from '@typegoose/typegoose';
import { AsQueryMethod } from '@typegoose/typegoose/lib/types';
import { Field, InputType, ObjectType } from 'type-graphql';
import { IsOptional, Length, MinLength } from 'class-validator';
import { Article } from 'schemas/article.schema';
import { User } from 'schemas/user.schema';
import { nanoid } from 'common/utils/string';

interface QueryHelper {
  findByCommentId: AsQueryMethod<typeof findByCommentId>;
}

function findByCommentId(
  this: ReturnModelType<typeof Comment, QueryHelper>,
  comment_id: Comment['comment_id'],
) {
  return this.findOne({ comment_id });
}

@index({ comment_id: 1 })
@queryMethod(findByCommentId)
@ObjectType()
export class Comment {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({
    required: true,
    default: () => `comment_${nanoid(6)()}`,
    unique: true,
  })
  comment_id: string;

  @Field(() => String)
  @prop({ ref: () => Article })
  article_id: Ref<Article>;

  @Field(() => String)
  @prop({ required: true, ref: () => User })
  author: Ref<User>;

  @Field(() => String)
  @prop({ required: true })
  body: string;

  @Field(() => [Comment])
  @prop({ required: false, ref: () => Array<Comment> })
  answers: Ref<Comment[]>;

  @Field(() => Number)
  @prop({ required: true })
  created_at: number;
}

export const CommentModel = getModelForClass<typeof Comment, QueryHelper>(
  Comment,
);

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  articleId: string;

  @Field(() => String)
  author: string;

  @MinLength(4, {
    message: 'Comment must have at least 6 chars length.',
  })
  @Field(() => String)
  body: string;
}

@InputType()
export class GetOrDeleteCommentInput {
  @Field(() => String)
  @Length(14)
  commentId: string;
}

@InputType()
export class UpdateCommentInput {
  @Field(() => String)
  articleId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  body: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  answers: string[];
}
