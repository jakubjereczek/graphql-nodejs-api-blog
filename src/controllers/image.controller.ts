import { FileUpload } from 'graphql-upload';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { GetOrDeleteImageInput, ImageModel } from 'schemas/image.schema';

export class ImageController {
  /**
   *  The function concatenates file read stream its chunks into
   * a buffer and create a payload object with base64 encoded
   * contents, filename and mimetype.
   */
  async uploadImage(file: FileUpload) {
    const { createReadStream, mimetype, filename } = file;

    const chunks: Buffer[] = [];
    for await (const chunk of createReadStream()) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const payload = {
      base64: buffer.toString('base64'),
      name: filename,
      mimeType: mimetype,
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
