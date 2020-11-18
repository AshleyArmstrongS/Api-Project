const { GraphQLServer } = require('graphql-yoga')
require('./atlas_client');

const resolvers = {
    Query: {
      info: () => `Hello this is the OptiFarm API.`
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
  })
server.start(() => console.log(`Server is running on http://localhost:4000`))
