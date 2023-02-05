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
import { verifyJwt } from 'common/utils/jwt';
import { User } from 'schemas/user.schema';
import { connectToMongo } from 'common/utils/mongo';

const authChecker: AuthChecker<Context> = function ({
  root,
  args,
  context,
  info,
}) {
  if (context.user) {
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
      const { accessToken } = context.req.cookies;
      if (context.req.cookies.accessToken) {
        // verify the user authorization
        context.user = verifyJwt<User>(accessToken);
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
        console.log('Playground http://localhost:4000/graphql');
      }
    },
  );

  connectToMongo();
}
