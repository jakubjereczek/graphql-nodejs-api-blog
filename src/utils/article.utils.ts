import { LeanDocument } from 'mongoose';
import { Article, ArticleModel } from 'schemas/article.schema';
import { Comment, CommentModel } from 'schemas/comment.schema';

export async function getRecursiveArticleCommentsIds(articleId: string) {
  const article = await ArticleModel.find().findByArticleId(articleId).lean();

  if (!article) {
    return [];
  }

  const innerComments: string[] = [];
  async function getInner(document: LeanDocument<Article | Comment>) {
    if (isArticle(document)) {
      for (const commentId of document.comments_ids) {
        const innerComment = await CommentModel.find()
          .findByCommentId(commentId as string)
          .lean();

        if (innerComment) {
          await getInner(innerComment);
        }
      }
    } else if (isComment(document)) {
      const { comment_id, answers } = document;
      innerComments.push(comment_id);

      for (const answer of answers) {
        const comment = await CommentModel.find()
          .findByCommentId(answer as string)
          .lean();
        if (comment) {
          await getInner(comment);
        }
      }
    }
  }

  await getInner(article);
  return innerComments;
}

function isArticle(
  document: LeanDocument<Article | Comment>,
): document is LeanDocument<Article> {
  return (document as LeanDocument<Article>).comments_ids !== undefined;
}

function isComment(
  document: LeanDocument<Article | Comment>,
): document is LeanDocument<Comment> {
  return (document as LeanDocument<Comment>).comment_id !== undefined;
}
