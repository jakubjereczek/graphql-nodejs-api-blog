import { Arg, Authorized, Ctx, Mutation, Query } from 'type-graphql';
import { CommentController } from 'controllers/comment.controller';
import {
  CreateCommentInput,
  GetOrDeleteCommentInput,
  UpdateCommentInput,
} from 'schemas/comment.schema';
import Context from 'common/types/Context';
import { Comment } from 'schemas/comment.schema';

export default class CommentResolver {
  constructor(private commentController: CommentController) {
    this.commentController = new CommentController();
  }

  @Mutation(() => Comment)
  @Authorized()
  createComment(
    @Arg('input') input: CreateCommentInput,
    @Ctx() context: Context,
  ) {
    return this.commentController.createComment(input, context);
  }

  @Query(() => Comment, { nullable: true })
  getComment(@Arg('input') input: GetOrDeleteCommentInput) {
    return this.commentController.getComment(input);
  }

  @Query(() => [Comment])
  getComments() {
    return this.commentController.getComments();
  }

  // author or moderator
  @Mutation(() => Comment)
  updateComment(
    @Arg('input') input: UpdateCommentInput,
    @Ctx() context: Context,
  ) {
    return this.commentController.updateComment(input, context);
  }

  // author or moderator
  @Mutation(() => Boolean)
  deleteComment(
    @Arg('input') input: GetOrDeleteCommentInput,
    @Ctx() context: Context,
  ) {
    return this.commentController.deleteComment(input, context);
  }
}
