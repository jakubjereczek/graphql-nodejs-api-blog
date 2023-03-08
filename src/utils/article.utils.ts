import { LeanDocument } from 'mongoose';
import { Article, ArticleModel } from 'schemas/article.schema';
import { Comment, CommentModel } from 'schemas/comment.schema';

interface GetRecursiveCommentsIdsArgs {
  id: string;
  isArticle: boolean;
}

export async function getRecursiveCommentsIds({
  id,
  isArticle,
}: GetRecursiveCommentsIdsArgs) {
  const value = isArticle
    ? await ArticleModel.find().findByArticleId(id).lean()
    : await CommentModel.find().findByCommentId(id).lean();
  if (!value) {
    return [];
  }

  const innerComments: string[] = [];
  async function getInner(document: LeanDocument<Article | Comment>) {
    if (checkArticle(document)) {
      for (const _id of document.comments_ids) {
        const innerComment = await CommentModel.findById(_id).lean();
        if (innerComment) {
          await getInner(innerComment);
        }
      }
    } else if (checkComment(document)) {
      const { comment_id, answers } = document;
      innerComments.push(comment_id);

      for (const _id of answers) {
        const comment = await CommentModel.findById(_id).lean();
        if (comment) {
          await getInner(comment);
        }
      }
    }
  }
  await getInner(value);

  return innerComments;
}

function checkArticle(
  document: LeanDocument<Article | Comment>,
): document is LeanDocument<Article> {
  return (document as LeanDocument<Article>).comments_ids !== undefined;
}

function checkComment(
  document: LeanDocument<Article | Comment>,
): document is LeanDocument<Comment> {
  return (document as LeanDocument<Comment>).comment_id !== undefined;
}
