import { getModelForClass, index, pre, prop } from '@typegoose/typegoose';
import { hash } from 'common/utils/hash';
import { Field, ObjectType } from 'type-graphql';

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await hash(this.password);
})
@index({ email: 1 })
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
}

export const UserModel = getModelForClass<typeof User>(User);
