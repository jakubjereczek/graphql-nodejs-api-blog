import express from 'express';
import { AuthChecker, buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import cookieParser from 'cookie-parser';
import Context from 'common/types/Context';
import { resolvers } from 'resolvers';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import { validateAuthorization } from 'common/utils/jwt';
import { connectToMongo } from 'common/utils/mongo';

// TODO: migrate: apollo-server-express to Apollo Server v3
// TODO: rewrite auth utils to separate class
// TODO: improved GraphQL errors
// https://www.apollographql.com/docs/apollo-server/security/authentication/
// https://codevoweb.com/react-node-access-refresh-tokens-authentication/

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

  if (user.roles.some((role) => role.includes(role))) {
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
    context: (ctx: Context) => {
      const context = ctx;
      if (context.req.cookies.refresh_token) {
        return validateAuthorization({ context });
      }
      return context;
    },
    plugins: [getApolloServerPlugins()],
  });
  return server;
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
        console.log(
          'Server is running, GraphQL Playground available at http://localhost:4000/graphql',
        );
      }
    },
  );

  connectToMongo();
}
