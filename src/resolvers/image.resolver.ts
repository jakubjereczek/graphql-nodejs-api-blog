import { Arg, Authorized, Mutation, Query } from 'type-graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { GetOrDeleteImageInput, Image } from 'schemas/image.schema';
import { Role } from 'common/types/Role';
import { ImageController } from 'controllers/image.controller';

export default class ImageResolver {
  constructor(private imageController: ImageController) {
    this.imageController = new ImageController();
  }
  @Mutation(() => Image)
  @Authorized([Role.Moderator, Role.Writer])
  async uploadImage(@Arg('file', () => GraphQLUpload) file: FileUpload) {
    return this.imageController.uploadImage(file);
  }

  @Query(() => Image, { nullable: true })
  getImage(@Arg('input') input: GetOrDeleteImageInput) {
    return this.imageController.getImage(input);
  }

  @Query(() => [Image])
  getImages() {
    return this.imageController.getImages();
  }

  @Mutation(() => Boolean)
  @Authorized([Role.Moderator])
  deleteComment(@Arg('input') input: GetOrDeleteImageInput) {
    return this.imageController.deleteImage(input);
  }
}
