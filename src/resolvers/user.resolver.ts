import { Ctx, Query, Resolver } from 'type-graphql';
import Context from 'common/types/Context';
import { UserController } from 'controllers/user.controller';
import { User } from 'schemas/user.schema';

@Resolver()
export default class UserResolver {
  constructor(private userController: UserController) {
    this.userController = new UserController();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    return context.user;
  }
}
