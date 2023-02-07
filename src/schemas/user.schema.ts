import {
  getModelForClass,
  index,
  pre,
  prop,
  queryMethod,
} from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { hash } from 'common/utils/hash';
import { Field, InputType, ObjectType } from 'type-graphql';

interface QueryHelper {
  findByEmail: AsQueryMethod<typeof findByEmail>;
}

function findByEmail(
  this: ReturnModelType<typeof User, QueryHelper>,
  email: User['email'],
) {
  return this.findOne({ email });
}

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await hash(this.password);
})
@index({ email: 1 })
@queryMethod(findByEmail)
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @Field(() => String)
  @prop({ required: true })
  password: string;

  @Field(() => [String])
  roles: string[];
}

export const UserModel = getModelForClass<typeof User, QueryHelper>(User);

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: 'Password must have at least 6 chars length.',
  })
  @MaxLength(32, {
    message: 'Password should not be longer than 32 chars.',
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class AuthorizeUserInput {
  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class UserAuthorizationToken {
  @Field(() => String)
  @prop({ required: true })
  access_token: string;

  @Field(() => String)
  @prop({ required: true })
  refresh_token: string;
}
