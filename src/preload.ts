import express from 'express';
import config from 'config';
import { AuthChecker, buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import cookieParser from 'cookie-parser';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import Context from 'common/types/Context';
import { resolvers } from 'resolvers';
import { connectToMongo } from 'common/utils/mongo';
import Authorization from 'common/Authorization/Authorization';
import { UserModel } from 'schemas/user.schema';
import { UserConfig } from 'common/types/User';
import { Role } from 'common/types/Role';

const authChecker: AuthChecker<Context> = function (
  { context: { user } },
  roles,
) {
  if (roles.length === 0) {
    if (user) {
      return true;
    }
  }

  if (!user) {
    return false;
  }

  if (user.roles.some((role) => roles.includes(role))) {
    return true;
  }
  return false;
};

function getApolloServerPlugins() {
  return process.env.NODE_ENV === 'production'
    ? ApolloServerPluginLandingPageProductionDefault()
    : ApolloServerPluginLandingPageGraphQLPlayground();
}

async function createApolloServer(schema: GraphQLSchema) {
  const server = new ApolloServer({
    schema,
    context: async (context: Context) => {
      return await Authorization.validate(context);
    },
    plugins: [getApolloServerPlugins()],
  });
  return server;
}

export async function createRootUserIfNotExists() {
  const root = config.get<UserConfig>('root');
  const user = await UserModel.find().findByEmail(root.email).lean();

  if (!user) {
    try {
      UserModel.create({ ...root, roles: [Role.Moderator] });
      console.debug('Created a default root user account with moderator role.');
    } catch (err) {
      console.error('Failed to create a default root user account.', err);
    }
  }
}

export async function bootstrap() {
  const app = express();
  app.use(cookieParser());

  const schema = await buildSchema({
    resolvers,
    authChecker,
  });
  const server = await createApolloServer(schema);
  await server.start();
  server.applyMiddleware({ app });

  app.listen(
    {
      port: 4000,
    },
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          'Server is running, GraphQL Playground available at http://localhost:4000/graphql',
        );
      }
    },
  );

  connectToMongo();
  createRootUserIfNotExists();
}
