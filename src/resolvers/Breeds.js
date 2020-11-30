const { GraphQLScalarType } = require('graphql');
const Breed = require("../models/breed")


Breeds : new GraphQLScalarType({
    name: 'Breeds',
    description: 'Animal Breeds',
    parseValue(value) {
        return new Breed(value); // value from the client
      },
      serialize(value) {
        return value.getBreed(); // value sent to the client
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return parseInt(ast.value, 10); // ast value is always in string format
        }
        return null;
      },
})
