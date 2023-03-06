import { LeanDocument } from 'mongoose';
import { Article, ArticleModel } from 'schemas/article.schema';
import { Comment, CommentModel } from 'schemas/comment.schema';

export async function getArticleRecursiveCommentsIds(articleId: string) {
  const article = await ArticleModel.find().findByArticleId(articleId).lean();

  if (!article) {
    return [];
  }

  const innerComments = [...article.comments_ids];
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
      const innerComment = await CommentModel.find()
        .findByCommentId(document.comment_id)
        .lean();
      if (innerComment) {
        for (const answer of innerComment.answers) {
          const comment = answer as LeanDocument<Comment>;
          innerComments.push(comment.comment_id);
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
