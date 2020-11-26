const { GraphQLServer } = require('graphql-yoga');
require('./atlas_client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Date = require('./resolvers/Date')

const resolvers = {
    Query,
    Mutation,
}

const server = new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers,
    context: request => {
      return {
        ...request,
      }
    },
  })
server.start(() => console.log(`Server is running on http://localhost:4000`))