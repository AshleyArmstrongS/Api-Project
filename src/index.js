const { GraphQLServer } = require('graphql-yoga')
require('./atlas_client')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')

const resolvers = {
    Query,
    Mutation,
}

const options = {
  port: 4000,
  endpoint: '/optiFarm',
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

server.start(options,({port,}) => console.log(`Server is running on http://localhost:${port}`))
