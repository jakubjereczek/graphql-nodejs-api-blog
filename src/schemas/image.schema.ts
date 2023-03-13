import {
  getModelForClass,
  index,
  prop,
  queryMethod,
} from '@typegoose/typegoose';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { Field, InputType, ObjectType } from 'type-graphql';
import { IsNotEmpty, Length } from 'class-validator';
import { FileUpload } from 'graphql-upload/Upload.js';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { nanoid } from 'common/utils/string';

interface QueryHelper {
  findByImageId: AsQueryMethod<typeof findByImageId>;
}

function findByImageId(
  this: ReturnModelType<typeof Image, QueryHelper>,
  image_id: Image['image_id'],
) {
  return this.findOne({ image_id });
}

@index({ image_id: 1 })
@queryMethod(findByImageId)
@ObjectType()
export class Image {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({
    required: true,
    default: () => `image_${nanoid(6)()}`,
    unique: true,
  })
  image_id: string;

  @Field(() => GraphQLUpload, { nullable: true })
  @prop({ type: Buffer })
  image: FileUpload;

  @Field(() => String)
  @prop({ required: true })
  mimeType: string;
}

export const ImageModel = getModelForClass<typeof Image, QueryHelper>(Image);

@InputType()
export class UploadImageInput {
  @Field(() => String)
  @IsNotEmpty()
  image: string;
}

@InputType()
export class GetOrDeleteImageInput {
  @Field(() => String)
  @Length(14)
  imageId: string;
}
