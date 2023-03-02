import Context from 'common/types/Context';
import { getTimestamp } from 'common/utils/datetime';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { ArticleModel } from 'schemas/article.schema';
import {
  Comment,
  CommentModel,
  CreateCommentInput,
  GetOrDeleteCommentInput,
  UpdateCommentInput,
} from 'schemas/comment.schema';

export class CommentController {
  async createComment(
    { commentId, articleId, ...input }: CreateCommentInput,
    { user }: Context,
  ) {
    if (!user) {
      throw new GraphQLError(ERROR_MESSAGE.UNAUTHORIZED, {
        code: ERROR_CODE.UNAUTHORIZED,
        statusCode: 401,
      });
    }

    const article = await ArticleModel.find().findByArticleId(articleId).lean();
    if (!article) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    try {
      const payload = {
        ...input,
        article_id: article._id,
        author: user._id,
        answers: new Array<Comment>(),
        created_at: getTimestamp(),
      };
      const result = await CommentModel.create(payload);

      let updateResult;
      if (commentId) {
        updateResult = await CommentModel.updateOne(
          { comment_id: commentId },
          { $push: { answers: result._id } },
        );
      } else {
        updateResult = await ArticleModel.updateOne(
          { article_id: articleId },
          { $push: { comments: result._id } },
        );
      }

      if (updateResult.modifiedCount === 0) {
        throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
          code: ERROR_CODE.BAD_USER_INPUT,
          statusCode: 400,
        });
      }

      return result;
    } catch (err) {
      console.warn('An error occurred when tried to create comment.', err);

      throw new GraphQLError(ERROR_MESSAGE.UPDATE_COMMENT_REFERENCES, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }
  }

  async getComment(input: GetOrDeleteCommentInput) {
    return await CommentModel.find().findByCommentId(input.commentId).lean();
  }

  async getComments() {
    return await CommentModel.find().lean();
  }

  async updateComment(input: UpdateCommentInput) {
    // TODO.
  }

  async deleteComment(input: GetOrDeleteCommentInput) {
    // TODO.
  }
}
