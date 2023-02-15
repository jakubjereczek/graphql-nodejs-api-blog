import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import Context from 'common/types/Context';
import { UserController } from 'controllers/user.controller';
import {
  AuthorizeUserInput,
  CreateUserInput,
  User,
  UserAuthorizationToken,
} from 'schemas/user.schema';
import { Unauthorized } from 'common/utils/typegraphql';

@Resolver()
export default class UserResolver {
  constructor(private userController: UserController) {
    this.userController = new UserController();
  }

  @Mutation(() => User)
  @UseMiddleware(Unauthorized)
  createUser(@Arg('input') input: CreateUserInput) {
    return this.userController.createUser(input);
  }

  @Mutation(() => UserAuthorizationToken)
  @UseMiddleware(Unauthorized)
  authorizeUser(
    @Arg('input') input: AuthorizeUserInput,
    @Ctx() context: Context,
  ) {
    return this.userController.authorizeUser(input, context);
  }

  @Authorized()
  @Query(() => Boolean)
  logoutUser(@Ctx() context: Context) {
    return this.userController.logoutUser(context);
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    return this.userController.getCurrentUser(context);
  }
}
