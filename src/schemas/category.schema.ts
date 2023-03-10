import { getModelForClass, prop, queryMethod } from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';

interface QueryHelper {
  findByName: AsQueryMethod<typeof findByName>;
}

function findByName(
  this: ReturnModelType<typeof Category, QueryHelper>,
  name: Category['name'],
) {
  return this.findOne({ name });
}

@queryMethod(findByName)
@ObjectType()
export class Category {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  description: string;
}

export const CategoryModel = getModelForClass<typeof Category, QueryHelper>(
  Category,
);

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description: string;
}

@InputType()
export class GetOrDeleteCategoryInput {
  @MinLength(4, {
    message: 'Category must have at least 4 chars length.',
  })
  @MaxLength(32, {
    message: 'Category should not be longer than 32 chars.',
  })
  @Field(() => String)
  name: string;
}

@InputType()
export class UpdateCategoryInput {
  @MinLength(4, {
    message: 'Category must have at least 4 chars length.',
  })
  @MaxLength(32, {
    message: 'Category should not be longer than 32 chars.',
  })
  @Field(() => String)
  name: string;

  @Field(() => String)
  newName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string;
}
