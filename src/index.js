const { GraphQLServer } = require("graphql-yoga");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const { apiSettings } = require("./Config");
require("./atlas_client");

const resolvers = {
  Query,
  Mutation,
};
const server = new GraphQLServer({
  typeDefs: "src/schema.graphql",
  resolvers,
  context: (request) => {
    return {
      ...request,
    };
  },
});

server.start(apiSettings, ({ port }) =>
  console.log(`Server is running on http://localhost:${port}`)
);
