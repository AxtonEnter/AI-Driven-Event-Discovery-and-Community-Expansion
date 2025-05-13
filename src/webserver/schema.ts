import {
  DateTimeResolver,
  DateTimeTypeDefinition,
  JSONResolver,
} from "graphql-scalars";
import { makeExecutableSchema } from "@graphql-tools/schema";


// for custom scalars such as Date
const resolveFunctions = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
};

export const schema = makeExecutableSchema({
  typeDefs: [

  ],
  resolvers: [ 
    resolveFunctions,

  ]
});