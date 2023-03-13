import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { getMimeTypeFromBuffer } from 'common/utils/mineType';
import {
  GetOrDeleteImageInput,
  ImageModel,
  UploadImageInput,
} from 'schemas/image.schema';

export class ImageController {
  async uploadImage(input: UploadImageInput) {
    const buffer = Buffer.from(input.image, 'base64');
    const mimeType = getMimeTypeFromBuffer(buffer);
    const payload = {
      image: buffer,
      mimeType,
    };
    return ImageModel.create(payload);
  }

  async getImage(input: GetOrDeleteImageInput) {
    return await ImageModel.find().findByImageId(input.imageId).lean();
  }

  async getImages() {
    return await ImageModel.find().lean();
  }

  async deleteImage(input: GetOrDeleteImageInput) {
    const image = await ImageModel.find().findByImageId(input.imageId).lean();
    if (!image) {
      throw new GraphQLError(ERROR_MESSAGE.IMAGE_NOT_EXIST, {
        code: ERROR_CODE.CONFLICT,
        statusCode: 400,
      });
    }

    const result = await ImageModel.deleteOne({
      name: input.imageId,
    }).lean();

    if (result.deletedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.IMAGE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    return result.deletedCount === 1;
  }
}
